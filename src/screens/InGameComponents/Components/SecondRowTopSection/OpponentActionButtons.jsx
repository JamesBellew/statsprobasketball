import React from "react";

const OpponentActionButtons = ({ 
  showFiltersPlayerStat, 
  savedGame, 
  updateOpponentScore 
}) => {
  if (!showFiltersPlayerStat) return null;

  return (
    <>
      {!savedGame?.isComplete ? (
        <div className="w-[45%] h-full text-center flex space-x-1 px-1 items-center rounded-lg">
          <button
            onClick={() => updateOpponentScore(2)}
            className="bg-secondary-bg shadow-md w-1/2 h-full rounded-md"
          >
            +2
          </button>
          <button
            onClick={() => updateOpponentScore(3)}
            className="bg-secondary-bg shadow-md w-1/2 h-full rounded-md"
          >
            +3
          </button>
          <button
            onClick={() => updateOpponentScore(1)}
            className="bg-secondary-bg shadow-md w-1/2 h-full rounded-md"
          >
            +1
          </button>
          <button
            onClick={() => updateOpponentScore(-1)}
            className="bg-secondary-bg shadow-md w-1/2 h-full rounded-md"
          >
            -1
          </button>
        </div>
      ) : (
        <div className="w-[45%] h-full bg-secondary-bg flex items-center justify-center">
          <p>BarChart here</p>
        </div>
      )}
    </>
  );
};

export default OpponentActionButtons;
