// components/GameStatsDiv.jsx
import React from "react";

const GameStatsDiv = ({ setShowGameStatsModal }) => {
  return (
    <div
      onClick={() => setShowGameStatsModal(true)}
      className="w-1/5 bg-secondary-bg h-full mt-1 text-sm rounded-lg text-center flex items-center cursor-pointer hover:bg-white/10 transition"
    >
      <p className="text-center mx-auto">Game Stats</p>
    </div>
  );
};

export default GameStatsDiv;
