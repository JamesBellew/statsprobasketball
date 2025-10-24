// LiveGameComponents/PreGameCard.jsx
import React, { useMemo, useState } from "react"

/**
 * Props
 * - liveGame?: the liveGames/{slug} doc (or a subset of it)
 *   └─ expects: { preGameCardEnabled?: boolean, preGameCard?: object, teamNames?, logos?, scheduledStart?, venue? }
 * - preGameCard?: object (override / direct injection; if present this is used)
 * - defaultTab?: "info" | "h2h"
 * - logos?: { home, away } (fallback)
 * - colors?: { home, away } (fallback)
 * - homeEmoji?: string fallback for missing logo
 * - awayEmoji?: string fallback for missing logo
 *
 * Notes:
 * - If neither preGameCard nor (liveGame.preGameCardEnabled && liveGame.preGameCard) exists, this returns null.
 */
export function PreGameCard({
  liveGame,
  preGameCard: preGameCardProp,
  defaultTab = "info",
  logos: logosProp = { home: null, away: null },
  colors: colorsProp = { home: "#3B82F6", away: "#F97316" },
  homeEmoji = "🦅",
  awayEmoji = "⛹",
}) {
  const [tab, setTab] = useState(defaultTab);
   // --- put normalize + pre HERE ---
   const normalizePre = (raw, lg) => {
    if (!raw) return null;
    if (raw.season || raw.recentForm || raw.record) return raw;

    const num = (v) => (v === undefined || v === null || v === "" ? null : Number(v));
    const arr = (v) => (Array.isArray(v) ? v : []);

    const hw = raw?.home?.record?.wins, hl = raw?.home?.record?.losses;
    const aw = raw?.away?.record?.wins, al = raw?.away?.record?.losses;

    return {
      teams: {
        home: { name: lg?.teamNames?.home, logo: lg?.logos?.home, color: lg?.homeTeamColor },
        away: { name: lg?.teamNames?.away, logo: lg?.logos?.away, color: lg?.awayTeamColor },
      },
      season: {
        home: { ppg: num(raw?.home?.ppg), papg: num(raw?.home?.papg), diff: num(raw?.home?.diff) },
        away: { ppg: num(raw?.away?.ppg), papg: num(raw?.away?.papg), diff: num(raw?.away?.diff) },
      },
      recentForm: {
        home: arr(raw?.home?.form),
        away: arr(raw?.away?.form),
      },
      record: {
        home: { wins: num(hw), losses: num(hl) },
        away: { wins: num(aw), losses: num(al) },
      },
      headToHead: {
        // your screenshot shows totalGames at preGameCard.totalGames
        totalGames: num(raw?.totalGames ?? raw?.h2h?.totalGames),
        homeWins:  num(raw?.home?.h2hWins ?? raw?.h2h?.homeWins),
        awayWins:  num(raw?.away?.h2hWins ?? raw?.h2h?.awayWins),
        lastMeeting: raw?.h2h?.lastMeeting ?? null,
      },
      meta: raw?.meta ?? null,
    };
  };

  const pre = useMemo(() => {
    const src = preGameCardProp ?? (liveGame?.preGameCardEnabled ? liveGame?.preGameCard : null);
    return normalizePre(src, liveGame);
  }, [preGameCardProp, liveGame]);

  if (!pre) return null;  // <-- now it’s safe

  // 1) Resolve the data source (prop wins; otherwise take from liveGame if enabled)
  // const pre = useMemo(() => {
  //   if (preGameCardProp) return preGameCardProp
  //   if (liveGame?.preGameCardEnabled && liveGame?.preGameCard) return liveGame.preGameCard
  //   return null
  // }, [preGameCardProp, liveGame])

  // Bail if no pre-game data present
  if (!pre) return null

  // 2) Safe getters + fallbacks
  const homeName =
    pre?.teams?.home?.name ??
    liveGame?.teamNames?.home ??
    "Home"
  const awayName =
    pre?.teams?.away?.name ??
    liveGame?.teamNames?.away ??
    "Away"

  const logos = {
    home: pre?.teams?.home?.logo ?? liveGame?.logos?.home ?? logosProp.home,
    away: pre?.teams?.away?.logo ?? liveGame?.logos?.away ?? logosProp.away,
  }

  const colors = {
    home: pre?.teams?.home?.color ?? colorsProp.home,
    away: pre?.teams?.away?.color ?? colorsProp.away,
  }

  const recordHome = pre?.record?.home ?? { wins: null, losses: null }
  const recordAway = pre?.record?.away ?? { wins: null, losses: null }

  const pct = (w, l) => {
    const played = (w ?? 0) + (l ?? 0)
    if (!played) return null
    return ((w / played) * 100).toFixed(1)
  }

  const season = pre?.season ?? {
    home: { ppg: null, papg: null, diff: null },
    away: { ppg: null, papg: null, diff: null },
  }

  const recentForm = pre?.recentForm ?? {
    home: [],
    away: [],
  }

  // normalize to 5 cells for the UI (W/L or blank)
  const padToFive = (arr) => {
    const a = Array.isArray(arr) ? arr.slice(0, 5) : []
    while (a.length < 5) a.push("") // blanks
    return a
  }
  const recentHome = padToFive(recentForm.home)
  const recentAway = padToFive(recentForm.away)

  const h2h = pre?.headToHead ?? {
    totalGames: null,
    homeWins: null,
    awayWins: null,
    lastMeeting: null,
  }

  const lastMeeting = h2h?.lastMeeting ?? null
  // lastMeeting suggested shape:
  // { dateISO?: string, dateLabel?: string, homeScore?: number, awayScore?: number }

  // Meta (when/where) – try liveGame.scheduledStart first, then pre.meta
  const sched = liveGame?.scheduledStart ?? pre?.meta?.scheduled ?? null
  const whenLine = sched
    ? (() => {
        // Try to display a friendly line if we get ISO/etc.
        if (sched.date && sched.time) return `${sched.date} • ${sched.time}`
        if (sched.dateLabel) return sched.dateLabel
        return null
      })()
    : null
  const whereLine =
    liveGame?.venue ??
    pre?.meta?.venue ??
    null

  const handleShare = () => {
    const title = `${homeName} vs ${awayName}`
    const text = "Check out this upcoming game!"
    const url = typeof window !== "undefined" ? window.location.href : undefined
    if (navigator.share) {
      navigator
        .share({ title, text, url })
        .catch(() => url && navigator.clipboard.writeText(url))
    } else if (url) {
      navigator.clipboard.writeText(url)
    }
  }

  const renderLogo = (val, fallbackEmoji) => {
    if (!val) return <span className="text-lg">{fallbackEmoji}</span>
    const isUrlLike =
      typeof val === "string" &&
      (val.startsWith("http") || val.startsWith("/") || val.startsWith("data:"))
    return isUrlLike ? (
      <img src={val} alt="team logo" className="w-full h-full rounded-full p-1" />
    ) : (
      <span className="text-lg">{val}</span>
    )
  }

  // helpers for colored numbers
  const Diff = ({ value }) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-300 font-semibold">—</span>
    }
    const n = Number(value)
    const cls = n >= 0 ? "text-secondary-cta" : "text-primary-red"
    const signed = n > 0 ? `+${n}` : `${n}`
    return <span className={`${cls} font-semibold`}>{signed}</span>
  }

  const Num = ({ value }) => (
    <span className="text-white font-semibold">
      {value === null || value === undefined || value === "" ? "—" : value}
    </span>
  )

  const Pct = ({ w, l }) => {
    const p = pct(w, l)
    return (
      <span className="text-sm text-gray-400 mt-1">
        {w ?? 0}-{l ?? 0}
        {p ? ` (${p}%)` : ""}
      </span>
    )
  }
   // ---- H2H helpers ----

