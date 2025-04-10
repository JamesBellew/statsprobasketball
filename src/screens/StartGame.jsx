import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { db } from "../db"; // Import your Dexie instance
import useAuth from "../hooks/useAuth"; // if inside component, otherwise pass user in
import { useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase"; // Adjust path based on your project structure

export default function StartGame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opponentName, setOpponentName] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("home");
  const [lineouts, setLineouts] = useState([]);



  const location = useLocation();
  const selectedLineoutFromNav = location.state?.lineout;
  const passedTeamName = location.state?.teamName || "Home";
  console.log('team name ',passedTeamName);
  
  
  const [selectedLineout, setSelectedLineout] = useState(selectedLineoutFromNav?.id || null);
  

// const selectedLineoutFromNav = location.state?.lineout;
// const [selectedLineout, setSelectedLineout] = useState(selectedLineoutFromNav?.id || null);


  // const [selectedLineout, setSelectedLineout] = useState(null);
  const [playerStatsEnabled, setPlayerStatsEnabled] = useState(false);
  const [minutesTracked, setMinutesTracked] = useState(false);
  const [opponentLogo, setOpponentLogo] = useState(null); // Store the uploaded logo

  // const location = useLocation();
  // const selectedLineout = location.state?.lineout;
  
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
  

  useEffect(() => {
    if (playerStatsEnabled) {
      if (lineouts.length === 0) {
        alert("Player Stats are enabled but there are no lineouts available!");
        setSelectedLineout(null);
      } else {
        setSelectedLineout(lineouts[lineouts.length - 1].id);
      }
    }
  }, [playerStatsEnabled, lineouts]);

  const handleOpponentInputChange = (event) => {
    setOpponentName(event.target.value);
  };

  const handleGameStart = () => {
    const selectedLineoutData =
    playerStatsEnabled && selectedLineout
      ? lineouts.find((lineout) => lineout.id.toString() === selectedLineout.toString()) || null
      : null;
  

    const gameState = {
      opponentName,
      selectedVenue,
      playerStatsEnabled,
      lineout: selectedLineoutData,
      opponentLogo, // Pass logo data
      minutesTracked,
      passedTeamName
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

  return (
    <div className="h-screen w-full bg-gradient-to-b from-black to-gray-900 flex items-center">

      <div className="container mx-auto">
      <button onClick={()=>{
   navigate("/homedashboard"); 
      }} className="bg-primary-cta  py-2 px-10 rounded-md cursor-pointer absolute top-5 mx-10 w-auto flex items-center justify-center  ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mr-5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
</svg>
Back</button>
        <div className="w-full px-10 my-auto flex-row justify-center items-center">
          <label htmlFor="small-input" className="block mb-2 text-sm font-medium text-gray-200">
            Opponent
          </label>
          <input
            required
            onChange={handleOpponentInputChange}
            type="text"
            id="small-input"
            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />

          {/* Toggle Section for Player Stats */}
          <div className="grid grid-cols-4 mt-5 w-full lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 h-24 col-span-2 p-2 lg:p-4 rounded-lg flex items-center justify-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={playerStatsEnabled}
                  onChange={(e) => setPlayerStatsEnabled(e.target.checked)}
                  className="sr-only peer mx-auto"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-300">Player Stats</span>
              </label>
            </div>

            {/* Opponent Logo Upload */}
            <div
              className="bg-gray-800 h-24 col-span-2 p-2 lg:p-4 rounded-lg flex items-center justify-center cursor-pointer relative"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {opponentLogo ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={opponentLogo}
                    alt="Opponent Logo"
                    className="h-full object-contain rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpponentLogo(null);
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <FontAwesomeIcon icon={faUpload} className="text-xl mb-2" />
                  <span className="text-xs">Drag & Drop or Click to Upload</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Lineout Selector */}
          {playerStatsEnabled && (
            <div className="mt-5">
              <label className="block text-sm font-medium text-white mb-5">Select Lineout</label>
              <div className=" flex flex-row my-auto items-center justify-center space-x-5 px-5 mb-10">
                <div className="w-1/2 h-full">
              {lineouts.length > 0 ? (
                <select
                  value={selectedLineout || ""}
                  onChange={(e) => setSelectedLineout(e.target.value)}
                  className=" block w-full p-2 text-black bg-gray-50 border border-gray-300 rounded-lg text-xs"
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
              <div className="w-1/2 h-full items-center justify-center my-auto">

<label class="inline-flex items-center cursor-pointer">
  <input  
  checked={minutesTracked}
  onChange={(e) => setMinutesTracked(e.target.checked)}
                   type="checkbox" value="" class="sr-only peer"/>
  <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
  <span class="ms-3 text-sm font-medium text-gray-200">Timer</span>
</label>

              </div>

</div>


            </div>
          )}

          {/* Venue Toggle and Start Game Button */}
          <div className="grid grid-cols-4 mt-5 w-full lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 col-span-4 lg:col-span-2 flex h-24 rounded-lg relative">
              <div className="absolute w-1/2 h-full bg-white rounded-lg transition-transform duration-300" />
              <div className="z-10 w-1/2 h-full flex justify-center items-center cursor-pointer" onClick={() => setSelectedVenue("home")}>
                <button className={`px-4 py-2 rounded ${selectedVenue === "home" ? "text-gray-800 font-bold" : "text-white"}`}>
                  Home
                </button>
              </div>
              <div className="z-10 w-1/2 h-full flex justify-center items-center cursor-pointer" onClick={() => setSelectedVenue("away")}>
                <button className={`px-4 py-2 rounded ${selectedVenue === "away" ? "text-gray-800 font-bold" : "text-white"}`}>
                  Away
                </button>
              </div>
            </div>

            <button
              onClick={handleGameStart}
              className="bg-indigo-500 h-24 col-span-4 lg:col-span-2 p-2 lg:p-4 rounded-lg flex items-center justify-center text-white"
              disabled={!opponentName}
            >
              <FontAwesomeIcon icon={faPlay} />
              <span className="ms-3 text-sm font-medium">Start Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
