import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusMinus, faPlay } from "@fortawesome/free-solid-svg-icons";
import { db } from "../db";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { uploadGameToCloud } from "../utils/syncGameToCloud"; // adjust path
import useAuth from "../hooks/useAuth"; // if inside component, otherwise pass user in
import { downloadGamesFromCloud } from "../utils/downloadGamesFromCloud";
import {  doc as firestoreDoc, setDoc, collection, getDocs ,getDoc} from "firebase/firestore";
import { firestore } from "../firebase"; // or wherever your firestore config is
import { deleteDoc } from "firebase/firestore"; // make sure this is imported
import { fetchTeamSettings } from "../utils/fetchTeamSettings";
import LineoutSection from "./Components/HomeDashboard/LineoutSection";
import CreateEditLineoutModal from "./Components/HomeDashboard/Modals/CreateEditLineoutModal";
import Navbar from "./Components/HomeDashboard/Navbar"; // or "../Components/Navbar" depending on structure
import SavedGamesSection from "./Components/HomeDashboard/SavedGamesSection";
import SettingsModal from "./Components/HomeDashboard/Modals/SettingsModal";
import ProfileProgressModal from "./Components/HomeDashboard/Modals/ProfileProgressModal";


import { faCheck, faEllipsisV } from "@fortawesome/free-solid-svg-icons";

export default function HomeDashboard() {

  const { user } = useAuth();
  // Dashboard states
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedGames, setSavedGames] = useState({ local: [], synced: [] });
const [alertMessage, setAlertMessage] = useState("");
  // We now load all saved lineouts from the DB and display only one (the most recent)
  const [savedLineouts, setSavedLineouts] = useState([]);
  const navigate = useNavigate();
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [gameToComplete, setGameToComplete] = useState(null);
  // Modal & Form states for Lineout creation/editing
  const [showLineoutModal, setShowLineoutModal] = useState(false);
  const [showAddNewStatisticsModal,setShowAddNewStatisticsModal] = useState(false);
  const [lineoutName, setLineoutName] = useState("");
  const [players, setPlayers] = useState([]);
  const [formError, setFormError] = useState("");
  // If editing, store the id of the lineout being edited; if null, we're creating a new one.
  const [editingLineoutId, setEditingLineoutId] = useState(null);
  const [gameToReopen, setGameToReopen] = useState(null);
  // New states for editing a saved game

  const [showReopenModal, setShowReopenModal] = useState(false);
  // Dropdown state for inline dropdowns (used for both saved games and lineouts)
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [addPhotos, setAddPhotos] = useState(false); // Toggle for photo upload
  const [syncingGameId, setSyncingGameId] = useState(null);
  const [justSyncedGameId, setJustSyncedGameId] = useState(null);
  const [selectedLineoutId, setSelectedLineoutId] = useState(null);
  const [localLineouts, setLocalLineouts] = useState([]);
  const [cloudLineouts, setCloudLineouts] = useState([]);
  const [creatingLineout, setCreatingLineout] = useState(false);
const [showSettingsPage,setShowSettingsPage] = useState(false);
const [showProfileProgressModal, setShowProfileProgressModal] = useState(false);
const [checkingProfile, setCheckingProfile] = useState(true);
const [teamImage, setTeamImage] = useState(null);
const [dontShowAgain, setDontShowAgain] = useState(() => {
  return localStorage.getItem("hideProfileModal") === "true";
});
  const totalSavedGames =
  savedGames.local.length + savedGames.synced.length;
  const handleCloseModal = () => {
    setShowProfileProgressModal(false);
    if (dontShowAgain) {
      localStorage.setItem("hideProfileModal", "true");
    }
  };

