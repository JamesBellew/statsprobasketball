import React from "react";

const PlayerStatsModal = ({
  showPlayerStatsModal,
  setShowPlayerStatsModal,
  teamImage,
  ravensLogo,
  teamScore,
  teamName,
  opponentLogo,
  opponentJerseyDefault,
  opponentScore,
  opponentName,
  setShowEditOpponentScoreModal,
  showEditOpponentScoreModal,
  currentQuater,
  quarterScores,
  opponentScoreInput,
  setOpponentScoreInput,
  minutesTracked,
  playersStatsArray,
  extractPlayerNumber,
  playerMinutes
}) => {
  if (!showPlayerStatsModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
      onClick={() => setShowPlayerStatsModal(false)}
    >
      <div
        className="relative bg-secondary-bg p-6 rounded-lg w-full max-w-4xl mx-4 my-8 overflow-auto max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Score Section */}
        <div className="flex justify-between items-center mb-4 p-4">
          <div
            onClick={() => setShowEditOpponentScoreModal(!showEditOpponentScoreModal)}
            className="flex flex-col space-y-2 pe-10 border-r-2 border-r-gray-400 w-2/5"
          >
            <div className="flex items-center w-full">
              <img className="w-10 h-10 rounded-full mr-2" alt="HomeLogo" src={teamImage || ravensLogo} />
              <span className={`${teamScore > opponentScore ? "text-white" : "text-gray-400"} text-lg font-semibold flex-1`}>
                {teamName}
              </span>
              <span className={`${teamScore > opponentScore ? "text-white" : "text-gray-400"} text-lg font-bold`}>
                {teamScore}
              </span>
            </div>

            <div className="flex items-center w-full">
              <img className="w-10 h-10 mx-auto rounded-full mr-2" src={opponentLogo || opponentJerseyDefault} alt={opponentName} />
              <span className={`${teamScore < opponentScore ? "text-white" : "text-gray-400"} text-lg font-semibold flex-1`}>
                {opponentName}
              </span>
              <span className={`${teamScore < opponentScore ? "text-white" : "text-gray-400"} text-lg font-bold`}>
                {opponentScore}
              </span>
            </div>
          </div>

          <div className="flex flex-col w-2/5">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs uppercase bg-primary-bg">
                  <tr>
                    {[1, 2, 3, 4].map((q) => (
                      <th key={q} className={`px-6 py-3 ${q === currentQuater ? "text-white" : "text-gray-400"}`}>
                        Q{q}
                      </th>
                    ))}
                    {currentQuater > 4 &&
                      [...Array(currentQuater - 4)].map((_, index) => {
                        const ot = index + 5;
                        return (
                          <th key={`OT${ot}`} className={`px-6 py-3 ${currentQuater === ot ? "text-white" : "text-gray-400"}`}>
                            OT{ot - 4}
                          </th>
                        );
                      })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-secondary-bg">
                    {[1, 2, 3, 4].map((q) => (
                      <td key={q} className={`px-6 py-4 ${q === currentQuater ? "text-white" : "text-gray-400"}`}>
                        {quarterScores[q] > 0 ? quarterScores[q] : currentQuater >= q ? "0" : "-"}
                      </td>
                    ))}
                    {currentQuater > 4 &&
                      [...Array(currentQuater - 4)].map((_, index) => {
                        const ot = index + 5;
                        return (
                          <td key={`OT${ot}`} className={`px-6 py-4 ${currentQuater === ot ? "text-white" : "text-gray-400"}`}>
                            {quarterScores[ot] > 0 ? quarterScores[ot] : "0"}
                          </td>
                        );
                      })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => setShowPlayerStatsModal(false)}
            className="text-white bg-primary-danger/50 hover:bg-red-500 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>

        {/* Opponent Score Edit (if enabled) */}
        {showEditOpponentScoreModal && (
          <div className="flex items-center">
            <form className="max-w-56 my-5 px-5">
              <label htmlFor="number-input" className="block mb-2 text-sm font-medium text-white">
                {opponentName} Score
              </label>
              <input
                type="number"
                id="number-input"
                className="bg-primary-bg border border-secondary-bg text-gray-200 text-sm rounded-lg block w-full p-2.5"
                placeholder="0"
                value={opponentScoreInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/^0+(?=\d)/, "");
                  setOpponentScoreInput(value);
                }}
              />
            </form>
            <svg
              onClick={() => setShowEditOpponentScoreModal(false)}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-primary-cta"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        )}

        {/* Player Stats Table */}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-white border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left">PlayerName</th>
                {minutesTracked && <th className="px-4 py-2 border-b text-left">Mins</th>}
                <th className="px-4 py-2 border-b text-left">PTS</th>
                <th className="px-4 py-2 border-b text-left">FG</th>
                <th className="px-4 py-2 border-b text-left">3PT</th>
                <th className="px-4 py-2 border-b text-left">FT</th>
                <th className="px-4 py-2 border-b text-left">AST</th>
                <th className="px-4 py-2 border-b text-left">RB</th>
                <th className="px-4 py-2 border-b text-left">BLK</th>
                <th className="px-4 py-2 border-b text-left">STL</th>
                <th className="px-4 py-2 border-b text-left">TO</th>
                <th className="px-4 py-2 border-b text-left">ORB</th>
              </tr>
            </thead>
            <tbody>
              {playersStatsArray.length > 0 ? (
                [...playersStatsArray]
                  .map((stat) => ({
                    ...stat,
                    totalPoints: (stat.fgMade * 2) + (stat.threePtMade * 1) + (stat.ftMade * 1),
                  }))
                  .sort((a, b) => b.totalPoints - a.totalPoints)
                  .map((stat, index) => {
                    const fgPct = stat.fgAttempts ? Math.round((stat.fgMade / stat.fgAttempts) * 100) : 0;
                    const threePct = stat.threePtAttempts ? Math.round((stat.threePtMade / stat.threePtAttempts) * 100) : 0;
                    const ftPct = stat.ftAttempts ? Math.round((stat.ftMade / stat.ftAttempts) * 100) : 0;
                    const playerNumber = extractPlayerNumber(stat.player);
                    const minutesPlayed = playerNumber ? playerMinutes[playerNumber] || 0 : 0;

                    return (
                      <tr key={index} className="hover:bg-primary-cta group odd:bg-secondary-bg even:bg-white/10 text-white hover:text-primary-bg">
                        <td className="px-4 py-2 border-b border-b-gray-500"><span className="text-gray-200 group-hover:text-black">{stat.player}</span></td>
                        {minutesTracked && (
                          <td className="px-4 py-2 border-b border-b-gray-500 font-bold text-white">
                            <span className="text-gray-200 group-hover:text-black">{minutesPlayed}</span>
                          </td>
                        )}
                        <td className="px-4 py-2 border-b border-b-gray-500 font-bold text-white">
                          <span className="text-gray-200 group-hover:text-black">{stat.totalPoints}</span>
                        </td>
                        <td className="px-4 py-2 border-b border-b-gray-500">{stat.fgMade}-{stat.fgAttempts} <span className="text-gray-400 group-hover:text-black">({fgPct}%)</span></td>
                        <td className="px-4 py-2 border-b border-b-gray-500">{stat.threePtMade}-{stat.threePtAttempts} <span className="text-gray-400 group-hover:text-black">({threePct}%)</span></td>
                        <td className="px-4 py-2 border-b border-b-gray-500">{stat.ftMade}-{stat.ftAttempts} <span className="text-gray-500 group-hover:text-black">({ftPct}%)</span></td>
                        <td className="px-4 py-2 border-b border-b-gray-500">{stat.assists}</td>
                        <td className="px-4 py-2 border-b border-b-gray-500">{stat.rebounds}</td>
                        <td className="px-4 py-2 border-b border-b-gray-500">{stat.blocks}</td>
                        <td className="px-4 py-2 border-b border-b-gray-500">{stat.steals}</td>
                        <td className="px-4 py-2 border-b border-b-gray-500">{stat.turnovers}</td>
                        <td className="px-4 py-2 border-b border-b-gray-500">{stat.offRebounds}</td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td className="px-4 py-2 border-b text-center" colSpan="12">
                    No player stats available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsModal;
