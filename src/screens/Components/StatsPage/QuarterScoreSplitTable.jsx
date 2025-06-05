import React from "react";

export default function QuarterScoreSplitTable({ gameActions = [] }) {
  // Aggregate scores by quarter


//   gameActions.forEach(({ quarter, points }) => {
//     if (!points || typeof points !== "number") return;

//     const key = quarter <= 4 ? `Q${quarter}` : `OT${quarter - 4}`;
//     quarterScores[key] = (quarterScores[key] || 0) + points;
//   });

  // Create ordered keys like Q1, Q2, ..., OT1, OT2...

// Filter home team actions only
const homeTeamActions = gameActions.filter(action => !action.isOpponent); // or however you determine it's home
const quarterScores = {};

homeTeamActions.forEach((action) => {
  if (["2 Points", "3 Points"].includes(action.actionName)) {
    const q = action.quarter;
    if (!quarterScores[q]) {
      quarterScores[q] = 0;
    }

    if (action.actionName === "2 Points") {
      quarterScores[q] += 2;
    } else if (action.actionName === "3 Points") {
      quarterScores[q] += 3;
    }
  }
});
const sortedKeys = Object.keys(quarterScores).sort((a, b) => {
    const getNumeric = (key) =>
      key.startsWith("Q") ? parseInt(key.slice(1)) : parseInt(key.slice(2)) + 4;

    return getNumeric(a) - getNumeric(b);
  });

  return (
<div className="max-w-lg w-1/2 mx-auto p-4 rounded-lg bg-white/5 backdrop-blur shadow-md border border-white/10">
  <h2 className="text-white text-xl font-bold text-center mb-4 tracking-wide">Quarter Breakdown</h2>

  <table className="table w-full text-sm text-center text-white">
    <thead>
      <tr className="border-b border-white/10">
        <th className="py-3 text-left text-gray-400">Quarter</th>
        {sortedKeys.map((key) => (
          <th key={key} className="py-3 text-gray-400">{key}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="font-semibold py-3 text-left text-white">PTS</td>
        {sortedKeys.map((key) => (
          <td key={key} className="py-3 text-white">{quarterScores[key] || "-"}</td>
        ))}
      </tr>
    </tbody>
  </table>

  {/* Legend */}
  <div className="flex justify-center items-center gap-6 mt-5">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-primary-cta rounded-full"></div>
      <span className="text-sm text-gray-300">Made</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-secondary-danger rounded-full"></div>
      <span className="text-sm text-gray-300">Missed</span>
    </div>
  </div>
</div>

  
  );
}
