// screens/Components/HomeDashboard/Modals/EditGameModal.jsx

import React from "react";

export default function EditGameModal({
  opponentName,
  venue,
  setOpponentName,
  user,
  setVenue,
  onClose,
  onSave,
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div
        className="relative bg-secondary-bg p-6 rounded-lg w-11/12 md:w-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Edit Game</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Opponent Name</label>
          <input
            type="text"
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter opponent name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter venue"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-primary-cta hover:bg-indigo-500 rounded"
          >
            Save Game
          </button>
        </div>
      </div>
    </div>
  );
}
