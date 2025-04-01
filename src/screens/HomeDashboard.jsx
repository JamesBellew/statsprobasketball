import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusMinus, faPlay } from "@fortawesome/free-solid-svg-icons";
import { db } from "../db";
import { uploadGameToCloud } from "../utils/syncGameToCloud"; // adjust path
import useAuth from "../hooks/useAuth"; // if inside component, otherwise pass user in
import { downloadGamesFromCloud } from "../utils/downloadGamesFromCloud";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase"; // or wherever your firestore config is
import { deleteDoc } from "firebase/firestore"; // make sure this is imported
import { faCheck, faEllipsisV } from "@fortawesome/free-solid-svg-icons";

export default function HomeDashboard() {
  const { user } = useAuth();
  // Dashboard states
  const [isExpanded, setIsExpanded] = useState(true);
  const [savedGames, setSavedGames] = useState({ local: [], synced: [] });

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
  const [showGameEditModal, setShowGameEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editedOpponentName, setEditedOpponentName] = useState("");
  const [editedVenue, setEditedVenue] = useState("");
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


  const totalSavedGames =
  savedGames.local.length + savedGames.synced.length;

if(user){
  console.log('logged in');
  
}else{
  console.log('not logged in');
  
}
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

useEffect(() => {
  fetchLineouts();
}, [user]);



useEffect(() => {
  async function syncAndRefresh() {
    if (user) {
      await downloadGamesFromCloud(user.email); // ✅ email not uid
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

  const updatedGame = { ...gameToComplete, isComplete: true };

  await db.games.put(updatedGame); // ✅ update locally

  if (user) {
    await uploadGameToCloud(user.email, updatedGame); // ❗ Use email

  }
// 🛠 FIX: Small delay so Dexie commits the write before we query again
await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms is enough

setTimeout(() => {
  refreshGames();
}, 50);

  const games = await db.games.toArray();

  const localOnlyGames = games.filter((game) => {
    if (!game.synced) return true;
    if (!user && game.userId) return false;
    if (!user && !game.userId) return true;
    if (user && game.userId !== user.uid) return false;
    return !game.userId;
  });

  const syncedGames = user
    ? games.filter((game) => game.synced && game.userId === user.uid)
    : [];

  setSavedGames({ local: localOnlyGames, synced: syncedGames });
  setShowCompleteModal(false);
  setGameToComplete(null);
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
  const handleStartNewGame = () => {
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
  
    navigate("/startgame", {
      state: { lineout: selectedLineout ?? null },
    });
  };
  


  const handleStatisticsClick = (game)=>{
    console.log('stats for game -> ' , game);
    navigate("/statistics", {state: game})
    
  }
  const handleGameClick = (game) => {
    navigate("/ingame", { state: game });
  };

  // --- Saved Game Handlers (Inline Editing) ---
  const openGameEditModal = (game) => {
    setEditingGame(game);
    setEditedOpponentName(game.opponentName || "");
    setEditedVenue(game.venue || "");
    setActiveDropdown(null);
    setShowGameEditModal(true);
  };

  const handleSaveGameEdit = async () => {
    if (!editedOpponentName.trim() || !editedVenue.trim()) {
      alert("Please fill in both opponent name and venue.");
      return;
    }
    const updatedGame = {
      ...editingGame,
      opponentName: editedOpponentName,
      venue: editedVenue,
    };
    await db.games.put(updatedGame);
    await refreshGames();
    setShowGameEditModal(false);
    setEditingGame(null);
  };

  

  const handleDeleteGame = async (gameId) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      await db.games.delete(gameId);
      await refreshGames();
      setActiveDropdown(null);
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

  // const handlePlayerChange = (index, field, value) => {
  //   const updatedPlayers = players.map((player, i) =>
  //     i === index ? { ...player, [field]: value } : player
  //   );
  //   setPlayers(updatedPlayers);
  // };
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
        const existingDoc = doc(firestore, "users", user.uid, "lineouts", editingLineoutId);
        await setDoc(existingDoc, { name: lineoutName, players });
      } else if (user && !editingLineoutId) {
        // ➕ Create new cloud lineout
        const newDoc = doc(collection(firestore, "users", user.uid, "lineouts"));
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
    const games = await db.games.toArray();
    // console.log('refresh games games', games);
    // console.log("Current user in refreshGames:", user);
  
    const localOnlyGames = games.filter((game) => {
      if (!game.synced) return true;
  
      // 🔥 Updated: make sure userId matches user.uid now
      if (!user && game.userId) return false;
      if (!user && !game.userId) return true;
  
      if (user && game.userId !== user.uid) return false;
  
      return !game.userId;
    });
  
    const syncedGames = user
    ? games.filter((game) => game.synced && game.userId === user.email) // ✅ MATCH email
    : [];
  
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
    
      await db.games.put(updatedGame);
    
      if (user) {
        await uploadGameToCloud(user.email, updatedGame); // ✅ Match your Firestore path
      }
    
      await refreshGames(); // ✅ Re-populate savedGames state
    };
    
    console.log('yeeeahh boiiii', savedGames.local.filter(game => game.isComplete).length);
    
  
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

      {/* Header Section */}
      <nav className="bg-secondary-bg w-full px-8">
        <div className="container mx-auto flex items-center justify-between h-16">
          <div className="text-primary-cta">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          {/* <ul className="flex font-semibold">
            <li className="px-4 py-2 text-primary-cta"><a href="#">Home</a></li>
            <li className="px-4 py-2 hover:text-indigo-400"><a href="#">Settings</a></li>
            <li className="px-4 py-2 hover:text-indigo-400"><a href="#">Subscription</a></li>
          </ul> */}
<div className="flex flex-row items-center space-x-4">
<span className="flex">{user ? user.email: "Guest"}</span>
          <button onClick={()=>{
            handleLogout()
          }} className="px-4 py-2 bg-primary-cta hover:bg-indigo-600 text-gray-50 rounded-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Home </span>
          </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">

        <div className="p-6">
          <button
            onClick={handleStartNewGame}
            className="btn my-5 bg-primary-cta px-4 ml-8 py-2 rounded-lg"
          >
            Start New Game
          </button>

{/* Saved Games Section */}
<div className="bg-primary-bg pb-24 p-8 rounded-lg">
<div className="flex items-center space-x-3">
  <h4 className="text-xl font-medium">Saved Games</h4>
  <p className="text-sm text-gray-400 font-light">
    ({totalSavedGames || "No"} {totalSavedGames === 1 ? "Game" : "Games"})
  </p>
</div>



  {/* In Progress Section */}
  <div className="border-l-4 px-5 border-l-secondary-cta">
    <h3 className="mt-8 mb-3">In Progress</h3>
  </div>
  <div className="h-auto bg-secondary-bg rounded-md py-10 px-5 overflow-auto">
  {/* Local Games */}
  {user &&
  <h4 className="text-sm text-white font-semibold mb-2">Local</h4>
}
  <ul className="grid grid-cols-6 gap-4 mb-6">
    {savedGames.local.filter(game => !game.isComplete).length > 0 ? (
      savedGames.local
        .filter(game => !game.isComplete)
        .map((game) => (
          <li key={game.id} className="bg-white/5 border-l-secondary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10">
            <p className="text-sm font-medium mb-2">{game.opponentName || "Unknown"} ({game.venue})</p>
            <div className="flex justify-between items-center">
  <button
    onClick={() => handleGameClick(game)}
    className="py-1 bg-white/10 px-4 text-secondary-cta font-semibold rounded"
  >
    {game.isComplete ? "Open" : "Continue"}
  </button>

  <div className="flex gap-2 items-center">
{user && (
  <button
    onClick={() => handleSyncToCloud(game)}
    className={`text-xs px-3 py-2 rounded flex items-center font-semibold transition-all
      ${
        syncingGameId === game.id
          ? "bg-blue-600 cursor-not-allowed"
          : justSyncedGameId === game.id
          ? "bg-green-600"
          : "bg-primary-danger hover:bg-blue-600"
      }
      text-white`}
    disabled={syncingGameId === game.id}
  >
    {syncingGameId === game.id ? (
      <>
        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Syncing...
      </>
    ) : justSyncedGameId === game.id ? (
      <>
        <span className="mr-2">✅</span> Synced!
      </>
    ) : (
      <>
        Sync<span className="mx-2">|</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257A3 3 0 0015.574 8.4a5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      </>
    )}
  </button>
)}


    <button
      onClick={() => handleCompleteGameClick(game)}
      className="py-2 bg-white/10 px-4 text-white font-semibold rounded"
    > 
      <FontAwesomeIcon className="text-secondary-cta" icon={faCheck} />
    </button>
  </div>
</div>

          </li>
        ))
    ) : (
      <li className="text-gray-400 my-auto w-96">No local games in progress</li>
    )}
  </ul>
{/* onyl want to show this is the user is logged in  */}
{user &&
<>
  {/* Synced Games */}
  <h4 className="text-sm text-white font-semibold mb-2">Cloud</h4>
  <ul className="grid grid-cols-6 gap-4">
    {savedGames.synced.filter(game => !game.isComplete).length > 0 ? (
      savedGames.synced
        .filter(game => !game.isComplete)
        .map((game) => (
          <li key={game.id} className="bg-white/5 border-l-green-500 border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10">
            <p className="text-sm font-medium mb-2">{game.opponentName || "Unknown"} ({game.venue})</p>
            <div className="flex justify-between items-center">
              <button onClick={() => handleGameClick(game)} className="py-1 bg-white/10 px-4 text-secondary-cta font-semibold rounded">
                Continue
              </button>
              <button onClick={() => handleCompleteGameClick(game)} className="py-1 bg-secondary-cta px-4 text-secondary-bg font-semibold rounded">
                <FontAwesomeIcon icon={faCheck} />
              </button>
            </div>
          </li>
        ))
    ) : (
      <li className="text-gray-400 w-96 mx-2">No cloud games in progress</li>
    )}
  </ul>
  </>
}
</div>


{/* Completed Section */}
<div className="border-l-4 px-5 border-l-primary-cta mt-8">
  <h3 className="mt-8 mb-3">Completed</h3>
</div>

<div className="h-auto bg-secondary-bg rounded-md py-10 px-5 overflow-auto">

{user && 
<>
  {/* Synced Completed Games */}
  <h4 className="text-sm text-white font-semibold mb-2">Cloud</h4>
  <ul className="grid grid-cols-6 gap-4">
    {savedGames.synced.filter(game => game.isComplete).length > 0 ? (
      savedGames.synced
        .filter(game => game.isComplete)
        .map((game) => (
          <li key={game.id} className="bg-white/5 border-l-primary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10 flex flex-col">
            <div className="mb-2">
              <p className="text-sm font-medium">
                {game.opponentName || "Unknown"} ({game.venue})
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex space-x-2 w-full">
                <button
                  onClick={() => handleGameClick(game)}
                  className="py-1 bg-white/10 px-4 text-white font-semibold rounded flex items-center text-md ml-1"
                >
                  Open
                </button>
                <div className="flex justify-end space-x-2 w-full">
                  <button
                    onClick={() => handleSetInProgress(game)}
                    className="py-1 rounded flex text-gray-400 items-center text-xs"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDeleteGame(game.id)}
                    className="py-1 text-gray-400 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))
    ) : (
      <li className="text-gray-400 min-w-96">No cloud completed games</li>
    )}
  </ul>
  </>
}

{/* {user && savedGames.local.filter(game => game.isComplete).length > 0 &&
<> */}
  {/* Local Completed Games */}

  {user &&  savedGames.local.filter(game => game.isComplete).length > 0 &&
  <h4 className="text-sm mt-5 text-white font-semibold mb-2">Local</h4>
  }
  <ul className="grid grid-cols-6 gap-4 mb-6">
    {savedGames.local.filter(game => game.isComplete).length > 0 ? (
      savedGames.local
        .filter(game => game.isComplete)
        .map((game) => (
          <li key={game.id} className="bg-white/5 border-l-primary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10 flex flex-col">
            <div className="mb-2">
              <p className="text-sm font-medium">
                {game.opponentName || "Unknown"} ({game.venue})
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex space-x-2 w-full">
                <button
                  onClick={() => handleGameClick(game)}
                  className="py-1 bg-white/10 px-4 text-white font-semibold rounded flex items-center text-md ml-1"
                >
                  Open
                </button>
                <div className="flex justify-end space-x-2 w-full">
                  <button
                    onClick={() => handleSetInProgress(game)}
                    className="py-1 rounded flex text-gray-400 items-center text-xs"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDeleteGame(game.id)}
                    className="py-1 text-gray-400 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))
    ) : (
      
      <li className="text-gray-400 w-auto min-w-96">
{!user
  ? "No completed games"
  : savedGames.local.filter(game => game.isComplete).length === 0 &&
    (savedGames.local.length > 0 || savedGames.synced.length > 0)
    ? "No local completed games"
    : null}


       </li>
    )}
  </ul>
  {/* </>
} */}
</div>

</div>


          <div className="grid grid-cols-2 gap-4 p-8">
            {/* Lineout Section */}
            <div className="bg-secondary-bg p-8 col-span-2 sm:col-span-2 rounded-lg mt-4">
 

            <div className="flex items-center justify-between mb-4">
  <p className="text-lg font-bold">Lineout</p>

  <div className="flex items-center space-x-4">
  {(localLineouts.length > 0 || cloudLineouts.length > 0) && (
  <select
    value={selectedLineoutId || ""}
    onChange={(e) => setSelectedLineoutId(e.target.value)}
    className="ml-4 p-2 rounded bg-white/10 text-white"
  >
    <optgroup label="Local Lineouts">
      {localLineouts.map((lineout) => (
        <option key={`local-${lineout.id}`} value={`local-${lineout.id}`}>
          {lineout.name}
        </option>
      ))}
    </optgroup>

    {user && cloudLineouts.length > 0 && (
      <optgroup label="Cloud Lineouts">
        {cloudLineouts.map((lineout) => (
          <option key={`cloud-${lineout.id}`} value={`cloud-${lineout.id}`}>
            {lineout.name}
          </option>
        ))}
      </optgroup>
    )}
  </select>
)}


    <button
      onClick={openLineoutModal}
      className="btn btn-primary px-5 py-2 bg-primary-cta rounded-md"
    >
      Create
    </button>
  </div>
</div>

              {displayedLineout ? (
                <div className="bg-secondary-bg shadow-lg border-l-4 border-l-primary-cta p-3 rounded flex justify-between items-center mt-3">
                  <div className="w-full">
                    <p className="font-medium">{displayedLineout.name}</p>
                    <div className="mt-2">
                      {displayedLineout.players.map((player, index) => (
                        <p
                          key={index}
                          className="text-xs py-2 border-b border-dotted border-white/10 text-gray-200"
                        >
                          <span className="text-gray-400">({player.number})</span>{" "}
                          {player.name}
                        </p>
                      ))}
                    </div>
                  </div>
                  {/* Three dot dropdown menu */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === displayedLineout.id
                            ? null
                            : displayedLineout.id
                        )
                      }
                      className="p-2 hover:bg-gray-600 rounded"
                    >
                      ⋮
                    </button>
                    {activeDropdown === displayedLineout.id && (
                      <div className="absolute right-0 mt-2 w-28 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                        <button
                          onClick={() => openEditModal(displayedLineout)}
                          className="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm"
                        >
                          Edit
                        </button>
                        <button
                        onClick={() => handleDeleteLineout(displayedLineout.id)}

                          className="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs w-44 text-gray-400">No Lineouts Saved</p>
              )}
            </div>
            {/* Saved Statistics Section */}
         
          </div>
        </div>
      </div>

      {/* Modal for Creating / Editing a Lineout */}
      {showLineoutModal && (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-secondary-bg   rounded-lg shadow-lg w-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingLineoutId ? "Edit Lineout" : "Create Lineout"}
            </h2>

            {/* ✅ Checkbox to Toggle Image Uploads */}
            <div className="flex items-center mb-4">
              {/* <input
                type="checkbox"
                id="addPhotos"
                checked={addPhotos}
                onChange={() => setAddPhotos(!addPhotos)}
                className="mr-2"
              /> */}


<label class="inline-flex items-center cursor-pointer">
  <input    id="addPhotos" type="checkbox" value=""                checked={addPhotos}
                onChange={() => setAddPhotos(!addPhotos)} class="sr-only peer"/>
  <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
  <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Add Player Images</span>
</label>


              {/* <label htmlFor="addPhotos" className="text-sm text-gray-300">
                Add Player Photos
              </label> */}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Lineout Name
                </label>
                <input
                  type="text"
                  value={lineoutName}
                  onChange={(e) => setLineoutName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter lineout name"
                />
              </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Players</h3>
              {players.map((player, index) => (
                <div key={index} className="flex flex-row gap-2 mb-3 items-center">
                  
                  {/* ✅ Player Name Input */}
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handlePlayerChange(index, "name", e.target.value)}
                    className="w-3/5 px-3 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Player ${index + 1} Name`}
                  />

                  {/* ✅ Player Number Input */}
                  <input
                    type="number"
                    value={player.number}
                    onChange={(e) => handlePlayerChange(index, "number", e.target.value)}
                    className="w-1/5 px-3 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Number"
                  />

                  {/* ✅ Conditional Image Upload */}
                  {addPhotos && (
                    <>
                    <div className={`w-1/5 flex flex-col items-center rounded-md
                      ${player.image ? "bg-primary-bg" : ""}
                      
                      `}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files[0])}
                        className="hidden"
                        id={`file-upload-${index}`}
                      />
                      <label
                        htmlFor={`file-upload-${index}`}
                        className="w-full text-center px-3 py-2 bg-white/10 rounded cursor-pointer hover:bg-gray-600"
                      >
                        {player.image ? "Delete" : "Upload"}
                      </label>

                     
                    </div>
                    <div className="w-1/5  h-full">
                     {/* ✅ Show Image Preview */}
                     {player.image && (
                        <img
                          src={player.image}
                          alt={`Player ${index + 1}`}
                          className="w-12 mx-auto h-12 rounded-full mt-2"
                        />
                      )}</div>
                    </>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  onClick={addPlayer}
                  disabled={players.length >= 15}
                  className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded disabled:opacity-50"
                >
                  +
                </button>
                <button
                  onClick={removePlayer}
                  disabled={players.length <= 5}
                  className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded disabled:opacity-50"
                >
                  –
                </button>
              </div>
            </div>

            {formError && <p className="mt-3 text-red-400 text-sm">{formError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLineoutModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Cancel
              </button>
              <button
  onClick={handleSaveLineout}
  className={`px-4 py-2 rounded ${
    creatingLineout
      ? "bg-blue-700 cursor-not-allowed"
      : "bg-indigo-600 hover:bg-primary-cta"
  }`}
  disabled={creatingLineout}
>
  {creatingLineout ? (
    <span className="flex items-center gap-2">
      <svg
        className="animate-spin h-4 w-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      Creating...
    </span>
  ) : (
    "Save Lineout"
  )}
</button>

            </div>
          </div>
        </div>
      </>
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
      {showGameEditModal && editingGame && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowGameEditModal(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div
            className="relative bg-gray-800 p-6 rounded-lg w-11/12 md:w-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Edit Game</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Opponent Name
              </label>
              <input
                type="text"
                value={editedOpponentName}
                onChange={(e) => setEditedOpponentName(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter opponent name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Venue
              </label>
              <input
                type="text"
                value={editedVenue}
                onChange={(e) => setEditedVenue(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter venue"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowGameEditModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGameEdit}
                className="px-4 py-2 bg-indigo-600 hover:bg-primary-cta rounded"
              >
                Save Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
