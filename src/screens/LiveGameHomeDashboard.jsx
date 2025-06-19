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
  <h2 className="text-white text-xl font-semibold mb-6 border-l-2 pl-2 border-l-[#8B5CF6]">Live Games</h2>

  {loading ? (
    <div className="flex items-center justify-center py-20 col-span-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-sm">Loading live games...</p>
      </div>
    </div>
  ) : (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {liveGamesOnly.length === 0 ? (
  <div className="text-gray-400 py-10 text-sm italic">No Live Games </div>
) : (
  liveGamesOnly.map((game) => {
    const homeScore = game.score?.home ?? 0;
    const awayScore = game.score?.away ?? 0;
    const currentQ = game.quarter ?? 2;

    return(
    <a
      key={game.id}
      onClick={() => handleLiveGameClick(game.link, false)}
      className=" hover:scale-95 transition-all hover:bg-slate-900 duration-500 cursor-pointer overflow-hidden"
    >
      <div className="relative h-40 group transition-all w-full bg-black  overflow-hidden">
<div className="absolute inset-0 clip-right bg-primary-danger-light z-10" />
<div className="absolute inset-0 clip-left z-20" style={{ backgroundColor: game.awayTeamColor || '#0b63fb' }} />


        <div className="absolute group-hover:scale-110 duration-300 left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="w-14 h-14 rounded-full bg-white">
          <img
  src={game?.logos?.away || opponentLogo}
  className="w-full h-full rounded-full p-1"
  alt="away logo"
/>
          </div>
        </div>
        <div className="absolute left-3/4 group-hover:scale-110 duration-300 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="w-14 h-14 rounded-full bg-white">
          <img
  src={game?.logos?.home || homeLogo}
  className="w-full h-full rounded-full p-1"
  alt="away logo"
/>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center items-center z-40">
  <div className="bg-secondary-bg bg-opacity-50 px-6 py-2 rounded-md">
    <p className="text-2xl font-bold text-white">{homeScore} - {awayScore}</p>
    <p className="text-sm text-gray-200 text-center">
  {currentQ > 4 ? `OT ${currentQ - 4}` : `Q${currentQ}`}
</p>

  </div>
</div>
              
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-40">
          LIVE <span className="animate-pulse">⚪️</span>
        </div>
      </div>
      <div className="text-center py-3 text-white font-medium">
        {game.teamNames?.home} @ {game.teamNames?.away}
      </div>
      
    </a>
  )})
)}

      </div>
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

{/* Scheduled Games */}
{scheduledGames.length > 0 && (
  <>
    <h2 className="text-white text-xl font-semibold mb-6 mt-12 border-l-2 pl-2 border-l-[#4F46E5]">Scheduled Games</h2>
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
          const isToday =
            scheduledDate.toDateString() === today.toDateString();
          const isTomorrow =
            scheduledDate.toDateString() === tomorrow.toDateString();
        
          if (isToday) {
            displayDateTime = `Today @ ${timeStr}`;
          } else if (isTomorrow) {
            displayDateTime = `Tomorrow @ ${timeStr}`;
          }
        }

        return (
          <div
            onClick={() => handleLiveGameClick(game.link, true)}
            key={game.id}
            className="bg-gray-800/30 hover:bg-gray-700/40 rounded-lg p-4 cursor-pointer transition-all duration-200"
          >
            {/* Date and Time */}
            <div className="text-xs text-gray-400 mb-2">
              {displayDateTime}
            </div>
                        
            {/* Game Info */}
            <div className="flex items-center justify-between">
              {/* Away Team */}
              <div className="flex items-center space-x-3 flex-1">
                <div 
                  className="w-10 h-10 rounded-full p-0.5"
                  style={{backgroundColor: game.awayTeamColor || '#0b63fb'}}
                >
                  <img
                    src={game?.logos?.away || opponentLogo}
                    className="w-full h-full rounded-full bg-white p-0.5"
                    alt="away logo"
                  />
                </div>
                <span className="text-gray-200 text-sm font-medium">
                  {game.teamNames?.away}
                </span>
              </div>
                            
              {/* VS */}
              <div className="flex items-center space-x-2 mx-4">
                <span className="text-gray-400 text-sm font-medium">vs</span>
              </div>
                            
              {/* Home Team */}
              <div className="flex items-center space-x-3 flex-1 justify-end">
                <span className="text-gray-200 text-sm font-medium">
                  {game.teamNames?.home}
                </span>
                <div className="w-10 h-10 rounded-full p-0.5 bg-primary-danger">
                  <img
                    src={game?.logos?.home || homeLogo}
                    className="w-full h-full rounded-full bg-white p-0.5"
                    alt="home logo"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </>
)}


     {/* Recent Games */}
     {recentGamesOnly.length > 0 && (
  <>
    <h2 className="text-white text-xl font-semibold my-6">Recent Games</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recentGamesOnly.map((game) => {
        const homeScore = game.score?.home ?? 0;
        const awayScore = game.score?.away ?? 0;
        
        return (
          <div
            onClick={() => handleLiveGameClick(game.link, false)}
            key={game.id}
            className="bg-gray-800/30 hover:bg-gray-700/40 rounded-lg p-4 cursor-pointer transition-all duration-200"
          >
            {/* Date and Status */}
            <div className="text-xs text-gray-400 mb-2">
              {game.scheduledStart?.date} • Final
            </div>
            
            {/* Game Info */}
            <div className="flex items-center justify-between">
              {/* Away Team */}
              <div className="flex items-center space-x-3 flex-1">
                <img
                  src={game?.logos?.away || opponentLogo}
                  className="w-8 h-8 rounded-full bg-white p-0.5"
                  alt="away logo"
                />
                <span className="text-gray-200 text-sm font-medium">
                  {game.teamNames?.away}
                </span>
              </div>
              
              {/* Score */}
              <div className="flex items-center space-x-2 mx-4">
                <div className="text-right">
                  <span className="text-white text-lg font-bold">{awayScore}</span>
                </div>
                <span className="text-gray-500">-</span>
                <div className="text-left">
                  <span className="text-white text-lg font-bold">{homeScore}</span>
                </div>
              </div>
              
              {/* Home Team */}
              <div className="flex items-center space-x-3 flex-1 justify-end">
                <span className="text-gray-200 text-sm font-medium">
                  {game.teamNames?.home}
                </span>
                <img
                  src={game?.logos?.home || homeLogo}
                  className="w-8 h-8 rounded-full bg-white p-0.5"
                  alt="home logo"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </>
)}

    </>
  )}

</div>


 
      </section>
      </div>

  );
}
