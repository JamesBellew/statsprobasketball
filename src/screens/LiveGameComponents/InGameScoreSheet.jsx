import React, { useEffect, useState, useMemo } from "react";

/**
 * InGameScoreSheet (compact, dynamic)
 * - Uses ONLY Tailwind + plain <svg>
 * - Number merged with name, smaller paddings, tighter layout
 */
export default function InGameScoreSheet({
  initialOpen = false,
  initialTeam = "Dundalk Ravens",
  homeScore = 0,
  awayScore = 0,
  quarter = 1,
  clock = "10:00",
  logos = { home: null, away: null },
  colors = { home: '#3B82F6', away: '#F97316' },
  homeEmoji = "🦅",
  awayEmoji = "⚔️",
  homeTeamName = "Home",
  awayTeamName = "Away",
  rows = [], // [{ number, name, pts, mins, ast, reb, to, stl, blk }]
}) {
  const [open, setOpen] = useState(initialOpen);
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  const [activeNumber, setActiveNumber] = useState(null);

  // prevent body scroll when sheet is open
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = orig);
  }, [open]);

  // esc to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const totals = (key) => rows.reduce((sum, p) => sum + (p[key] || 0), 0);

  const sortedRows = useMemo(() => {
    const safe = Array.isArray(rows) ? rows : [];
    return [...safe].sort((a, b) => {
      const p = (b.pts ?? 0) - (a.pts ?? 0); // points desc
      if (p !== 0) return p;
      const ast = (b.ast ?? 0) - (a.ast ?? 0);
      if (ast !== 0) return ast;
      const reb = (b.reb ?? 0) - (a.reb ?? 0);
      if (reb !== 0) return reb;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [rows]);

  // Logo renderer: shows <img> for urls/paths, else emoji/text
  const renderLogo = (val, fallbackEmoji) => {
    if (!val) return <span className="text-lg">{fallbackEmoji}</span>;
    const isUrlLike =
      typeof val === "string" &&
      (val.startsWith("http") || val.startsWith("/") || val.startsWith("data:"));
    return isUrlLike ? (
      <img src={val} alt="team logo" className="w-full h-full rounded-full p-1" />
    ) : (
      <span className="text-lg">{val}</span>
    );
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open scoresheet"
        className="fixed bottom-4 left-4 rounded-full shadow-lg bg-primary-green hover:bg-primary-green/90 h-12 w-12 p-0 grid place-items-center z-40"
      >
        {/* clipboard + ball */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none">
          <rect x="4" y="4" width="11" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7 8h6M7 11h6M7 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="18" cy="17" r="3.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M18 13.8v6.4M14.8 17h6.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {/* overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />}

      {/* bottom sheet */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-40 bg-zinc-950 border-t border-zinc-800 rounded-t-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: "85vh" }}
        role="dialog"
        aria-modal="true"
      >
        {/* handle + close */}
        <div className="relative px-3 py-2">
          <div className="mx-auto h-1 w-8 rounded-full bg-zinc-700" />
          <button
            className="absolute right-2 top-1.5 p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* header (smaller) */}
        <div className="px-3">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-zinc-900/80 rounded-lg border border-zinc-800">
            {/* left (home) */}
            <div className="flex flex-col items-center gap-0.5 flex-1">
              <div
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center border"
                style={{ borderColor: colors?.home }}
              >
                <span className="text-base">{renderLogo(logos?.home, homeEmoji)}</span>
              </div>
              <div className="text-xl font-bold tracking-tight">{homeScore}</div>
            </div>

            {/* center */}
            <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
              <div className="text-[9px] font-semibold text-zinc-500 tracking-wider uppercase">Time</div>
              <div className="text-sm font-mono font-bold tracking-tight">{clock}</div>
              <div className="text-[9px] font-semibold text-zinc-500 tracking-wider uppercase">QTR</div>
              <div className="text-xs font-bold bg-zinc-800 px-1.5 py-[1px] rounded">{quarter}</div>
            </div>

            {/* right (away) */}
            <div className="flex flex-col items-center gap-0.5 flex-1">
              <div
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center border"
                style={{ borderColor: colors?.away }}
              >
                <span className="text-base">{renderLogo(logos?.away, awayEmoji)}</span>
              </div>
              <div className="text-xl font-bold tracking-tight">{awayScore}</div>
            </div>
          </div>
        </div>

        {/* team switch */}
        <div className="mt-2 flex gap-1 p-1 bg-zinc-900 rounded-lg mx-3">
          <button
            onClick={() => setSelectedTeam(homeTeamName)}
            style={{ backgroundColor: selectedTeam===homeTeamName ? colors?.home : undefined }}
            className={`flex-1 py-1.5 px-2 rounded-md text-[12px] font-semibold transition-all ${
              selectedTeam === homeTeamName
                ? " text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {homeTeamName}
          </button>

          <button
            onClick={() => setSelectedTeam(awayTeamName)}
            style={selectedTeam === awayTeamName ? { backgroundColor: colors?.away, color: "#fff" } : undefined}
            className={`flex-1 py-1.5 px-2 rounded-md text-[12px] font-semibold transition-all ${
              selectedTeam === awayTeamName
                ? "text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {awayTeamName}
          </button>
        </div>

        {/* body */}
        {selectedTeam === homeTeamName ? (
          <div className="mt-2 px-3 h-auto overflow-auto ">
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="sticky left-0 z-10 bg-zinc-950 text-left text-xs font-semibold tracking-wide text-zinc-400 px-2 py-1 min-w-[100px]">
              Player
            </th>
            {["PTS", "AST", "REB", "T/O", "STL", "BLK"].map((h) => (
              <th
                key={h}
                className="text-center text-xs font-semibold tracking-wide text-zinc-400 px-2 py-1 min-w-[20px]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedRows.map((p) => (
            <tr
              key={`${p.number}-${p.name}`}
              className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors"
            >
              <td className="sticky left-0 z-10 bg-zinc-950 px-2  text-xs font-medium text-zinc-100">
                {p.name} <span className="text-zinc-500 font-normal">({p.number})</span>
              </td>
              <td className="text-center text-sm font-semibold text-zinc-100 px-2 py-1">{p.pts ?? 0}</td>
              <td className="text-center text-sm text-zinc-300 px-3 py-1">{p.ast ?? 0}</td>
              <td className="text-center text-sm text-zinc-300 px-3 py-1">{p.reb ?? 0}</td>
              <td className="text-center text-sm text-zinc-300 px-3 py-1">{p.to ?? p.tov ?? 0}</td>
              <td className="text-center text-sm text-zinc-300 px-3 py-1">{p.stl ?? 0}</td>
              <td className="text-center text-sm text-zinc-300 px-3 py-1">{p.blk ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
            </div>
          </div>
        ) : (
          <div className="mt-2 h-[calc(80vh-140px)] flex items-center justify-center px-3">
            <div className="text-center space-y-3">
              <div
                className="w-16 h-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center border"
                style={{ borderColor: colors?.away }}
              >
                <span className="text-3xl">{renderLogo(logos?.away, awayEmoji)}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Coming Soon</h3>
                <p className="text-zinc-400 text-sm">Away Team Stats Available in Beta Release 2</p>
          
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
