// components/BroadcastDiv.jsx
import React from "react";

const BroadcastDiv = ({ gameFinsihedFlag, setShowBroadcastModal, showBroadCastDiv ,broadcastUpdate,liveBroadcastGameFinished}) => {
  if (!showBroadCastDiv) return null;
  return (
    <div
      onClick={() => {
        setShowBroadcastModal(true);
      }}
      className={`h-full w-full md:w-[15%]  flex justify-center
        ${
          broadcastUpdate ? 
"   border-2      border-primary animate-pulse  "
          : " "
        }

       
      items-center w-[15%]  ${liveBroadcastGameFinished ? "border-2 border-red-500" : "bg-secondary-bg" } mt-1 rounded-md`}
    >
      {/* When game is not finished, show pulsing blue icon. When finished, show gray. */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className={`size-6 font-semibold ${
          !gameFinsihedFlag
            ? "animate-pulse text-primary-cta border-b-2 border-b-primary-cta"
            : "text-gray-200"
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
        />
      </svg>
    </div>
  );
};

export default BroadcastDiv;
