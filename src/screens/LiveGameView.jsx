// LiveGameView.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase"; // ✅ make sure it's 'firestore', not 'db'
import homeLogo from '../assets/logo.jpg'
import { useLocation } from 'react-router-dom';
import opponentJersey from '../assets/jersey.webp'
import { useNavigate } from "react-router-dom";

export default function LiveGameView() {
  const { slug } = useParams();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameClock, setGameClock] = useState(null);
  const [liveClock, setLiveClock] = useState(null);
  const [showStatsModal,setShowStatsModal] = useState(false)
  const [broadcastUpdate, setBroadcastUpdate] = useState(null);
  const [gameFinsihedFlag, setGameFinsihedFlag] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ✅ Add React state for mobile menu
  const [gameStatsToggleMode,setGameStatsToggleMode]= useState('Game');
  const navigate = useNavigate();
  const maxQuarter = gameData?.quarter > 4 ? gameData.quarter : 4;
  const quarters = Array.from({ length: maxQuarter }, (_, i) => i + 1);
  const [lineoutPlayers, setLineoutPlayers] = useState([]);
  const location = useLocation();
  const isScheduled = Boolean(location?.state?.isScheduled);


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
  useEffect(() => {
    if (gameData?.lineout?.players) {
      setLineoutPlayers(gameData.lineout.players);
    }
  }, [gameData]);
  
  // ✅ Remove the problematic DOM manipulation useEffect entirely
  // Replace with React event handlers
  const stats = {
    fieldGoalPct: 80,
    fieldGoalMade: 12,
    fieldGoalMissed: 3,
  
    threePointPct: 40,
    threePointMade: 4,
    threePointMissed: 6,
  
    freeThrowPct: 75,
    freeThrowMade: 9,
    freeThrowMissed: 3,
  
    blocks: 5,
    steals: 4,
    turnovers: 7,
  };
  const trackingPlayers = gameData?.gameActions?.some(
    (action) =>
      action.team === 'home' && 
      (action.playerNumber || action.playerName)
  );

  const trackingLineout = gameData?.lineout?.players?.length > 0;

  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  // Utility function to sum points per quarter for a given team
  const getQuarterScores = (gameActions, teamKey) => {
    const quarterScores = { 1: null, 2: null, 3: null, 4: null };
  
    if (!gameActions || gameActions.length === 0) return quarterScores;
  
    gameActions.forEach(action => {
      if (action.type === 'score' && action.team === teamKey) {
        const quarter = action.quarter;
        const points = action.points || 0;
  
        if (quarter) {
          if (!quarterScores[quarter]) quarterScores[quarter] = 0;
          quarterScores[quarter] += points;
        }
      }
    });
  
    return quarterScores;
  };
  
// const quarters = [1, 2, 3, 4];

const homeTeamName = gameData?.teamNames?.home;
const awayTeamName = gameData?.teamNames?.away;
const homeScores = getQuarterScores(gameData?.gameActions, "home");
const awayScores = getQuarterScores(gameData?.gameActions, "away");
// Compute winner boolean flags beforehand:
const homeWon = gameData?.gameState && (gameData?.score?.home > gameData?.score?.away);
const awayWon = gameData?.gameState && (gameData?.score?.away > gameData?.score?.home);

console.log('this is the gamedata object', gameData);
//lets check to see if the game that is opened is a scheduled game or what and if so lets open the lineoutmenue on start
// useEffect(()=>{
//   // isScheduled ? console.log('jeje') : ""
//   if(isScheduled){
//     // lets check if there is a lineout passed
//     // console.log('this is a scheduled game');
//     if(lineoutPlayers.length >=1){
//       console.log('we have a lineout to shows them in the scheduled game');
//       setShowStatsModal(true)
//       setGameStatsToggleMode("Lineouts")
//     }else{
    
//       console.log('no lineout int he scheudled game');
      
//     }

    
//   }else{
//     console.log('not a schefu;ed game');
    
//   }
  
//   },[])

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
// Get full players array
// const lineoutPlayers = gameData?.lineout?.players ?? [];

// Get on-court jersey numbers (as strings)
const onCourtPlayers = gameData?.onCourtPlayers ?? [];

