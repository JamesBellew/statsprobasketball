import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeDashboard() {
  // Dashboard states
  const [isExpanded, setIsExpanded] = useState(true);
  const [savedGames, setSavedGames] = useState([]);
  const [savedLineouts, setSavedLineouts] = useState([]);
  const navigate = useNavigate();

  // Modal & Form states for Lineout creation/editing
  const [showLineoutModal, setShowLineoutModal] = useState(false);
  const [lineoutName, setLineoutName] = useState("");
  const [players, setPlayers] = useState([]);
  const [formError, setFormError] = useState("");
  // If editing, store the id of the lineout being edited; if null, we're creating a new one.
  const [editingLineoutId, setEditingLineoutId] = useState(null);
  // Track which dropdown (by lineout id) is open
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Ref for handling clicks outside the dropdown
  const dropdownRef = useRef(null);

  // Load saved games and lineouts from localStorage on mount
  useEffect(() => {
    const games = JSON.parse(localStorage.getItem("savedGames")) || [];
    setSavedGames(games);

    const lineouts = JSON.parse(localStorage.getItem("lineouts")) || [];
    setSavedLineouts(lineouts);
  }, []);

  // Close dropdown if click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    navigate("/"); // Navigate to home page
  };

  const handleStartNewGame = () => {
    console.log("Navigating to /startgame");
    navigate("/startgame");
  };

  const handleGameClick = (game) => {
    navigate("/ingame", { state: game }); // Pass saved game data as props
  };

  // Open the modal for creating a new lineout
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

  // Open the modal for editing an existing lineout and pre-populate the fields
  const openEditModal = (lineout) => {
    setEditingLineoutId(lineout.id);
    setLineoutName(lineout.name);
    setPlayers(lineout.players);
    setFormError("");
    setShowLineoutModal(true);
    setActiveDropdown(null);
  };

  // Delete a lineout by id
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

  // Add a new player (if below 15)
  const addPlayer = () => {
    if (players.length < 15) {
      setPlayers([...players, { name: "", number: "" }]);
    }
  };

  // Remove the last player (if more than 5)
  const removePlayer = () => {
    if (players.length > 5) {
      setPlayers(players.slice(0, players.length - 1));
    }
  };

  // Handle changes in a player's name or number
  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = players.map((player, i) =>
      i === index ? { ...player, [field]: value } : player
    );
    setPlayers(updatedPlayers);
  };

  // Validate the form and save (or update) the lineout
  const handleSaveLineout = () => {
    // Basic validation
    if (!lineoutName.trim()) {
      setFormError("Please enter a lineout name.");
      return;
    }
    // Ensure all players have name and number
    for (let i = 0; i < players.length; i++) {
      if (!players[i].name.trim() || !players[i].number) {
        setFormError("All players must have a name and a number.");
        return;
      }
    }
    // Ensure no duplicate numbers (convert to string for consistency)
    const numbers = players.map((p) => p.number.toString());
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      setFormError("Each player must have a unique number.");
      return;
    }

    // Create the new or updated lineout object
    const newLineout = {
      id: editingLineoutId || Date.now(),
      name: lineoutName,
      players,
    };

    let updatedLineouts;
    if (editingLineoutId) {
      // Editing: update the matching lineout
      updatedLineouts = savedLineouts.map((lineout) =>
        lineout.id === editingLineoutId ? newLineout : lineout
      );
    } else {
      // Creating: add new lineout to list
      updatedLineouts = [...savedLineouts, newLineout];
    }

    // Save to localStorage and update state
    localStorage.setItem("lineouts", JSON.stringify(updatedLineouts));
    setSavedLineouts(updatedLineouts);

    // Close modal and clear form
    setShowLineoutModal(false);
    setLineoutName("");
    setPlayers([]);
    setEditingLineoutId(null);
    setFormError("");
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

          {/* Saved Games Section */}
          <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-gray-800 col-span-6 p-4 rounded-lg cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Saved Games</h4>
              </div>
              <p className="text-2xl font-bold">
                {savedGames.length || "No"}{" "}
                {savedGames.length === 1 ? "Game" : "Games"}
              </p>

              {isExpanded && (
                <div className="h-[20vh] overflow-auto">
                  <ul className="mt-4 grid grid-cols-2 w-full">
                    {savedGames.length > 0 ? (
                      savedGames.map((game, index) => (
                        <li
                          key={index}
                          className="col-span-2 sm:col-span-1 z-50 h-auto flex mx-3 my-2 justify-between items-center bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                        >
                          <div className="p-3">
                            <div className="flex items-center mb-3">
                              <p className="text-sm font-medium">
                                {game.opponentName || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-400 ml-2">
                                ({game.venue})
                              </p>
                            </div>
                            <button
                              onClick={() => handleGameClick(game)}
                              className="btn bg-gray-900 px-3 py-2 rounded-md mr-3"
                            >
                              Continue
                            </button>
                            <button className="btn bg-indigo-400 px-3 py-2 rounded-md">
                              Stats
                            </button>
                          </div>
                          <div className="bg-gray-900 w-12 h-full flex items-center justify-center">
                            <button
                              onClick={() => alert("clicked")}
                              className="text-xl text-indigo-400 hover:text-indigo-200"
                            >
                              ...
                            </button>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-center text-gray-400">
                        No saved games yet.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Lineouts Section */}
          <div className="grid grid-cols-4 mt-2 lg:grid-cols-6 gap-4">
            <div className="bg-gray-800 col-span-6 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">Lineouts</p>
                <button
                  onClick={openLineoutModal}
                  className="btn btn-primary px-5 py-2 bg-[#632aed] rounded-md"
                >
                  Create
                </button>
              </div>
              {savedLineouts.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {savedLineouts.map((lineout) => (
                    <li
                      key={lineout.id}
                      className="bg-gray-700 p-3 rounded hover:bg-gray-600 flex justify-between items-center relative"
                    >
                      <div>
                        <p className="font-medium">{lineout.name}</p>
                        <p className="text-xs text-gray-400">
                          {lineout.players.length} Players
                        </p>
                      </div>
                      {/* Three dot dropdown menu */}
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === lineout.id ? null : lineout.id
                            )
                          }
                          className="p-2 hover:bg-gray-600 rounded"
                        >
                          ⋮
                        </button>
                        {activeDropdown === lineout.id && (
                          <div className="absolute right-0 mt-2 w-28 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                            <button
                              onClick={() => openEditModal(lineout)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLineout(lineout.id)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 muted">
                  No Lineouts Saved
                </p>
              )}
            </div>
          </div>

          {/* Saved Statistics Section */}
          <div className="bg-gray-800 col-span-4 p-4 rounded-lg cursor-pointer mt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-xl">Saved Statistics</h4>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-400 font-small">
                No Saved Stats Yet
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Creating / Editing a Lineout */}
      {showLineoutModal && (
        <>
          {/* Modal Overlay */}
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
                  <div
                    key={index}
                    className="flex flex-row sm:flex-row gap-2 mb-3 items-start sm:items-center"
                  >
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) =>
                        handlePlayerChange(index, "name", e.target.value)
                      }
                      className="flex-1 px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 w-3/4"
                      placeholder={`Player ${index + 1} Name`}
                    />
                    <input
                      type="number"
                      value={player.number}
                      onChange={(e) =>
                        handlePlayerChange(index, "number", e.target.value)
                      }
                      className="w-1/4 px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

              {formError && (
                <p className="mt-3 text-red-400 text-sm">{formError}</p>
              )}

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
    </div>
  );
}
