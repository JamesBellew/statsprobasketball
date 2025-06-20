import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { db } from "../db"; // Import your Dexie instance
import useAuth from "../hooks/useAuth"; // if inside component, otherwise pass user in
import { useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase"; // Adjust path based on your project structure
import { doc, setDoc, getDoc } from "firebase/firestore";
import { firestore as firestoreDb } from "../firebase"; // 👈 Rename it on import




export default function StartGame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opponentName, setOpponentName] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("home");
  const [lineouts, setLineouts] = useState([]);
  const location = useLocation();
  const selectedLineoutFromNav = location.state?.lineout;
  const passedTeamName = location.state?.teamName || "Home";
  const [selectedLineout, setSelectedLineout] = useState(selectedLineoutFromNav?.id || null);
  const [playerStatsEnabled, setPlayerStatsEnabled] = useState(false);
  const [broadcastToggle,setBroadcastToggle] = useState(false)
  const [minutesTracked, setMinutesTracked] = useState(false);
  const [opponentLogo, setOpponentLogo] = useState(null); // Store the uploaded logo
  const [awayTeamColor, setAwayTeamColor] = useState("#0b63fb");
  const [teamColor, setTeamColor] = useState("#8B5CF6"); // Home team color from settings
  const [leagues, setLeagues] = useState([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [customLeague, setCustomLeague] = useState("");
  const [selectedLeagueName, setSelectedLeagueName] = useState("");
  
  const handleGoBack = (e) => {
    e.preventDefault(); // Prevent form submission reload
    // Perform login logic here (e.g., validation, API call)
    navigate("/startgame"); // Navigate to HomeDashboard after login
  };

  useEffect(() => {
    const fetchLineouts = async () => {
      let allLineouts = [];
  
      // 1. Fetch local lineouts
      const local = await db.lineouts.toArray();
      allLineouts = [...local];
  
      // 2. Fetch cloud lineouts if user is logged in
      if (user) {
        const snapshot = await getDocs(collection(firestore, "users", user.uid, "lineouts"));
        const cloudLineouts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isCloud: true,
        }));
  
        allLineouts = [...local, ...cloudLineouts];
      }
  
      setLineouts(allLineouts);
    };
  
    fetchLineouts();
  }, [user]);
  