// ---- H2H helpers (REPLACE this whole section) ----
const asNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const rawTotal   = asNum(h2h?.totalGames);
const homeWinsH2H = asNum(h2h?.homeWins);
const awayWinsH2H = asNum(h2h?.awayWins);

// If totalGames missing/wrong, fall back to sum of wins
const totalH2H = rawTotal > 0 ? rawTotal : (homeWinsH2H + awayWinsH2H);

// Correct H2H %: wins / total
const h2hPct = (wins, total) => (total > 0 ? Math.round((wins / total) * 100) : 0);

const homePct = h2hPct(homeWinsH2H, totalH2H);
const awayPct = h2hPct(awayWinsH2H, totalH2H);


  return (
    <div className="w-full max-w-lg bg-secondary-bg border border-secondary-bg/50 rounded-lg shadow-lg">
      <div className="p-6 space-y-2">
        {/* Tabs / slider */}
        <div className="relative w-full flex justify-center">
          <div className="relative bg-secondary-bg/60 rounded-full p-1 w-[260px] flex items-center">
            {/* slider pill */}
            <div
              className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-primary-cta rounded-lg transition-transform duration-300"
              style={{ transform: tab === "info" ? "translateX(0)" : "translateX(100%)" }}
            />
            <button
              onClick={() => setTab("info")}
              className={`relative z-10 flex-1 py-1 text-sm rounded-full transition-colors ${
                tab === "info" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
              aria-pressed={tab === "info"}
            >
              Info
            </button>
            <button
              onClick={() => setTab("h2h")}
              className={`relative z-10 flex-1 py-1 text-sm rounded-full transition-colors ${
                tab === "h2h" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
              aria-pressed={tab === "h2h"}
            >
              Head to Head
            </button>
          </div>
        </div>

        {/* Teams + records */}
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <p className="font-semibold text-white">{homeName}</p>
            <Pct w={recordHome.wins} l={recordHome.losses} />
          </div>
          <div className="text-gray-500 px-4 font-medium">vs</div>
          <div className="flex-1">
            <p className="font-semibold text-white">{awayName}</p>
            <Pct w={recordAway.wins} l={recordAway.losses} />
          </div>
        </div>

        {tab === "info" ? (
          <>
            {/* Recent form */}
            <div className="space-y-3 pt-2 border-t border-secondary-bg">
              <div className="flex items-center justify-between">
                {/* Home recent form */}
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Recent Form</p>
                  <div className="flex gap-0.5">
                    {recentHome.map((r, i) => {
                      const win = r?.toUpperCase() === "W"
                      const loss = r?.toUpperCase() === "L"
                      const base = "px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded-sm"
                      if (win) return <span key={i} className={`${base} bg-secondary-cta/20 text-secondary-cta`}>W</span>
                      if (loss) return <span key={i} className={`${base} bg-primary-red/20 text-primary-red`}>L</span>
                      return <span key={i} className={`${base} bg-white/5 text-gray-400`}>•</span>
                    })}
                  </div>
                </div>

                {/* Away recent form */}
                <div className="flex-1 text-right">
                  <p className="text-xs text-gray-400 mb-1">Recent Form</p>
                  <div className="flex gap-0.5 justify-end">
                    {recentAway.map((r, i) => {
                      const win = r?.toUpperCase() === "W"
                      const loss = r?.toUpperCase() === "L"
                      const base = "px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded-sm"
                      if (win) return <span key={i} className={`${base} bg-secondary-cta/20 text-secondary-cta`}>W</span>
                      if (loss) return <span key={i} className={`${base} bg-primary-red/20 text-primary-red`}>L</span>
                      return <span key={i} className={`${base} bg-white/5 text-gray-400`}>•</span>
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Season averages */}
            <div className="space-y-3 pt-2 border-t border-secondary-bg">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Num value={season?.home?.ppg} />
                  <span className="text-gray-400 text-xs">Points Per Game</span>
                  <Num value={season?.away?.ppg} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Num value={season?.home?.papg} />
                  <span className="text-gray-400 text-xs">Points Allowed</span>
                  <Num value={season?.away?.papg} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Diff value={season?.home?.diff} />
                  <span className="text-gray-400 text-xs">Point Differential</span>
                  <Diff value={season?.away?.diff} />
                </div>
              </div>
            </div>

            {/* When/where */}
            {(whenLine || whereLine) && (
              <div className="pt-2 border-t border-secondary-bg text-center space-y-1">
                {whenLine && <p className="text-sm font-medium text-white">{whenLine}</p>}
                {whereLine && <p className="text-xs text-gray-400">{whereLine}</p>}
              </div>
            )}

            {/* Share button (optional) */}
            {/* <div className="flex justify-center pt-1">
              <button
                onClick={handleShare}
                className="h-8 px-3 rounded-md hover:bg-secondary-bg text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                Share
              </button>
            </div> */}
          </>
        ) : (
          <>
{/* HEAD TO HEAD */}
<div className="space-y-3 pt-3 border-t border-secondary-bg">
  <div className="flex items-center justify-between">
    <p className="text-xs text-gray-400 font-semibold tracking-wide">HEAD TO HEAD</p>
    <span className="text-[11px] text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
      {totalH2H || "—"} Total Games
    </span>
  </div>

  {/* Split bar: home + away */}
  <div className="w-full">
    <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/10 flex">
      <div
        className="h-full"
        style={{
          width: `${homePct}%`,
          background: colors?.home || '#3B82F6',
          transition: 'width .4s ease',
        }}
      />
      <div
        className="h-full"
        style={{
          width: `${Math.max(0, 100 - homePct)}%`,
          background: colors?.away || '#F97316',
          opacity: 0.4, // keep away lighter so home remains dominant color
          transition: 'width .4s ease',
        }}
      />
    </div>
    <div className="flex justify-between items-center mt-1.5 text-[11px]">
      <span className="text-gray-300">{homeName}</span>
      <span className="text-gray-400">vs</span>
      <span className="text-gray-300">{awayName}</span>
    </div>
  </div>

  {/* Stat tiles (perfectly centered) */}
{/* Stat tiles (vertically centered) */}
<div className="grid grid-cols-3 gap-3 text-center items-stretch">
  {/* Home */}
  <div className="rounded-lg shadow-lg shadow-primary-bg  border-white/10 p-3
                  min-h-[100px] h-full flex flex-col items-center justify-center">
    <div className="flex flex-col items-center justify-center gap-2">
      <span className="text-3xl font-extrabold text-white leading-none">
        {homeWinsH2H || "—"}
      </span>
      <span
        className="text-[10px] font-medium px-2 py-[2px] rounded-full"
        style={{ backgroundColor: `${(colors?.home || '#3B82F6')}20`, color: colors?.home || '#3B82F6' }}
      >
        {homePct}%
      </span>
    </div>
  </div>

  {/* Center: donut with total */}
  <div className="rounded-lg shadow-lg shadow-primary-bg  border-white/10 p-3
                  min-h-[100px] h-full flex flex-col items-center justify-center">
    <div className="relative inline-flex items-center justify-center">
      <svg width="54" height="54" viewBox="0 0 36 36" className="-rotate-90">
        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle
          cx="18" cy="18" r="16" fill="none"
          stroke={colors?.home || '#3B82F6'} strokeWidth="4"
          strokeDasharray={`${homePct} ${100 - homePct}`}
          strokeDashoffset="0"
        />
      </svg>
      <span className="absolute text-2xl font-bold text-gray-200 leading-none">
        {totalH2H || "—"}
      </span>
    </div>
    <span className="text-[11px] text-gray-400 mt-1">Total Games</span>
  </div>

  {/* Away */}
  <div className="rounded-lg shadow-lg shadow-primary-bg  border-white/10 p-3
                  min-h-[100px] h-full flex flex-col items-center justify-center">
    <div className="flex flex-col items-center justify-center gap-2">
      <span className="text-3xl font-extrabold text-white leading-none">
        {awayWinsH2H || "—"}
      </span>
      <span
        className="text-[10px] font-medium px-2 py-[2px] rounded-full"
        style={{ backgroundColor: `${(colors?.away || '#F97316')}20`, color: colors?.away || '#F97316' }}
      >
        {awayPct}%
      </span>
    </div>
  </div>
</div>

  {/* tiny legend line */}
  {/* <div className="flex items-center justify-center gap-4 pt-1">
    <div className="flex items-center gap-1 text-[11px]">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: colors?.home || '#3B82F6' }} />
      <span className="text-gray-400">{homeName}</span>
    </div>
    <div className="flex items-center gap-1 text-[11px]">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: colors?.away || '#F97316' }} />
      <span className="text-gray-400">{awayName}</span>
    </div>
  </div> */}
</div>



            {/* LAST MEETING MINI SCOREBOARD */}
            {/* {lastMeeting && (
              <div className="w-full">
                <p className="text-xs text-gray-400 font-semibold mb-2">LAST MEETING</p>

                <div className="rounded-xl bg-card-bg/50 px-3 py-3">
                  <div className="grid grid-cols-3 items-center gap-2">
                 
                    <div className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2"
                        style={{ borderColor: colors.home }}
                      >
                        {renderLogo(logos?.home, homeEmoji)}
                      </div>
                      <p className="mt-1 text-xs text-white text-center truncate max-w-[110px]">
                        {homeName}
                      </p>
                    </div>

              
                    <div className="flex flex-col items-center">
                      <p className="text-[11px] text-gray-300">
                        {lastMeeting.dateLabel ??
                          (lastMeeting.dateISO
                            ? new Date(lastMeeting.dateISO).toLocaleDateString()
                            : "")}
                      </p>
                      <p className="text-2xl font-extrabold text-white leading-tight">
                        {(lastMeeting.homeScore ?? "—")}–{(lastMeeting.awayScore ?? "—")}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {lastMeeting.status ?? "Final"}
                      </p>
                    </div>

               
                    <div className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2"
                        style={{ borderColor: colors.away }}
                      >
                        {renderLogo(logos?.away, awayEmoji)}
                      </div>
                      <p className="mt-1 text-xs text-white text-center truncate max-w-[110px]">
                        {awayName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )} */}
          </>
        )}
      </div>
    </div>
  )
}
