import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase";
import homeLogo from "../assets/logo.jpg";
import opponentLogo from "../assets/jersey.webp";
import { useNavigate } from "react-router-dom";

export default function LiveGamesHomeDashboard() {
  //* CONSTS START
  const navigate = useNavigate();
  
  //* CONST END 
  //*USE STATES START
  const [liveGames, setLiveGames] = useState([]);
  const [loading, setLoading] = useState(true);
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
  
const recentGamesOnly = liveGames.filter((game) => game.gameState === true);

  //*USE STATES END

  //*USE EFFECTS START
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "liveGames"), (snapshot) => {
      const games = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLiveGames(games);
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
const handleLiveGameClick = (link) => {
  // Strip full URL to just the path
  const relativePath = link.replace(/^.*\/\/[^/]+/, ''); // removes http://localhost:5174
  navigate(relativePath);
};


//*FUNCTION HANDLERS END

const scheduledGames = liveGames.filter((game) => {
  const { date, time } = game.scheduledStart || {};
  if (!date || !time) return false;

  const scheduledDateTime = new Date(`${date}T${time}`);
  const isFuture = scheduledDateTime > new Date();
  const hasNoActions = !game.gameActions || game.gameActions.length === 0;

  return isFuture && hasNoActions;
});


  return (
    <>
      <style>{`
        .clip-left {
          clip-path: polygon(0 0, 55% 0, 45% 100%, 0% 100%);
        }
        .clip-right {
          clip-path: polygon(55% 0, 100% 0, 100% 100%, 45% 100%);
        }
      `}</style>
<header className="bg-primary-bg shadow w-full px-2 z-50">
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
      <div className="block text-center text-blue-500 font-semibold text-white py-3 rounded-lg">
     Beta Release 1.71
      </div>
    </div>
  </div>
</div>

      <section className="bg-primary-bg min-h-screen  pt-2  px-4">


<div className="container mx-auto py-12 h-auto">

  {/* Live Games */}
  <h2 className="text-white text-xl font-semibold mb-6">Live Games</h2>

  {loading ? (
    <div className="flex items-center justify-center py-20 col-span-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-sm">Loading live games...</p>
      </div>
    </div>
  ) : (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      {liveGamesOnly.length === 0 ? (
  <div className="text-gray-400 py-10 text-sm italic">No Live Games </div>
) : (
  liveGamesOnly.map((game) => (
    <a
      key={game.id}
      onClick={() => handleLiveGameClick(game.link)}
      className="bg-primary-bg hover:scale-95 transition-all hover:bg-slate-900 duration-500 cursor-pointer rounded-lg overflow-hidden"
    >
      <div className="relative h-40 group transition-all w-full bg-black rounded-lg overflow-hidden">
        <div className="absolute inset-0 clip-right bg-slate-900 z-10" />
        <div className="absolute inset-0 clip-left bg-secondary-cta z-20" />
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
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-40">
          LIVE <span className="animate-pulse">⚪️</span>
        </div>
      </div>
      <div className="text-center py-3 text-white font-medium">
        {game.teamNames?.home} @ {game.teamNames?.away}
      </div>
    </a>
  ))
)}

      </div>

{/* Scheduled Games */}
{scheduledGames.length > 0 && (
  <>
    <h2 className="text-white text-xl font-semibold mb-6 mt-12">Scheduled Games</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scheduledGames.map((game) => {
        const scheduledDate = `${game.scheduledStart?.date || "TBD"} ${game.scheduledStart?.time || ""}`;

        return (
          <div
            key={game.id}
            className="bg-primary-bg hover:scale-95 transition-all rounded-lg hover:bg-slate-900 duration-500 cursor-pointer overflow-hidden"
          >
            <div className="relative h-24 group w-full bg-black rounded-lg overflow-hidden">
              <div className="absolute inset-0 clip-right bg-slate-900 z-10" />
              <div className="absolute inset-0 clip-left bg-secondary-cta z-20" />

              {/* Away logo */}
              <div className="absolute group-hover:scale-110 duration-300 left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="w-14 h-14 rounded-full bg-white">
                  <img
                    src={game?.logos?.away || opponentLogo}
                    className="w-full h-full rounded-full p-1"
                    alt="away logo"
                  />
                </div>
              </div>

              {/* Home logo */}
              <div className="absolute left-3/4 group-hover:scale-110 duration-300 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="w-14 h-14 rounded-full bg-white">
                  <img
                    src={game?.logos?.home || homeLogo}
                    className="w-full h-full rounded-full p-1"
                    alt="home logo"
                  />
                </div>
              </div>

              {/* Overlay text */}
              <div className="absolute inset-0 flex flex-col justify-center items-center z-40 bg-black bg-opacity-50">
                <p className="text-sm  font-semibold text-white">
                  {scheduledDate}   
                </p>

              </div>
            </div>

            <div className="text-center py-3 text-base bg-primary-bg text-white font-medium">
            <p className="text-md mt-1 text-white">    {game.teamNames?.home} vs {game.teamNames?.away}</p>
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
    <h2 className="text-white text-xl font-semibold mb-6">Recent Games</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recentGamesOnly.map((game) => {
        const homeScore = game.score?.home ?? 0;
        const awayScore = game.score?.away ?? 0;
        const winner =
          homeScore > awayScore
            ? game.teamNames?.home
            : awayScore > homeScore
            ? game.teamNames?.away
            : "Draw";

        return (
          <a onClick={() => handleLiveGameClick(game.link)}
            key={game.id} 
            className="bg-primary-bg hover:scale-95 transition-all rounded-lg transition-all hover:bg-slate-900 duration-500 cursor-pointer overflow-hidden"
          >
            <div className="relative h-24 group transition-all w-full bg-black rounded-lg overflow-hidden">
              <div className="absolute inset-0 clip-right bg-slate-900 z-10" />
              <div className="absolute inset-0 clip-left bg-secondary-cta z-20" />

              {/* Left logo */}
              <div className="absolute group-hover:scale-110 duration-300 left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="w-14 h-14 rounded-full bg-white">
                <img
  src={game?.logos?.away || opponentLogo}
  className="w-full h-full rounded-full p-1"
  alt="away logo"
/>
                </div>
              </div>

              {/* Right logo */}
              <div className="absolute left-3/4 group-hover:scale-110 duration-300 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="w-14 h-14 rounded-full bg-white">
                <img
  src={game?.logos?.home || homeLogo}
  className="w-full h-full rounded-full p-1"
  alt="home logo"
/>
                </div>
              </div>

              {/* Overlay text */}
              <div className="absolute inset-0 flex flex-col justify-center items-center z-40 bg-black bg-opacity-80">
                <p className="text-sm mb-2 font-medium text-gray-100">
                  {game.teamNames?.home} vs {game.teamNames?.away}
                </p>
                <p className="text-2xl font-bold text-white">
                  {homeScore} - {awayScore}
                </p>
                {/* <p className="text-xs mt-1 text-gray-300">Final Score</p> */}
              </div>
              <div className="absolute top-2 left-2  text-gray-500 text-xs font-bold px-2 py-1 rounded z-40">
     
FT

              </div>
            </div>

            {/* Winner display */}
            <div className="text-center py-3  bg-primary-bg text-gray-400 text-sm ">
             {/* {winner} Won */}
             {game.lastUpdated?.toDate().toLocaleDateString()}
            </div>
          </a>
        );
      })}
    </div>
  </>
)}

    </>
  )}

</div>


 
      </section>
    </>
  );
}
