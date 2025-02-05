import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusMinus, faPlay } from "@fortawesome/free-solid-svg-icons";

export default function HomeDashboard() {
  // Dashboard states
  const [isExpanded, setIsExpanded] = useState(true);
  const [savedGames, setSavedGames] = useState([]);
  // Load all saved lineouts from localStorage, but display only one (the most recent)
  const [savedLineouts, setSavedLineouts] = useState([]);
  const navigate = useNavigate();

  // Modal & Form states for Lineout creation/editing
  const [showLineoutModal, setShowLineoutModal] = useState(false);
  const [lineoutName, setLineoutName] = useState("");
  const [players, setPlayers] = useState([]);
  const [formError, setFormError] = useState("");
  // If editing, store the id of the lineout being edited; if null, we're creating a new one.
  const [editingLineoutId, setEditingLineoutId] = useState(null);

  // New states for editing a saved game
  const [showGameEditModal, setShowGameEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editedOpponentName, setEditedOpponentName] = useState("");
  const [editedVenue, setEditedVenue] = useState("");

  // Dropdown state for inline dropdowns (used for both saved games and lineouts)
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Load saved games and lineouts from localStorage on component mount
  useEffect(() => {
    const games = JSON.parse(localStorage.getItem("savedGames")) || [];
    setSavedGames(games);

    const lineouts = JSON.parse(localStorage.getItem("lineouts")) || [];
    setSavedLineouts(lineouts);
  }, []);

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

  const handleSaveGameEdit = () => {
    if (!editedOpponentName.trim() || !editedVenue.trim()) {
      alert("Please fill in both opponent name and venue.");
      return;
    }
    const updatedGame = {
      ...editingGame,
      opponentName: editedOpponentName,
      venue: editedVenue,
    };
    const updatedGames = savedGames.map((game) =>
      game.id === updatedGame.id ? updatedGame : game
    );
    localStorage.setItem("savedGames", JSON.stringify(updatedGames));
    setSavedGames(updatedGames);
    setShowGameEditModal(false);
    setEditingGame(null);
  };

  const handleDeleteGame = (gameId) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      const updatedGames = savedGames.filter((game) => game.id !== gameId);
      localStorage.setItem("savedGames", JSON.stringify(updatedGames));
      setSavedGames(updatedGames);
      setActiveDropdown(null);
    }
  };

  // --- Lineout Handlers ---
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

  const handleDeleteLineout = (lineoutId) => {
    setActiveDropdown(null);
    if (window.confirm("Are you sure you want to delete this lineout?")) {
      const updatedLineouts = savedLineouts.filter(
        (lineout) => lineout.id !== lineoutId
      );
      localStorage.setItem("lineouts", JSON.stringify(updatedLineouts));
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

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = players.map((player, i) =>
      i === index ? { ...player, [field]: value } : player
    );
    setPlayers(updatedPlayers);
  };

  const handleSaveLineout = () => {
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
    let updatedLineouts;
    if (editingLineoutId) {
      updatedLineouts = savedLineouts.map((lineout) =>
        lineout.id === editingLineoutId ? newLineout : lineout
      );
    } else {
      // Since only one lineout is allowed, we replace any existing one.
      updatedLineouts = [newLineout];
    }
    localStorage.setItem("lineouts", JSON.stringify(updatedLineouts));
    setSavedLineouts(updatedLineouts);
    setShowLineoutModal(false);
    setLineoutName("");
    setPlayers([]);
    setEditingLineoutId(null);
    setFormError("");
  };

  // For display, only show the most recent (or only) lineout.
  const displayedLineout =
    savedLineouts.length > 0 ? savedLineouts[savedLineouts.length - 1] : null;

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

      <div className="container mx-auto p-6">
        {/* Bottom Section */}
        <div className="p-6">
          <button
            onClick={handleStartNewGame}
            className="btn my-5 bg-[#632aed] px-4 py-2 rounded-lg"
          >
            Start New Game
          </button>

          {/* Saved Games Section */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium">Saved Games</h4>
            <p className="text-2xl font-bold">
              {savedGames.length || "No"} {savedGames.length === 1 ? "Game" : "Games"}
            </p>
            <div className="h-[20vh] overflow-auto mt-4">
              <ul className="grid grid-cols-3  gap-4">
                {savedGames.length > 0 ? (
                  savedGames.map((game) => (
                    <li
                      key={game.id}
                      className="bg-gray-700 col-span-3 md:col-span-1  p-3 rounded hover:bg-gray-600  flex flex-col"
                    >
                      <div className="mb-2">
                        <p className="text-sm font-medium">{game.opponentName || "Unknown"} ({game.venue})</p>
                        <p className="text-xs text-gray-400"></p>
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => handleGameClick(game)}
                          className="bg-gray-600 px-3 py-1 rounded text-xs"
                        >
                          Open
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openGameEditModal(game)}
                            className="bg-purple-800/50 px-3 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className=" px-3 py-1 rounded text-xs"
                          >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
                          </button>
                          

                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center text-gray-400">No saved games yet.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Lineout Section */}
          <div className="bg-gray-800 p-4 rounded-lg mt-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">Lineout</p>
              <button
                onClick={openLineoutModal}
                className="btn btn-primary px-5 py-2 bg-[#632aed] rounded-md"
              >
                Create
              </button>
            </div>
            {displayedLineout ? (
              <div className="bg-gray-700 p-3 rounded hover:bg-gray-600 flex justify-between items-center mt-3">
                <div>
                  <p className="font-medium">{displayedLineout.name}</p>
                  <div className="mt-2">
                    {displayedLineout.players.map((player, index) => (
                      <p key={index} className="text-xs text-gray-100">
                        <span className="text-gray-400">({player.number})</span> {player.name}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === displayedLineout.id ? null : displayedLineout.id
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
                        className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLineout(displayedLineout.id)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No Lineouts Saved</p>
            )}
          </div>

          {/* Saved Statistics Section */}
          <div className="bg-gray-800 p-4 rounded-lg mt-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-xl">Saved Statistics</h4>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-400 font-small">No Saved Stats Yet</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Creating / Editing a Lineout */}
      {showLineoutModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-lg w-11/12 md:w-1/2 p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingLineoutId ? "Edit Lineout" : "Create Lineout"}
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Lineout Name
                </label>
                <input
                  type="text"
                  value={lineoutName}
                  onChange={(e) => setLineoutName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter lineout name"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Players</h3>
                {players.map((player, index) => (
                  <div key={index} className="flex flex-row gap-2 mb-3 items-center">
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handlePlayerChange(index, "name", e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Player ${index + 1} Name`}
                    />
                    <input
                      type="number"
                      value={player.number}
                      onChange={(e) => handlePlayerChange(index, "number", e.target.value)}
                      className="w-24 px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Number"
                    />
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded"
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
              <label className="block text-sm font-medium mb-1">Opponent Name</label>
              <input
                type="text"
                value={editedOpponentName}
                onChange={(e) => setEditedOpponentName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter opponent name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Venue</label>
              <input
                type="text"
                value={editedVenue}
                onChange={(e) => setEditedVenue(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded"
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
