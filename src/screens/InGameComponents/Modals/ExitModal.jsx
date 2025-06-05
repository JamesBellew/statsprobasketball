import React from "react";

const ExitModal = ({ showExitModal, setShowExitModal, onExit }) => {
  if (!showExitModal) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={() => setShowExitModal(false)}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Modal Content */}
      <div
        className="relative bg-secondary-bg p-6 rounded-lg w-72"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h3 className="text-white text-lg mb-4">Exit Game?</h3>
        <p className="text-gray-300 mb-4">
          Unsaved game data will be lost. Are you sure you want to exit?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowExitModal(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-primary-danger hover:bg-red-500 text-white rounded"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitModal;