const venueSelectedHandler=(venue)=>{
  console.log('we are in the venuw handler '+venue);
  setSelectedVenue(venue)
  
}

  useEffect(() => {
    if (playerStatsEnabled) {
      if (lineouts.length === 0) {
        alert("You don't ave any saved lineout");
        setPlayerStatsEnabled(false)
        setSelectedLineout(null);
      } else {
        setSelectedLineout(lineouts[lineouts.length - 1].id);
      }
    }
  }, [playerStatsEnabled, lineouts]);

  const handleOpponentInputChange = (event) => {
    setOpponentName(event.target.value);
  };

  useEffect(() => {
    // Fetch leagues from Firestore (new structure: each doc has a Names array)
    async function fetchLeagues() {
      const snapshot = await getDocs(collection(firestore, "Leagues"));
      // Extract all Names arrays and flatten them with region
      const leagueList = [];
      snapshot.docs.forEach(doc => {
        const region = doc.id;
        const names = doc.data().Names || [];
        names.forEach(name => {
          leagueList.push({ id: region, name });
        });
      });
      setLeagues(leagueList); // leagues is now an array of {id, name}
    }
    fetchLeagues();
  }, []);

  const handleLeagueChange = (e) => {
    const [id, name] = e.target.value.split("|");
    setSelectedLeagueId(id);
    setSelectedLeagueName(name);
    setCustomLeague("");
  };

  const handleCustomLeagueChange = (e) => {
    setCustomLeague(e.target.value);
    setSelectedLeagueId("");
    setSelectedLeagueName("");
  };

  const handleGameStart = async () => {
    const selectedLineoutData =
      playerStatsEnabled && selectedLineout
        ? lineouts.find((lineout) => lineout.id.toString() === selectedLineout.toString()) || null
        : null;
  
    // 🧠 Create the slug (e.g., ravens-vs-wolves-2025-04-11)
    const dateStr = new Date().toISOString().split("T")[0];
    const slug = `${passedTeamName}-vs-${opponentName}-${dateStr}`
      .toLowerCase()
      .replace(/\s+/g, "-");
  
    // Determine league info
    let leagueId = selectedLeagueId;
    let leagueName = selectedLeagueName;
    if (customLeague.trim()) {
      leagueId = "custom";
      leagueName = customLeague.trim();
    }
  
    // ✅ Save public document if broadcasting
    if (broadcastToggle) {
      console.log('we have a broadcast toggle activated');
      
      await setDoc(doc(firestoreDb, "liveGames", slug), {
        homeTeamName: passedTeamName,
        opponentName,
        createdAt: new Date(),
        isLive: true,
        slug, // Optional: makes it easier to reference later
        awayTeamColor,
        homeTeamColor: teamColor || "#8B5CF6", // <-- Save home team color
        leagueId,
        leagueName,
        venue: selectedVenue, // Save venue
      });
    }else{
      console.log('no broadcast toggle');
      
    }

  
    // 📦 Package game state to send to InGame screen
    const gameState = {
      opponentName,
      selectedVenue,
      playerStatsEnabled,
      lineout: selectedLineoutData,
      opponentLogo,
      minutesTracked,
      passedTeamName,
      broadcast: broadcastToggle, // Pass this if needed later
      slug, // You may want to keep this around too
      awayTeamColor,
      leagueId,
      leagueName,
      selectedVenue, // Pass venue
    };
  
    navigate("/ingame", { state: gameState });
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOpponentLogo(reader.result); // Save image as Base64
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag & drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOpponentLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  //!Broadcasting logic below 
  // const slug = `${homeTeamName}-vs-${opponentName}-${new Date().toISOString().split("T")[0]}`.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    // Fetch home team color from Settings
    async function fetchTeamColor() {
      if (user) {
        // Firestore settings
        const ref = doc(firestore, "users", user.uid, "settings", "preferences");
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().teamColor) {
          setTeamColor(snap.data().teamColor);
        }
      } else {
        // Local DB settings
        const localSettings = await db.settings.get("preferences");
        if (localSettings && localSettings.teamColor) {
          setTeamColor(localSettings.teamColor);
        }
      }
    }
    fetchTeamColor();
  }, [user]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-gray-900 flex items-center justify-center py-8 px-2">
      <div className="relative w-full max-w-xl mx-auto bg-gray-900/90 rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-800">
        {/* Back Button (better design, inside card, left-aligned) */}
        <button
          onClick={() => navigate("/homedashboard")}
          className="flex items-center gap-2 w-fit rounded-lg bg-gray-800 hover:bg-gray-700 text-white shadow-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="font-medium text-sm">Back</span>
        </button>

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          {/* League Selection */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-300">League</label>
            <select
              value={selectedLeagueId && selectedLeagueName ? `${selectedLeagueId}|${selectedLeagueName}` : ""}
              onChange={handleLeagueChange}
              className="block w-full p-2 text-gray-900 border border-gray-700 rounded-lg bg-gray-100 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Select a league</option>
              {leagues.map((league, idx) => (
                <option key={idx} value={`${league.id}|${league.name}`}>{league.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={customLeague}
              onChange={handleCustomLeagueChange}
              placeholder="Or enter a custom league/tournament"
              className="mt-2 block w-full p-2 text-gray-900 border border-gray-700 rounded-lg bg-gray-100 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          {/* Opponent */}
          <div>
            <label htmlFor="opponent-input" className="block mb-1 text-xs font-semibold text-gray-300">Opponent</label>
            <input
              required
              onChange={handleOpponentInputChange}
              type="text"
              id="opponent-input"
              className="block w-full p-2 text-gray-900 border border-gray-700 rounded-lg bg-gray-100 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          {/* Away Team Color Picker */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-300">Away Team Color</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                "#8B5CF6", "#06B6D4", "#F59E0B", "#EF4444", "#10B981", "#6366F1", "#EC4899", "#64748B"
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    awayTeamColor === color ? 'border-white scale-110 shadow-lg' : 'border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAwayTeamColor(color)}
                  aria-label={`Select color ${color}`}
                >
                  {awayTeamColor === color && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles and Logo Upload */}
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            {/* Player Stats Toggle */}
            <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-200 font-medium">Player Stats</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={playerStatsEnabled}
                  onChange={(e) => setPlayerStatsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all"></div>
              </label>
            </div>

            {/* Logo Upload */}
            <div
              className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center px-4 py-3 cursor-pointer relative min-h-[56px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {opponentLogo ? (
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <img
                    src={opponentLogo}
                    alt="Opponent Logo"
                    className="h-full w-full object-contain rounded-full border border-gray-700"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpponentLogo(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow"
                  >
                    <FontAwesomeIcon className="w-4" icon={faTrash} />
                  </button>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center text-gray-300 cursor-pointer">
                  <FontAwesomeIcon icon={faUpload} className="text-lg mb-1" />
                  <span className="text-xs">Logo</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Broadcast Toggle (if user) */}
            {user && (
              <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-200 font-medium">Broadcast</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    checked={broadcastToggle}
                    onClick={(e) => setBroadcastToggle(e.target.checked)}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all"></div>
                </label>
              </div>
            )}
          </div>

          {/* Lineout Selector (if Player Stats enabled) */}
          {playerStatsEnabled && (
            <div className="bg-gray-800 rounded-lg p-4 mt-2">
              <label className="block text-xs font-semibold text-gray-300 mb-2">Select Lineout</label>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  {lineouts.length > 0 ? (
                    <select
                      value={selectedLineout || ""}
                      onChange={(e) => setSelectedLineout(e.target.value)}
                      className="block w-full p-2 text-black bg-gray-50 border border-gray-300 rounded-lg text-xs"
                    >
                      {lineouts.map((lineout) => (
                        <option key={lineout.id} value={lineout.id}>
                          {lineout.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-400">None</p>
                  )}
                </div>
                <div className="flex-1 w-full flex items-center justify-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      checked={minutesTracked}
                      onChange={(e) => setMinutesTracked(e.target.checked)}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all"></div>
                    <span className="ml-3 text-xs font-medium text-gray-200">Timer</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Venue Toggle and Start Game Button */}
        <div className="flex flex-col md:flex-row gap-4 mt-6 items-center">
          <div className="flex-1 bg-gray-800 rounded-lg flex overflow-hidden relative h-16">
            {/* Sliding background */}
            <div
              className={`absolute top-0 left-0 h-full w-1/2 bg-white rounded-lg transition-transform duration-300 ease-in-out ${selectedVenue === "away" ? "translate-x-full" : "translate-x-0"}`}
            />
            {/* Home Button */}
            <div
              className="z-10 w-1/2 h-full flex justify-center items-center cursor-pointer"
              onClick={() => venueSelectedHandler('home')}
            >
              <button className={`px-4 py-2 rounded ${selectedVenue === "home" ? "text-gray-800 font-bold" : "text-white"}`}>Home</button>
            </div>
            {/* Away Button */}
            <div
              className="z-10 w-1/2 h-full flex justify-center items-center cursor-pointer"
              onClick={() => venueSelectedHandler('away')}
            >
              <button className={`px-4 py-2 rounded ${selectedVenue === "away" ? "text-gray-800 font-bold" : "text-white"}`}>Away</button>
            </div>
          </div>
          <button
            onClick={handleGameStart}
            className="md:w-full w-auto px-8 md:w-auto py-4 flex-1 bg-indigo-500 hover:bg-indigo-600 h-16 rounded-lg flex items-center justify-center text-white text-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 mt-4 md:mt-0"
            disabled={!opponentName}
          >
            <FontAwesomeIcon icon={faPlay} />
            <span className="ml-3">Start Game</span>
          </button>
        </div>
      </div>
    </div>
  );
}
