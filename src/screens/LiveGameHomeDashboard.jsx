import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase";
import homeLogo from "../assets/logo.jpg";
import opponentLogo from "../assets/jersey.webp";
import { useNavigate } from "react-router-dom";
import TeamFilter from "./Components/TeamFilter";

export default function LiveGamesHomeDashboard() {
  //* CONSTS START
  const navigate = useNavigate();
  const DEFAULT_TEAM_LOGO = opponentLogo;
  // Treat obvious bad/dev paths or non-URLs as invalid
const isBadLogo = (src) => {
  if (!src || typeof src !== "string") return true;
  const s = src.trim();
  if (!s || s === "undefined" || s === "null") return true;
  if (s.includes("/src/") || s.startsWith("../") || s.startsWith("file:")) return true;
  const ok = ["http://", "https://", "data:", "blob:", "/"];
  if (!ok.some((p) => s.startsWith(p))) return true;
  return false;
};

const safeLogo = (src) => (isBadLogo(src) ? DEFAULT_TEAM_LOGO : src);
  //* CONST END 
  //*USE STATES START
  const [liveGames, setLiveGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
const [teamOptions, setTeamOptions] = useState([]);

  const liveGamesOnly = liveGames.filter((game) => {
    if (game.gameState === true) return false;
  
    const { date, time } = game.scheduledStart || {};
    const scheduledDateTime = date && time ? new Date(`${date}T${time}`) : null;
    const now = new Date();
  
    const isScheduledFuture = scheduledDateTime && scheduledDateTime > now;
    const hasNoActions = !game.gameActions || game.gameActions.length === 0;
  
    // Exclude if it's still scheduled and hasn't started
    if (isScheduledFuture && hasNoActions) return false;
  
    return true;
  });
  
  const recentGamesOnly = liveGames
  .filter((game) => {
    if (!game.gameState) return false;

    const dateStr = game?.scheduledStart?.date;
    const scheduledDate = dateStr ? new Date(dateStr) : null;
    const now = new Date();

    const hasScore = (game.score?.home ?? 0) > 0 || (game.score?.away ?? 0) > 0;
    const hasActions = game.gameActions?.length > 0;

    const matchesFilter =
      !selectedTeam ||
      game.teamNames?.home === selectedTeam ||
      game.teamNames?.away === selectedTeam;

    return matchesFilter && (!scheduledDate || scheduledDate <= now || hasActions || hasScore);
  })
  .sort((a, b) => {
    const aDate = a?.scheduledStart?.date ? new Date(a.scheduledStart.date) : new Date(0);
    const bDate = b?.scheduledStart?.date ? new Date(b.scheduledStart.date) : new Date(0);
    return aDate - bDate; // Earliest date first

  });

  

  //*USE STATES END

  //*USE EFFECTS START
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "liveGames"), (snapshot) => {
      const games = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLiveGames(games);
      const allTeams = new Set();
games.forEach((game) => {
  if (game?.teamNames?.home) allTeams.add(game.teamNames.home);
  if (game?.teamNames?.away) allTeams.add(game.teamNames.away);
});
setTeamOptions([...allTeams]);

    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "liveGames"), (snapshot) => {
      const games = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLiveGames(games);
      setLoading(false); // ✅ once data is fetched
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    const closeMenu = document.getElementById("close-menu");
    if (!hamburger || !mobileMenu || !closeMenu) return;

    const openMenu = () => {
      mobileMenu.classList.remove("hidden");
      setTimeout(() => {
        mobileMenu.classList.remove("-translate-x-full");
      }, 10);
    };

    const closeMenuFn = () => {
      mobileMenu.classList.add("-translate-x-full");
      setTimeout(() => {
        mobileMenu.classList.add("hidden");
      }, 300);
    };

    hamburger.addEventListener("click", openMenu);
    closeMenu.addEventListener("click", closeMenuFn);
    mobileMenu.addEventListener("click", (event) => {
      if (event.target === mobileMenu) {
        closeMenuFn();
      }
    });

    return () => {
      hamburger.removeEventListener("click", openMenu);
      closeMenu.removeEventListener("click", closeMenuFn);
      mobileMenu.removeEventListener("click", closeMenuFn);
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveGames((prevGames) => {
        const now = new Date();
  
        return prevGames.map((game) => {
          const { date, time } = game.scheduledStart || {};
          const scheduledDateTime = date && time ? new Date(`${date}T${time}`) : null;
          const hasActions = game.gameActions && game.gameActions.length > 0;
  
          if (
            scheduledDateTime &&
            scheduledDateTime <= now &&
            !hasActions &&
            game.gameState === false
          ) {
            // Game is past scheduled time but no actions yet
            // Optional: You can log or update something here
            return { ...game, status: "startingSoon" };
          }
  
          return game;
        });
      });
    }, 60000); // check every 60 seconds
  
    return () => clearInterval(interval);
  }, []);
  
