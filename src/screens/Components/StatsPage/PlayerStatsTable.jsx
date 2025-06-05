import React from "react";

const extractPlayerNumber = (str) => {
  const match = str?.match(/\((\d+)\)/);
  return match ? match[1] : null;
};

const PlayerStatsTable = ({ gameActions = [], playerMinutes = {} }) => {
  const minutesTracked = false;

  const playersStats = gameActions.reduce((acc, action) => {
    if (!action.playerName) return acc;

    const key = `(${action.playerNumber}) ${action.playerName}`;
    if (!acc[key]) {
      acc[key] = {
        player: key,
        fgMade: 0,
        fgAttempts: 0,
        threePtMade: 0,
        threePtAttempts: 0,
        ftMade: 0,
        ftAttempts: 0,
        steals: 0,
        assists: 0,
        rebounds: 0,
        offRebounds: 0,
        turnovers: 0,
        blocks: 0,
      };
    }

    if (["2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(action.actionName)) {
      acc[key].fgAttempts += 1;
      if (["2 Points", "3 Points"].includes(action.actionName)) acc[key].fgMade += 1;
    }

    if (["3 Points", "3Pt Miss"].includes(action.actionName)) {
      acc[key].threePtAttempts += 1;
      if (action.actionName === "3 Points") acc[key].threePtMade += 1;
    }

    if (["FT Score", "FT Miss"].includes(action.actionName)) {
      acc[key].ftAttempts += 1;
      if (action.actionName === "FT Score") acc[key].ftMade += 1;
    }

    if (action.actionName === "Assist") acc[key].assists += 1;
    if (action.actionName === "Steal") acc[key].steals += 1;
    if (action.actionName === "T/O") acc[key].turnovers += 1;
    if (action.actionName === "Rebound") acc[key].rebounds += 1;
    if (action.actionName === "OffRebound") {
      acc[key].offRebounds += 1;
      acc[key].rebounds += 1;
    }
    if (action.actionName === "Block") acc[key].blocks += 1;

    return acc;
  }, {});

  const playersStatsArray = Object.values(playersStats);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* <h1 className="mb-4 text-2xl font-semibold leading-none tracking-tight text-gray-900 md:text-2xl mx-auto mt-4 lg:text-4xl dark:text-white">
        Player Stats Table
      </h1> */}

      <div className="overflow-x-auto">
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
                .map(stat => ({
                  ...stat,
                  totalPoints: (stat.fgMade * 2) + stat.threePtMade + stat.ftMade
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
                      <td className="px-4 py-2 border-b border-b-gray-500">
                        <span className="text-gray-200 group-hover:text-black">{stat.player}</span>
                      </td>
                      {minutesTracked && (
                        <td className="px-4 py-2 border-b border-b-gray-500 font-bold text-white">
                          <span className="text-gray-200 group-hover:text-black">{minutesPlayed}</span>
                        </td>
                      )}
                      <td className="px-4 py-2 border-b border-b-gray-500 font-bold text-white">{stat.totalPoints}</td>
                      <td className="px-4 py-2 border-b border-b-gray-500">{stat.fgMade}-{stat.fgAttempts} <span className="text-gray-400 group-hover:text-black">({fgPct}%)</span></td>
                      <td className="px-4 py-2 border-b border-b-gray-500">{stat.threePtMade}-{stat.threePtAttempts} <span className="text-gray-400 group-hover:text-black">({threePct}%)</span></td>
                      <td className="px-4 py-2 border-b border-b-gray-500">{stat.ftMade}-{stat.ftAttempts} <span className="text-gray-400 group-hover:text-black">({ftPct}%)</span></td>
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
                <td colSpan="12" className="px-4 py-2 text-center text-gray-400">No player stats available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerStatsTable;
