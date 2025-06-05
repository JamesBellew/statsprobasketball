import React from "react";

const GameStats = ({ gameActions = [] }) => {
  // Initial totals
  let fgMade = 0, fgAtt = 0, threeMade = 0, threeAtt = 0, ftMade = 0, ftAtt = 0;
  let assists = 0, rebounds = 0, offRebounds = 0, steals = 0, turnovers = 0, blocks = 0;

  gameActions.forEach(action => {
    const a = action.actionName;

    if (["2 Points", "2Pt Miss", "3 Points", "3Pt Miss"].includes(a)) {
      fgAtt += 1;
      if (["2 Points", "3 Points"].includes(a)) fgMade += 1;
    }

    if (["3 Points", "3Pt Miss"].includes(a)) {
      threeAtt += 1;
      if (a === "3 Points") threeMade += 1;
    }

    if (["FT Score", "FT Miss"].includes(a)) {
      ftAtt += 1;
      if (a === "FT Score") ftMade += 1;
    }

    if (a === "Assist") assists += 1;
    if (a === "Steal") steals += 1;
    if (a === "T/O") turnovers += 1;
    if (a === "Block") blocks += 1;
    if (a === "Rebound") rebounds += 1;
    if (a === "OffRebound") {
      offRebounds += 1;
      rebounds += 1; // Counted as both rebound and offensive rebound
    }
  });

  const calcPct = (made, att) => att ? Math.round((made / att) * 100) + "%" : "0%";

  const stats = [
    { label: "FG%", value: calcPct(fgMade, fgAtt), detail: `${fgMade}-${fgAtt}` },
    { label: "3PT%", value: calcPct(threeMade, threeAtt), detail: `${threeMade}-${threeAtt}` },
    { label: "FT%", value: calcPct(ftMade, ftAtt), detail: `${ftMade}-${ftAtt}` },
    { label: "AST", value: assists },
    { label: "REB", value: rebounds },
    { label: "ORB", value: offRebounds },
    { label: "BLK", value: blocks },
    { label: "T/O", value: turnovers },
    { label: "STL", value: steals },
    { label: "STL", value: steals },
  ];

  return (
    <>
{/* <h1 className="py-12 text-3xl font-bold tracking-tight text-center text-white">
  📊 Game Stats
</h1> */}

<div className="grid grid-cols-2 md:grid-cols-5 my-auto gap-6">
  {stats.map((stat, i) => (
    <div
      key={i}
      className="bg-gradient-to-br from-[#1e1e2f] to-[#15151d] p-5 rounded-xl border border-white/10
       shadow-md text-center transform transition hover:scale-[1.03] hover:shadow-xl"
    >
      <p className="text-md font-medium text-primary-cta tracking-wide uppercase mb-1">
        {stat.label}
      </p>
      <p className="text-3xl font-bold text-primary-cta text-white">{stat.value}</p>
      {stat.detail && (
        <p className="text-xs text-gray-500 mt-2 italic">{stat.detail}</p>
      )}
    </div>
  ))}
</div>

    </>
  );
};

export default GameStats;
