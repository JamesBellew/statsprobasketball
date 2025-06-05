import React from "react";

const LineoutModal = ({
  showLineoutModal,
  setShowLineoutModal,
  passedLineout,
  onCourtPlayers,
  handleTogglePlayer,
}) => {
  if (!showLineoutModal || !passedLineout?.players) return null;

  const sortedPlayers = [...passedLineout.players].sort((a, b) => {
    const aOn = onCourtPlayers.includes(a.number);
    const bOn = onCourtPlayers.includes(b.number);
    return aOn === bOn ? 0 : aOn ? -1 : 1;
  });

  const onFloorPlayers = sortedPlayers.slice(0, 5);
  const benchPlayers = sortedPlayers.slice(5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-secondary-bg p-6 rounded-md flex flex-col space-y-4 w-80">
        <h3 className="text-white text-lg text-center mb-4">Manage On-Court Players</h3>

        {/* On Floor Section */}
        <p className="text-gray-400 text-sm mb-1">On Floor</p>
        {onFloorPlayers.map((player) => (
          <div key={player.number} className="flex justify-between items-center text-white">
            <span>{player.name} #{player.number}</span>
            <input
              type="checkbox"
              checked={onCourtPlayers.includes(player.number)}
              onChange={() => handleTogglePlayer(player.number)}
              className="w-5 h-5"
            />
          </div>
        ))}

        <hr className="border-gray-600 my-2" />

        {/* Bench Section */}
        <p className="text-gray-400 text-sm mb-1">Bench</p>
        {benchPlayers.map((player) => (
          <div key={player.number} className="flex justify-between items-center text-white">
            <span>{player.name} #{player.number}</span>
            <input
              type="checkbox"
              checked={onCourtPlayers.includes(player.number)}
              onChange={() => handleTogglePlayer(player.number)}
              className="w-5 h-5"
            />
          </div>
        ))}

        <button
          onClick={() => setShowLineoutModal(false)}
          className="mt-4 bg-primary-cta px-4 py-2 rounded text-white"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default LineoutModal;
