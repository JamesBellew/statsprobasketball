// LiveGameView.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase"; // ✅ make sure it's 'firestore', not 'db'
import homeLogo from '../assets/logo.jpg'
import opponentJersey from '../assets/jersey.webp'
import { useNavigate } from "react-router-dom";

export default function LiveGameView() {
  const { slug } = useParams();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameClock, setGameClock] = useState(null);
  const [liveClock, setLiveClock] = useState(null);
  const [broadcastUpdate, setBroadcastUpdate] = useState(null);
  const [gameFinsihedFlag, setGameFinsihedFlag] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ✅ Add React state for mobile menu
  const navigate = useNavigate();

  // for game slugs
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(firestore, "liveGames", slug), (docSnap) => {
      if (docSnap.exists()) {
        setGameData(docSnap.data());
      } else {
        setGameData(null);
      }
      setLoading(false); // 🔥 This should be outside the if-block to always run
    });
  
    return () => unsubscribe();
  }, [slug]);
  
  useEffect(() => {
    if (!slug) return;
  
    const unsub = onSnapshot(doc(firestore, "liveGameupdates", slug), (snap) => {
      if (snap.exists()) {
        const updateData = snap.data();
  
        if (updateData.message && updateData.message.trim() !== "") {
          setBroadcastUpdate(updateData.message);
          console.log("🐒 we have some broadcast update", updateData.message);
        } else {
          setBroadcastUpdate(null);
          console.log("no update 😭");
        }

        if (typeof updateData.gameFinsihedFlag === "boolean") {
          setGameFinsihedFlag(updateData.gameFinsihedFlag);
        }
      } else {
        setBroadcastUpdate(null); // fallback if doc doesn't exist
      }
    });
  
    return () => unsub();
  }, [slug]);
  
  useEffect(() => {
    const unsubscribeClock = onSnapshot(doc(firestore, "liveGameClocks", slug), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGameClock(data);
        console.log('🕒 Minutes:', data.minutesLeft);
        console.log('🕒 Seconds:', data.secondsLeft);
      } else {
        console.log('clock does not exist');
      }
    });
  
    return () => unsubscribeClock();
  }, [slug]);
  
  // ✅ Remove the problematic DOM manipulation useEffect entirely
  // Replace with React event handlers

  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-primary-bg text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }
  
  if (!gameData) return <div className="text-center">Game not found or has ended.</div>;
  console.log(gameData);

  return (
    <div className="h-screen relative bg-secondary-bg text-white flex flex-col bg-[url('/assets/bg-pattern.svg')] min-h-screen bg-repeat bg-[length:150px_150px]">

      <header className="bg-primary-bg shadow w-full px-2 z-50">
        <div className="container mx-auto">
          <div className="flex cursor-pointer justify-between items-center py-4 mx-auto">
            <a onClick={() => { navigate("/") }} className="text-xl font-bold text-white">
              StatsPro <span className="text-sm text-gray-400">| Basketball</span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-6 text-gray-300 text-sm">
              <a onClick={() => { navigate('/') }} className="hover:text-white">Home</a>
              <a onClick={()=>{
                navigate('/liveGameHomeDashboard')
              }} className="hover:text-white border-b-2 border-b-primary-cta pb-1">LiveGames</a>
            </nav>

            {/* Mobile Hamburger - ✅ Use React onClick instead of DOM manipulation */}
            <button 
              onClick={handleOpenMobileMenu}
              className="text-white md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ✅ Mobile Menu - Use React state and conditional rendering */}
      <div 
        className={`fixed inset-0 bg-primary-bg bg-opacity-98 md:hidden z-50 transition-transform duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => {
          // Close menu when clicking outside
          if (e.target === e.currentTarget) {
            handleCloseMobileMenu();
          }
        }}
      >
        <div className="flex flex-col justify-between h-full p-6 text-white">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">StatsPro</h2>
            <button 
              onClick={handleCloseMobileMenu}
              className="text-2xl text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
          <nav className="space-y-6 text-lg">
            <a onClick={() => {
              navigate('/');
              handleCloseMobileMenu(); // Close menu after navigation
            }} className="block hover:text-blue-400">Home</a>
            <a onClick={()=>{
              navigate("/../liveGameHomeDashboard")
            }} className="block hover:text-blue-400 text-white border-l-2 border-l-primary-cta pl-4">Live Games</a>
          </nav>
          <div>
          <div className="block text-center text-blue-500 font-semibold text-gray-400 py-3 rounded-lg">
     StatsPro | Basketball<br></br> Beta
      </div>
          </div>
        </div>
      </div>

      <div className="w-full relative max-w-sm mx-auto text-white text-center">
        <div className="relative rounded-lg bg-secondary-bg bg-opacity-60 h-auto py-8 w-full mt-2 shadow-md grid grid-cols-8 items-center text-center">
        <div className="absolute top-1 flex items-center justify-center mx-auto text-center w-full">
  {gameData?.gameActions?.length > 0 && !gameFinsihedFlag && !gameData?.gameState ? (
    // ✅ LIVE badge
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
      <span className="bg-secondary-danger text-white text-xs uppercase px-3 py-1 rounded font-bold tracking-wide">
        LIVE <span className="pl-1 animate-pulse text-xs font-extralight">⚪️</span>
      </span>
    </div>
  ) : (
    // 🕒 Scheduled date fallback
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
      <span className="bg-primary-bg text-white text-xs px-4 py-2 rounded font-medium">
        {gameData?.scheduledStart?.date || "Scheduled"}
      </span>
    </div>
  )}
</div>



          <div className="relative col-span-2">
            <div className="w-16 h-16 rounded-full bg-white mx-auto">
              <img
                src={gameData?.logos?.home || homeLogo}
                className="w-full h-full rounded-full p-1"
                alt="home logo"
              />
            </div>
            <div className="text-xl font-medium text-gray-300">{gameData?.teamNames.home || "home"}</div>
          </div>

          <div className="text-4xl col-span-4 flex-1 font-extrabold text-white">
            {gameData.quarter && !gameData.gameState &&
              <span className="text-md text-gray-200 font-semibold text-base text-gray-400">Q{gameData.quarter ?? "1"}</span>
            }
            <br />
            {gameData.score?.home ?? 0} - {gameData.score?.away ?? 0}
            <p className="text-base text-gray-400">
  {gameData?.gameState ? (
    "FT" // ✅ Finished game
  ) : gameData?.gameActions?.length > 0 ? (
    gameClock?.minutesLeft !== undefined && gameClock?.secondsLeft !== undefined
      ? `${gameClock.minutesLeft}:${String(gameClock.secondsLeft).padStart(2, "0")}` // ✅ Live clock
      : "--:--" // Edge fallback
  ) : (
    "" // 🕒 Scheduled, no actions yet
  )}
</p>


            {broadcastUpdate && (
              <div className="text-xs mt-2 mx-5 bg-white/5 rounded-md p-3">
                {broadcastUpdate}
              </div>
            )}
          </div>

          <div className="col-span-2">
            <div className="w-16 h-16 rounded-full bg-white mx-auto">
              <img
                src={gameData?.logos?.away || opponentJersey}
                className="w-full h-full rounded-full p-1"
                alt="away logo"
              />
            </div>
            <div className="text-xl font-medium text-gray-300">{gameData?.teamNames.away || "Away"}</div>
          </div>
        </div>
      </div>

      {gameData?.gameActions?.length > 0 && (
        <div className="h-[65vh] mt-5 overflow-auto w-full px-4">
          <ul className="timeline timeline-vertical">
            {gameData?.gameActions?.length > 0 && (
              <div className="h-full overflow-auto w-full px-4">
                <ul className="timeline timeline-vertical w-full max-w-2xl mx-auto">
                  {[...gameData?.gameActions].reverse().map((action, index, array) => {
                    const isHome = action.team === "home";
                    const nameText = action.playerName || "";
                    const playerText = action.playerNumber ? `(${action.playerNumber})` : "";
                    const timeLabel = `Q${action.quarter || "-"}`;
                    const isNewQuarter = index === 0 || action.quarter !== array[index - 1]?.quarter;
                    const clock = `${action.clockMinutesLeft ?? "-"}:${String(action.clockSecondsLeft).padStart(2, "0")}`;

                    // 🎯 Filter: show only scores, misses, FT, BLK, TO, STL
                    const displayType = action.type?.toLowerCase();
                    const isScore = action.points;
                    const isMiss = displayType?.includes("miss");
                    const isBlock = displayType?.includes("Block");
                    const isTO = displayType?.includes("turnover");
                    const isSteal = displayType?.includes("steal");
                    const isFT = displayType?.includes("free throw");

                    const shouldShow = isScore || isMiss || isBlock || isTO || isSteal || isFT;

                    if (!shouldShow) return null;

                    return (
                      <React.Fragment key={index}>
                        {isNewQuarter && (
                          <div className="w-auto py-2 items-center mx-auto justify-center text-center">
                            <div className="w-full px-4 py-1 rounded-md shadow-sm">
                              <p className="text-xs text-gray-400 font-bold tracking-wider uppercase text-center">
                                ── Q {action.quarter} ──
                              </p>
                            </div>
                          </div>
                        )}

                        <li className="w-full">
                          {isScore ? (
                            <>
                              {isHome ? (
                                <div className="timeline-start border-l-2 border-l-primary-danger timeline-box bg-secondary-bg text-white border border-gray-700 w-36">
                                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>{timeLabel}</span>
                                    <span>{clock}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold text-white">
                                      <span className="text-gray-400">{playerText}</span>{nameText}
                                    </p>
                                    <p className="text-md font-bold text-primary-danger">+{action.points}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="timeline-end w-36 border-r-2 border-r-primary-cta timeline-box bg-secondary-bg text-white border border-gray-700">
                                  <p className="text-xs text-gray-400 mb-1">{timeLabel} </p>
                                  <p className="font-semibold">
                                    {playerText} {nameText} + {action.points}
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            // 👇 Miss, block, TO, etc. inline and styled
                            <div className={`text-sm text-white px-2 py-1 italic ${isHome ? "text-left pl-6" : "text-right pr-6"}`}>
                              <p className="text-white/50">
                                {displayType === "miss" && <>❌ FG Miss — <span className="font-semibold">{nameText} {playerText}</span></>}
                                {isBlock && <>🔒 Block — <span className="font-semibold">{nameText} {playerText}</span></>}
                                {isTO && <>⚠️ Turnover — <span className="font-semibold">{nameText} {playerText}</span></>}
                                {isSteal && <>🛡️ Steal — <span className="font-semibold">{nameText} {playerText}</span></>}
                                {isFT && <>🎯 Free Throw — <span className="font-semibold">{nameText} {playerText}</span></>}
                              </p>
                            </div>
                          )}

                          <div className="timeline-middle">
                            <svg xmlns="http://www.w3.org/2000/svg"
                              className="size-4 text-white/50 bg-secondary-bg rounded-full"
                              fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                            </svg>
                          </div>

                          <hr className="bg-gray-600" />
                        </li>
                      </React.Fragment>
                    );
                  })}
                </ul>
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}