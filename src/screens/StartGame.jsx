import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusMinus, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function StartGame() {
  const navigate = useNavigate();
  const [opponentName, setOpponentName] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("home");

  // New states for player stats and lineout selection
  const [playerStatsEnabled, setPlayerStatsEnabled] = useState(false);
  const [lineouts, setLineouts] = useState([]);
  const [selectedLineout, setSelectedLineout] = useState(null);

  // Load saved lineouts from localStorage on mount
  useEffect(() => {
    const storedLineouts = JSON.parse(localStorage.getItem("lineouts")) || [];
    setLineouts(storedLineouts);
  }, []);

  // When player stats are enabled, if lineouts exist, select the newest one.
  // If none exist, alert the user.
  useEffect(() => {
    if (playerStatsEnabled) {
      if (lineouts.length === 0) {
        alert("Player Stats are enabled but there are no lineouts available!");
        setSelectedLineout(null);
      } else {
        // Default to the newest lineout (assuming the last one is the newest)
        setSelectedLineout(lineouts[lineouts.length - 1].id);
      }
    }
  }, [playerStatsEnabled, lineouts]);

  const handleClick = (venue) => {
    setSelectedVenue(venue);
  };

  const handleOpponentInputChange = (event) => {
    setOpponentName(event.target.value);
  };

  const handleGameStart = () => {
    // Only find a lineout if player stats are enabled and a lineout has been selected.
    const selectedLineoutData =
      playerStatsEnabled && selectedLineout
        ? lineouts.find((lineout) => lineout.id === selectedLineout) || null
        : null;
  
    const gameState = {
      opponentName,
      selectedVenue,
      playerStatsEnabled,
      lineout: selectedLineoutData, // will be null if no lineout was chosen
    };
  
    navigate("/ingame", { state: gameState });
  };
  

  return (
    <div className="h-screen w-full bg-gradient-to-b from-black to-gray-900 flex items-center  ">
      <div className="container  mx-auto">
        <div className="w-full   
        px-10  my-auto flex-row justify-center items-center">

            <label
              htmlFor="small-input"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Opponent
            </label>
            <input
              required
              onChange={handleOpponentInputChange}
              type="text"
              id="small-input"
              className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />


          {/* Toggle Section for Player Stats and Game Stats */}
          <div className="grid  grid-cols-4 mt-5 w-full 
          lg:grid-cols-4 gap-4">
            {/* Player Stats Toggle */}
            <div className="bg-gray-800 h-24 col-span-2 p-2 lg:p-4 rounded-lg flex items-center justify-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={playerStatsEnabled}
                  onChange={(e) => setPlayerStatsEnabled(e.target.checked)}
                  className="sr-only peer mx-auto"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Player Stats
                </span>
              </label>
            </div>

            {/* Game Stats Toggle */}
            <div className="bg-gray-800 h-24 col-span-2 p-2 lg:p-4 hover:bg-indigo-500 cursor-pointer rounded-lg flex items-center justify-center">
              <label className="inline-flex items-center cursor-pointer">
                <FontAwesomeIcon className="text-white" icon={faPlusMinus} />
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Game Stats
                </span>
              </label>
            </div>
          </div>

          {/* Lineout Selector Section */}
          <div className="mt-5">
            {playerStatsEnabled ? (
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Select Lineout
                </label>
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
            ) : (
              <div>
                <p className="text-gray-400">Player stats not recorded.</p>
              </div>
            )}
          </div>

          {/* Venue Toggle and Start Game Button */}
          <div className="grid grid-cols-4  mt-5 w-full lg:grid-cols-4 gap-4">
            {/* Venue Toggle */}
            <div className="bg-gray-800 col-span-4 lg:col-span-2 flex h-24 rounded-lg relative">
              {/* Slider Background */}
              <div className="absolute inset-0 flex">
                <div className="h-full w-1/2 transition-all duration-300" />
              </div>
              {/* Slider Indicator */}
              <div
                className={`absolute w-1/2 h-full bg-white rounded-lg transition-transform duration-300 ${
                  selectedVenue === "home"
                    ? "translate-x-0"
                    : "translate-x-full"
                }`}
              ></div>
              {/* Home Button */}
              <div
                className="z-10 w-1/2 h-full flex justify-center items-center cursor-pointer"
                onClick={() => setSelectedVenue("home")}
              >
                <button
                  className={`px-4 py-2 rounded ${
                    selectedVenue === "home"
                      ? "text-gray-800 font-bold"
                      : "text-white"
                  }`}
                >
                  Home
                </button>
              </div>
              {/* Away Button */}
              <div
                className="z-10 w-1/2 h-full flex justify-center items-center cursor-pointer"
                onClick={() => setSelectedVenue("away")}
              >
                <button
                  className={`px-4 py-2 rounded ${
                    selectedVenue === "away"
                      ? "text-gray-800 font-bold"
                      : "text-white"
                  }`}
                >
                  Away
                </button>
              </div>
            </div>
            {/* Start Game Button */}
            <button
              onClick={handleGameStart}
              disabled={!opponentName}
              className={`bg-gray-800 h-24 col-span-4 lg:col-span-2 p-2 lg:p-4 ${
                opponentName
                  ? "bg-indigo-500 cursor-pointer"
                  : "bg-gray-500 cursor-not-allowed"
              } rounded-lg flex items-center justify-center`}
            >
              <label className="inline-flex items-center">
                <FontAwesomeIcon className="text-white" icon={faPlay} />
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Start Game
                </span>
              </label>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
