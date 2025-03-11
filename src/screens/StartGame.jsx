import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { db } from "../db"; // Import your Dexie instance

export default function StartGame() {
  const navigate = useNavigate();
  const [opponentName, setOpponentName] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("home");
  const [lineouts, setLineouts] = useState([]);
  const [selectedLineout, setSelectedLineout] = useState(null);
  const [playerStatsEnabled, setPlayerStatsEnabled] = useState(false);
  const [opponentLogo, setOpponentLogo] = useState(null); // Store the uploaded logo

  useEffect(() => {
    async function fetchLineouts() {
      const storedLineouts = await db.lineouts.toArray();
      setLineouts(storedLineouts);
    }
    fetchLineouts();
  }, []);

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
        ? lineouts.find((lineout) => lineout.id === selectedLineout) || null
        : null;

    const gameState = {
      opponentName,
      selectedVenue,
      playerStatsEnabled,
      lineout: selectedLineoutData,
      opponentLogo, // Pass logo data
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
              <label className="block text-sm font-medium text-white">Select Lineout</label>
              {lineouts.length > 0 ? (
                <select
                  value={selectedLineout || ""}
                  onChange={(e) => setSelectedLineout(e.target.value)}
                  className="mt-1 block w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
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
