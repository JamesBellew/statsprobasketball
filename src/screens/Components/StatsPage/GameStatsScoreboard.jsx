import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import opponentJerseyDefault from "../../../assets/jersey.webp"; // ✅ adjust path if needed
import { fetchTeamSettings } from "../../../utils/fetchTeamSettings";
import { faDownload, faHome, faCog, faEllipsisH,faShareNodes,faSliders } from "@fortawesome/free-solid-svg-icons";
const GameStatsScoreboard = ({
  homeTeamName,
  opponentName,
  opponentLogo,
  teamImage, // if you want to do similar logic for homeLogo
  currentQuarter = 4,
  gameActions = [],
  gameStatus = "FT",
  score,
}) => {

  //?Local Variables
  const homeScore = score?.home ?? "-";
  const awayScore = score?.opponent ?? "-";

  //? Functions
  // Helper to determine current quarter or OT label
const getQuarterDisplay = (gameActions = []) => {
  const quarters = gameActions.map(action => action.quarter).filter(Boolean);
  const maxQuarter = Math.max(...quarters, 1); // default to 1

  if (maxQuarter <= 4) {
    return maxQuarter;
  } else {
    return `OT${maxQuarter - 4}`;
  }
};


  return (
    <>

    <div className="w-full  h-full max-w-3xl mx-auto flex items-center justify-between bg-secondary-bg px-6 py-4 rounded-lg shadow-lg text-white">
      {/* Home Team */}
      <div className="flex flex-col items-center space-y-1">
        <img
          src={teamImage || "https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg"}
          alt={`${homeTeamName} Logo`}
          className="w-16 h-16 object-contain rounded-full"
        />
        <p className="text-lg font-semibold">{homeTeamName}</p>
        <p className="text-3xl font-bold">{homeScore}</p>
      </div>

      {/* Center Info */}
      <div className="flex flex-col items-center space-y-1">
  <p className="text-sm text-gray-400">QTR</p>
  <div className="text-2xl font-bold">{getQuarterDisplay(gameActions)}</div>
  <p className="text-sm text-gray-400">
    {getQuarterDisplay(gameActions)>=4 ? "FT" : ""}
    </p>
</div>


      {/* Away Team */}
      <div className="flex flex-col items-center space-y-1">
        <img
          src={opponentLogo || opponentJerseyDefault}
          alt={`${opponentName} Logo`}
          className="w-16 h-16 object-contain rounded-full"
        />
        <p className="text-lg font-semibold">{opponentName}</p>
        <p className="text-3xl font-bold">{awayScore}</p>
      </div>
    </div>


    </>
  );
};

export default GameStatsScoreboard;