// Split into on-court and bench dynamically
const onCourt = lineoutPlayers.filter(p => onCourtPlayers.includes(String(p.number)));
const bench = lineoutPlayers.filter(p => !onCourtPlayers.includes(String(p.number)));



  return (
    
    <div className={`${showStatsModal ? "h-auto" : "h-screen"} bg-secondary-bg relative  text-white flex flex-col bg-[url('/assets/bg-pattern.svg')]
     min-h-screen bg-repeat bg-[length:150px_150px]`}>

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

      <div className="w-full relative md:max-w-sm  mx-auto text-white  text-center">
      <div className="relative rounded-lg bg-secondary-bg bg-opacity-60 w-full py-3 px-4 flex flex-col items-center gap-1">

{/* Inline keyframes */}
<style>{`
  @keyframes confettiPulse {
    0%, 100% { box-shadow: 0 0 10px #8B5CF6, 0 0 20px rgba(139, 92, 246, 0.4); }
    50% { box-shadow: 0 0 20px #8B5CF6, 0 0 40px rgba(139, 92, 246, 0.2); }
  }
  @keyframes confettiBurst {
    0% { opacity: 0; transform: translate(0, 0) rotate(0deg); }
    20% { opacity: 1; }
    100% { opacity: 0; transform: translate(var(--x), var(--y)) rotate(720deg); }
  }
`}</style>

{/* LIVE or Scheduled */}
<div className="absolute top-1 left-1/2 transform -translate-x-1/2">
  {gameData?.gameActions?.length > 0 && !gameFinsihedFlag && !gameData?.gameState ? (
    <span className="bg-secondary-danger text-white text-xs px-3 py-0.5 rounded font-bold">LIVE <span className="animate-pulse">⚪️</span></span>
  ) : (
    <span className="bg-primary-bg text-white text-xs px-3 py-0.5 rounded font-medium">{gameData?.scheduledStart?.date || "Scheduled"}</span>
  )}
</div>

{/* Teams & Score Row */}
<div className="flex justify-between items-center w-full">

  {/* HOME */}
  <div className="relative flex flex-col items-center w-1/3">
    <div
      className={`w-12 h-12 border-2 border-primary-danger rounded-full bg-white mb-1 ${homeWon ? 'z-20' : ''}`}
      style={homeWon ? { animation: "confettiPulse 5s forwards" } : {}}
    >
      <img src={gameData?.logos?.home || homeLogo} className="w-full h-full rounded-full p-1" />
    </div>
    <p className="text-sm text-white">{gameData?.teamNames.home || "Home"}</p>

    {/* Confetti for Home */}
    {homeWon && [...Array(20)].map((_, i) => {
      const angle = Math.random() * 360;
      const distance = 80 + Math.random() * 50;
      const x = `${Math.cos(angle) * distance}px`;
      const y = `${Math.sin(angle) * distance}px`;
      const colors = ["#F43F5E", "#FACC15", "#22C55E", "#3B82F6", "#8B5CF6"];
      return (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            top: "50%",
            left: "50%",
            backgroundColor: colors[i % colors.length],
            transform: "translate(-50%, -50%)",
            "--x": x,
            "--y": y,
            animation: `confettiBurst 2s ${i * 0.1}s forwards`,
          }}
        />
      );
    })}
  </div>

  {/* SCORE */}
  <div className="flex flex-col items-center mt-5 w-1/3">
    <p className="text-2xl font-bold text-white">{gameData.score?.home ?? 0} - {gameData.score?.away ?? 0}</p>
    <p className="text-xs text-gray-300">
      {gameData?.quarter > 4 ? `OT ${gameData.quarter - 4}` : `Q${gameData?.quarter ?? 1}`} 
      &nbsp;|&nbsp;
      {gameClock?.minutesLeft ?? "--"}:{String(gameClock?.secondsLeft ?? "00").padStart(2, "0")}
    </p>
    {broadcastUpdate && (
              <div className=" mt-2 w-full text-xs bg-white/5 rounded-md p-3">
                {broadcastUpdate}
              </div>
            )}
  </div>

  {/* AWAY */}
  <div className="relative flex flex-col items-center w-1/3">
    <div
      className={`w-12 h-12 border-2 border-primary-cta rounded-full bg-white mb-1 ${awayWon ? 'z-20' : ''}`}
      style={awayWon ? { animation: "confettiPulse 5s forwards" } : {}}
    >
      <img src={gameData?.logos?.away || opponentJersey} className="w-full h-full rounded-full p-1" />
    </div>
    <p className="text-sm text-white">{gameData?.teamNames.away || "Away"}</p>

    {/* Confetti for Away */}
    {awayWon && [...Array(20)].map((_, i) => {
      const angle = Math.random() * 360;
      const distance = 80 + Math.random() * 50;
      const x = `${Math.cos(angle) * distance}px`;
      const y = `${Math.sin(angle) * distance}px`;
      const colors = ["#F43F5E", "#FACC15", "#22C55E", "#3B82F6", "#8B5CF6"];
      return (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            top: "50%",
            left: "50%",
            backgroundColor: colors[i % colors.length],
            transform: "translate(-50%, -50%)",
            "--x": x,
            "--y": y,
            animation: `confettiBurst 2s ${i * 0.1}s forwards`,
          }}
        />
      );
    })}
  </div>

