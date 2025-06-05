import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import steph from '../../../assets/steph-curry.png'
const QuickStats = ({
  currentQuater,
  currentGameActionFilters,
  playersStatsArray,
  savedGame,
  showFiltersPlayerStat,
  setShowFiltersPlayerStat,
  handleFilterSelection,
  alertMessage,
  setAlertMessage,
  fieldGoal,
  threepoint,
  fieldGoalPercentage,
  threePointPercentage,
  gameActions,
  minutesTracked,
  playerMinutes,
}) => {
  const selectedPlayer = currentGameActionFilters.find(
    (filter) =>
      !["All Game", "2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(filter)
  );

  let selectedPlayerStat = playersStatsArray.find((player) =>
    player.player.includes(selectedPlayer)
  ) || {};

  const playerDetails = {
    number: selectedPlayerStat.player?.match(/\((\d+)\)/)?.[1] || "",
    name:
      selectedPlayerStat.player?.replace(/\(\d+\)\s*/, "") || selectedPlayer || "Unknown",
    image: selectedPlayerStat.image || null,
  };

  if (!playerDetails.image && savedGame?.lineout?.players) {
    const lineoutPlayer = savedGame.lineout.players.find(
      (p) =>
        p.name.trim() === playerDetails.name.trim() &&
        p.number.toString() === playerDetails.number.toString()
    );
    if (lineoutPlayer?.image) {
      playerDetails.image = lineoutPlayer.image;
    }
  }

  if (selectedPlayer) {
    const {
      fgMade,
      fgAttempts,
      threePtMade,
      threePtAttempts,
      ftMade,
      ftAttempts,
      assists,
      rebounds,
      offRebounds,
      turnovers,
      steals,
      blocks,
    } = selectedPlayerStat;

    const fgPercentage = fgAttempts ? Math.round((fgMade / fgAttempts) * 100) : 0;
    const threePtPercentage = threePtAttempts ? Math.round((threePtMade / threePtAttempts) * 100) : 0;
    const ftPercentage = ftAttempts ? Math.round((ftMade / ftAttempts) * 100) : 0;
    const minutesPlayed = playerDetails.number ? playerMinutes[playerDetails.number] || 0 : 0;

    return (
      <div className={`text-white items-center justify-center flex-row space-x-4 flex w-auto ${currentGameActionFilters.some(filter => !["All Game", "2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(filter)) ? "h-[33%]" : "h-1/4"}`}>
        {currentGameActionFilters.length >= 1 && (
          <div
            className={`relative flex flex-col justify-start items-start gap-y-[2px] py-1 transition-all duration-300 ease-in-out ${
              showFiltersPlayerStat ? "w-[25%] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-2 overflow-hidden"
            }`}
          >
            {currentGameActionFilters.map((filter, index) => (
              <div
                key={index}
                onClick={() => handleFilterSelection(filter)}
                className="relative text-sm px-3 py-1 bg-secondary-bg rounded-md flex items-end h-8 group cursor-pointer hover:bg-primary-cta"
              >
                <span className="text-gray-400 group-hover:text-primary-bg">{filter}</span>
                <div className="ml-2 text-center text-primary-cta group-hover:text-primary-bg">X</div>
              </div>
            ))}

            <button
              onClick={() => setShowFiltersPlayerStat(!showFiltersPlayerStat)}
              className="absolute top-1/4 right-0 px-2 h-2/4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 transition-transform duration-300 ease-in-out" style={{ transform: showFiltersPlayerStat ? "rotate(0deg)" : "rotate(180deg)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        )}

        <div className="relative text-sm w-full rounded-md flex flex-row h-[90%]">
          {!showFiltersPlayerStat && currentGameActionFilters.length > 1 && (
            <div className="w-9 h-full flex justify-center bg-primary-bg">
              <button onClick={() => setShowFiltersPlayerStat(!showFiltersPlayerStat)} className="my-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 mx-auto" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}

          <div className="bg-secondary-bg rounded-s-md w-[22%] relative mx-auto h-auto border-r-4 border-r-primary-cta flex items-center justify-center">
            <img className="w-full h-full rounded-s-md" src={playerDetails.image || steph} alt="Player Avatar" />
          </div>

          <StatBlock label="PTS" value={(fgMade * 2) + (threePtMade * 1) + (ftMade * 1)} subLabel={`(${playerDetails.number}) ${playerDetails.name}`} />
          <StatBlock label="AST" value={assists} />
          <StatBlock label="RB" value={rebounds} />
          <StatBlock label="STL" value={steals} />
          {!showFiltersPlayerStat && (
            <>
              <StatBlock label="BLK" value={blocks} />
              {minutesTracked && <StatBlock label="MINS" value={minutesPlayed} gray />}
            </>
          )}
          <PercentageBlock label="FG" percentage={fgPercentage} made={fgMade} attempts={fgAttempts} />
          <PercentageBlock label="3PT" percentage={threePtPercentage} made={threePtMade} attempts={threePtAttempts} />
          {!showFiltersPlayerStat && <PercentageBlock label="FT" percentage={ftPercentage} made={ftMade} attempts={ftAttempts} />}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[40%] flex flex-row h-full">
      {alertMessage && (
        <motion.div className="absolute bottom-8 text-center left-0 w-full transform -translate-x-1/2 bg-primary-cta text-white py-3 rounded-lg shadow-lg flex items-center space-x-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
          <p className="text-sm font-medium">{alertMessage}</p>
          <button onClick={() => setAlertMessage("")} className="text-gray-400 hover:text-white">X</button>
        </motion.div>
      )}

      <div className="h-full flex w-2/4 mt-1 my-auto flex-col justify-center items-center">
        <p>FG {fieldGoal.made > 0 && ` ${Math.round((fieldGoal.made / fieldGoal.total) * 100)}%`}</p>
        <p>{fieldGoal.made}-{fieldGoal.total}</p>
      </div>
      <div className="h-full mt-1 flex w-2/4 my-auto flex-col justify-center items-center">
        <p>3PT {threepoint.made > 0 && ` ${Math.round((threepoint.made / threepoint.total) * 100)}%`}</p>
        <p>{threepoint.made}-{threepoint.total}</p>
      </div>
    </div>
  );
};

const StatBlock = ({ label, value, subLabel, gray }) => (
  <div className={`w-1/6 bg-secondary-bg text-center text-sm flex flex-col justify-center h-full ${gray ? "text-gray-300" : "text-gray-200"}`}>
    {subLabel && <p className="absolute text-white top-1 ml-4 text-md font-semibold mt-1">{subLabel}</p>}
    <p className="text-2xl font-semibold">{value}</p>
    <div className="flex justify-center">
      <p className="text-white bg-primary-cta rounded-sm px-2 py-[2px] text-xs uppercase font-bold w-fit inline-block">{label}</p>
    </div>
  </div>
);

const PercentageBlock = ({ label, percentage, made, attempts }) => (
  <div className="w-1/6 flex flex-col bg-secondary-bg text-center justify-center h-full">
    <p className="text-white text-lg">{percentage}%</p>
    <p className="text-gray-200 text-md mb-1">{made}-{attempts}</p>
    <div className="flex justify-center">
      <p className="text-white bg-white/10 px-2 py-[2px] rounded-sm text-xs uppercase font-bold w-fit inline-block">{label}</p>
    </div>
  </div>
);

export default QuickStats;