const fetchLineouts = async () => {
  const local = await db.lineouts.toArray();
  setLocalLineouts(local);

  let defaultSet = false;

  if (local.length > 0) {
    setSelectedLineoutId(`local-${local[0].id}`);
    defaultSet = true;
  }

  if (user) {
    const snapshot = await getDocs(collection(firestore, "users", user.uid, "lineouts"));
    const cloud = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCloudLineouts(cloud);

    // If no local lineouts and there are cloud ones, set cloud as default
    if (!defaultSet && cloud.length > 0) {
      setSelectedLineoutId(`cloud-${cloud[0].id}`);
    }
  }
};
const checkProfileCompletion = async () => {
  try {
    let teamName = null;

    if (user) {
      const ref = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        teamName = data.teamName;
      }
    } else {
      const localSettings = await db.settings.get("preferences");
      teamName = localSettings?.teamName;
    }

    console.log("✅ Team name found:", teamName);

    setShowProfileProgressModal(!teamName); // Show only if no team name
  } catch (err) {
    console.error("❌ Error checking profile completion:", err);
    setShowProfileProgressModal(true); // fallback to show
  } finally {
    // Delay render until finished
    setTimeout(() => {
      setCheckingProfile(false);
    }, 2500); // 🔄 optional 500ms buffer
  }
};


useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('yes we have a user');
      
      const userRef = firestoreDoc(firestore, "users", user.uid);

      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log('snap exists');
        
        const data = userSnap.data();
        if (data.userType === "admin") {
          setIsAdmin(true);
        }
      }
    } else {
      setIsAdmin(false);
    }
  });

  return () => unsubscribe();
}, []);
const loadTeamSettings = async () => {
  const settings = await fetchTeamSettings(user);
  if (settings?.teamImage) {
    setTeamImage(settings.teamImage);
  }
};

useEffect(() => {
  loadTeamSettings();
}, [user]);

useEffect(() => {
  if (user !== undefined) {
    checkProfileCompletion();
  }
}, [user]);




useEffect(() => {
  fetchLineouts();
}, [user]);

useEffect(() => {
  if (!dontShowAgain) setShowProfileProgressModal(true);
}, [dontShowAgain]);

useEffect(() => {
  async function syncAndRefresh() {
    if (user) {
      await downloadGamesFromCloud(user.uid); // ✅ use UID here!
    }
    await refreshGames();
  }
  syncAndRefresh();
}, [user]);



  // Load saved lineouts from IndexedDB on component mount
  useEffect(() => {
    async function fetchLineouts() {
      const lineouts = await db.lineouts.toArray();
      setSavedLineouts(lineouts);
      if (lineouts.length > 0 && !selectedLineoutId) {
        setSelectedLineoutId(lineouts[0].id);
      }
      
    }
    fetchLineouts();
    
  }, []);
// HomeDashboard.jsx (partial)
useEffect(() => {
  async function fetchSavedGames() {
    const games = await db.games.toArray();
    const localOnlyGames = games.filter(
      (game) => !game.synced || (game.synced && !game.userId)
    );
    
    const syncedGames = games.filter(game => game.synced);     // already pushed to cloud

    setSavedGames({ local: localOnlyGames, synced: syncedGames });
  }

  fetchSavedGames();
}, []);

useEffect(() => {
  refreshGames();
}, [user]);


const handleCompleteGameClick = (game) => {
  setGameToComplete(game);
  setShowCompleteModal(true);
};