</div>
</div>



      {/*this is the game stats toggle section */}
      <div className="w-full h-auto bg-secondary-bg bg-opacity-65 text-sm rounded-b-lg flex flex-col items-center justify-center">
      <div className={`overflow-hidden transition-all w-full duration-300 ease-in-out ${
        showStatsModal ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className={`h-auto pb-4 w-full  transform transition-all duration-300 ease-in-out ${
          showStatsModal ? 'translate-y-0' : '-translate-y-4'
        }`}>
<div className="w-full flex justify-center">
<div className={`relative flex bg-secondary-bg rounded-full p-1 ${trackingPlayers ? 'w-[360px]' : 'w-[270px]'} mx-auto`}>
  {/* Animated background */}
  <div 
    className={`absolute top-1 left-1 h-[calc(100%-8px)] bg-primary-danger bg-opacity-50 rounded-full transition-transform duration-300 ease-in-out`}
    style={{
      width: trackingPlayers ? 'calc(25% - 4px)' : 'calc(33.333% - 4px)',
      transform: trackingPlayers 
        ? (gameStatsToggleMode === 'Game' 
            ? 'translateX(0%)' 
            : gameStatsToggleMode === 'Player' 
              ? 'translateX(100%)' 
              : gameStatsToggleMode === 'Stats' 
                ? 'translateX(200%)' 
                : 'translateX(300%)')
        : (gameStatsToggleMode === 'Game' 
            ? 'translateX(0%)' 
            : gameStatsToggleMode === 'Stats' 
              ? 'translateX(100%)' 
              : 'translateX(200%)')
    }}
  ></div>

  {/* Game */}
  <button 
    onClick={() => setGameStatsToggleMode("Game")}
    className={`relative ${trackingPlayers ? 'w-1/4' : 'w-1/3'} px-4 py-1 rounded-full text-sm font-medium transition-all duration-300 z-10 ${
      gameStatsToggleMode === "Game" ? "text-white" : "text-gray-400"
    }`}
  >
    Game
  </button>

  {/* Players */}
  {trackingPlayers && (
    <button 
      onClick={() => setGameStatsToggleMode("Player")}
      className={`relative w-1/4 px-4 py-1 rounded-full text-sm font-medium transition-all duration-300 z-10 ${
        gameStatsToggleMode === "Player" ? "text-white" : "text-gray-400"
      }`}
    >
      Players
    </button>
  )}

  {/* Stats */}
  <button 
    onClick={() => setGameStatsToggleMode("Stats")}
    className={`relative ${trackingPlayers ? 'w-1/4' : 'w-1/3'} px-4 py-1 rounded-full text-sm font-medium transition-all duration-300 z-10 ${
      gameStatsToggleMode === "Stats" ? "text-white" : "text-gray-400"
    }`}
  >
    Stats
  </button>

  {/* Lineouts */}
  <button 
    onClick={() => setGameStatsToggleMode("Lineouts")}
    className={`relative ${trackingPlayers ? 'w-1/4' : 'w-1/3'} px-4 py-1 rounded-full text-sm font-medium transition-all duration-300 z-10 ${
      gameStatsToggleMode === "Lineouts" ? "text-white" : "text-gray-400"
    }`}
  >
    Lineouts
  </button>
</div>


</div>


<div className="overflow-x-auto mt-2 px-2  min-h-[20vh]">
  {gameStatsToggleMode === 'Game' ? (
    
    <table className="w-full text-sm text-center bg-opacity-60 text-white rounded-lg">
      <thead>
        <tr>
          <th className="py-2 px-4 text-left">Team</th>
          {quarters.map((q) => (
  <th key={q} className={`py-2 px-4 ${gameData?.quarter === q && !gameData.gameState ? "text-primary-danger font-bold" : ""}`}>
    {q > 4 ? `OT ${q - 4}` : `Q${q}`}
  </th>
))}

        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-gray-700">
          <td className="py-2 px-4 text-left font-semibold">{homeTeamName}</td>
          {quarters.map((q) => {
            const score = homeScores[q];
            const value = score !== null ? score : gameData?.quarter === q ? 0 : "—";
            return <td key={q} className="py-2 px-4">{value}</td>;
          })}
        </tr>
        <tr className="border-t border-gray-700">
          <td className="py-2 px-4 text-left font-semibold">{awayTeamName}</td>
          {quarters.map((q) => {
            const score = awayScores[q];
            const value = score !== null ? score : gameData?.quarter === q ? 0 : "—";
            return <td key={q} className="py-2 px-4">{value}</td>;
          })}
        </tr>
      </tbody>
    </table>
  ) : gameStatsToggleMode === 'Player' ? (
    <div className="w-full h-auto min-h-[20vh]">
 <div className="flex justify-center items-center w-full  gap-4">
  <p className=" bg-secondary-bg  w-auto text-center border-b-2 border-b-primary-danger">{homeTeamName || "Home"}</p>


<div className="relative group">
    <button 
      type="button" 
      className="bg-secondary-bg rounded-lg w-auto line-through text-gray-400 text-center px-2 py-2"
    >
 {awayTeamName || "Away"}
    </button>
    <div 
      className="absolute  top-2/2 w-auto h-auto  overflow-y-auto -translate-y-1/2 ml-2 
                 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 
                 whitespace-nowrap opacity-0 group-hover:opacity-100 
                 transition-opacity duration-300 z-50"
    >
      Release 2.0
    </div>
  </div>

</div>

      <div className="flex overflow-x-auto space-x-3 px-2 py-1 ">
        {(() => {
          const homePlayerScores = {};

          gameData?.gameActions?.forEach(action => {
            if (action.type === 'score' && action.team === 'home') {
              const playerId = action.playerNumber || 'Unknown';
              const playerName = action.playerName || playerId;

              if (!homePlayerScores[playerId]) {
                homePlayerScores[playerId] = { number: playerId, name: playerName, points: 0 };
              }
              homePlayerScores[playerId].points += action.points || 0;
            }
          });

          const playersArray = Object.values(homePlayerScores);
          const sortedPlayersArray = [...playersArray].sort((a, b) => b.points - a.points);
          return sortedPlayersArray.map((player, index) => (
            <div
              key={index}
              className="min-w-[100px] bg-secondary-bg rounded-lg p-2 flex flex-col items-center shadow-md scroll-snap-x scroll-smooth snap-mandatory"
            >
              <div className="w-12 h-12 bg-primary-danger/50 rounded-full flex items-center justify-center text-white text-md font-semibold">
                {player.number}
              </div>
              <div className="mt-2 text-gray-400 text-sm text-center truncate">{player.name}</div>
              <div className="mt-1 text-white text-base font-semibold">{player.points} pts</div>
            </div>
          ));
          
          if (playersArray.length === 0) {
            return (
              <div className="text-white text-center w-full py-4">
                No player scores yet.
              </div>
            );
          }

          return playersArray.map((player, index) => (
            <div
              key={index}
              className="min-w-[100px] bg-secondary-bg rounded-lg p-2 flex flex-col items-center shadow-md scroll-snap-x scroll-smooth snap-mandatory"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white text-lg font-bold">
                #{player.number}
              </div>
              <div className="mt-2 text-gray-400 text-sm text-center truncate">{player.name}</div>
              <div className="mt-1 text-white text-base font-semibold">{player.points} pts</div>
            </div>
          ));
        })()}
      </div>
    </div>
  ) 
  : gameStatsToggleMode === 'Lineouts' ? (
    trackingLineout ? (
    
<div className="relative w-full h-full aspect-square rounded-lg overflow-hidden">

  <div className="h-[10%] relative w-full" data-section="team-nav-div">
    <div className="flex h-full justify-center items-center  w-full gap-4">
      <p className="bg-secondary-bg w-auto text-center border-b-2 border-b-primary-danger">{homeTeamName || "Home"}</p>
      <div className="relative group">
        <button type="button" className="bg-secondary-bg rounded-lg w-auto line-through text-gray-400 text-center">
          {awayTeamName || "Away"}
        </button>
        <div className="absolute top-2/2 w-auto h-auto overflow-y-auto -translate-y-1/2 ml-2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
          Release 3.0
        </div>
      </div>
    </div>
  </div>



  <div className="h-[60%]  border-t-2 border-t-white/5  relative" data-section="on-court-5">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute w-1/5 h-[55%] border-[1px] border-white/10 top-0" data-section="key"></div>
      <div className="absolute top-[55%] w-1/5 h-[20%] border-[1px] border-white/10 rounded-b-full" data-section="key-semi-circle" ></div>
      <div className="border-[1px] border-white/10 w-[80%] h-[80%] rounded-b-full   absolute top-0"></div>
    </div>

    {/* Filter the players */}
    {(() => {
      const onCourt = lineoutPlayers.filter(p => onCourtPlayers.includes(String(p.number)));
      const bench = lineoutPlayers.filter(p => !onCourtPlayers.includes(String(p.number)));

      return (
        <>
          {onCourt.length === 5 && (
            <>
              {/* Center */}
              <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2">
                <div className="w-10 h-10 bg-primary-danger rounded-full flex items-center justify-center text-white font-bold shadow-lg border-[1px] border-white/10 text-xs">
                  #{onCourt[0].number}
                </div>
                <div className="text-white text-sm text-center mt-1">{onCourt[0].name}</div>
              </div>

              {/* Left Wing */}
              <div className="absolute top-[25%] left-[15%] transform -translate-x-1/2">
                <div className="w-10 h-10 bg-primary-danger rounded-full flex items-center justify-center text-white font-bold shadow-lg border-[1px] border-white/10 text-xs">
                  #{onCourt[1].number}
                </div>
                <div className="text-white text-sm text-center mt-1">{onCourt[1].name}</div>
              </div>

              {/* Right Wing */}
              <div className="absolute top-[25%] right-[15%] transform translate-x-1/2">
                <div className="w-10 h-10 bg-primary-danger rounded-full flex items-center justify-center text-white font-bold shadow-lg border-[1px] border-white/10 text-xs">
                  #{onCourt[2].number}
                </div>
                <div className="text-white text-sm text-center mt-1">{onCourt[2].name}</div>
              </div>

              {/* Left Corner */}
              <div className="absolute top-[60%] left-[35%] transform -translate-x-1/2">
        <div className="w-10 h-10 bg-primary-danger rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg border-[1px] border-white/10">
          #{onCourt[3].number}
        </div>
        <div className="text-white text-sm text-center mt-1 opacity-80">{onCourt[3].name}</div>
      </div>


              {/* Right Corner */}
              <div className="absolute top-[60%] right-[35%] transform translate-x-1/2">
                <div className="w-10 h-10 bg-primary-danger rounded-full flex items-center justify-center text-white font-bold shadow-lg border-[1px] border-white/10 text-xs">
                  #{onCourt[4].number}
                </div>
                <div className="text-white text-sm text-center mt-1">{onCourt[4].name}</div>
              </div>
            </>
          )}
        </>
      );
    })()}
  </div>


  <div className="h-[20%] relative border-t-[1px] bg-secondary-bg
 border-t-white/10 w-full flex flex-wrap justify-center items-center gap-3 px-2" data-section="bench-div">
    {lineoutPlayers
      .filter(p => !onCourtPlayers.includes(String(p.number)))
      .map((player, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
            #{player.number}
          </div>
          <div className="text-xs text-white mt-1 text-center">{player.name}</div>
        </div>
      ))}
  </div>
</div>
    )
    :(
      <div className="text-center text-white py-10">No Lineout's uploaded yet</div>
    )
    )
 
  : (
<div className="w-full min-h-[20vh] flex flex-col gap-3 px-4 py-1">

<div className="flex justify-center items-center w-full gap-4">
  <p className="bg-secondary-bg w-auto text-center border-b-2 border-b-primary-danger">
    {homeTeamName || "Home"}
  </p>
  <div className="relative group">
    <button 
      type="button" 
      className="bg-secondary-bg rounded-lg w-auto line-through text-gray-400 text-center px-2 py-2"
    >
 {awayTeamName || "Away"}
    </button>
    <div 
      className="absolute  top-2/2 w-auto h-auto  overflow-y-auto -translate-y-1/2 ml-2 
                 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 
                 whitespace-nowrap opacity-0 group-hover:opacity-100 
                 transition-opacity duration-300 z-50"
    >
      Coming<br></br>
      Release 2.0
    </div>
  </div>
</div>

{[
 { 
  label: "FG%", 
  value: gameData?.stats?.fieldGoalPct ?? 0, 
  made: gameData?.stats?.fieldGoalMade ?? 0, 
  missed: gameData?.stats?.fieldGoalMissed ?? 0 
},
{ 
  label: "3PT%", 
  value: (gameData?.stats?.threePointMade + gameData?.stats?.threePointMissed) > 0 
  ? Math.round((gameData?.stats?.threePointMade / (gameData?.stats?.threePointMade + gameData?.stats?.threePointMissed)) * 100)
  : 0,
  made: gameData?.stats?.threePointMade ?? 0, 
  missed: gameData?.stats?.threePointMissed ?? 0 
},
{ 
  label: "FT%", 
  value: gameData?.stats?.freeThrowPct ?? 0, 
  made: gameData?.stats?.freeThrowMade ?? 0, 
  missed: gameData?.stats?.freeThrowMissed ?? 0 
}
].map((stat, i) => (
  <div key={i}>
    <div className="flex w-full justify-between text-white text-sm mb-1">
      <span>{stat.label} <span className="mx-1">-</span><span className="mx-2 text-gray-300 justify-end">{stat.made}/{stat.made + stat.missed}</span></span>
      <span>{stat.value}%</span>
    </div>
    <div className="w-full bg-white/10 rounded-full h-2">
      <div className="bg-primary-danger transition-all duration-700  h-2 rounded-full" style={{ width: `${stat.value}%` }}></div>
    </div>
  </div>
))}

<div className="grid grid-cols-3 gap-2 text-white text-center text-sm ">
  <div className="bg-secondary-bg px-2 rounded-lg">
    Blocks<br/><span className="font-bold">{gameData?.stats?.blocks ?? 0}</span>
  </div>
  <div className="bg-secondary-bg px-2 rounded-lg">
    Steals<br/><span className="font-bold">{gameData?.stats?.steals ?? 0}</span>
  </div>
  <div className="bg-secondary-bg px-2 rounded-lg">
    Turnovers<br/><span className="font-bold">{gameData?.stats?.turnovers ?? 0}</span>
  </div>
</div>

</div>

  
  )}
</div>


        </div>
      </div>
      
      <button 
        onClick={() => setShowStatsModal(!showStatsModal)} 
        className="flex items-center px-2 w-full justify-center hover:text-primary-danger px-4 flex-col transition-colors duration-200"
      >
        {!showStatsModal &&
        <p>Game Stats</p>
}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth="1.5" 
          stroke="currentColor" 
          className={`w-6 h-6 transition-transform duration-300 ease-in-out ${showStatsModal ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
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

          // Build clock only if both values exist
          let clock = "";
          if (typeof action.clockMinutesLeft === "number" && typeof action.clockSecondsLeft === "number") {
            clock = `${action.clockMinutesLeft}:${String(action.clockSecondsLeft).padStart(2, "0")}`;
          }

          // 🎯 Filter: show only scores, misses, FT, BLK, TO, STL
          const displayType = action.type?.toLowerCase();
          const isScore = action.points;
          const isMiss = displayType?.includes("miss");
          const isBlock = displayType?.includes("block");
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
  {action?.quarter > 4 
    ? `── OT ${action.quarter - 4} ──`
    : `── Q ${action.quarter} ──`}
</p>

                  </div>
                </div>
              )}

              <li className="w-full">
                {isScore ? (
                  <>
                    {isHome ? (
                      <div className="timeline-start border-l-2 border-l-primary-danger timeline-box bg-secondary-bg text-white border border-gray-700 w-36">
                        {(timeLabel || clock) && (
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{timeLabel}</span>
                            {clock && <span>{clock}</span>}
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-white">
                            <span className="text-gray-400">{playerText}</span>{nameText}
                          </p>
                          <p className="text-md font-bold text-primary-danger">+{action.points}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="timeline-end w-36 border-r-2 border-r-primary-cta timeline-box bg-secondary-bg text-white border border-gray-700">
                        <p className="text-xs text-gray-400 mb-1">{timeLabel}</p>
                        <p className="font-semibold">
                          {playerText} {nameText} + {action.points}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4 text-white/50 bg-secondary-bg rounded-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
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