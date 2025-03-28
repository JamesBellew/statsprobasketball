import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusMinus, faPlay } from "@fortawesome/free-solid-svg-icons";
import { db } from "../db";
import { uploadGameToCloud } from "../utils/syncGameToCloud"; // adjust path
import useAuth from "../hooks/useAuth"; // if inside component, otherwise pass user in

import { faCheck, faEllipsisV } from "@fortawesome/free-solid-svg-icons";

export default function HomeDashboard() {
  // Dashboard states
  const [isExpanded, setIsExpanded] = useState(true);
  const [savedGames, setSavedGames] = useState([]);
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

  // Load saved lineouts from IndexedDB on component mount
  useEffect(() => {
    async function fetchLineouts() {
      const lineouts = await db.lineouts.toArray();
      setSavedLineouts(lineouts);
    }
    fetchLineouts();
    
  }, []);
// HomeDashboard.jsx (partial)
useEffect(() => {
  async function fetchSavedGames() {
    const games = await db.games.toArray();
    setSavedGames(games);
  }
  fetchSavedGames();
}, []);
console.log(savedGames);



const handleCompleteGameClick = (game) => {
  setGameToComplete(game);
  setShowCompleteModal(true);
};

const handleConfirmCompleteGame = async () => {
  if (!gameToComplete) return;
  const updatedGame = { ...gameToComplete, isComplete: true };
  await db.games.put(updatedGame);
  const games = await db.games.toArray();
  setSavedGames(games);
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
    console.log("Navigating to /startgame");
    navigate("/startgame");
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
  
    // Use the correct table: 'games' as defined in your db.js file
    await db.games.put(updatedGame);
  
    // Re-fetch games from Dexie using the correct table
    const games = await db.games.toArray();
    setSavedGames(games);
    setShowGameEditModal(false);
    setEditingGame(null);
  };
  
  

  const handleDeleteGame = async (gameId) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      await db.games.delete(gameId);
      const games = await db.games.toArray();
      setSavedGames(games);
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
  const handleReopenGameClick = (game) => {
    setGameToReopen(game);
    setShowReopenModal(true);
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
    if (window.confirm("Are you sure you want to delete this lineout?")) {
      await db.lineouts.delete(lineoutId);
      const updatedLineouts = await db.lineouts.toArray();
      setSavedLineouts(updatedLineouts);
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
    if (!lineoutName.trim()) {
      setFormError("Please enter a lineout name.");
      return;
    }
    for (let i = 0; i < players.length; i++) {
      if (!players[i].name.trim() || !players[i].number) {
        setFormError("All players must have a name and a number.");
        return;
      }
    }
    const numbers = players.map((p) => p.number.toString());
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      setFormError("Each player must have a unique number.");
      return;
    }
    const newLineout = {
      id: editingLineoutId || Date.now(),
      name: lineoutName,
      players,
    };
    if (editingLineoutId) {
      // Update the existing lineout
      await db.lineouts.put(newLineout);
    } else {
      // Since only one lineout is allowed, clear any existing entries and add new one.
      await db.lineouts.clear();
      await db.lineouts.add(newLineout);
    }
    
    // Re-fetch from DB
    const updatedLineouts = await db.lineouts.toArray();
    setSavedLineouts(updatedLineouts);
    setShowLineoutModal(false);
    setLineoutName("");
    setPlayers([]);
    setEditingLineoutId(null);
    setFormError("");
  };

  const handleCreateStatisticSave= async () =>{
    
  }


  
  // For display, only show the most recent (or only) lineout.
  const displayedLineout =
    savedLineouts.length > 0 ? savedLineouts[savedLineouts.length - 1] : null;
    const handleSetInProgress = async (game) => {
      const updatedGame = { ...game, isComplete: false };
      await db.games.put(updatedGame);
      const games = await db.games.toArray();
      setSavedGames(games);
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
          <button onClick={()=>{
            handleLogout()
          }} className="px-4 py-2 bg-primary-cta hover:bg-indigo-600 text-gray-50 rounded-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Logout</span>
          </button>
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
      ({savedGames.length || "No"} {savedGames.length === 1 ? "Game" : "Games"})
    </p>
  </div>

  {/* In Progress Section */}
  <div className="border-l-4 px-5 border-l-secondary-cta">
    <h3 className="mt-8 mb-3">In Progress</h3>
  </div>
  <div className="h-auto bg-secondary-bg rounded-md py-10 px-5 overflow-auto">
    <ul className="grid grid-cols-6 gap-4">
      {savedGames.filter(game => !game.isComplete).length > 0 ? (
        savedGames
          .filter(game => !game.isComplete)
          .map((game) => (
            <li
              key={game.id}
              className="bg-white/5 border-l-secondary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10 flex flex-col"
            >
              <div className="mb-2">
                <p className="text-sm font-medium">
                  {game.opponentName || "Unknown"} ({game.venue})
                </p>
              </div>
              <div className="flex justify-between">
                <div className="flex space-x-2 w-full">
                  <button
                    onClick={() => handleGameClick(game)}
                    className="py-1 bg-white/10 px-4 text-secondary-cta font-semibold rounded flex items-center text-md ml-1"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => handleCompleteGameClick(game)}
                    className="py-1 bg-secondary-cta px-4 text-center font-semibold rounded flex items-center text-md text-secondary-bg"
                  >
                    <FontAwesomeIcon icon={faCheck} className="mr-2" /> 
                  </button>
                  <div className="flex justify-end space-x-2 w-full">
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
                  </div>
                </div>
              </div>
            </li>
          ))
      ) : (
        <li className="text-gray-400 w-44 ">No games in progress</li>
      )}
    </ul>
  </div>

  {/* Completed Section */}
  <div className="border-l-4 px-5 border-l-primary-cta mt-8">
    <h3 className="mt-8 mb-3">Completed</h3>
  </div>
  <div className="h-auto bg-secondary-bg rounded-md py-10 px-5 overflow-auto">
    <ul className="grid grid-cols-6 gap-4">
      {savedGames.filter(game => game.isComplete).length > 0 ? (
        savedGames
          .filter(game => game.isComplete)
          .map((game) => (
            <li
              key={game.id}
              className="bg-white/5 border-l-primary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10 flex flex-col"
            >
              <div className="mb-2">
                <p className="text-sm font-medium">
                  {game.opponentName || "Unknown"} ({game.venue})
                </p>
              </div>
              <div className="flex justify-between">
                <div className="flex space-x-2 w-full">
                <button
                    onClick={() => handleGameClick(game)}
                    className="py-1 bg-white/10 px-4 text-primary-cta font-semibold rounded flex items-center text-md ml-1"
                  >
                    Open
                  </button>
                  {/* <button
                    onClick={() => handleSetInProgress(game)}
                    className="p-2 w-auto px-4 bg-white/10 hover:bg-gray-500 rounded text-white"
                  >
                    Restore
                  </button> */}
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
        <li className="text-gray-400">No completed games</li>
      )}
    </ul>
  </div>
</div>


          <div className="grid grid-cols-2 gap-4">
            {/* Lineout Section */}
            <div className="bg-secondary-bg p-8 col-span-2 sm:col-span-2 rounded-lg mt-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">Lineout</p>
                {!displayedLineout && (
                  <button
                    onClick={openLineoutModal}
                    className="btn btn-primary px-5 py-2 bg-primary-cta rounded-md"
                  >
                    Create
                  </button>
                )}
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
                          onClick={() =>
                            handleDeleteLineout(displayedLineout.id)
                          }
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
                className="px-4 py-2 bg-indigo-600 hover:bg-primary-cta rounded"
              >
                Save Lineout
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
