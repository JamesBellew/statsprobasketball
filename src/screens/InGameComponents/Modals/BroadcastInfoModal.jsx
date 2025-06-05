import React from "react";

const BroadcastInfoModal = ({
  showBroadcastInformationModal,
  setShowBroadcastInformationModal,
  broadcastLink,
}) => {
  if (!showBroadcastInformationModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
      onClick={() => setShowBroadcastInformationModal(false)}
    >
      <div
        className="relative bg-primary-bg p-6 rounded-lg w-full max-w-md mx-4 my-8 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowBroadcastInformationModal(false)}
          className="text-white absolute right-5 top-2 bg-primary-danger px-2 py-2 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Body */}
        <div className="bg-secondary-bg text-white rounded-md p-4 shadow-md text-center">
          <h1 className="text-xl font-bold mb-2">Broadcast Link</h1>
          <p className="text-sm text-gray-300 mb-4">
            Share this link with viewers to watch the live game.
          </p>
          <a
            href={broadcastLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-cta underline break-all"
          >
            {broadcastLink}
          </a>
        </div>
      </div>
    </div>
  );
};

export default BroadcastInfoModal;