//*USE EFFECTS END

//*FUNCTION HANDLERS START
const handleLiveGameClick = (link, isScheduled) => {
  const relativePath = link.replace(/^.*\/\/[^/]+/, '');
  navigate(relativePath, { state: { isScheduled } });
};



//*FUNCTION HANDLERS END

const scheduledGames = liveGames
  .filter((game) => {
    const { date, time } = game.scheduledStart || {};
    if (!date || !time) return false;

    const scheduledDateTime = new Date(`${date}T${time}`);
    const isFuture = scheduledDateTime > new Date();
    const hasNoActions = !game.gameActions || game.gameActions.length === 0;

    const matchesFilter =
      !selectedTeam ||
      game.teamNames?.home === selectedTeam ||
      game.teamNames?.away === selectedTeam;

    return isFuture && hasNoActions && matchesFilter;
  })
  .sort((a, b) => {
    const dateA = new Date(`${a.scheduledStart.date}T${a.scheduledStart.time}`);
    const dateB = new Date(`${b.scheduledStart.date}T${b.scheduledStart.time}`);
    return dateA - dateB; // Ascending order: earliest first
  });

// Helper to group games by leagueName (or 'Other')
function groupByLeague(games) {
  const grouped = {};
  games.forEach(game => {
    const league = game.leagueName || 'Other';
    if (!grouped[league]) grouped[league] = [];
    grouped[league].push(game);
  });
  return grouped;
}