const handleConfirmCompleteGame = async () => {
  if (!gameToComplete) return;

  const updatedGame = {
    ...gameToComplete,
    isComplete: true,
    synced: true,
    userId: user?.uid ?? null,
  };

  try {
    // 1. ✅ Save locally
    await db.games.put(updatedGame);

    // 2. ✅ Sync to Firestore if user is logged in
    if (user) {
      const cleanedGame = { ...updatedGame };
      const docRef = firestoreDoc(
        firestore,
        "users",
        user.uid,
        "games",
        updatedGame.id
      );

      await setDoc(docRef, cleanedGame); // ✅ overwrite by ID
      console.log("✅ Game marked complete & synced to Firestore");
    }

    // 3. ✅ Refresh dashboard games
    await refreshGames();
  } catch (err) {
    console.error("❌ Error completing game:", err);
  } finally {
    setShowCompleteModal(false);
    setGameToComplete(null);
  }
};





  // Close dropdown if click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = () => {
    navigate("/");
  };
  const handleStartNewGame = async () => {
    let teamName = null;
  
    try {
      if (user) {
        const ref = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          teamName = snap.data().teamName;
        }
      } else {
        const localSettings = await db.settings.get("preferences");
        teamName = localSettings?.teamName;
      }
  
      if (!teamName) {
        setShowProfileProgressModal(true);
        return;
      }
    } catch (err) {
      console.error("Error checking team name before game start:", err);
      setShowProfileProgressModal(true); // Fallback
      return;
    }
  
    // ✅ Team name exists — continue to start game
    let selectedLineout = null;
  
    if (typeof selectedLineoutId === "string") {
      if (selectedLineoutId.startsWith("local-")) {
        const id = parseInt(selectedLineoutId.replace("local-", ""));
        selectedLineout = localLineouts.find((lo) => lo.id === id);
      } else if (selectedLineoutId.startsWith("cloud-")) {
        const id = selectedLineoutId.replace("cloud-", "");
        selectedLineout = cloudLineouts.find((lo) => lo.id === id);
      }
    }
  console.log('just about to pass something ', teamName);
  
    navigate("/startgame", {
      state: {
        // lineout: selectedLineout ?? null,
          lineoutRef: selectedLineout
   ? selectedLineoutId?.startsWith("cloud-")
     ? { source: 'cloud', id: String(selectedLineout.id) }
       : { source: 'local', id: Number(selectedLineout.id) }
    : null,
        teamName: teamName || "Home",
      },
    });
  };
  
  


  const handleStatisticsClick = (game)=>{
    console.log('stats for game -> ' , game);
    navigate("/statistics", {state: game})
    
  }
  const handleGameClick = (game) => {
    navigate("/ingame", { state: game });
  };



  


  const handleDeleteGame = async (gameId) => {
    if (!window.confirm("Are you sure you want to delete this game?")) return;
  
    try {
      // 🗑️ Delete from local Dexie first
      await db.games.delete(gameId);
      console.log("🗑️ Deleted from local IndexedDB");
  
      // 🔥 Delete from Firestore if logged in
      if (user) {
        try {
          const ref = firestoreDoc(
            firestore,
            "users",
            user.uid,
            "games",
            gameId
          );
          console.log("Attempting to delete:", ref.path);
          await deleteDoc(ref);
          console.log("✅ Deleted from Firestore");
        } catch (err) {
          console.error("❌ Firestore deletion error:", err.message, err.code);
          // Also check if this is a permission error
          if (err.code === 'permission-denied') {
            console.error("Permission denied - check security rules");
          }
        }
      }
  
      // ✅ Refresh games and UI
      await refreshGames();
      setActiveDropdown(null);
    } catch (err) {
      console.error("❌ Error deleting game:", err);
    }
  };
  

  // --- Lineout Handlers (Using IndexedDB) ---
  const openLineoutModal = () => {
    setEditingLineoutId(null);
    setLineoutName("");
    setPlayers(
      Array.from({ length: 5 }, () => ({
        name: "",
        number: "",
      }))
    );
    setFormError("");
    setShowLineoutModal(true);
  };

  const openEditModal = (lineout) => {
    setEditingLineoutId(lineout.id);
    setLineoutName(lineout.name);
    setPlayers(lineout.players);
    setFormError("");
    setShowLineoutModal(true);
    setActiveDropdown(null);
  };


  const handleConfirmReopenGame = async () => {
    if (!gameToReopen) return;
    const updatedGame = { ...gameToReopen, isComplete: false };
    await db.games.put(updatedGame);
    const games = await db.games.toArray();
    setSavedGames(games);
    setShowReopenModal(false);
    setGameToReopen(null);
  };

  const handleDeleteLineout = async (lineoutId) => {
    setActiveDropdown(null);
  
    if (!lineoutId) return;
  
    const isCloud = typeof lineoutId === "string" && isNaN(Number(lineoutId));
  
    const confirmed = window.confirm("Are you sure you want to delete this lineout?");
    if (!confirmed) return;
  
    try {
      let updatedLocal = localLineouts;
      let updatedCloud = cloudLineouts;
  
      if (isCloud && user) {
        // ✅ Delete from Firestore
        await deleteDoc(doc(firestore, "users", user.uid, "lineouts", lineoutId));
        const snapshot = await getDocs(collection(firestore, "users", user.uid, "lineouts"));
        updatedCloud = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCloudLineouts(updatedCloud);
      } else {
        // ✅ Delete from Dexie
        await db.lineouts.delete(Number(lineoutId)); // make sure it's a number
        updatedLocal = await db.lineouts.toArray();
        setLocalLineouts(updatedLocal);
        setSavedLineouts(updatedLocal);
      }
  
      // 🔄 Update selected
      const deletedSelected =
        selectedLineoutId === `cloud-${lineoutId}` ||
        selectedLineoutId === `local-${lineoutId}`;
  
      if (deletedSelected) {
        if (updatedLocal.length > 0) {
          setSelectedLineoutId(`local-${updatedLocal[0].id}`);
        } else if (updatedCloud.length > 0) {
          setSelectedLineoutId(`cloud-${updatedCloud[0].id}`);
        } else {
          setSelectedLineoutId(null);
        }
      }
    } catch (err) {
      console.error("❌ Failed to delete lineout:", err);
    }
  };
  
  
  

  const addPlayer = () => {
    if (players.length < 15) {
      setPlayers([...players, { name: "", number: "" }]);
    }
  };

  const removePlayer = () => {
    if (players.length > 5) {
      setPlayers(players.slice(0, players.length - 1));
    }
  };

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index][field] = value;
    setPlayers(updatedPlayers);
  };
  
  const handleImageUpload = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handlePlayerChange(index, "image", reader.result); // Store base64 data
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveLineout = async () => {
    setCreatingLineout(true);
  
    try {
      if (!lineoutName.trim()) {
        setFormError("Please enter a lineout name.");
        setCreatingLineout(false);
        return;
      }
  
      for (let i = 0; i < players.length; i++) {
        if (!players[i].name.trim() || !players[i].number) {
          setFormError("All players must have a name and a number.");
          setCreatingLineout(false);
          return;
        }
      }
  
      const numbers = players.map((p) => p.number.toString());
      const uniqueNumbers = new Set(numbers);
      if (uniqueNumbers.size !== numbers.length) {
        setFormError("Each player must have a unique number.");
        setCreatingLineout(false);
        return;
      }
  
      if (user && typeof editingLineoutId === "string") {
        // ✏️ Update existing cloud lineout
        const existingDoc = firestoreDoc(firestore, "users", user.uid, "lineouts", editingLineoutId);
        await setDoc(existingDoc, { name: lineoutName, players });
      } else if (user && !editingLineoutId) {
        // ➕ Create new cloud lineout
        const newDoc = firestoreDoc(collection(firestore, "users", user.uid, "lineouts"));
        await setDoc(newDoc, { name: lineoutName, players });
      } else {
        // 🗃 Save/update locally
        const newLineout = {
          id: editingLineoutId || Date.now(),
          name: lineoutName,
          players,
        };
      
        if (editingLineoutId) {
          await db.lineouts.put(newLineout);
        } else {
          await db.lineouts.add(newLineout);
        }
      
        const updatedLineouts = await db.lineouts.toArray();
        setSavedLineouts(updatedLineouts);
        setLocalLineouts(updatedLineouts);
      }
      
      
  
      const updatedLineouts = await db.lineouts.toArray();
      setSavedLineouts(updatedLineouts);
      setLineoutName("");
      setPlayers([]);
      setEditingLineoutId(null);
      setFormError("");
      await fetchLineouts();

      setShowLineoutModal(false);
    } catch (err) {
      console.error("Error saving lineout", err);
      setFormError("Something went wrong saving the lineout.");
    } finally {
      setCreatingLineout(false);
    }
  };
  
  
  const refreshGames = async () => {
    const allGames = await db.games.toArray();
  
    let localOnlyGames = [];
    let syncedGames = [];
  
    if (user) {
      // 🔐 Logged-in: only show games for this user
      localOnlyGames = allGames.filter(
        (g) => !g.synced && (!g.userId || g.userId === user.uid)
      );
      syncedGames = allGames.filter(
        (g) => g.synced && g.userId === user.uid
      );
    } else {
      // 👤 Guest: only show games with no userId
      localOnlyGames = allGames.filter((g) => !g.userId);
      syncedGames = []; // Guests don't see cloud games
    }
  
    setSavedGames({ local: localOnlyGames, synced: syncedGames });
  };
  
  
  const handleSyncToCloud = async (game) => {
    if (!user) return;
    setSyncingGameId(game.id);
  
    try {
      const updatedGame = {
        ...game,
        synced: true,
        userId: user.uid, // ✅ match Firestore path
        isComplete: game.isComplete ?? false,
      };
      
  
      await db.games.put(updatedGame);
      await uploadGameToCloud(user.email, updatedGame);

      await refreshGames();
  
      console.log("✅ Synced game to cloud!");
      setJustSyncedGameId(game.id); // ✅ flash success state
      setTimeout(() => setJustSyncedGameId(null), 2000); // ⏱️ auto clear after 2s
    } catch (err) {
      console.error("❌ Failed to sync game:", err);
    } finally {
      setSyncingGameId(null);
    }
  };
  
  
  
  // For display, only show the most recent (or only) lineout.
  const displayedLineout = (() => {
    if (!selectedLineoutId || typeof selectedLineoutId !== "string") return null;
  
    if (selectedLineoutId.startsWith("local-")) {
      const id = parseInt(selectedLineoutId.replace("local-", ""));
      return localLineouts.find((lineout) => lineout.id === id);
    }
  
    if (selectedLineoutId.startsWith("cloud-")) {
      const id = selectedLineoutId.replace("cloud-", "");
      return cloudLineouts.find((lineout) => lineout.id === id);
    }
  
    return null;
  })();
  
  

    const handleSetInProgress = async (game) => {
      const updatedGame = { ...game, isComplete: false };
    
      console.log("🔄 Restoring game:", updatedGame);
      await db.games.put(updatedGame);
      const stored = await db.games.get(updatedGame.id);
      console.log("📦 Game after put:", stored);
      
    
      if (user) {
        await uploadGameToCloud(user.uid, updatedGame); // ✅ Match your Firestore path
      }
    
      await refreshGames(); // ✅ Re-populate savedGames state
    };

    
  
  return (
    <div className="min-h-screen bg-primary-bg text-white">
       {/* Completion Confirmation Modal */}
       {showCompleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-secondary-bg p-6 rounded-lg w-96 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-2">Complete Game?</h2>
            <p className="text-sm text-gray-400 mb-4">This can always be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowCompleteModal(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded">
                Cancel
              </button>
              <button onClick={handleConfirmCompleteGame} className="px-4 py-2 bg-secondary-cta hover:bg-primary-cta rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

<Navbar
  user={user}
  handleLogout={handleLogout}
  openSettings={() => setShowSettingsPage(true)}
/>



      <div className="container mx-auto px-2 py-2 sm:p-6 w-full max-w-full">

        <div className="py-2 sm:p-6 w-full">
          <button
            onClick={handleStartNewGame}
            className="btn my-4 bg-primary-cta px-4 py-2 rounded-lg w-full sm:w-auto sm:ml-8"
          >
            Start New Game
          </button>
          {isAdmin && (
        <button
          onClick={()=>{navigate('/users')}}
          className="btn my-4 bg-primary-green px-4 py-2 rounded-lg w-full sm:w-auto sm:ml-8"
        >
          Users
        </button>
      )}
{/* Saved Games Section */}
<SavedGamesSection
  savedGames={savedGames}
  user={user}
  teamImage={teamImage} // ✅ NEW
  handleGameClick={handleGameClick}
  handleCompleteGameClick={handleCompleteGameClick}
  handleStatisticsClick={handleStatisticsClick}
  handleSetInProgress={handleSetInProgress}
  handleDeleteGame={handleDeleteGame}
  handleSyncToCloud={handleSyncToCloud}
  syncingGameId={syncingGameId}
  justSyncedGameId={justSyncedGameId}
  totalSavedGames={
    savedGames.local.length + (user ? savedGames.synced.length : 0)
  }
/>



          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 sm:p-8 w-full">
            {/* Lineout Section */}
            <LineoutSection
  localLineouts={localLineouts}
  cloudLineouts={cloudLineouts}
  selectedLineoutId={selectedLineoutId}
  setSelectedLineoutId={setSelectedLineoutId}
  openLineoutModal={openLineoutModal}
  openEditModal={openEditModal}
  handleDeleteLineout={handleDeleteLineout}
  user={user}
  displayedLineout={displayedLineout}
  activeDropdown={activeDropdown}
  setActiveDropdown={setActiveDropdown}
  dropdownRef={dropdownRef}
/>


            {/* Saved Statistics Section */}
         
          </div>
        </div>
      </div>

      {/* Modal for Creating / Editing a Lineout */}
      {showLineoutModal && (
        <CreateEditLineoutModal
  showLineoutModal={showLineoutModal}
  setShowLineoutModal={setShowLineoutModal}
  lineoutName={lineoutName}
  setLineoutName={setLineoutName}
  players={players}
  addPlayer={addPlayer}
  removePlayer={removePlayer}
  handlePlayerChange={handlePlayerChange}
  handleSaveLineout={handleSaveLineout}
  handleImageUpload={handleImageUpload}
  addPhotos={addPhotos}
  setAddPhotos={setAddPhotos}
  formError={formError}
  creatingLineout={creatingLineout}
  editingLineoutId={editingLineoutId}
/>

    )}


{/* this is the modal for the settings page  */}
{showSettingsPage && (
        <SettingsModal onClose={() => setShowSettingsPage(false)}
        setAlertMessage={setAlertMessage} // 👈 pass it down
        setTeamImage={setTeamImage} 
        />
      )}

{showAddNewStatisticsModal && (
        <>
          <div className="fixed inset-0 bg-primary-bg opacity-75 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-secondary-bg rounded-lg shadow-lg w-11/12 md:w-1/2 p-6">
              <h2 className="text-2xl font-bold mb-4">
           Choose Saved Game
              </h2>
            
              <ul className="grid grid-cols-6 gap-4">
                {savedGames.length > 0 ? (
                  savedGames.map((game) => (
                    <li
                      key={game.id}
                      className="bg-white/5 border-l-primary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10 flex flex-col"
                    >
                      <div className="mb-2 w-full flex justify-between items-center">
                        <p className="text-sm font-medium">
                          {game.opponentName || "Unknown"} ({game.venue})
                        </p>
                        <input id="bordered-checkbox-1" type="checkbox" value="" name="bordered-checkbox" class="w-8 h-8 text-blue-600
     bg-gray-100 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-white/10 "/>
   
                      </div>
                      <div className="flex justify-between">
                        {/* <div className="flex space-x-2">
                          <button
                            onClick={() => handleGameClick(game)}
                            className="py-1 text-primary-cta font-semibold rounded flex items-center text-md pl-1"
                          >
                            Continue
                          </button>
                          <button
                            onClick={() => openGameEditModal(game)}
                            className="py-1 rounded flex text-gray-400 items-center text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="py-1 text-gray-400 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div> */}
                        
                      </div>
                      <div class="flex items-center ps-4  border-gray-200 rounded-sm dark:border-gray-700">
   
</div>
                    </li>
                  ))
                ) : (
                  <li className=" text-gray-400">Nothing Yet</li>
                )}
              </ul>
             
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddNewStatisticsModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLineout}
                  className="px-4 py-2 bg-primary-cta rounded"
                >
                  Save Lineout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal for Editing a Saved Game */}
  
{ !checkingProfile && showProfileProgressModal && 
<ProfileProgressModal
          onClose={handleCloseModal}
          openSettings={() => {
            handleCloseModal();
            setShowSettingsPage(true); // your existing logic
          }}
          dontShowAgain={dontShowAgain}
          setDontShowAgain={setDontShowAgain}
        />
}
{alertMessage && (
  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50">
    {alertMessage}
  </div>
)}

    </div>
  );
}
