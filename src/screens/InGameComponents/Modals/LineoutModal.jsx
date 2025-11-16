import React, { useState, useEffect, useMemo } from "react";

const LineoutModal = (props) => {
  const {
    showLineoutModal,
    setShowLineoutModal,
    passedLineout,
    onCourtPlayers,
    handleTogglePlayer,
    awayLineout,
    onSaveAwayLineout,
    onSaveHomeLineout,
  } = props;

  // ✅ early return before ANY hooks
  if (!showLineoutModal) return null;

  // all hooks below run only when modal is open
  const [activeTab, setActiveTab] = useState("home");
  const [homeSubTab, setHomeSubTab] = useState("oncourt");
  
  const homeName = passedLineout?.name || "Home";
  const [homePlayers, setHomePlayers] = useState([]);
  
  useEffect(() => {
    setHomePlayers(
      (passedLineout?.players || []).map(p => ({ name: p.name || "", number: String(p.number ?? "").trim() }))
    );
  }, [passedLineout]);

  const [opponentLineoutName, setOpponentLineoutName] = useState("");
  const [opponentPlayers, setOpponentPlayers] = useState([]);
  const [addPhotos, setAddPhotos] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setOpponentLineoutName(awayLineout?.name || "Opponent");
    const initialPlayers = awayLineout?.players || Array.from({ length: 5 }, () => ({ name: "", number: "", image: null }));
    setOpponentPlayers(initialPlayers.map(p => ({ name: p.name || "", number: String(p.number ?? "").trim(), image: p.image ?? null })));
    setAddPhotos(!!awayLineout?.players?.some(p => p.image)); 
  }, [awayLineout]);

  // ✅ this hook is now always in a fixed position when the component renders
  const sortedHomePlayers = useMemo(() => {
    const ocSet = new Set(onCourtPlayers?.map(n => String(n)));
    return [...(passedLineout?.players || [])].sort((a, b) => {
      const aOn = ocSet.has(String(a.number));
      const bOn = ocSet.has(String(b.number));
      return aOn === bOn ? 0 : aOn ? -1 : 1;
    });
  }, [passedLineout, onCourtPlayers]);


  const onFloorPlayers = sortedHomePlayers.filter(p => onCourtPlayers?.map(n => String(n)).includes(String(p.number)));
  const benchPlayers   = sortedHomePlayers.filter(p => !onCourtPlayers?.map(n => String(n)).includes(String(p.number)));

  // ------ HOME: roster edit handlers ------
  const addHomePlayer = () => {
    if (homePlayers.length >= 15) return;
    setHomePlayers(prev => [...prev, { name: "", number: "" }]);
  };
  const updateHomePlayer = (idx, field, value) => {
    setHomePlayers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: field === "number" ? String(value).trim() : value } : p));
  };
  const deleteHomePlayer = (idx) => {
    const toRemove = homePlayers[idx];
    const numStr = String(toRemove?.number ?? "");
    setHomePlayers(prev => prev.filter((_, i) => i !== idx));
    // If deleting a player who is on court, auto-remove from onCourtPlayers via toggle (best-effort)
    if (numStr && onCourtPlayers?.map(n => String(n)).includes(numStr)) {
      handleTogglePlayer(numStr);
    }
  };

  const validateUniqueNumbers = (list) => {
    const seen = new Set();
    for (const p of list) {
      const num = String(p.number ?? "").trim();
      if (!num) return { ok: false, msg: "Every player must have a number." };
      if (seen.has(num)) return { ok: false, msg: `Duplicate jersey number: ${num}` };
      seen.add(num);
    }
    return { ok: true };
  };

  const handleSaveHome = async () => {
    setFormError("");
    const cleaned = homePlayers
      .map(p => ({ name: (p.name || "").trim(), number: String(p.number ?? "").trim() }))
      .filter(p => p.name || p.number);

    if (cleaned.length < 5) { setFormError("Roster must have at least 5 players."); return; }
    if (cleaned.length > 15) { setFormError("Roster cannot exceed 15 players."); return; }

    if (cleaned.some(p => !p.name || !p.number)) { setFormError("All players must have a name and number."); return; }

    const uniq = validateUniqueNumbers(cleaned);
    if (!uniq.ok) { setFormError(uniq.msg); return; }

    await onSaveHomeLineout?.({
      id: passedLineout?.id || `home_${Date.now()}`,
      name: homeName,
      players: cleaned,
    });
    setShowLineoutModal(false);
  };
  const handleSaveHomeLineout = (data) => {
    setHomeLineout(data);
    setAlertMessage("Home lineout saved!");
    setTimeout(() => setAlertMessage(""), 3000);
  
    // optional but handy so Firestore reflects the change immediately
    setTimeout(() => {
      handleSaveGame();
    }, 500);
  };
  

  // ------ AWAY handlers (as you had) ------
  const addOpponentPlayer = () => { if (opponentPlayers.length < 15) setOpponentPlayers([...opponentPlayers, { name: "", number: "", image: null }]); };
  const removeOpponentPlayer = () => { if (opponentPlayers.length > 5) setOpponentPlayers(opponentPlayers.slice(0, -1)); };
  const handleOpponentPlayerChange = (index, field, value) => {
    setOpponentPlayers(prev => prev.map((p, i) => i === index ? { ...p, [field]: field === "number" ? String(value).trim() : value } : p));
  };
  const handleOpponentImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => handleOpponentPlayerChange(index, "image", reader.result);
    reader.readAsDataURL(file);
  };
  const handleSaveOpponentLineout = async () => {
    setFormError("");
    if (!opponentLineoutName.trim()) { setFormError("Lineout name is required."); return; }
    if (opponentPlayers.some(p => !(p.name || "").trim() || !(String(p.number ?? "").trim()))) { setFormError("All player names and numbers are required."); return; }
    const uniq = validateUniqueNumbers(opponentPlayers);
    if (!uniq.ok) { setFormError(uniq.msg); return; }

    await onSaveAwayLineout?.({
      id: awayLineout?.id || `away_${Date.now()}`,
      name: opponentLineoutName.trim(),
      players: opponentPlayers,
    });
    setShowLineoutModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
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
              {/* sub tabs */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  onClick={() => setHomeSubTab("oncourt")}
                  className={`px-3 py-1 text-xs rounded-full ${homeSubTab === 'oncourt' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                >
                  On Court
                </button>
                <button
                  onClick={() => setHomeSubTab("edit")}
                  className={`px-3 py-1 text-xs rounded-full ${homeSubTab === 'edit' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                >
                  Edit Roster
                </button>
              </div>
              {homeSubTab === "oncourt" ? (
  <>
    <h3 className="text-white text-lg text-center mb-4">
      Manage On-Court Players
    </h3>

    {passedLineout?.players ? (
      <>
        {/* ON FLOOR */}
        <p className="text-gray-400 text-sm mb-2">
          On Floor ({onFloorPlayers.length}/5)
        </p>
        <div className="space-y-1.5">
          {onFloorPlayers.map((player, idx) => (
            <div
              key={player.number}
              className={`flex items-center justify-between px-3 py-2 rounded-md
                ${idx % 2 === 0 ? "bg-secondary-bg/60" : "bg-secondary-bg/30"}`}
            >
              <span className="text-sm text-white">
                {player.name}{" "}
                <span className="text-gray-400">#{player.number}</span>
              </span>
              <input
                type="checkbox"
                checked={onCourtPlayers.includes(player.number)}
                onChange={() => handleTogglePlayer(player.number)}
                className="form-checkbox h-5 w-5 text-primary-cta bg-gray-800 border-gray-600 rounded focus:ring-primary-cta"
              />
            </div>
          ))}
        </div>

        <hr className="border-gray-700 my-4" />

        {/* BENCH */}
     {/* Bench */}
<p className="text-gray-400 text-sm mb-2 mt-4">Bench</p>

{(() => {
  // group bench players into rows of 2
  const benchRows = [];
  for (let i = 0; i < benchPlayers.length; i += 2) {
    benchRows.push(benchPlayers.slice(i, i + 2));
  }

  return (
    <div className="space-y-1.5">
      {benchRows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={`grid grid-cols-2 gap-2 px-3 py-2 rounded-md
            ${rowIdx % 2 === 0 ? "bg-secondary-bg/60" : "bg-secondary-bg/30"}`}
        >
          {row.map((player) => (
            <div
              key={player.number}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-sm text-white font-medium truncate">
                  {player.name}
                </span>
                <span className="text-xs text-gray-400">
                  #{player.number}
                </span>
              </div>

              <input
                type="checkbox"
                checked={onCourtPlayers.includes(player.number)}
                onChange={() => handleTogglePlayer(player.number)}
                className="form-checkbox h-5 w-5 text-primary-cta bg-gray-800
                           border-gray-600 rounded focus:ring-primary-cta"
              />
            </div>
          ))}

          {/* if odd number of bench players, add an empty cell to keep grid even */}
          {row.length === 1 && <div />}
        </div>
      ))}
    </div>
  );
})()}

      </>
    ) : (
      <p className="text-gray-400 text-center">
        No home lineout set for this game.
      </p>
    )}
  </>
) : (
                <>
                  <h3 className="text-white text-lg text-center mb-3">Edit Home Roster</h3>
                  <div className="space-y-2">
                    {homePlayers.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updateHomePlayer(idx, "name", e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={`Player ${idx + 1} Name`}
                        />
                        <input
                          type="number"
                          value={p.number}
                          onChange={(e) => updateHomePlayer(idx, "number", e.target.value)}
                          className="w-24 px-3 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="#"
                        />
                        <button
                          onClick={() => deleteHomePlayer(idx)}
                          className="px-2 py-2 rounded bg-red-600/80 hover:bg-red-500 text-white"
                          title="Delete player"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={addHomePlayer}
                      disabled={homePlayers.length >= 15}
                      className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded disabled:opacity-50"
                      title="Add player"
                    >
                      ＋
                    </button>
                    <span className="text-xs text-gray-400">Min 5, Max 15</span>
                  </div>
                </>
              )}

              {formError && <p className="mt-3 text-red-400 text-sm">{formError}</p>}
            </div>
          )}

          {activeTab === "away" && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white">
                {awayLineout ? "Edit Opponent Lineout" : "Create Opponent Lineout"}
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-300">Lineout Name</label>
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
                  <button onClick={addOpponentPlayer} disabled={opponentPlayers.length >= 15} className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded disabled:opacity-50">+</button>
                  <button onClick={removeOpponentPlayer} disabled={opponentPlayers.length <= 5} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded disabled:opacity-50">–</button>
                </div>
              </div>

              {formError && <p className="mt-3 text-red-400 text-sm">{formError}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button onClick={() => setShowLineoutModal(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded">
            Cancel
          </button>
          {activeTab === 'home' && homeSubTab === 'edit' && (
            <button onClick={handleSaveHome} className="px-4 py-2 rounded bg-indigo-600 hover:bg-primary-cta text-white">
              Save Home Lineout
            </button>
          )}
          {activeTab === 'away' && (
            <button onClick={handleSaveOpponentLineout} className="px-4 py-2 rounded bg-indigo-600 hover:bg-primary-cta text-white">
              Save Opponent Lineout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LineoutModal;
