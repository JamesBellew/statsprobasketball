import React from "react";

const ProfileProgressModal = ({ onClose, openSettings, dontShowAgain, setDontShowAgain }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="relative p-4 w-full max-w-md">
        <div className="bg-primary-bg text-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
         <h1 className="my-10 text-3xl font-semibold">StatsPro - Basketball</h1>
            {/* <h3 className="text-2xl text-gray-300 font-bold mb-2">Complete Team Profile</h3> */}
            <p className="text-sm text-gray-300 border p-4 border-white/10 rounded-md">
              You must complete your team settings before starting a game.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Profile Completion</span>
              <span>0/1 steps complete</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-secondary-danger h-2 rounded-full" style={{ width: "0%" }} />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col space-y-4">
            <button
              onClick={openSettings}
              className="w-full bg-primary-cta hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium"
            >
              Open Team Settings
            </button>

            <button
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm"
            >
              Cancel
            </button>

            {/* <label className="flex items-center text-sm text-gray-300 mt-2">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={() => setDontShowAgain(!dontShowAgain)}
                className="mr-2"
              />
              Don’t show this on startup again
            </label> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileProgressModal;
