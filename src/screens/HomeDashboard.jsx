import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function HomeDashboard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  // Dummy Saved Games Data
  const savedGames = [
    { name: "Game 1", date: "2024-11-20", action: "View" },
    { name: "Game 2", date: "2024-11-19", action: "View" },
    { name: "Game 3", date: "2024-11-18", action: "View" },
    { name: "Game 4", date: "2024-11-17", action: "View" },
    { name: "Game 5", date: "2024-11-16", action: "View" },
  ];
const handleLogout=()=>{
    navigate("/"); // Navigate to the App.jsx (home page)
}
const handleStartNewGame = () => {
  console.log("Navigating to /startgame");
  navigate("/startgame");
};

  return (
    
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Header Section */}
      <div className="relative flex flex-col items-start justify-center h-[30vh] p-6 bg-gradient-to-r from-purple-800 to-indigo-700 rounded-b-2xl">
        {/* Header Content */}
        <div className="container mx-auto">
        <div className="flex justify-between items-center w-full">
          <div className="opacity-0">Placeholder Icon</div>
          <p className="px-3 py-2 bg-white/50 rounded-full">JB</p>
        </div>
    

        <div className="mt-4">
          <h1 className="text-2xl font-light">Welcome</h1>
          <h2 className="text-4xl font-bold">James</h2>
        </div>

        <div className="mt-6 w-full">
          <div className="flex items-center px-4 py-2 bg-gray-800 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search Device"
              className="ml-4 w-full bg-transparent text-sm text-gray-300 placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>
        </div>
      </div>
      <div className="container mx-auto">
      {/* Bottom Section */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold"></h3>
          <button className="text-sm text-gray-400 hover:text-gray-200">
            Statspro
          </button>
        </div>

        <button onClick={handleStartNewGame} className="btn my-5 bg-[#632aed] px-4 py-2 rounded-lg">
          Start New Game
        </button>

        {/* Device Grid */}
        <div className="grid grid-cols-4   lg:grid-cols-6 gap-4">
          {/* Saved Game Stats Card */}
          <div
            className="bg-gray-800 col-span-4 p-4 rounded-lg cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Saved Game Stats</h4>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                {isExpanded ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 12H6"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                )}
              </svg>
            </div>
            <p className="text-2xl font-bold">4</p>
            <p className="text-xs text-gray-400">6 Remaining</p>

            {/* Expandable Saved Games List */}
            {isExpanded && (
              <ul className="mt-4 space-y-2">
                {savedGames.map((game, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-700 p-2 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">{game.name}</p>
                      <p className="text-xs text-gray-400">{game.date}</p>
                    </div>
                    <button className="text-xs text-indigo-400 hover:text-indigo-200">
                      {game.action}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Other Cards */}
          <div className=" bg-gray-800 h-32 col-span-2 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Match Settings</h4>
            <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="w-6 h-6"
>
  <circle cx="12" cy="12" r="3"></circle>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V20a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V4a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H20a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
</svg>

            <p className="text-xs text-gray-200 mt-2">Customize to your needs</p>
          </div>
          <div className="bg-gray-800 h-32 col-span-2 p-4 rounded-lg">
            <h4 className="text-sm font-medium">Buy me a coffee</h4>
            <p className="text-2xl font-bold">$2</p>
            <p className="text-xs text-gray-400">Saying Thanks </p>
          </div>
          <div className="bg-gray-800 col-span-3 h-32 p-4 rounded-lg">
            <h4 className="text-sm font-medium">Buy me a coffee</h4>
            <p className="text-2xl font-bold">$2</p>
            <p className="text-xs text-gray-400">Saying Thanks </p>
          </div>
          <a onClick={handleLogout} className=" flex bg-indigo-600 col-span-1 h-32 p-4 rounded-lg">
            <h4 className="text-sm font-medium mx-auto my-auto">Logout</h4>
       

          </a>
        </div>
      </div>
      </div>
    </div>
 
  );
}
