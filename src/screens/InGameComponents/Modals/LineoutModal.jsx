import React, { useState, useEffect } from "react";

const LineoutModal = ({
  showLineoutModal,
  setShowLineoutModal,
  passedLineout, // This is the HOME lineout
  onCourtPlayers,
  handleTogglePlayer,
  awayLineout, // This is the AWAY lineout
  onSaveAwayLineout, // Function to save the away lineout
}) => {
  const [activeTab, setActiveTab] = useState("home");

  // State for the "Away" lineout form
  const [opponentLineoutName, setOpponentLineoutName] = useState("");
  const [opponentPlayers, setOpponentPlayers] = useState([]);
  const [addPhotos, setAddPhotos] = useState(false);
  const [formError, setFormError] = useState("");

  // Populate form when modal opens or awayLineout data changes
  useEffect(() => {
    if (showLineoutModal) {
      setOpponentLineoutName(awayLineout?.name || "Opponent");
      // Create a new object for each player to avoid reference sharing
      const initialPlayers = awayLineout?.players || Array.from({ length: 5 }, () => ({ name: "", number: "", image: null }));
      setOpponentPlayers(initialPlayers);
      setAddPhotos(!!awayLineout?.players?.some(p => p.image));
    }
  }, [showLineoutModal, awayLineout]);

  if (!showLineoutModal) return null;

  // --- Home Team View ---
  const sortedHomePlayers = [...(passedLineout?.players || [])].sort((a, b) => {
    const aOn = onCourtPlayers.includes(a.number);
    const bOn = onCourtPlayers.includes(b.number);
    return aOn === bOn ? 0 : aOn ? -1 : 1;
  });

  const onFloorPlayers = sortedHomePlayers.filter(p => onCourtPlayers.includes(p.number));
  const benchPlayers = sortedHomePlayers.filter(p => !onCourtPlayers.includes(p.number));
  
  // --- Away Team Form Handlers ---
  const addOpponentPlayer = () => {
    if (opponentPlayers.length < 15) {
      setOpponentPlayers([...opponentPlayers, { name: "", number: "", image: null }]);
    }
  };

  const removeOpponentPlayer = () => {
    if (opponentPlayers.length > 5) {
      setOpponentPlayers(opponentPlayers.slice(0, -1));
    }
  };

  const handleOpponentPlayerChange = (index, field, value) => {
    // Create a new array with a new object for the updated item
    const newPlayers = opponentPlayers.map((player, i) => {
      if (i === index) {
        return { ...player, [field]: value };
      }
      return player;
    });
    setOpponentPlayers(newPlayers);
  };

  const handleOpponentImageUpload = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleOpponentPlayerChange(index, "image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveOpponentLineout = () => {
    setFormError("");
    if (!opponentLineoutName.trim()) {
      setFormError("Lineout name is required.");
      return;
    }
    const hasEmptyFields = opponentPlayers.some(
      (p) => !p.name.trim() || !p.number.toString().trim()
    );
    if (hasEmptyFields) {
      setFormError("All player names and numbers are required.");
      return;
    }
    
    const lineoutData = {
      id: awayLineout?.id || `away_${Date.now()}`,
      name: opponentLineoutName,
      players: opponentPlayers,
    };

    onSaveAwayLineout(lineoutData);
    setShowLineoutModal(false); // Close modal on save
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-bg p-6 rounded-lg shadow-xl flex flex-col w-full max-w-md max-h-[90vh]">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'home' ? 'text-primary-cta border-b-2 border-primary-cta' : 'text-gray-400'}`}
          >
            Home Lineout
          </button>
          <button
            onClick={() => setActiveTab("away")}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'away' ? 'text-primary-cta border-b-2 border-primary-cta' : 'text-gray-400'}`}
          >
            Opponent Lineout
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow">
          {activeTab === "home" && (
            <div>
              <h3 className="text-white text-lg text-center mb-4">Manage On-Court Players</h3>
              {passedLineout?.players ? (
                <>
                  {/* On Floor Section */}
                  <p className="text-gray-400 text-sm mb-2">On Floor ({onFloorPlayers.length}/5)</p>
                  {onFloorPlayers.map((player) => (
                    <div key={player.number} className="flex justify-between items-center text-white py-1">
                      <span>{player.name} #{player.number}</span>
                      <input
                        type="checkbox"
                        checked={onCourtPlayers.includes(player.number)}
                        onChange={() => handleTogglePlayer(player.number)}
                        className="form-checkbox h-5 w-5 text-primary-cta bg-gray-800 border-gray-600 rounded focus:ring-primary-cta"
                      />
                    </div>
                  ))}

                  <hr className="border-gray-700 my-4" />

                  {/* Bench Section */}
                  <p className="text-gray-400 text-sm mb-2">Bench</p>
                  {benchPlayers.map((player) => (
                    <div key={player.number} className="flex justify-between items-center text-white py-1">
                      <span>{player.name} #{player.number}</span>
                      <input
                        type="checkbox"
                        checked={onCourtPlayers.includes(player.number)}
                        onChange={() => handleTogglePlayer(player.number)}
                        className="form-checkbox h-5 w-5 text-primary-cta bg-gray-800 border-gray-600 rounded focus:ring-primary-cta"
                      />
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-gray-400 text-center">No home lineout set for this game.</p>
              )}
            </div>
          )}

          {activeTab === "away" && (
            // This is the form, structure copied from CreateEditLineoutModal
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white">
                {awayLineout ? "Edit Opponent Lineout" : "Create Opponent Lineout"}
              </h2>
              
              <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Lineout Name
                  </label>
                  <input
                    type="text"
                    value={opponentLineoutName}
                    onChange={(e) => setOpponentLineoutName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter opponent lineout name"
                  />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-white">Players</h3>
                {opponentPlayers.map((player, index) => (
                  <div key={index} className="flex flex-row gap-2 mb-3 items-center">
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handleOpponentPlayerChange(index, "name", e.target.value)}
                      className="w-3/5 px-3 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Player ${index + 1} Name`}
                    />
                    <input
                      type="number"
                      value={player.number}
                      onChange={(e) => handleOpponentPlayerChange(index, "number", e.target.value)}
                      className="w-2/5 px-3 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Number"
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button
                    onClick={addOpponentPlayer}
                    disabled={opponentPlayers.length >= 15}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded disabled:opacity-50"
                  >
                    +
                  </button>
                  <button
                    onClick={removeOpponentPlayer}
                    disabled={opponentPlayers.length <= 5}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded disabled:opacity-50"
                  >
                    –
                  </button>
                </div>
              </div>

              {formError && <p className="mt-3 text-red-400 text-sm">{formError}</p>}
            </div>
          )}
        </div>
        
        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={() => setShowLineoutModal(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          {activeTab === 'away' && (
            <button
              onClick={handleSaveOpponentLineout}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-primary-cta text-white"
            >
              Save Opponent Lineout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LineoutModal;
