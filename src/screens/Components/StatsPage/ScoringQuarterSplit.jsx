import React from "react";

const ScoringQuarterSplit = ({ gameActions }) => {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const quarterMap = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };

  const quarterStats = {
    Q1: { pts: 0, fgMade: 0, fgAttempted: 0, threePtMade: 0, threePtAttempted: 0 },
    Q2: { pts: 0, fgMade: 0, fgAttempted: 0, threePtMade: 0, threePtAttempted: 0 },
    Q3: { pts: 0, fgMade: 0, fgAttempted: 0, threePtMade: 0, threePtAttempted: 0 },
    Q4: { pts: 0, fgMade: 0, fgAttempted: 0, threePtMade: 0, threePtAttempted: 0 },
  };

  gameActions.forEach((action) => {
    const q = Object.keys(quarterMap).find((key) => quarterMap[key] === action.quarter);
    if (!q) return;

    switch (action.actionName) {
      case "2 Points":
        quarterStats[q].pts += 2;
        quarterStats[q].fgMade += 1;
        quarterStats[q].fgAttempted += 1;
        break;
      case "3 Points":
        quarterStats[q].pts += 3;
        quarterStats[q].fgMade += 1;
        quarterStats[q].fgAttempted += 1;
        quarterStats[q].threePtMade += 1;
        quarterStats[q].threePtAttempted += 1;
        break;
      case "2Pt Miss":
        quarterStats[q].fgAttempted += 1;
        break;
      case "3Pt Miss":
        quarterStats[q].fgAttempted += 1;
        quarterStats[q].threePtAttempted += 1;
        break;
      default:
        break;
    }
  });

  const calculatePercentage = (made, attempted) => {
    if (attempted === 0) return "";
    const percentage = ((made / attempted) * 100).toFixed(0);
    return ` (${percentage}%)`;
  };

  const statLabels = [
    { label: "PTS", key: "pts", format: (q) => q.pts },
    {
      label: "FG",
      key: "fg",
      format: (q) => `${q.fgMade}/${q.fgAttempted}${calculatePercentage(q.fgMade, q.fgAttempted)}`,
    },
    {
      label: "3PT",
      key: "threePt",
      format: (q) =>
        `${q.threePtMade}/${q.threePtAttempted}${calculatePercentage(q.threePtMade, q.threePtAttempted)}`,
    },
  ];

  return (
<div className="bg-dark-700 p-6 rounded-2xl shadow-lg ring-1 ring-white/5">
  <h3 className="text-xl font-semibold text-white text-center mb-6">
    📊 Quarter-by-Quarter Stats
  </h3>
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm text-center rounded-xl overflow-hidden">
      <thead>
        <tr className="bg-white/5 text-white uppercase tracking-wide">
          <th className="text-left px-4 py-3">Stat</th>
          {quarters.map((q) => (
            <th key={q} className="px-4 py-3">
              {q}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {statLabels.map((stat, rowIdx) => (
          <tr
            key={stat.label}
            className={`transition duration-200 ${
              rowIdx % 2 === 1 ? "bg-white/5" : "bg-primary-bg"
            } hover:bg-white/10`}
          >
            <td className="text-left px-4 py-3 font-medium text-white">
              {stat.label}
            </td>
            {quarters.map((q) => (
              <td
                key={q}
                className="px-4 py-3 text-white/90 font-mono border-l border-gray-700"
              >
                {stat.format(quarterStats[q])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


  );
};

export default ScoringQuarterSplit;
