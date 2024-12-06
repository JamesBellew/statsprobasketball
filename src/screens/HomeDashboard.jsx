import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeDashboard() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [savedGames, setSavedGames] = useState([]);
  const navigate = useNavigate();

  // Fetch saved games from local storage on component mount
  useEffect(() => {
    const games = JSON.parse(localStorage.getItem("savedGames")) || [];
    setSavedGames(games);
  }, []);

  const handleLogout = () => {
    navigate("/"); // Navigate to the App.jsx (home page)
  };

  const handleStartNewGame = () => {
    console.log("Navigating to /startgame");
    navigate("/startgame");
  };

  const handleGameClick = (game) => {
    navigate("/ingame", { state: game }); // Pass saved game data as props
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Header Section */}
      <div className="relative flex flex-col items-start justify-center h-[30vh] p-6 bg-gradient-to-r from-purple-800 to-indigo-700 rounded-b-2xl">
        <div className="container mx-auto">
          <div className="flex justify-between items-center w-full">
            <div className="opacity-0">Placeholder Icon</div>
            <p className="px-3 py-2 bg-white/50 rounded-full">JB</p>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-light">Welcome</h1>
            <h2 className="text-4xl font-bold">James</h2>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        {/* Bottom Section */}
        <div className="p-6">
          <button
            onClick={handleStartNewGame}
            className="btn my-5 bg-[#632aed] px-4 py-2 rounded-lg"
          >
            Start New Game
          </button>

          <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
            <div
              className="bg-gray-800 col-span-6 p-4 rounded-lg cursor-pointer"
              // onClick={() => setIsExpanded(!isExpanded)}
              //put something here
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Saved Games</h4>
              </div>
              <p className="text-2xl font-bold">
                {savedGames.length || "No"} {savedGames.length === 1 ? "Game" : "Games"}
              </p>

              {isExpanded && (
                <div className="h-[20vh] overflow-auto">
                <ul className="mt-4  w-full  grid grid-cols-2">
                  {savedGames.length > 0 ? (
                    savedGames.map((game, index) => (
                      <li
                      key={index}
                      className="col-span-1 z-50  h-auto  flex mx-3 my-2 justify-between items-center bg-gray-700  rounded cursor-pointer hover:bg-gray-600"
                      // onClick={() => handleGameClick(game)} // Navigate to InGame with saved game
                    >
                      <div className="p-3">
                        <p className="text-sm font-medium">{game.opponentName || "Unknown"}</p>
                        <p className="text-xs text-gray-400 mb-3">{game.venue}</p>
                        {/* <button className="btn bg-blue-400 px-3 py-2 rounded-md">Continue</button> */}
                        <button onClick={() => handleGameClick(game)} className="btn bg-gray-900 px-3 py-2 rounded-md mr-3">Continue</button>
                        <button className="btn bg-indigo-400 px-3 py-2 rounded-md">Stats</button>
                      </div>
                      <div className="bg-gray-900 w-12 h-full flex items-center justify-center">
  <button 
    onClick={() => alert('clicked')} 
    className="text-xl text-indigo-400 hover:text-indigo-200"
  >
    ...
  </button>
</div>

                    </li>
                    
                    ))
                  ) : (
                    <li className="text-center text-gray-400">No saved games yet.</li>
                  )}
                </ul>
                </div>
              )}

         
            </div>
          </div>
          <div className="bg-gray-800 col-span-4 p-4 rounded-lg cursor-pointer mt-2">
          <div className="flex items-center justify-between ">
                <h4 className="text-sm font-bold text-xl">Saved Statistics</h4>
          
              </div>
              <div className="flex items-center justify-between mb-2 ">
                <h4 className="text-sm text-gray-400 font-small">No Saved Stats Yet</h4>
          
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
