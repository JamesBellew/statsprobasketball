import React from 'react';

const PlayerStatsDiv = ({ setShowPlayerStatsModal }) => {
  return (
    <div
      onClick={() => setShowPlayerStatsModal(true)}
      className="md:w-1/5 w-full bg-secondary-bg h-full mt-1 cursor-pointer hover:bg-white/10 rounded-lg text-center flex items-center"
    >
      <p className="text-center mx-auto text-sm">Player Stats</p>
    </div>
  );
};

export default PlayerStatsDiv;
