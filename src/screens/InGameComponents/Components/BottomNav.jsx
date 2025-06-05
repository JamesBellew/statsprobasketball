import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward, faForward } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const BottomNav = ({
  passedLineout,
  currentQuater,
  minutesTracked,
  handlePreviousPeriodClick,
  handleNextPeriodClick,
  setShowLineoutModal,
  showTimeModal,
  setShowTimeModal,
  minutes,
  seconds,
  setMinutes,
  setSeconds,
  isRunning,
  setIsRunning,
}) => {

  return (
    <div className="text-white relative  text-center flex-row p-2 space-x-4 flex w-full items-center justify-center h-1/4">
      {/* Previous Period */}
      <button
        disabled={currentQuater === 1}
        onClick={handlePreviousPeriodClick}
        className={`h-full flex-row bg-secondary-bg rounded-lg flex 
          ${minutesTracked ? "w-1/4" : "w-2/4"}
          my-auto justify-center items-center
          ${currentQuater === 1 ? "line-through bg-secondary-bg/50 text-gray-400" : "text-white"}`}
      >
        <FontAwesomeIcon className="mr-2" icon={faBackward} />
        Previous Period
      </button>

      {/* Team Lineout (when not tracking time) */}
      {!minutesTracked && passedLineout &&(
        <div
          className="flex items-center justify-center w-1/4 bg-secondary-bg h-full rounded-md"
          onClick={() => setShowLineoutModal(true)}
        >
          <TeamIcon />
        </div>
      )}

      {/* Game Clock (if tracking time) */}
      {minutesTracked && (
        <>
          {showTimeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-secondary-bg p-6 rounded-md flex flex-col items-center space-y-4">
                <p className="text-white text-lg">Adjust Time</p>
                <div className="flex space-x-4 items-center">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                    className="bg-gray-800 text-white text-3xl text-center w-16 rounded-md"
                  />
                  <span className="text-white text-3xl">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                    className="bg-gray-800 text-white text-3xl text-center w-16 rounded-md"
                  />
                </div>
                <button
                  onClick={() => setShowTimeModal(false)}
                  className="mt-4 bg-primary-cta px-4 py-2 rounded text-white"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          <div className="py-1 w-2/4 grid grid-cols-8 grid-flow-col rounded-md h-full">
            <div
              className="flex items-center justify-center col-span-2 cursor-pointer"
              onClick={() => setShowLineoutModal(true)}
            >
              <TeamIcon />
            </div>

            <div
              className="col-span-4 grid grid-cols-2 px-2 space-x-2 cursor-pointer"
              onClick={() => setShowTimeModal(true)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={minutes}
                  initial={{ y: 50, opacity: 0, rotateX: -90 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    rotateX: 0,
                    scale: minutes === 0 && seconds === 0 ? [1, 1.5, 1] : 1,
                    color: minutes === 0 && seconds === 0 ? "#8B5CF6" : undefined,
                  }}
                  exit={{ y: -50, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={`relative h-full bg-secondary-bg rounded-md text-3xl items-center justify-center ${
                    isRunning ? "text-primary-cta" : "text-gray-400"
                  } flex`}
                >
                  <p>{minutes}</p>
                </motion.div>
              </AnimatePresence>

              <motion.div
                key={seconds}
                animate={{
                  scale: minutes === 0 && seconds === 0 ? [1, 1.5, 1] : 1,
                  color: minutes === 0 && seconds === 0 ? "#8B5CF6" : undefined,
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`h-full bg-secondary-bg rounded-md text-3xl items-center justify-center ${
                  isRunning ? "text-primary-cta" : "text-gray-400"
                } flex`}
              >
                <p>{seconds < 10 ? `0${seconds}` : seconds}</p>
              </motion.div>
            </div>

            <div
              className="col-span-2 justify-center flex items-center cursor-pointer"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <PauseIcon /> : <PlayIcon />}
            </div>
          </div>
        </>
      )}

      {/* Next Period Button */}
      <button
        disabled={currentQuater === 8}
        onClick={handleNextPeriodClick}
        className={`h-full flex-row bg-secondary-bg rounded-lg flex 
          ${minutesTracked ? "w-1/4" : "w-2/4"}
          my-auto justify-center items-center
          ${currentQuater === 4 ? "bg-secondary-bg text-gray-200" : ""}
          ${currentQuater === 8 ? "line-through text-gray-500" : ""}`}
      >
        {currentQuater <= 3 ? "Next Period" : "OT " + (currentQuater - 3)}
        <FontAwesomeIcon
          className={`ml-2 ${currentQuater === 4 ? "text-primary-cta" : "text-white"}`}
          icon={faForward}
        />
      </button>
    </div>
  );
};

const TeamIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
  </svg>
);

export default BottomNav;