// Only group liveGamesOnly by league
const liveGamesGrouped = groupByLeague(liveGamesOnly);
// Sort league entries so 'Other' is last
const liveGamesLeagueEntries = Object.entries(liveGamesGrouped).sort(([a], [b]) => {
  if (a === 'Other') return 1;
  if (b === 'Other') return -1;
  return a.localeCompare(b);
});

  return (

    <div className="bg-primary-bg">
      <style>{`
        .clip-left {
          clip-path: polygon(0 0, 55% 0, 45% 100%, 0% 100%);
        }
        .clip-right {
          clip-path: polygon(55% 0, 100% 0, 100% 100%, 45% 100%);
        }
      `}</style>
<header className="bg-primary-bg bg-opacity-60 shadow w-full px-2 z-50">
  <div className="container mx-auto">
  <div className="flex cursor-pointer justify-between items-center py-4  mx-auto">
    <a onClick={()=>{
navigate("/")
    }} className="text-xl font-bold text-white">
      StatsPro <span className="text-sm text-gray-400">| Basketball</span>
    </a>

    {/* Desktop Nav */}
    <nav className="hidden md:flex space-x-6 text-gray-300 text-sm">
      <a onClick={()=>{navigate('/')}} className="hover:text-white">Home</a>
      <a  className="hover:text-white border-b-2 border-b-primary-cta pb-1">LiveGames</a>
      <a  onClick={()=>{navigate('/teamsDashboard')}} className="hover:text-white ">Teams</a>

    </nav>

    {/* Mobile Hamburger */}
    <button id="hamburger" className="text-white md:hidden">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
      </svg>
    </button>
  </div>
  </div>
</header>


<div id="mobile-menu" className="fixed inset-0 bg-primary-bg bg-opacity-98 md:hidden hidden z-50 transition-transform duration-300 transform -translate-x-full">
  <div className="flex flex-col justify-between h-full p-6 text-white">
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-xl font-bold">StatsPro</h2>
      <button id="close-menu" className="text-2xl text-gray-300 hover:text-white">✕</button>
    </div>
    <nav className="space-y-6 text-lg">
      <a onClick={()=>{
        navigate('/')
      }} className="block hover:text-blue-400">Home</a>
      <a href="#" className="block hover:text-blue-400 text-white border-l-2 border-l-primary-cta pl-4 ">LiveGames</a>
      <a onClick={()=>{navigate('/teamsDashboard')}} className="block hover:text-blue-400 text-white ">Teams</a>
  
    </nav>
    <div>
      <div className="block text-center text-blue-500 font-semibold text-gray-400 py-3 rounded-lg">
     StatsPro | Basketball<br></br> Beta
      </div>
    </div>
  </div>
</div>

      <section className="bg-primary-bg min-h-screen bg-[url('/assets/bg-pattern.svg')]  bg-repeat bg-[length:150px_150px]  pt-2  px-4">


<div className="container mx-auto py-6 lg:py-12 h-auto">



  {/* Live Games */}
  <h2 className="text-white text-xl font-semibold mb-6  pl-2 ">Live Games</h2>

  {loading ? (
    <div className="flex items-center justify-center py-20 col-span-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-sm">Loading live games...</p>
      </div>
    </div>
  ) : (
    <>
      {/* Live Games (grouped by league) */}
      {liveGamesLeagueEntries.map(([league, games]) => (
        <div key={league} className="mb-8">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 border-l-gray-800/40 py-2 pl-2">{league}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-6 mb-10">
            {games.map((game) => {
              const homeScore = game.score?.home ?? 0;
              const awayScore = game.score?.away ?? 0;
              const currentQ = game.quarter ?? 2;
            
              // Robust home/away logic
              let homeTeam, homeLogo, homeColor, awayTeam, awayLogo, awayColor;
              if (game.venue === 'home') {
                homeTeam = game.teamNames?.home;
                homeLogo = game?.logos?.home;
                homeColor = game.homeTeamColor;
                awayTeam = game.teamNames?.away;
                awayLogo = game?.logos?.away;
                awayColor = game.awayTeamColor;
              } else if (game.venue === 'away') {
                homeTeam = game.teamNames?.away;
                homeLogo = game?.logos?.away;
                homeColor = game.awayTeamColor;
                awayTeam = game.teamNames?.home;
                awayLogo = game?.logos?.home;
                awayColor = game.homeTeamColor;
              } else if (game.venue === game.teamNames?.home) {
                homeTeam = game.teamNames?.home;
                homeLogo = game?.logos?.home;
                homeColor = game.homeTeamColor;
                awayTeam = game.teamNames?.away;
                awayLogo = game?.logos?.away;
                awayColor = game.awayTeamColor;
              } else if (game.venue === game.teamNames?.away) {
                homeTeam = game.teamNames?.away;
                homeLogo = game?.logos?.away;
                homeColor = game.awayTeamColor;
                awayTeam = game.teamNames?.home;
                awayLogo = game?.logos?.home;
                awayColor = game.homeTeamColor;
              } else {
                homeTeam = game.teamNames?.home;
                homeLogo = game?.logos?.home;
                homeColor = game.homeTeamColor;
                awayTeam = game.teamNames?.away;
                awayLogo = game?.logos?.away;
                awayColor = game.awayTeamColor;
              }
              const groupLabel = game.opponentGroup || game.teamGroup || game.group || "";
              const safeAwayLogo = safeLogo(awayLogo);
              const safeHomeLogo = safeLogo(homeLogo);
              
              return (
                <a
                key={game.id}
                onClick={() => handleLiveGameClick(game.link, false)}
                className="group block cursor-pointer min-w-0"
              >
                {/* fixed-size outer wrapper to clip any inner motion */}
                <div className="rounded-2xl overflow-hidden">
                  {/* desktop: no scale, just a tiny lift + shadow */}
                  <div className="relative rounded-2xl transition-all duration-300
                                  lg:transform-gpu lg:will-change-transform lg:origin-center
                                  lg:group-hover:-translate-y-0.5 lg:group-hover:shadow-2xl lg:group-hover:shadow-purple-500/10">
              
                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
              
                    {/* Team color radial glows */}
                    <div
                      className="absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-50"
                      style={{
                        background: `radial-gradient(circle at 20% 50%, ${awayColor}15 0%, transparent 50%),
                                     radial-gradient(circle at 80% 50%, ${homeColor}15 0%, transparent 50%)`,
                      }}
                    />
              
                    {/* Dot texture */}
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />
              
                    {/* Edge accents */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 opacity-60"
                      style={{
                        background: `linear-gradient(to bottom, transparent, ${awayColor} 30%, ${awayColor} 70%, transparent)`,
                        boxShadow: `2px 0 12px ${awayColor}60`,
                      }}
                    />
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 opacity-60"
                      style={{
                        background: `linear-gradient(to bottom, transparent, ${homeColor} 30%, ${homeColor} 70%, transparent)`,
                        boxShadow: `-2px 0 12px ${homeColor}60`,
                      }}
                    />
              
                    {/* Border overlays */}
                    <div className="absolute inset-0 rounded-2xl border border-white/10 transition-colors duration-300" />
                    <div
                      className="absolute inset-0 rounded-2xl opacity-50"
                      style={{
                        background: `linear-gradient(135deg, ${awayColor}20 0%, transparent 30%, transparent 70%, ${homeColor}20 100%)`,
                        maskImage:
                          "linear-gradient(to bottom, transparent, black 2px, black calc(100% - 2px), transparent)",
                        WebkitMaskImage:
                          "linear-gradient(to bottom, transparent, black 2px, black calc(100% - 2px), transparent)",
                      }}
                    />
              
                    {/* Content */}
                    <div className="relative backdrop-blur-xl bg-black/20 p-4 lg:p-3 xl:p-2.5">
                      {/* LIVE badge */}
                      <div className="absolute left-0 top-0 z-40">
                        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-semibold px-3 py-1 rounded-br-lg rounded-tl-2xl flex items-center space-x-1.5 shadow-lg shadow-red-500/30">
                          <span>LIVE</span>
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                      </div>
              
                      {/* GROUP pill */}
                      {groupLabel && (
                        <div className="absolute right-2 top-2 z-40">
                          <span
                            title={groupLabel}
                            className="inline-flex items-center gap-1.5 text-[10px] font-medium leading-none text-white/90 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 max-w-[160px] truncate shadow-lg"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7.5 9a7.5 7.5 0 0115 0H4.5z" />
                            </svg>
                            <span className="truncate">{groupLabel}</span>
                          </span>
                        </div>
                      )}
              
                      {/* Teams + Score */}
                      <div className="pt-8 lg:pt-7 xl:pt-6">
                        <div className="flex items-center justify-between px-2 lg:px-1 gap-2 lg:gap-1.5">
                          {/* Away */}
                          <div className="w-24 lg:w-20 xl:w-20 shrink-0 min-w-0 flex flex-col items-center">
                            <div className="relative mb-2">
                              <div className="relative w-12 h-12 lg:w-10 lg:h-10">
                                <div
                                  className="absolute -inset-2 rounded-full opacity-30 blur-xl"
                                  style={{ background: `radial-gradient(circle, ${awayColor}, transparent 70%)` }}
                                />
                                <div
                                  className="absolute inset-0 rounded-full"
                                  style={{ boxShadow: `0 0 0 2px transparent, 0 0 0 4px ${awayColor}40` }}
                                />
                                <img
                                  src={safeAwayLogo || "/placeholder.svg"}
                                  alt={`${awayTeam} logo`}
                                  className="relative w-12 h-12 lg:w-10 lg:h-10 rounded-full bg-white p-1 shadow-xl"
                                />
                                <div
                                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 shadow-lg"
                                  style={{ backgroundColor: awayColor }}
                                />
                              </div>
                            </div>
                            <div className="text-center min-w-0">
                              <p className="text-white font-semibold text-xs truncate max-w-[100px] lg:max-w-[120px]" title={awayTeam}>
                                {awayTeam}
                              </p>
                              <p className="text-gray-400 text-xs mt-0.5">Away</p>
                            </div>
                          </div>
              
                          {/* Score */}
                       {/* Score */}
<div className="flex-1 min-w-0 mx-0 lg:mx-2 flex flex-col items-center">
  {/* score text */}
  <div className="relative inline-block mx-auto">
    <div
      className="absolute inset-0 rounded-lg opacity-20 blur-md"
      style={{ background: `linear-gradient(90deg, ${awayColor}40, ${homeColor}40)` }}
    />
    <p className="relative text-2xl lg:text-xl font-bold text-white tracking-tight px-4 lg:px-2 py-1 whitespace-nowrap">
      {awayScore} - {homeScore}
    </p>
  </div>

  {/* period pill */}
  <div className="mt-2 inline-flex items-center gap-1.5 bg-white/5 backdrop-blur-sm px-3 lg:px-2 py-1 rounded-full border border-white/10 mx-auto">
    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
    <p className="text-xs font-medium text-gray-200">
      {currentQ > 4 ? `OT ${currentQ - 4}` : `Q${currentQ}`}
    </p>
  </div>
</div>

              
                          {/* Home */}
                          <div className="w-24 lg:w-20 xl:w-20 shrink-0 min-w-0 flex flex-col items-center">
                            <div className="relative mb-2">
                              <div className="relative w-12 h-12 lg:w-10 lg:h-10">
                                <div
                                  className="absolute -inset-2 rounded-full opacity-30 blur-xl"
                                  style={{ background: `radial-gradient(circle, ${homeColor}, transparent 70%)` }}
                                />
                                <div
                                  className="absolute inset-0 rounded-full"
                                  style={{ boxShadow: `0 0 0 2px transparent, 0 0 0 4px ${homeColor}40` }}
                                />
                                <img
                                  src={safeHomeLogo || "/placeholder.svg"}
                                  alt={`${homeTeam} logo`}
                                  className="relative w-12 h-12 lg:w-10 lg:h-10 rounded-full bg-white p-1 shadow-xl"
                                />
                                <div
                                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 shadow-lg"
                                  style={{ backgroundColor: homeColor }}
                                />
                              </div>
                            </div>
                            <div className="text-center min-w-0">
                              <p className="text-white font-semibold text-xs truncate max-w-[100px] lg:max-w-[120px]" title={homeTeam}>
                                {homeTeam}
                              </p>
                              <p className="text-gray-400 text-xs mt-0.5">Home</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>{/* /content */}
                  </div>{/* /inner */}
                </div>{/* /outer */}
              </a>
              
              
              
              );
              
            })}
          </div>
        </div>
      ))}

      <div className="mb-12">
        <div className="flex flex-row">

  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mr-2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
</svg>
<label htmlFor="teamSelect" className="block text-white mb-2">Filters </label>
  </div>
  <select
    id="teamSelect"
    value={selectedTeam || ""}
    onChange={(e) => setSelectedTeam(e.target.value || null)}
    className="bg-secondary-bg text-white border border-gray-800 bg-opacity-60 px-4 py-2 rounded-md"
  >
    <option value="">All Teams</option>
    {teamOptions.map((team) => (
      <option key={team} value={team}>{team}</option>
    ))}
  </select>

  {selectedTeam && (
    <div className="mt-2 ml-2 inline-flex items-center bg-primary-danger text-white px-4 py-2 rounded-xl text-sm">
      <span>{selectedTeam}</span>
      <button onClick={() => setSelectedTeam(null)} className="ml-2 text-white">&times;</button>
    </div>
  )}
</div>


{/* Scheduled Games (flat) */}
{/* Scheduled Games (flat) */}
{/* Scheduled Games */}
<div className="mb-8">
  <h3 className="text-lg font-bold text-white mb-2 pl-2">Scheduled Games</h3>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {scheduledGames.map((game) => {
      const dateStr = game.scheduledStart?.date || "";
      const timeStr = game.scheduledStart?.time || "";
      let displayDateTime = `${dateStr} @ ${timeStr}`;

      if (dateStr) {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const scheduledDate = new Date(`${dateStr}T${timeStr}`);
        const isToday = scheduledDate.toDateString() === today.toDateString();
        const isTomorrow = scheduledDate.toDateString() === tomorrow.toDateString();
        if (isToday) displayDateTime = `Today @ ${timeStr}`;
        else if (isTomorrow) displayDateTime = `Tomorrow @ ${timeStr}`;
      }

      // Home/away based on venue
      const isVenueHome = game.venue === "home";
      const homeTeam = isVenueHome ? game.teamNames?.home : game.teamNames?.away;
      const homeLogo = isVenueHome ? game?.logos?.home : game?.logos?.away;
      const homeColor = isVenueHome ? game.homeTeamColor : game.awayTeamColor;
      const awayTeam = isVenueHome ? game.teamNames?.away : game.teamNames?.home;
      const awayLogo = isVenueHome ? game?.logos?.away : game?.logos?.home;
      const awayColor = isVenueHome ? game.awayTeamColor : game.homeTeamColor;

      const groupLabel = game.opponentGroup || game.teamGroup || game.group || "";
      const leagueLabel = game.league?.name || game.leagueName || "";
      const safeAwayLogo = safeLogo(awayLogo);
      const safeHomeLogo = safeLogo(homeLogo);
      return (
        <div
          key={game.id}
          onClick={() => handleLiveGameClick(game.link, true)}
          className="bg-gray-800/30 hover:bg-gray-700/40 rounded-lg p-4 cursor-pointer transition-all duration-200"
        >
          {/* Top bar: Group (left) | League (right) */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {groupLabel && (
                <span
                  title={groupLabel}
                  className="inline-flex items-center gap-1 text-[10px] text-gray-100 bg-white/5 px-2 py-0.5 rounded-full max-w-[160px] truncate"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7.5 9a7.5 7.5 0 0115 0H4.5z" />
                  </svg>
                  <span className="truncate">{groupLabel}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {leagueLabel && (
                <span
                  title={leagueLabel}
                  className="inline-flex items-center gap-1 text-[10px] text-gray-300 bg-white/5 px-2 py-0.5 rounded-full max-w-[180px] truncate"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 4h10l1 4H6l1-4zm-1 6h12l-1.5 9h-9L6 10z" />
                  </svg>
                  <span className="truncate">{leagueLabel}</span>
                </span>
              )}
            </div>
          </div>

          {/* Teams row */}
          <div className="flex items-center justify-between">
            {/* Away */}
            <div className="flex items-center space-x-3 flex-1">
              <div
                className="relative w-12 h-12 rounded-full p-0.5"
                style={{ backgroundColor: awayColor || "#0b63fb" }}
              >
                <img
                  src={safeAwayLogo}
                  className="w-full h-full rounded-full bg-white p-0.5"
                  alt="away logo"
                />
              </div>
              <span className="text-gray-200 text-sm font-medium">{awayTeam}</span>
            </div>

            {/* VS */}
            <div className="mx-4">
              <span className="text-gray-400 text-sm font-medium">vs</span>
            </div>

            {/* Home */}
            <div className="flex items-center space-x-3 flex-1 justify-end">
              <span className="text-gray-200 text-sm font-medium">{homeTeam}</span>

              <div
                className="relative w-14 h-12 rounded-full p-0.5"
                style={{ backgroundColor: homeColor || "#8B5CF6" }}
              >
                <img
                  src={safeHomeLogo}
                  className="w-full h-full rounded-full bg-white p-0.5"
                  alt="home logo"
                />
                {/* tiny HOME badge */}
                <span className="absolute -bottom-1 -right-1 bg-white text-gray-600 text-[9px] font-semibold rounded-full px-1.5 py-0.5 shadow">
                  Home
                </span>
              </div>
            </div>
          </div>

          {/* Venue chip under the HOST (home) logo */}
          {/* {homeTeam && (
            <div className="mt-2 flex justify-end">
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-300 bg-white/5 px-2 py-0.5 rounded-full max-w-[220px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                </svg>
                <span className="truncate">{homeTeam}</span>
              </span>
            </div>
          )} */}

          {/* Date/Time bottom center */}
          <div className="mt-3 flex justify-center">
            <span className="text-xs text-gray-400">{displayDateTime}</span>
          </div>
        </div>
      );
    })}
  </div>
</div>



{/* Recent Games (flat) */}
<div className="mb-8">
  <h3 className="text-lg font-bold text-white mb-2 pl-2">Recent Games</h3>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {recentGamesOnly.map((game) => {
      const homeScore = game.score?.home ?? 0;
      const awayScore = game.score?.away ?? 0;

      // home/away via venue (same logic you already use)
      const isVenueHome = game.venue === 'home';
      const homeTeam  = isVenueHome ? game.teamNames?.home : game.teamNames?.away;
      const homeLogo  = isVenueHome ? game?.logos?.home      : game?.logos?.away;
      const homeColor = isVenueHome ? game.homeTeamColor     : game.awayTeamColor;
      const awayTeam  = isVenueHome ? game.teamNames?.away : game.teamNames?.home;
      const awayLogo  = isVenueHome ? game?.logos?.away      : game?.logos?.home;
      const awayColor = isVenueHome ? game.awayTeamColor     : game.homeTeamColor;

      const groupLabel = game.opponentGroup || game.teamGroup || game.group || "";
      const dateOnly   = game.scheduledStart?.date || "";
      const safeAwayLogo = safeLogo(awayLogo);
      const safeHomeLogo = safeLogo(homeLogo);
      return (
        <div
          key={game.id}
          onClick={() => handleLiveGameClick(game.link, false)}
          className="relative rounded-lg p-4 pt-8 bg-gray-800/25 hover:bg-gray-800/35 transition-colors border border-gray-700/30"
        >
          {/* FINAL (top-left) */}
          <div className="absolute top-2 left-2">
            <span className="bg-gray-600/70 text-white text-[10px] font-semibold px-2 py-[2px] rounded-sm">
              FINAL
            </span>
          </div>

          {/* GROUP (top-right) */}
          {groupLabel && (
            <div className="absolute top-2 right-2">
              <span
                title={groupLabel}
                className="inline-flex items-center gap-1 text-[10px] text-gray-100 bg-white/5 px-2 py-[2px] rounded-full max-w-[160px] truncate"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7.5 9a7.5 7.5 0 0115 0H4.5z" />
                </svg>
                <span className="truncate">{groupLabel}</span>
              </span>
            </div>
          )}

          {/* Teams row */}
          <div className="flex items-center justify-between">
            {/* Away */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-10 h-10 rounded-full p-0.5 shrink-0"
                style={{ backgroundColor: awayColor || '#0b63fb' }}
              >
                <img
                  src={safeAwayLogo}
                  alt="away logo"
                  className="w-full h-full rounded-full bg-white p-0.5"
                />
              </div>
              <div className="min-w-0">
                <p className="text-gray-200 text-xs font-medium truncate">{awayTeam}</p>
                <p className="text-[11px] text-gray-400">Away</p>
              </div>
            </div>

            {/* Score */}
            <div className="mx-4 text-center">
              <p className="text-xl font-semibold text-white leading-6">
                {awayScore} - {homeScore}
              </p>
            </div>

            {/* Home */}
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
              <div className="min-w-0 text-right">
                <p className="text-gray-200 text-xs font-medium truncate">{homeTeam}</p>
                <p className="text-[11px] text-gray-400">Home</p>
              </div>
              <div
                className="w-11 h-11 rounded-full p-0.5 shrink-0"
                style={{ backgroundColor: homeColor || '#8B5CF6' }}
              >
                <img
                  src={safeHomeLogo}
                  alt="home logo"
                  className="w-full h-full rounded-full bg-white p-0.5"
                />
              </div>
            </div>
          </div>

          {/* Date (bottom center) */}
          {dateOnly && (
            <div className="mt-3 flex justify-center">
              <span className="text-xs text-gray-400">{dateOnly}</span>
            </div>
          )}

          {/* Subtle accent line */}
          <div
            className="absolute bottom-0 left-0 w-full h-1 rounded-b-lg opacity-60"
            style={{
              background: `linear-gradient(to right, ${awayColor || '#0b63fb'} 0%, ${awayColor || '#0b63fb'} 50%, ${homeColor || '#8B5CF6'} 50%, ${homeColor || '#8B5CF6'} 100%)`,
            }}
          />
        </div>
      );
    })}
  </div>
</div>



    </>
  )}

</div>


 
      </section>
      </div>

  );
}
