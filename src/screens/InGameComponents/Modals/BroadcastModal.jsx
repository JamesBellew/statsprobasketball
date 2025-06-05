import React, { useState } from "react";

const BroadcastModal = ({
  showBroadcastModal,
  setShowBroadcastModal,
  slug,
  gameFinsihedFlag,
  setGameFinsihedFlag,
  broadcastUpdate,
  setBroadcastUpdate,
  broadcastUpdatesText,
  liveBroadcastGameFinished,
  handlebroadcastUpdate,
  handleBroadcastUpdateClear,
  selectedDate,
  selectedTime,
  setSelectedDate,
  setSelectedTime,
  handleFinishGame,
  handleResumeGame,
  BroadcastLinkCopyHandler,
  broadcastLinkName
}) => {
  if (!showBroadcastModal) return null;
  console.log("📅 Selected Date:", selectedDate);
  console.log("⏰ Selected Time:", selectedTime);
  
  const [showCopyClipCheck, setShowCopyClipCheck] = useState(false);


  const copyClipboardCheckStateHandler = () => {
    setShowCopyClipCheck(true);
    setTimeout(() => {
      setShowCopyClipCheck(false);
    }, 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={() => setShowBroadcastModal(false)}
    >
      <div
        className="relative bg-primary-bg p-6 rounded-lg w-full max-w-3xl mx-4 h-auto max-h-[80vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ❌ Close button */}
        <button
          onClick={() => setShowBroadcastModal(false)}
          className="text-white absolute right-5 top-3 bg-primary-danger px-3 py-2 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Broadcast Link */}
          <div className="w-full max-w-lg">
            <div className="flex flex-row items-center justify-center h-auto py-2 space-x-4">
              <h2 className="text-lg text-white font-semibold">Broadcast Link</h2>
            </div>
            <div className="flex flex-row">
              <div className="text-center text-sm bg-secondary-bg text-white px-4 py-2 rounded-lg">
                {/* <code className="text-primary-cta">{`http://localhost:5173/liveGames/${slug}`}</code> */}
                <code className="text-primary-cta">{`https://statsprobasketball.netlify.app/liveGames/${slug}`}</code>
              </div>
              <button
                onClick={() => {
                  // BroadcastLinkCopyHandler(`http://localhost:5173/liveGames/${slug}`);
                  BroadcastLinkCopyHandler(`https://statsprobasketball.netlify.app/liveGames/${slug}`);
                  copyClipboardCheckStateHandler();
                }}
                className="bg-secondary-bg relative mx-1 text-white px-4 py-2 rounded"
              >
                {showCopyClipCheck && (
                  <div className="top-0 absolute flex p-2 right-0 w-1/4 h-1/4 bg-green-500 rounded-full text-center items-center justify-center">
                    ✓
                  </div>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Game Start Date + Time Picker */}
          {!gameFinsihedFlag && (
            <div className="w-full max-w-lg">
              <label htmlFor="date" className="block mb-2 text-sm font-medium text-white">
                Game Start Date:
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mb-4 bg-secondary-bg border border-gray-300 text-white text-sm rounded-lg block w-full p-2.5"
              />

              <label htmlFor="time" className="block mb-2 text-sm font-medium text-white">
                Game Start Time:
              </label>
              <input
                type="time"
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="bg-secondary-bg border border-gray-300 text-white text-sm rounded-lg block w-full p-2.5"
              />
            </div>
          )}

          {/* Game State Toggle */}
          <div className="w-full max-w-lg">
            <h2 className="text-lg text-white font-semibold text-center my-3">Game State</h2>
            <label className="inline-flex items-center cursor-pointer mb-2">
              <span className="me-3 text-sm font-medium text-gray-300">Full Time</span>
              <input
                type="checkbox"
                checked={gameFinsihedFlag}
                onChange={(e) => setGameFinsihedFlag(e.target.checked)}
                className="sr-only peer mx-auto"
              />
              <div className="relative w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>

            {/* Update Buttons */}
            <h2 className="text-lg text-white font-semibold text-center mb-3">Select an Update</h2>
            <div className="grid grid-cols-2 gap-2">
              {broadcastUpdatesText.map((update) => (
                <button
                  key={update}
                  onClick={() => setBroadcastUpdate(update)}
                  className={`py-2 rounded-md transition text-sm ${
                    broadcastUpdate === update
                      ? "bg-primary-cta text-white font-bold"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {update}
                </button>
              ))}
            </div>
          </div>

          {/* Send/Clear */}
          <div className="px-4 w-full max-w-lg flex flex-row items-center space-x-2">
            <button className="bg-primary-cta text-white w-full py-2 rounded hover:bg-opacity-90" onClick={handlebroadcastUpdate}>
              📢 Send Update
            </button>
            {broadcastUpdate && (
              <button
                onClick={handleBroadcastUpdateClear}
                className="bg-secondary-danger text-white px-5 w-full py-2 rounded-md hover:bg-red-600"
              >
                Clear Update
              </button>
            )}
          </div>

          {/* Finish Game */}
          <div className="px-4 w-full max-w-lg flex flex-row items-center space-x-2">
            {!liveBroadcastGameFinished ? (
              <button
                className="bg-primary-danger w-full text-white py-2 rounded hover:bg-opacity-90"
                onClick={() => handleFinishGame(broadcastLinkName)}
              >
                🏁 Finish Game
              </button>
            ) : (
              <button
                className="bg-primary w-full text-white py-2 rounded hover:bg-opacity-90"
                onClick={() => handleResumeGame(broadcastLinkName)}
              >
                🏁 Resume Live Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;
