// LiveGameView.jsx
import React, { useEffect, useState, useRef ,useMemo} from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase"; // ✅ make sure it's 'firestore', not 'db'
import homeLogo from '../assets/logo.jpg'
import { useLocation } from 'react-router-dom';
import opponentJersey from '../assets/jersey.webp'
import { useNavigate } from "react-router-dom";
import jersey from '../assets/jersey2.png'
import InGameScoreSheet from "./LiveGameComponents/InGameScoreSheet";
import { PreGameCard } from "./LiveGameComponents/PreGameCard";
import ShareButton from "./InGameComponents/Components/Buttons/ShareButton";



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
  // const [gameStatsToggleMode,setGameStatsToggleMode]= useState('Game');
  const [gameStatsToggleMode,setGameStatsToggleMode]= useState("Game");
  const navigate = useNavigate();
  // const maxQuarter = gameData?.quarter > 4 ? gameData.quarter : 4;

  const [lineoutPlayers, setLineoutPlayers] = useState([]);
  const location = useLocation();
  const isScheduled = Boolean(location?.state?.isScheduled);
  const [selectedTeamLineout, setSelectedTeamLineout] = useState('home'); // 'home' or 'away'
  const [awayLineoutPlayers, setAwayLineoutPlayers] = useState([]);
  const [localSubstitutions, setLocalSubstitutions] = useState([]);
  const [selectedPlayerCard, setSelectedPlayerCard] = useState(null);  
  // at top of component:
const [showPreGameCard, setShowPreGameCard] = useState(false);
const [shotQuarterFilter, setShotQuarterFilter] = useState("All");
  const SUB_TTL_MS = 7500;
  // pop when score changes
const [homePop, setHomePop] = useState(false);
const [awayPop, setAwayPop] = useState(false);
const prevScoresRef = useRef({ home: null, away: null });

const allActions = Array.isArray(gameData?.gameActions)
  ? gameData.gameActions
  : [];

// find max quarter that appears in actions
const maxQuarter = allActions.reduce((max, a) => {
  if (typeof a.quarter === "number") {
    return Math.max(max, a.quarter);
  }
  return max;
}, 1);

// build buttons: All, Q1–Q4, OT1, OT2...
const quarterOptions = [
  { label: "All", value: "All" },
  ...Array.from({ length: maxQuarter }, (_, i) => {
    const q = i + 1;
    return {
      label: q <= 4 ? `Q${q}` : `OT${q - 4}`,
      value: q,
    };
  }),
];
const quarters = Array.from({ length: maxQuarter }, (_, i) => i + 1);
// NEW: toggle logic (same -> close, different -> switch)
const handlePlayerCardClick = (player) => {
  setSelectedPlayerCard((prev) =>
    prev && String(prev.number) === String(player.number) && prev.name === player.name
      ? null
      : player
  );
};
// --- NEW: compute a single player's shooting stats from gameActions ---
const getPlayerShootingStats = (gameActions = [], teamKey, player) => {
  if (!player) return null;

  // normalize match by number first, else by name
  const matchesPlayer = (a) => {
    const aNum = a.playerNumber != null ? String(a.playerNumber) : null;
    const pNum = player.number != null ? String(player.number) : null;
    if (aNum && pNum && aNum === pNum) return true;

    const aName = (a.playerName || "").trim().toLowerCase();
    const pName = (player.name || "").trim().toLowerCase();
    return aName && pName && aName === pName;
  };

  const acc = {
    points: 0,
    twoMade: 0, twoMiss: 0,
    threeMade: 0, threeMiss: 0,
    ftMade: 0, ftMiss: 0,
  };

  gameActions.forEach((a) => {
    if (!a || a.team !== teamKey || !matchesPlayer(a)) return;

    const label = String(a.actionType || a.actionName || "").toLowerCase();

    // scores
    if (a.type === "score") {
      if (a.points === 1) { acc.ftMade += 1; acc.points += 1; }
      if (a.points === 2) { acc.twoMade += 1; acc.points += 2; }
      if (a.points === 3) { acc.threeMade += 1; acc.points += 3; }
      if (a.points === 0 && label.includes("miss")) {
        if (label.includes("ft")) acc.ftMiss += 1;
        else if (label.includes("3pt")) acc.threeMiss += 1;
        else if (label.includes("2pt")) acc.twoMiss += 1;
      }
    }

    // explicit miss/action records
    if (a.type === "action" || a.actionType) {
      if (label.includes("ft miss")) acc.ftMiss += 1;
      else if (label.includes("3pt miss")) acc.threeMiss += 1;
      else if (label.includes("2pt miss")) acc.twoMiss += 1;
    }
  });

  const fgMade = acc.twoMade + acc.threeMade;
  const fgMiss = acc.twoMiss + acc.threeMiss;
  const pct = (m, miss) => {
    const att = m + miss;
    return att > 0 ? Math.round((m / att) * 100) : 0;
  };

  return {
    points: acc.points,
    fg: { made: fgMade, att: fgMade + fgMiss, pct: pct(fgMade, fgMiss) },
    tp: { made: acc.threeMade, att: acc.threeMade + acc.threeMiss, pct: pct(acc.threeMade, acc.threeMiss) }, // 3PT
    ft: { made: acc.ftMade, att: acc.ftMade + acc.ftMiss, pct: pct(acc.ftMade, acc.ftMiss) },
  };
};
const selectedStats = useMemo(() => {
  if (!selectedPlayerCard) return null;
  // Players tab is showing the HOME team right now
  return getPlayerShootingStats(gameData?.gameActions || [], "home", selectedPlayerCard);
}, [selectedPlayerCard, gameData?.gameActions]);
    // ✅ Add this ref declaration at the component level
    const prevOnCourtRef = useRef(null);
  useEffect(() => {
    if (gameData?.awayLineout?.players) {
      setAwayLineoutPlayers(gameData.awayLineout.players);
    } else if (gameData?.opponentLineout?.players) {
      // Handle both field names for backward compatibility
      setAwayLineoutPlayers(gameData.opponentLineout.players);
    }
  }, [gameData]);
  useEffect(() => {
    if (gameData?.lineout?.players) {
      setLineoutPlayers(gameData.lineout.players);
    }
  }, [gameData]);
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
    const home = gameData?.score?.home ?? null;
    const away = gameData?.score?.away ?? null;
  
    // skip first load
    if (prevScoresRef.current.home === null && prevScoresRef.current.away === null) {
      prevScoresRef.current = { home, away };
      return;
    }
  
    if (home != null && prevScoresRef.current.home != null && home > prevScoresRef.current.home) {
      setHomePop(true);
      setTimeout(() => setHomePop(false), 300);
    }
  
    if (away != null && prevScoresRef.current.away != null && away > prevScoresRef.current.away) {
      setAwayPop(true);
      setTimeout(() => setAwayPop(false), 300);
    }
  
    prevScoresRef.current = { home, away };
  }, [gameData?.score?.home, gameData?.score?.away]);
  
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
    // Skip if no lineout data or if this is the initial load
    if (!lineoutPlayers.length || !gameData?.onCourtPlayers) return;
    
    if (prevOnCourtRef.current === null) {
      // First time setting up, just store current state
      prevOnCourtRef.current = [...(gameData.onCourtPlayers || [])];
      return;
    }
    
    const currentOnCourt = gameData.onCourtPlayers || [];
    const previousOnCourt = prevOnCourtRef.current || [];
    
    // Check if arrays are different
    const hasChanged = currentOnCourt.length !== previousOnCourt.length || 
                      currentOnCourt.some((player, index) => player !== previousOnCourt[index]);
    
    if (hasChanged && previousOnCourt.length > 0) {
      // Find who was subbed out (in previous but not in current)
      const subbedOut = previousOnCourt.filter(playerNum => !currentOnCourt.includes(playerNum));
      // Find who was subbed in (in current but not in previous)
      const subbedIn = currentOnCourt.filter(playerNum => !previousOnCourt.includes(playerNum));
      
      if (subbedOut.length > 0 && subbedIn.length > 0) {
        // Get player details from lineout
        const getPlayerDetails = (playerNumber) => {
          const player = lineoutPlayers.find(p => String(p.number) === String(playerNumber));
          return player ? { name: player.name, number: player.number } : { name: `Player ${playerNumber}`, number: playerNumber };
        };
        
        // For each substitution pair, we'll create a substitution action
        const newSubstitutions = [];
        subbedOut.forEach((outPlayerNum, index) => {
          if (subbedIn[index]) {
            const playerOut = getPlayerDetails(outPlayerNum);
            const playerIn = getPlayerDetails(subbedIn[index]);
            
            // Create substitution action object
            const substitutionAction = {
              type: "substitution",
              team: "home",
              quarter: gameData?.quarter || 1,
              clockMinutesLeft: gameClock?.minutesLeft,
              clockSecondsLeft: gameClock?.secondsLeft,
              off: playerOut,
              on: playerIn,
              timestamp: Date.now() // Add timestamp to ensure uniqueness
            };
            
            console.log('🔄 Substitution detected:', playerOut.name, '→', playerIn.name);
            newSubstitutions.push(substitutionAction);
          }
        });
        
        // Add new substitutions to local array
        if (newSubstitutions.length > 0) {
          setLocalSubstitutions(prev => [...prev, ...newSubstitutions]);
        }
      }
    }
    
    // Update the ref with current state
    prevOnCourtRef.current = [...currentOnCourt];
  }, [gameData?.onCourtPlayers, lineoutPlayers, gameData?.quarter, gameClock?.minutesLeft, gameClock?.secondsLeft]);



  
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
const groupName = gameData?.opponentGroup;
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
const decorateWithScoresAndMilestones = (actions, { step = 10, mode = "leader" } = {}) => {
  // assume actions are already chronological (oldest → newest)
  let h = 0, a = 0;
  let prevLeader = null;

  const crossed = (prev, next) => Math.floor(prev / step) < Math.floor(next / step);

  return actions.map((act) => {
    const out = { ...act, _postHome: h, _postAway: a, _milestone: false, _milestoneText: "" };

    const isScore = !!act.points && (act.type?.toLowerCase() === "score" || true);
    if (!isScore) return out;

    const prevH = h, prevA = a;
    if (act.team === "home") h += act.points || 0; else a += act.points || 0;

    // determine leader before & after
    const wasLeader = prevH === prevA ? prevLeader : (prevH > prevA ? "home" : "away");
    const nowLeader = h === a ? wasLeader : (h > a ? "home" : "away");
    prevLeader = nowLeader;

    let milestone = false;
    if (mode === "each") {
      if (act.team === "home" && crossed(prevH, h)) milestone = true;
      if (act.team === "away" && crossed(prevA, a)) milestone = true;
    } else { // "leader"
      const prevLeaderScore = wasLeader === "home" ? prevH : wasLeader === "away" ? prevA : Math.max(prevH, prevA);
      const nowLeaderScore  = nowLeader  === "home" ? h    : nowLeader  === "away" ? a    : Math.max(h, a);
      if (crossed(prevLeaderScore, nowLeaderScore)) milestone = true;
    }

    out._postHome = h;
    out._postAway = a;
    out._milestone = milestone;
    out._milestoneText = `${h} - ${a}`;
    return out;
  });
};


// Auto-show stats modal if there are few game actions
useEffect(() => {
  if (gameData?.gameActions?.length < 2 && !showPreGameCard)  {
    setGameStatsToggleMode("Stats")
    setShowStatsModal(true);
    
  }
}, [gameData?.gameActions?.length]);

// --- Scoresheet helpers ---
const normalize = (s) => (s || "").trim().toLowerCase();
const sameNumber = (a, b) =>
  a != null && b != null && String(a) === String(b);

// Match an action to a player (prefer number, fallback to name)
const matchesPlayer = (action, player) => {
  const aNum = action?.playerNumber;
  const pNum = player?.number;

  if (sameNumber(aNum, pNum)) return true;

  const aName = normalize(action?.playerName);
  const pName = normalize(player?.name);
  return aName && pName && aName === pName;
};

// Build compact rows from gameData for HOME team
const buildHomeScoresheetRows = (gameData) => {
  const players = gameData?.lineout?.players ?? [];
  const actions = gameData?.gameActions ?? [];

  // accumulator by jerseyNumber (string)
  const acc = new Map();

  // seed with all lineout players so bench shows as 0-rows too
  players.forEach((p) => {
    acc.set(String(p.number), {
      number: p.number,
      name: p.name,
      pts: 0,
      mins: 0,          // Optional: wire up later from your on/off court timing
      ast: 0,
      reb: 0,           // counts all rebounds (off/def combined)
      to: 0,
      stl: 0,
      blk: 0,
    });
  });

  actions.forEach((a) => {
    if (!a || a.team !== "home") return;

    // find the target player (by number first, otherwise by name)
    let key = null;
    if (a.playerNumber != null && acc.has(String(a.playerNumber))) {
      key = String(a.playerNumber);
    } else if (a.playerName) {
      // try to find by name in the seeded players
      const hit = players.find((p) => matchesPlayer(a, p));
      if (hit) key = String(hit.number);
    }
    if (!key) return; // skip if we can't confidently match

    const row = acc.get(key);
    const label = normalize(a.actionType || a.actionName);

    // scoring
    if (a.type === "score") {
      if (a.points === 1) row.pts += 1;
      if (a.points === 2) row.pts += 2;
      if (a.points === 3) row.pts += 3;
    }

    // counters from action labels
    if (label) {
      if (label.includes("assist") || label === "ast") row.ast += 1;
      if (label.includes("rebound") || label === "reb") row.reb += 1;
      if (label.includes("steal")) row.stl += 1;
      if (label.includes("block")) row.blk += 1;
      if (label.includes("t/o") || label.includes("turnover") || label === "tov")
        row.to += 1;
    }
  });

  // return rows sorted by jersey number asc
  return Array.from(acc.values()).sort(
    (a, b) => Number(a.number) - Number(b.number)
  );
};
// Compact rows for the sheet (HOME team only for now)
const scoresheetRows = useMemo(() => buildHomeScoresheetRows(gameData), [gameData]);

// mm:ss clock string from your live clock doc
const sheetClock = useMemo(() => {
  const m = gameClock?.minutesLeft;
  const s = gameClock?.secondsLeft;
  if (typeof m !== "number" || typeof s !== "number") return "--:--";
  return `${String(m).padStart(1, "0")}:${String(s).padStart(2, "0")}`;
}, [gameClock?.minutesLeft, gameClock?.secondsLeft]);

useEffect(() => {
  if (!localSubstitutions.length) return;

  // set a timer per substitution so each disappears ~5s after its timestamp
  const timers = localSubstitutions.map((sub) => {
    const age = Date.now() - (sub.timestamp || 0);
    const remaining = Math.max(0, SUB_TTL_MS - age);

    return setTimeout(() => {
      setLocalSubstitutions((prev) =>
        prev.filter((s) => s.timestamp !== sub.timestamp)
      );
    }, remaining);
  });


  return () => timers.forEach(clearTimeout);
}, [localSubstitutions]);

// Only the actions that actually appear on the timeline
const timelineActions = useMemo(() => {
  const base = [
    ...(gameData?.gameActions || []),
    ...localSubstitutions, // you already show these on the timeline
  ];

  // If you have timestamps, you can sort here:
  // base.sort((a,b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

  return base.filter((action) => {
    if (!action) return false;
    if (action.type === "substitution") return true; // you render these

    const label = String(action.actionType || action.actionName || "").toLowerCase();
    const t = String(action.type || "").toLowerCase();

    const isScore = Number.isFinite(action.points);
    const isMiss  = t.includes("miss") || label.includes(" miss");
    const isBlock = t.includes("block") || label.includes("block");
    const isTO    = t.includes("turnover") || label.includes("t/o");
    const isSteal = t.includes("steal");
    const isFT    = label.includes("free throw") || label.includes("ft ");

    return isScore || isMiss || isBlock || isTO || isSteal || isFT;
  });
}, [gameData?.gameActions, localSubstitutions]);
// after timelineActions useMemo (or anywhere after it exists)
useEffect(() => {
  setShowPreGameCard(timelineActions.length === 0);
}, [timelineActions.length]);


// one place to handle the interaction
const toggleStatsModal = () => {
  setShowStatsModal(prev => {
    const next = !prev;            // are we opening it now?
    if (next && showPreGameCard) { // if opening AND pregame is open → close pregame
      setShowPreGameCard(false);
    }
    return next;
  });
};

const hasPreGame = !!(
  // explicit prop takes priority if you use one
  // preGameCardProp ??
  // otherwise require the flag AND the object on the live game
  (gameData?.preGameCardEnabled )
);
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
  
  if (!gameData) return <div className="min-h-screen h-auto  bg-primary-bg flex items-center justify-center px-4">
  <div className="max-w-md w-full text-center">
    {/* Animated Basketball Icon */}
    <div className="relative mb-8">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-cta to-primary-danger rounded-full flex items-center justify-center shadow-2xl animate-bounce">
        <div className="w-24 h-24 bg-primary-bg rounded-full flex items-center justify-center">
          {/* <AlertCircle className="w-12 h-12 text-primary-red" /> */}
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-secondary-cta rounded-full animate-pulse"></div>
      <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-primary-green rounded-full animate-pulse delay-300"></div>
      <div className="absolute top-8 -left-8 w-4 h-4 bg-primary-danger-light rounded-full animate-pulse delay-700"></div>
    </div>

    {/* Error Code */}
    <div className="mb-6">
      <h1 className="text-8xl font-black text-transparent bg-gradient-to-r from-primary-cta via-primary-danger to-secondary-cta bg-clip-text mb-2">
        404
      </h1>
      <div className="w-24 h-1 bg-gradient-to-r from-primary-cta to-primary-danger mx-auto rounded-full"></div>
    </div>

    {/* Main Message */}
    <div className="mb-8 space-y-4">
      <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
      <div className="bg-card-bg rounded-lg p-6 border border-gray-700/50">
        <div className="flex items-center justify-center space-x-2 mb-3">
          {/* <Clock className="w-5 h-5 text-primary-red" /> */}
          <span className="text-primary-red font-semibold">Status: Unavailable</span>
        </div>
        <p className="text-gray-300 leading-relaxed">
          This game has either ended or doesn't exist. The final buzzer has sounded, 
          and this matchup is no longer available for viewing.
        </p>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="space-y-4">
      <button 
        onClick={()=>{navigate('/liveGameHomeDashboard')}}
        className="w-full bg-gradient-to-r from-primary-cta to-primary-green hover:from-primary-cta/80 hover:to-primary-green/80 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
      >
        {/* <Home className="w-5 h-5" /> */}
        <span>View Live Games</span>
      </button>

      <button 
        onClick={() => window.location.reload()}
        className="w-full bg-secondary-bg hover:bg-card-bg text-gray-300 hover:text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 border border-gray-700/50 hover:border-primary-cta/50"
      >
        Try Again
      </button>
    </div>

    {/* Additional Info */}
    <div className="mt-8 text-sm text-gray-500">
      <p>Looking for live games? Check out our</p>
      <button className="text-primary-cta hover:text-primary-green transition-colors underline">
        current schedule
      </button>
    </div>

    {/* Decorative Elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-cta rounded-full animate-ping"></div>
      <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-secondary-cta rounded-full animate-ping delay-500"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-primary-green rounded-full animate-ping delay-1000"></div>
    </div>
  </div>
</div>;
  console.log(gameData);
// Get full players array
// const lineoutPlayers = gameData?.lineout?.players ?? [];

// Get on-court jersey numbers (as strings)
const onCourtPlayers = gameData?.onCourtPlayers ?? [];

// Split into on-court and bench dynamically
const onCourt = lineoutPlayers.filter(p => onCourtPlayers.includes(String(p.number)));
const bench = lineoutPlayers.filter(p => !onCourtPlayers.includes(String(p.number)));

// Get the home team color from gameData, fallback to #8B5CF6
const homeTeamColor = gameData?.homeTeamColor || '#8B5CF6';

// Get lead changes from Firestore gameData, with fallback to default draw
const leadChanges = gameData?.leadChanges && gameData.leadChanges.length > 0 
  ? gameData.leadChanges 
  : [{ q: 1, score: "0-0", team: "Draw" }];

// Current scores (dummy)
const homeScore = 52;
const awayScore = 47;
const homeTeam = "DKIT Mens";
const awayTeam = "Mayo Meteors";

const getQuarterColor = (quarter) => {
  const colors = {
    1: "#3B82F6",
    2: "#10B981", 
    3: "#F59E0B",
    4: "#EF4444"
  };
  return colors[quarter] || "#6B7280";
};

const latestLeadChange = leadChanges[leadChanges.length - 1];
const handleTeamClick = (passedteamName) => {
  // const teamName = gameData?.teamNames.home || "Home";
  // Navigate to the team page with the team name
  navigate(`/teams/${encodeURIComponent(passedteamName)}`);
};
  return (
    
    <div className={`${showStatsModal ? "h-auto" : "h-auto"} bg-secondary-bg relative  text-white flex flex-col bg-[url('/assets/bg-pattern.svg')]
     min-h-screen bg-repeat bg-[length:150px_150px]`}>
      {/* {groupName &&
<span class="bg-primary-cta/20 absolute right-2 bottom-2 text-gray-300 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm  ">{groupName}</span>
} */}
      <header className="bg-primary-bg shadow w-full px-2 z-50">
        <div className="container mx-auto">
          <div className="flex cursor-pointer justify-between items-center py-4 mx-auto">
            <a onClick={() => { navigate("/liveGameHomeDashboard") }} className="text-xl font-bold text-white">
              StatsPro <span className=" text-primary-cta">|</span> <span className="text-sm text-gray-400">Basketball</span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-6 text-gray-300 text-sm">
              <a onClick={() => { navigate('/') }} className="hover:text-white">Home</a>
              <a onClick={()=>{
                navigate('/liveGameHomeDashboard')
              }} className="hover:text-white border-b-2 border-b-primary-cta pb-1">LiveGames</a>
                <ShareButton link={window.location.href} />
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
  <a onClick={() => { navigate('/'); handleCloseMobileMenu(); }} className="block hover:text-blue-400">
    Home
  </a>

  <a onClick={() => { navigate("/../liveGameHomeDashboard"); }} className="block hover:text-blue-400 text-white border-l-2 border-l-primary-cta pl-4">
    Live Games
  </a>

  <a onClick={() => { navigate('/teamsDashboard'); handleCloseMobileMenu(); }} className="block hover:text-blue-400">
    Teamsddd
  </a>

  {/* Share button */}
  <ShareButton link={window.location.href} />
</nav>


          <div>
          <div className="block text-center text-blue-500 font-semibold text-gray-400 py-3 rounded-s-lg">
     StatsPro | Basketball<br></br> Alpha 1.64
      </div>
          </div>
        </div>
      </div>

      <div className="w-full relative md:max-w-sm  mx-auto text-white  text-center">
      <div className="relative rounded-s-lg bg-secondary-bg bg-opacity-60 w-full py-3 px-4 flex flex-col items-center gap-1">

{/* Inline keyframes */}
<style>{`
  @keyframes confettiPulse { /* ...yours unchanged... */ }
  @keyframes confettiBurst { /* ...yours unchanged... */ }
  @keyframes shotGlow { /* ...yours unchanged... */ }

  /* NEW: subtle score pop */
  @keyframes scorePop {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.06); }
    100% { transform: scale(1); }
  }
  .animate-scorePop {
    animation: scorePop 300ms cubic-bezier(0.2, 0.6, 0.3, 1) 1;
  }
    /* pop */
@keyframes scorePop { 0%{transform:scale(1)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }
.fx-pop { animation: scorePop 260ms cubic-bezier(.2,.7,.3,1) 1; }

/* shockwave ring */
@keyframes shock { to { transform: scale(1.7); opacity: 0; } }
.fx-shockwave { position: relative; }
.fx-shockwave::before {
  content: "";
  position: absolute; inset: -2px;
  border: 2px solid var(--fx-color, #8B5CF6);
  border-radius: 9999px;
  opacity: .6;
  transform: scale(1);
  animation: shock 420ms ease-out 1;
  pointer-events: none;
}

/* light sweep */
@keyframes shine { to { transform: translateX(140%); } }
.fx-shine { position: relative; overflow: visible; }
.fx-shine::after{
  content:"";
  position:absolute; top:-8%; bottom:-8%; left:-40%;
  width:40%;
  background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.55) 40%, transparent 80%);
  transform: translateX(-120%);
  filter: blur(1px);
  animation: shine 520ms ease-out 1;
  pointer-events:none;
}

  @keyframes confettiPulse {
    0%, 100% { box-shadow: 0 0 10px #8B5CF6, 0 0 20px rgba(139, 92, 246, 0.4); }
    50% { box-shadow: 0 0 20px #8B5CF6, 0 0 40px rgba(139, 92, 246, 0.2); }
  }
  @keyframes confettiBurst {
    0% { opacity: 0; transform: translate(0, 0) rotate(0deg); }
    20% { opacity: 1; }
    100% { opacity: 0; transform: translate(var(--x), var(--y)) rotate(720deg); }
  }
  @keyframes shotGlow {
    0% {
      box-shadow: 0 0 0 0 rgba(34,197,94,0.8), 0 0 0 0 rgba(239,68,68,0.8);
      opacity: 0.7;
      transform: scale(1);
    }
    40% {
      box-shadow: 0 0 48px 32px rgba(34,197,94,0.7), 0 0 48px 32px rgba(239,68,68,0.7);
      opacity: 1;
      transform: scale(1.5);
    }
    80% {
      box-shadow: 0 0 24px 12px rgba(34,197,94,0.4), 0 0 24px 12px rgba(239,68,68,0.4);
      opacity: 1;
      transform: scale(1.1);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(34,197,94,0.0), 0 0 0 0 rgba(239,68,68,0.0);
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-shot-glow {
    animation: shotGlow 1.2s cubic-bezier(0.4,0,0.2,1) 1;
  }
`}</style>

{/* LIVE or Scheduled */}
<div className="absolute top-1 left-1/2 transform -translate-x-1/2">
  {gameData?.gameActions?.length > 0 && !gameFinsihedFlag && !gameData?.gameState ? (
    <span className="bg-secondary-danger text-white text-xs px-3 py-0.5 rounded font-bold">LIVE <span className="animate-pulse text-xs font-extralight h-1">⚪️</span></span>
  ) : (
    
    <span className="bg-primary-bg text-white text-xs px-3 py-0.5 rounded font-medium">{gameData?.scheduledStart?.date || "Scheduled"}</span>
  )}
  
</div>

{/* Teams & Score Row */}
<div className="flex justify-between items-center w-full">

  {/* HOME */}
  <div className="relative flex hover:bg-primary-bg hover:backdrop-blur-lg hover:scale-95 duration-300 hover:rounded-lg cursor-pointer  flex-col items-center w-1/3"
   onClick={()=>{handleTeamClick(homeTeamName)}}
  >
<div
  className={`w-12 h-12 border-2 rounded-full bg-white mb-1 ${homeWon ? 'z-20' : ''} ${homePop ? 'fx-pop fx-shockwave fx-shine' : ''}`}
  style={{ borderColor: homeTeamColor, '--fx-color': homeTeamColor }}
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
              <div className=" mt-2 w-full text-xs border-x-2 px-1 border-primary-green  py-1">
                {broadcastUpdate}
              </div>
            )}
  </div>

  {/* AWAY */}
  <div className="relative flex flex-col items-center w-1/3"  onClick={()=>{handleTeamClick(awayTeamName)}}>
  <div
  className={`w-12 h-12 border-2 rounded-full bg-white mb-1 ${awayWon ? 'z-20' : ''} ${awayPop ? 'fx-pop fx-shockwave fx-shine' : ''}`}
  style={{ borderColor: gameData?.awayTeamColor || '#0b63fb', '--fx-color': gameData?.awayTeamColor || '#0b63fb' }}
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
<div className={`relative flex bg-secondary-bg rounded-full p-1 ${trackingPlayers ? 'w-[450px]' : 'w-[360px]'} mx-auto`}>
  {/* Animated background */}
  <div 
    className={`absolute top-1 left-1 h-[calc(100%-8px)] bg-primary-cta bg-opacity-50 rounded-full transition-transform duration-300 ease-in-out`}
    style={{
      width: trackingPlayers ? 'calc(20% - 4px)' : 'calc(25% - 4px)',
      transform: trackingPlayers 
        ? (gameStatsToggleMode === 'Game' 
            ? 'translateX(0%)' 
            : gameStatsToggleMode === 'Player' 
              ? 'translateX(100%)' 
              : gameStatsToggleMode === 'Stats' 
                ? 'translateX(200%)' 
                : gameStatsToggleMode === 'Map'
                  ? 'translateX(300%)'
                  : 'translateX(400%)')
        : (gameStatsToggleMode === 'Game' 
            ? 'translateX(0%)' 
            : gameStatsToggleMode === 'Stats' 
              ? 'translateX(100%)' 
              : gameStatsToggleMode === 'Map'
                ? 'translateX(200%)'
                : 'translateX(300%)')
    }}
  ></div>

  {/* Game */}
  <button 
    onClick={() => setGameStatsToggleMode("Game")}
    className={`relative ${trackingPlayers ? 'w-1/5' : 'w-1/4'} px-4 py-1 rounded-full text-sm font-medium transition-all duration-300 z-10 ${
      gameStatsToggleMode === "Game" ? "text-white" : "text-gray-400"
    }`}
  >
    Game
  </button>

  {/* Players */}
  {trackingPlayers && (
    <button 
      onClick={() => setGameStatsToggleMode("Player")}
      className={`relative w-1/5 px-4 py-1 rounded-full text-sm font-medium transition-all duration-300 z-10 ${
        gameStatsToggleMode === "Player" ? "text-white" : "text-gray-400"
      }`}
    >
      Players
    </button>
  )}

  {/* Stats */}
  <button 
    onClick={() => setGameStatsToggleMode("Stats")}
    className={`relative ${trackingPlayers ? 'w-1/5' : 'w-1/4'} px-4 py-1 rounded-full text-sm font-medium transition-all duration-300 z-10 ${
      gameStatsToggleMode === "Stats" ? "text-white" : "text-gray-400"
    }`}
  >
    Stats
  </button>

  {/* Map */}
  <button 
    onClick={() => setGameStatsToggleMode("Map")}
    className={`relative ${trackingPlayers ? 'w-1/5' : 'w-1/4'} px-4 py-1 rounded-full text-sm font-medium transition-all duration-300 z-10 ${
      gameStatsToggleMode === "Map" ? "text-white" : "text-gray-400"
    }`}
  >
    Map
  </button>

  {/* Lineouts */}
  <button 
    onClick={() => setGameStatsToggleMode("Lineouts")}
    className={`relative ${trackingPlayers ? 'w-1/5' : 'w-1/4'} px-4 py-1 rounded-full text-sm font-medium transition-all duration-300 z-10 ${
      gameStatsToggleMode === "Lineouts" ? "text-white" : "text-gray-400"
    }`}
  >
    Team
  </button>
</div>


</div>


<div className="overflow-x-auto mt-1 px-2  min-h-[20vh] ">
  {gameStatsToggleMode === 'Game' ? (
    <>
    <table className="w-full text-sm text-center bg-opacity-60 text-white rounded-s-lg">
      <thead>
        <tr>
          <th className="py-2 px-4 border-l-2 border-l-secondary-bg text-left">Team</th>
          {quarters.map((q) => (
  <th key={q} className={`py-2 px-4 ${gameData?.quarter === q && !gameData.gameState ? "text-primary-cta font-bold" : ""}`}>
    {q > 4 ? `OT ${q - 4}` : `Q${q}`}
  </th>
))}

        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-gray-700">
          <td style={{borderLeftColor: gameData?.homeTeamColor || '#8B5CF6'}} className="py-2 px-4 border-l-2 text-left font-semibold">{homeTeamName}</td>
          {quarters.map((q) => {
            const score = homeScores[q];
            const value = score !== null ? score : gameData?.quarter === q ? 0 : "—";
            return <td key={q} className="py-2 px-4">{value}</td>;
          })}
        </tr>
        <tr className="border-t border-gray-700">
          <td style={{borderLeftColor: gameData?.awayTeamColor || '#8B5CF6'}} className="py-2 border-l-2 px-4 text-left font-semibold">{awayTeamName}</td>
          {quarters.map((q) => {
            const score = awayScores[q];
            const value = score !== null ? score : gameData?.quarter === q ? 0 : "—";
            return <td key={q} className="py-2 px-4">{value}</td>;
          })}
        </tr>
      </tbody>
    </table>
    <div className=" backdrop-blur-sm rounded-xl  px-2  mt-2">
      {/* Header */}
      <h1 className="text-md font-semibold text-center mt-4 mb-4 text-white">
        Lead Changes 
  
      </h1>

      {/* Timeline Container */}
      <div className="h-32 flex flex-row">
        {/* Team Logos */}
        <div className="h-24   my-auto flex flex-col w-auto">
          {/* Home Team Logo */}
          <div className={`w-10  flex items-center justify-center h-10 bg-white/10 rounded-full
            ${homeScore > awayScore ? "border-2 border-purple-400" : ""}`}>
        <img src={gameData?.logos?.home || opponentJersey} className="w-10 h-10 rounded-full" />
          </div>
          
          {/* Away Team Logo */}
          <div className={`w-10 flex items-center justify-center h-10 bg-white/10 rounded-full mt-2
            ${awayScore > homeScore ? "border-2 border-red-400" : ""}`}>
           <img src={gameData?.logos?.away || opponentJersey} className="w-10 h-10 rounded-full " />
          </div>
        </div>

        {/* Timeline */}
     {/* Timeline */}
<div className="timeline flex overflow-x-auto ml-4 w-11/12 space-x-3 relative px-2">
  {([...leadChanges] || []).reverse().map((lead, index, arr) => {
    const isLatest = index === 0;                // newest is first (leftmost)
    const prevLead = arr[index - 1];             // previous in the *reversed* order
    const isNewQuarter = !prevLead || prevLead.q !== lead.q;

    const isHomeTeamLead = lead.team !== homeTeam;   // (keep your flipped logic)
    const isDraw = lead.team === "Draw";

    return (
      <div key={index} className="flex-shrink-0 relative flex flex-col items-center h-full">
        {isNewQuarter && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <span
              className="text-xs px-2 py-1 rounded-full text-white font-medium"
              style={{ backgroundColor: getQuarterColor(lead.q) }}
            >
              Q{lead.q}
            </span>
          </div>
        )}

        {/* Top (home lead) */}
        <div className="h-10 flex items-end">
          {isHomeTeamLead && (
            <div className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
              isLatest ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"
            }`}>
              {lead.score}
            </div>
          )}
        </div>

        {/* Middle icon */}
        <div
          className="relative bg-gray-800 p-2 rounded-full border-none flex items-center my-1"
          style={{
            color: isHomeTeamLead
              ? (gameData?.homeTeamColor || '#8B5CF6')
              : isDraw
                ? '#6B7280'
                : (gameData?.awayTeamColor || '#EF4444')
          }}
        >
          {/* …icon svg stays the same… */}

          {/* connector to the next (older) item to the RIGHT */}
          {index !== arr.length - 1 && (
            <div className="absolute top-1/2 left-full w-6 h-0.5 bg-gray-800"></div>
          )}

          {isDraw && (
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              {lead.score}
            </div>
          )}
        </div>

        {/* Bottom (away lead) */}
        <div className="h-10 flex items-start">
          {!isHomeTeamLead && !isDraw && (
            <div className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
              isLatest ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300"
            }`}>
              {lead.score}
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>

      </div>
    </div>
</>

  ) :gameStatsToggleMode === 'Player' ? (
    <div className="w-full h-auto min-h-[20vh]">
    {/* header */}
    <div className="flex justify-center items-center w-full gap-4">
      <p
        style={{ borderBottomColor: gameData?.homeTeamColor || '#8B5CF6' }}
        className="bg-secondary-bg w-auto text-center border-b-2"
      >
        {homeTeamName || 'Home'}
      </p>

      <div className="relative group">
        <button
          type="button"
          className="bg-secondary-bg rounded-s-lg w-auto line-through text-gray-400 text-center px-2 py-2"
        >
          {awayTeamName || 'Away'}
        </button>
        <div className="absolute top-2/2 w-auto h-auto -translate-y-1/2 ml-2 bg-gray-900 text-white text-xs rounded-s-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
          Release 2.0
        </div>
      </div>
    </div>

    {/* player strip */}
    <div className="flex overflow-x-auto space-x-3 px-3 py-3">
      {(() => {
        const homePlayerScores = {};
        gameData?.gameActions?.forEach((action) => {
          if (action.type === 'score' && action.team === 'home') {
            const playerId = action.playerNumber || 'Unknown';
            const playerName = action.playerName || playerId;
            if (!homePlayerScores[playerId]) {
              homePlayerScores[playerId] = { number: playerId, name: playerName, points: 0 };
            }
            homePlayerScores[playerId].points += action.points || 0;
          }
        });

        const sorted = Object.values(homePlayerScores).sort((a, b) => b.points - a.points);

        if (sorted.length === 0) {
          return <div className="text-white/80 text-center w-full py-4">No player scores yet.</div>;
        }

        return sorted.map((player) => {
          const isSelected =
            selectedPlayerCard &&
            String(selectedPlayerCard.number) === String(player.number) &&
            selectedPlayerCard.name === player.name;

          return (
            <button
              type="button"
              key={`${player.number}-${player.name}`}
              onClick={() => handlePlayerCardClick(player)}
              aria-pressed={isSelected}
              className={`min-w-[110px] bg-secondary-bg rounded-xl p-2 flex flex-col items-center shadow-md focus:outline-none transition-transform duration-150 active:scale-95 ${
                isSelected ? 'ring-2 ring-white/40' : 'ring-0'
              }`}
            >
              <div
                style={{
                  borderColor: gameData?.homeTeamColor || '#8B5CF6',
                  backgroundImage: `url(${jersey})`,
                  backgroundSize: '90%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                className="w-9 h-9 border bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              >
                {player.number}
              </div>
              <div className="mt-1 text-gray-300 text-xs text-center truncate max-w-[100px]">{player.name}</div>
              <div className="mt-1 text-white text-base font-semibold">{player.points} pts</div>
            </button>
          );
        });
      })()}
    </div>

    {/* selected player panel – airier layout, compact info */}
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        selectedPlayerCard ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      {selectedPlayerCard && (() => {
        // --- compute extras for the selected player (AST, REB, STL, BLK, TOV) ---
        const matchesPlayer = (a) => {
          const aNum = a?.playerNumber != null ? String(a.playerNumber) : null;
          const pNum = selectedPlayerCard?.number != null ? String(selectedPlayerCard.number) : null;
          if (aNum && pNum && aNum === pNum) return true;
          const aName = (a?.playerName || '').trim().toLowerCase();
          const pName = (selectedPlayerCard?.name || '').trim().toLowerCase();
          return aName && pName && aName === pName;
        };

        let ast = 0, reb = 0, stl = 0, blk = 0, tov = 0;
        (gameData?.gameActions || []).forEach((a) => {
          if (!a || a.team !== 'home' || !matchesPlayer(a)) return;
          const label = String(a.actionType || a.actionName || '').toLowerCase();
          if (label.includes('assist') || label === 'ast') ast += 1;
          if (label.includes('rebound') || label === 'reb') reb += 1;     // counts all rebounds
          if (label.includes('steal')) stl += 1;
          if (label.includes('block')) blk += 1;
          if (label.includes('t/o') || label.includes('turnover') || label === 'tov') tov += 1;
        });

        const chip = (v, t) => (
          <div className="rounded-xl bg-white/5 px-1 py-1 text-center">
            <div className="text-xs text-white font-semibold leading-none">{v}</div>
            <div className="text-[10px] text-gray-400 leading-none mt-1">{t}</div>
          </div>
        );

        return (
          <div className="mx-1 mb-1 rounded-2xl bg-secondary-bg/80 px-1 py-2 backdrop-blur">
            {/* header */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 text-xs">
                <span className="inline-flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: gameData?.homeTeamColor || '#8B5CF6' }}
                  />
                </span>
                <span className="text-white font-semibold">
                  {selectedPlayerCard.name}{' '}
                  <span className="text-gray-400">#{selectedPlayerCard.number}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlayerCard(null)}
                className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
              >
                Clear
              </button>
            </div>

            {/* content */}
         {/* content */}
<div className="mt-3 grid grid-cols-[1fr,1.5fr]  gap-2 w-full">
  {/* LEFT: FG + 3PT (compact) */}
  <div className="rounded-xl bg-white/5 p-2">
    {[
      { key: 'fg', label: 'FG' },
      { key: 'tp', label: '3PT' },
    ].map(({ key, label }) => {
      const made = selectedStats?.[key]?.made ?? 0;
      const att  = selectedStats?.[key]?.att  ?? 0;
      const pct  = selectedStats?.[key]?.pct  ?? 0;

      return (
        <div key={key} className="mb-2 last:mb-0">
          <div className="flex items-center justify-between">
            <div className="text-[10px] leading-none text-gray-300">{label}</div>
            <div className="text-[10px] leading-none text-gray-400">{made}/{att}</div>
          </div>
          <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                backgroundColor: gameData?.homeTeamColor || '#8B5CF6',
              }}
            />
          </div>
          <div className="mt-0.5 text-[9px] leading-none text-gray-400">
            {att > 0 ? `${pct}%` : '—'}
          </div>
        </div>
      );
    })}
  </div>

  {/* RIGHT: chips + BIG FT (2-row span) */}
  <div className="grid grid-cols-[1fr,1fr,1fr,1.25fr]  grid-rows-2 gap-1.5 items-stretch h-full w-full">
    {/* Row 1 chips */}
    <div className="rounded-xl bg-white/5 px-2 py-2 text-center">
      <div className="text-xs text-white font-semibold leading-none">{ast}</div>
      <div className="text-[10px] text-gray-400 leading-none mt-1">AST</div>
    </div>
    <div className="rounded-xl bg-white/5 px-2 py-2 text-center">
      <div className="text-xs text-white font-semibold leading-none">{reb}</div>
      <div className="text-[10px] text-gray-400 leading-none mt-1">REB</div>
    </div>
    <div className="rounded-xl bg-white/5 px-2 py-2 text-center">
      <div className="text-xs text-white font-semibold leading-none">{stl}</div>
      <div className="text-[10px] text-gray-400 leading-none mt-1">STL</div>
    </div>

    {/* FT (wider column, spans two rows) */}
    {(() => {
      const ftMade = selectedStats?.ft?.made ?? 0;
      const ftAtt  = selectedStats?.ft?.att  ?? 0;
      const ftPct  = selectedStats?.ft?.pct  ?? 0;
      return (
        <div className="col-[4/5] row-span-2 rounded-xl bg-white/5 px-3 py-3 flex flex-col justify-center items-center">
          <div className="text-[10px] leading-none text-gray-300">FT</div>
          <div className="mt-1 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${ftPct}%`,
                backgroundColor: gameData?.homeTeamColor || '#8B5CF6',
              }}
            />
          </div>
          <div className="mt-1 text-[10px] leading-none text-gray-400">
            {ftMade}/{ftAtt}{ftAtt > 0 ? `  ${ftPct}%` : ''}
          </div>
        </div>
      );
    })()}

    {/* Row 2 chips */}
    <div className="rounded-xl bg-white/5 px-2 py-2 text-center">
      <div className="text-xs text-white font-semibold leading-none">{blk}</div>
      <div className="text-[10px] text-gray-400 leading-none mt-1">BLK</div>
    </div>
    <div className="rounded-xl bg-white/5 px-2 py-2 text-center">
      <div className="text-xs text-white font-semibold leading-none">{tov}</div>
      <div className="text-[10px] text-gray-400 leading-none mt-1">TO</div>
    </div>
    <div className="rounded-xl bg-white/5 px-2 py-2 text-center opacity-60">
      <div className="text-xs text-white font-semibold leading-none">—</div>
      <div className="text-[10px] text-gray-400 leading-none mt-1">MIN</div>
    </div>
  </div>
</div>

          </div>
        );
      })()}
    </div>
  </div>
 
  
  ) 
:gameStatsToggleMode === 'Lineouts' ? (
  trackingLineout || awayLineoutPlayers.length > 0 ? (
    
<div className="relative w-full h-full  aspect-square rounded-s-lg overflow-hidden mx-0 px-0">

  <div className="h-[10%] relative w-full" data-section="team-nav-div">
    <div className="flex h-full justify-center items-center w-full gap-4">
      {/* Home Team Button */}
      <button
        onClick={() => setSelectedTeamLineout('home')}
        style={{
          borderBottomColor: selectedTeamLineout === 'home' ? (gameData?.homeTeamColor || '#8B5CF6') : 'transparent'
        }}
        className={`bg-secondary-bg w-auto text-center border-b-2 px-3 py-1 rounded-t-lg transition-all duration-200 ${
          selectedTeamLineout === 'home' ? 'text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        {homeTeamName || "Home"}
      </button>

      {/* Away Team Button - Only clickable if away lineout exists */}
      {(awayLineoutPlayers.length > 0) ? (
        <button
          onClick={() => setSelectedTeamLineout('away')}
          style={{
            borderBottomColor: selectedTeamLineout === 'away' ? (gameData?.awayTeamColor || '#0b63fb') : 'transparent'
          }}
          className={`bg-secondary-bg w-auto text-center border-b-2 px-3 py-1 rounded-t-lg transition-all duration-200 ${
            selectedTeamLineout === 'away' ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          {awayTeamName || "Away"}
        </button>
      ) : (
        <div className="relative group">
          <button
            type="button"
            className="bg-secondary-bg rounded-lg w-auto line-through text-gray-400 text-center px-3 py-1"
            disabled
          >
            {awayTeamName || "Away"}
          </button>
          <div className="absolute top-1/2 w-auto h-auto overflow-y-auto -translate-y-1/2 ml-2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
            No Away Lineout
          </div>
        </div>
      )}
    </div>
  </div>

  <div className="h-[60%] border-t-2 border-t-white/5 relative mx-0 px-0" data-section="on-court-5">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute w-1/5 h-[55%] border-[1px] border-white/10 top-0" data-section="key"></div>
      <div className="absolute top-[55%] w-1/5 h-[20%] border-[1px] border-white/10 rounded-b-full" data-section="key-semi-circle"></div>
      <div className="border-[1px] border-white/10 w-[80%] h-[80%] rounded-b-full absolute top-0"></div>
    </div>

    {/* Filter the players based on selected team */}
    {(() => {
      // Choose which lineout data to use
      const currentLineoutPlayers = selectedTeamLineout === 'home' ? lineoutPlayers : awayLineoutPlayers;
      
      // For home team: use the existing onCourtPlayers logic
      // For away team: first 5 players are on court, rest are bench
      let currentOnCourtPlayers, onCourt, bench;
      
      if (selectedTeamLineout === 'home') {
        currentOnCourtPlayers = onCourtPlayers;
        onCourt = currentLineoutPlayers.filter(p => currentOnCourtPlayers.includes(String(p.number)));
        bench = currentLineoutPlayers.filter(p => !currentOnCourtPlayers.includes(String(p.number)));
      } else {
        // Away team: first 5 are on court, rest are bench
        onCourt = currentLineoutPlayers.slice(0, 5);
        bench = currentLineoutPlayers.slice(5);
      }
      
      const currentTeamColor = selectedTeamLineout === 'home' ? (gameData?.homeTeamColor || '#8B5CF6') : (gameData?.awayTeamColor || '#0b63fb');

      return (
        <>
          {onCourt.length === 5 && (
            <>
              {/* Center */}
              <div className="absolute top-[10%] left-[50%]  transform -translate-x-1/2">
                <div 
                  className="w-10 h-10 mx-auto bg-white/10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-[1px] text-xs"
                  style={{ borderColor: currentTeamColor }}
                >
                  #{onCourt[0].number}
                </div>
                <div className="text-white text-sm flex text-center mt-1">{onCourt[0].name}</div>
              </div>

              {/* Left Wing */}
              <div className="absolute top-[25%] left-[15%] transform -translate-x-1/2">
                <div 
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-[1px] text-xs"
                  style={{ borderColor: currentTeamColor }}
                >
                  #{onCourt[1].number}
                </div>
                <div className="text-white text-sm text-center mt-1">{onCourt[1].name}</div>
              </div>

              {/* Right Wing */}
              <div className="absolute top-[25%] right-[15%] transform translate-x-1/2">
                <div 
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-[1px] text-xs"
                  style={{ borderColor: currentTeamColor }}
                >
                  #{onCourt[2].number}
                </div>
                <div className="text-white text-sm text-center mt-1">{onCourt[2].name}</div>
              </div>

              {/* Left Corner */}
              <div className="absolute top-[60%] left-[35%] transform -translate-x-1/2">
                <div 
                  className="w-10 h-10 bg-white/10 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg border-[1px]"
                  style={{ borderColor: currentTeamColor }}
                >
                  #{onCourt[3].number}
                </div>
                <div className="text-white text-sm text-center mt-1 opacity-80">{onCourt[3].name}</div>
              </div>

              {/* Right Corner */}
              <div className="absolute top-[60%] right-[35%] transform translate-x-1/2">
                <div 
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-[1px] text-xs"
                  style={{ borderColor: currentTeamColor }}
                >
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

  <div className="h-auto   relative border-t-[1px] bg-secondary-bg border-t-white/10 w-full flex flex-wrap justify-center items-center gap-3 px-0" data-section="bench-div">
    {(() => {
      const currentLineoutPlayers = selectedTeamLineout === 'home' ? lineoutPlayers : awayLineoutPlayers;
      
      let benchPlayers;
      if (selectedTeamLineout === 'home') {
        // Home team: use existing onCourtPlayers logic
        benchPlayers = currentLineoutPlayers.filter(p => !onCourtPlayers.includes(String(p.number)));
      } else {
        // Away team: players from index 5 onwards are bench
        benchPlayers = currentLineoutPlayers.slice(5);
      }
      
      return benchPlayers.map((player, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
            #{player.number}
          </div>
          <div className="text-xs text-white mt-1 text-center">{player.name}</div>
        </div>
      ));
    })()}
  </div>
</div>
  ) : (
    <div className="text-center text-white py-10">No Lineout's uploaded yet</div>
  )
) : gameStatsToggleMode === 'Map' ? (
<>
  {/* Team toggle */}
  <div
    className="flex flex-row w-full h-auto items-center justify-center space-x-4"
    data-section="map-team-nav-div"
  >
    <button
      style={{ borderBottomColor: gameData?.homeTeamColor || "#8B5CF6" }}
      className="text-white text-sm font-medium border-b-2 "
    >
      {homeTeamName || "Home"}
    </button>
    <button
      style={{ borderBottomColor: gameData?.awayTeamColor || "#0b63fb" }}
      className="text-gray-600 line-through text-sm font-medium"
    >
      {awayTeamName || "Away"}
    </button>
  </div>

  {/* NEW: quarter filter buttons */}
  <div
    className="mt-3 mb-2 flex flex-wrap justify-center gap-2 text-xs"
    data-section="map-quarter-filter"
  >
    {quarterOptions.map((opt) => {
      const isActive = shotQuarterFilter === opt.value;
      return (
        <button
          key={opt.label}
          type="button"
          onClick={() => setShotQuarterFilter(opt.value)}
          className={`px-3 py-1 rounded-lg border text-xs font-medium transition
            ${
              isActive
                ? "bg-primary-cta text-black border-primary-cta"
                : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
            }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>

  <div
    className="w-full   
      h-[40vh] sm:h-[35vh] md:h-[30vh] lg:h-[28vh] xl:h-[25vh] 
      max-h-[500px] bg-opacity-40 rounded-lg flex items-center justify-center"
  >
    <div
      className="border-[1px] border-gray-600/40 rounded-md h-full w-full relative"
      data-section="court"
    >
      <div className="absolute left-1/2 top-0 w-[82.5%] h-[90%] -translate-x-1/2 border-b-[2px] border-x-2 border-t-0 border-gray-600/40 rounded-b-full" />
      <div className="absolute left-1/2 top-0 w-1/3 h-[55%] -translate-x-1/2 border-[2px] border-gray-600/40" />
      <div className="absolute top-[55%] w-1/3 left-1/3 h-1/4 rounded-b-full border-[2px] border-gray-600/40" />

      {/* Home team score dots */}
      {(() => {
        const homeShots = allActions.filter(
          (a) =>
            a.team === "home" &&
            typeof a.x === "number" &&
            typeof a.y === "number" &&
            (shotQuarterFilter === "All" || a.quarter === shotQuarterFilter)
        );

        const latestIdx = homeShots.length - 1;

        return homeShots.map((action, idx) => {
          const isMiss =
            typeof action.actionName === "string" &&
            action.actionName.toLowerCase().includes("miss");

          const dotClass =
            `${isMiss ? "bg-primary-red" : action.type === "score"
                ? "bg-primary-green"
                : "bg-gray-400"
            } border-2 border-white/20 shadow` +
            (idx === latestIdx ? " animate-shot-glow" : "");

          return (
            <div
              key={idx}
              className={`absolute w-3 h-3 ${dotClass}`}
              style={{
                left: `${action.x}%`,
                top: `${action.y}%`,
                zIndex: 10,
                clipPath:
                  "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
                transform: "translate(-50%, -50%)",
              }}
              title={`Q${action.quarter} (${action.points} pts)`}
            />
          );
        });
      })()}
    </div>
  </div>
</>

) : (
  <div className="w-full h-auto flex flex-col gap-3 px-4 ">
  
  {/* Team Headers */}

  {/* Calculate stats for both teams */}
  {(() => {
    // Initialize stats objects
    const homeStats = {
      twoPointMade: 0,
      twoPointMissed: 0,
      threePointMade: 0,
      threePointMissed: 0,
      freeThrowMade: 0,
      freeThrowMissed: 0,
      blocks: 0,
      steals: 0,
      turnovers: 0
    };
  
    const awayStats = {
      twoPointMade: 0,
      twoPointMissed: 0,
      threePointMade: 0,
      threePointMissed: 0,
      freeThrowMade: 0,
      freeThrowMissed: 0,
      blocks: 0,
      steals: 0,
      turnovers: 0
    };
  
    // Process game actions to calculate stats
    gameData?.gameActions?.forEach(action => {
      if (!action.team) return; // Only process actions with a team property
      const statsObj = action.team === 'home' ? homeStats : awayStats;

      // Defensive stats (Block, Steal, Turnover)
      const actionLabel = (action.actionType || action.actionName || '').toLowerCase();
      if (["block", "steal", "t/o", "turnover"].some(s => actionLabel.includes(s))) {
        if (actionLabel.includes("block")) statsObj.blocks++;
        if (actionLabel.includes("steal")) statsObj.steals++;
        if (actionLabel.includes("t/o") || actionLabel.includes("turnover")) statsObj.turnovers++;
      }

      // Scoring
      if (action.type === 'score') {
        if (action.points > 0) {
          if (action.points === 1) statsObj.freeThrowMade++;
          else if (action.points === 2) statsObj.twoPointMade++;
          else if (action.points === 3) statsObj.threePointMade++;
        }
        // Misses for 'score' type with points === 0
        if (action.points === 0 && action.actionName) {
          const missLabel = action.actionName.toLowerCase();
          if (missLabel.includes('ft miss')) statsObj.freeThrowMissed++;
          else if (missLabel.includes('2pt miss')) statsObj.twoPointMissed++;
          else if (missLabel.includes('3pt miss')) statsObj.threePointMissed++;
        }
      }

      // Misses
      if (action.type === 'action' || action.actionType) {
        const missLabel = (action.actionType || action.actionName || '').toLowerCase();
        if (missLabel.includes('ft miss')) statsObj.freeThrowMissed++;
        else if (missLabel.includes('2pt miss')) statsObj.twoPointMissed++;
        else if (missLabel.includes('3pt miss')) statsObj.threePointMissed++;
      }

      // Always count FT Score and FT Miss for home team by action name/type
      // if (action.team === 'home') {
      //   if (actionLabel.includes('ft score')) statsObj.freeThrowMade++;
      //   if (actionLabel.includes('ft miss')) statsObj.freeThrowMissed++;
      // }
    });
  
    // Combine 2-point and 3-point stats for total Field Goals
    homeStats.fieldGoalMade = homeStats.twoPointMade + homeStats.threePointMade;
    homeStats.fieldGoalMissed = homeStats.twoPointMissed + homeStats.threePointMissed;
    awayStats.fieldGoalMade = awayStats.twoPointMade + awayStats.threePointMade;
    awayStats.fieldGoalMissed = awayStats.twoPointMissed + awayStats.threePointMissed;
  
    // Calculate percentages
    const calculatePercentage = (made, missed) => {
      const total = made + missed;
      return total > 0 ? Math.round((made / total) * 100) : 0;
    };
  
    const homeFieldGoalPct = calculatePercentage(homeStats.fieldGoalMade, homeStats.fieldGoalMissed);
    const awayFieldGoalPct = calculatePercentage(awayStats.fieldGoalMade, awayStats.fieldGoalMissed);
    
    const homeThreePointPct = calculatePercentage(homeStats.threePointMade, homeStats.threePointMissed);
    const awayThreePointPct = calculatePercentage(awayStats.threePointMade, awayStats.threePointMissed);
    
    const homeFreeThrowPct = calculatePercentage(homeStats.freeThrowMade, homeStats.freeThrowMissed);
    const awayFreeThrowPct = calculatePercentage(awayStats.freeThrowMade, awayStats.freeThrowMissed);
  
    const statCategories = [
      {
        label: "Field Goals",
        home: { pct: homeFieldGoalPct, made: homeStats.fieldGoalMade, total: homeStats.fieldGoalMade + homeStats.fieldGoalMissed },
        away: { pct: awayFieldGoalPct, made: awayStats.fieldGoalMade, total: awayStats.fieldGoalMade + awayStats.fieldGoalMissed }
      },
      {
        label: "3-Pointers",
        home: { pct: homeThreePointPct, made: homeStats.threePointMade, total: homeStats.threePointMade + homeStats.threePointMissed },
        away: { pct: awayThreePointPct, made: awayStats.threePointMade, total: awayStats.threePointMade + awayStats.threePointMissed }
      },
      {
        label: "Free Throws",
        home: { pct: homeFreeThrowPct, made: homeStats.freeThrowMade, total: homeStats.freeThrowMade + homeStats.freeThrowMissed },
        away: { pct: awayFreeThrowPct, made: awayStats.freeThrowMade, total: awayStats.freeThrowMade + awayStats.freeThrowMissed }
      }
    ];
  
    return (
      <>
      
        {/* Shooting Stats with Simple Horizontal Bar Charts */}
        {statCategories.map((stat, i) => (
          <div className="">
                     {/* Stat label row with percentages */}
              
          <div key={i} className="flex items-center  justify-between  text-xs mb-0.5">
            <span  className="font-semibold min-w-[32px] text-left text-gray-400">{stat.home.pct}%</span>
            <span className="text-white text-xs font-medium flex-1 text-center">{stat.label.replace(/Field Goals|3-Pointers|Free Throws/, (match) => {
              if (match === "Field Goals") return "Field Goals";
              if (match === "3-Pointers") return "3-Pointers";
              if (match === "Free Throws") return "Free Throws";
              return match;
            })}</span>
            <span  className="font-semibold min-w-[32px] text-gray-400 text-right">{stat.away.pct}%</span>
          </div>
          {/* Numbers and bar row */}
          <div className="flex items-center bg justify-between h-auto w-full">
            {/* Home team value */}
            <div className="text-white font-bold text-sm w-12 text-left flex items-center">
              <span>{stat.home.made}/{stat.home.total}</span>
            </div>
            {/* Home team bar (extends right from center) */}
            <div className="flex-1 mx-1 flex justify-end">
              <div className="w-full bg-gray-700 rounded-s-lg h-2 relative">
                <div 
                  className=" rounded-s-lg h-2 transition-all duration-700 absolute right-0" 
                  style={{ width: `${Math.max(stat.home.pct, 5)}%`,backgroundColor: gameData?.homeTeamColor || '#8B5CF6' }}
                ></div>
              </div>
            </div>
            {/* Away team bar (extends left from center) */}
            <div className="flex-1 mx-1 flex justify-start">
              <div className="w-full bg-gray-700 rounded-e-lg h-2 relative">
                <div 
                  style={{ backgroundColor: gameData?.awayTeamColor || '#0b63fb', width: `${Math.max(stat.away.pct, 5)}%` }} className="rounded-e-lg h-2 transition-all
                   duration-700 absolute left-0"
        
                ></div>
              </div>
            </div>
            {/* Away team value */}
            <div  className="text-white font-bold text-sm w-12 text-right flex items-center justify-end">
              <span>{stat.away.made}/{stat.away.total}</span>
            </div>
          </div>
          </div>
        ))}
  
        {/* Other Stats with Simple Horizontal Bars */}
        <div className="">
          {/* <div className="text-center text-white text-sm font-medium">Other Stats</div> */}
          
          {[
            { label: "Blocks", homeValue: homeStats.blocks, awayValue: awayStats.blocks },
            { label: "Steals", homeValue: homeStats.steals, awayValue: awayStats.steals },
            { label: "Turnovers", homeValue: homeStats.turnovers, awayValue: awayStats.turnovers }
          ].map((stat, i) => {
            const maxValue = Math.max(stat.homeValue, stat.awayValue, 1);
            const homePercentage = (stat.homeValue / maxValue) * 100;
            const awayPercentage = (stat.awayValue / maxValue) * 100;
            
            return (
              <>
                     <div className=" text-white text-sm font-medium min-w-fit">
                    {stat.label}
                  </div>
              <div key={i} className="">
                <div className="flex items-center justify-between w-full">
                  {/* Home team value */}
                  <div className="text-white font-bold text-sm w-6 text-left">
                    {stat.homeValue}
                  </div>
                  
                  {/* Home team bar (extends right from center) */}
                  <div className="flex-1 mx-1 flex justify-end">
                    <div className="w-full bg-gray-700 rounded-s-lg h-2 relative">
                      <div 
             className=" rounded-s-lg h-2 transition-all duration-700 absolute right-0 z-50 "
             style={{ width: `${stat.homeValue + stat.awayValue > 0 ? (stat.homeValue / (stat.homeValue + stat.awayValue)) * 100 : 0}%`, backgroundColor: gameData?.homeTeamColor || '#8B5CF6' }}
                       
                      ></div>
                    </div>
                  </div>
                  
                  {/* Center label */}
           
                  
                  {/* Away team bar (extends left from center) */}
                  <div className="flex-1 mx-1 flex justify-start">
                    <div className="w-full rounded-e-lg bg-gray-700 h-2 relative">
                      <div 
                        className=" rounded-e-lg h-2 transition-all duration-700 absolute left-0" 
                        style={{ backgroundColor: gameData?.awayTeamColor || '#0b63fb',width: `${stat.homeValue + stat.awayValue > 0 ? (stat.awayValue / (stat.homeValue + stat.awayValue)) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Away team value */}
                  <div className="text-white font-bold text-xs w-6 text-right">
                    {stat.awayValue}
                  </div>
                </div>
              </div>
              </>
            );
          })}
        </div>
      </>
    );
  })()}
  
  </div>
  )
  
  }
</div>


        </div>
      </div>
      <div className="w-full bg-secondary-bg/30 rounded-lg overflow-hidden">
      <div className="w-full bg-secondary-bg/30 rounded-lg overflow-hidden">
      <div className="relative">
      <div className="bg-white/[0.02] hover:bg-white/[0.05] border-l-2 border-l-blue-500 rounded-r-xl transition-all duration-300">
      <button
  onClick={toggleStatsModal}
  className="flex items-center px-4 py-3 w-full justify-between hover:bg-blue-500/10 transition-all duration-200 group"
>            
    <div className="flex items-center space-x-3">       
      <div className="bg-blue-500/20 p-2 rounded-lg">         
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-blue-500">           
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 9C9.75 8.379 10.254 7.875 10.875 7.875h2.25C13.746 7.875 14.25 8.38 14.25 9v10.125c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 9.75 19.125V9ZM16.5 4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.875Z" />         
        </svg>       
      </div>       
      <div className="text-left">         
        <p className="text-white font-medium">Game Statistics</p>         
        <p className="text-gray-400 text-sm">View detailed analytics</p>       
      </div>     
    </div>     
    <svg                   
      xmlns="http://www.w3.org/2000/svg"                   
      fill="none"                   
      viewBox="0 0 24 24"                   
      strokeWidth="2"                   
      stroke="currentColor"                   
      className={`w-5 h-5 text-blue-500 transition-transform duration-300 ease-in-out group-hover:scale-110 ${showStatsModal ? "rotate-180" : ""}`}              
    >                  
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />              
    </svg>   
  </button>
</div>
  
  {/* Tooltip */}
  <div className="fixed bottom-20 right-6 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm opacity-0 pointer-events-none transition-opacity duration-200 hover:opacity-100">
    View Stats
  </div>
</div>
</div>
</div>
    </div>
      </div>

      {/* {gameData?.gameActions?.length > 0 && ( */}
      {showPreGameCard ? (
  <div className="mt-5 px-4 flex justify-center">
{gameData && (
  <PreGameCard
  liveGame={gameData}               // important
  preGameCard={gameData?.preGameCard}  // optional; if you pass it, it’s used
  colors={{ home: gameData?.homeTeamColor, away: gameData?.awayTeamColor }}
  logos={{ home: gameData?.logos?.home, away: gameData?.logos?.away }}
/>

)}

  </div>
) : (
  <div className="h-[65vh] mt-5 overflow-auto w-full px-4">
    <ul className="timeline timeline-vertical">
      {(() => {
        // 1) Combine game actions with local substitutions
        const allActionsRaw = [
          ...(gameData?.gameActions || []),
          ...localSubstitutions
        ];

        // 2) Ensure chronological order (oldest -> newest)
        // If you have timestamps, sort them here. Otherwise we assume they are already chronological.
        const allActionsChrono = [...allActionsRaw];
        // Example (uncomment if you have millis):
        // allActionsChrono.sort((a,b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

        // 3) Decorate with running scores + milestone flags
        const decorated = decorateWithScoresAndMilestones(allActionsChrono, {
          step: 10,
          mode: "leader" // change to "each" to trigger per team independently
        });

        return decorated.length > 0 && (
          <div className="h-full overflow-auto w-full px-4">
            <ul className="timeline timeline-vertical w-full max-w-2xl mx-auto">
              {[...decorated].reverse().map((action, index, array) => {
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

                // 🎯 Filter: show only scores, misses, FT, BLK, TO, STL, substitutions
                const displayType = action.type?.toLowerCase();
                const isScore = action.points;
                const isMiss = displayType?.includes("miss");
                const isBlock = displayType?.includes("block");
                const isTO = displayType?.includes("turnover");
                const isSteal = displayType?.includes("steal");
                const isFT = displayType?.includes("free throw");

                const shouldShow = isScore || isMiss || isBlock || isTO || isSteal || isFT || action.type === "substitution";
                if (!shouldShow) return null;

                // Substitution entry for home team
                if (action.type === "substitution" && action.team === "home") {
                  return (
                    <li key={`${action.timestamp || index}-substitution`} className="w-full">
                      <div
                        style={{ borderRightColor: gameData?.homeTeamColor || '#8B5CF6' }}
                        className="timeline-start border-r-2 timeline-box w-32 bg-secondary-bg border-gray-600 py-3 text-white border shadow-lg rounded-xl flex flex-col px-2 py-2 relative"
                      >
                        <div className="flex flex-col items-start ms-1 gap-0.5">
                          <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                            <svg className="w-3 h-3 text-primary-red" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-4-4m4 4l4-4" />
                            </svg>
                            <span>{action.off?.name}</span>
                            <span className="text-gray-400">({action.off?.number})</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-100 font-semibold">
                            <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V4m0 0l-4 4m4-4l4 4" />
                            </svg>
                            <span>{action.on?.name}</span>
                            <span className="text-gray-400">({action.on?.number})</span>
                          </div>
                        </div>
                      </div>
                      <div className="timeline-middle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                      </div>
                      <hr className="bg-gray-400/40" />
                    </li>
                  );
                }

                return (
                  <React.Fragment key={action.timestamp || index}>
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
                            <div
                              style={{ borderLeftColor: gameData?.homeTeamColor || '#8B5CF6' }}
                              className="timeline-start border-l-2 timeline-box bg-secondary-bg text-white border border-gray-700 w-36"
                            >
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
                                <p className="text-md font-bold" style={{ color: gameData?.homeTeamColor || '#8B5CF6' }}>+{action.points}</p>
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{ borderRightColor: gameData?.awayTeamColor || '#0b63fb' }}
                              className="timeline-end w-36 border-r-2 timeline-box bg-secondary-bg text-white border border-gray-700"
                            >
                              <p className="text-xs text-gray-400 mb-1">{timeLabel}</p>
                              <p className="font-semibold">
                                {playerText} {nameText} + {action.points}
                              </p>
                            </div>
                          )}

                          {/* 🔵 Milestone pill: show when helper says we crossed a 10-point step */}
                          {action._milestone && (
                            <div className="timeline-middle mt-1">
                              <div className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] leading-none shadow-sm backdrop-blur-sm">
                                <span className="font-semibold" style={{ color: gameData?.homeTeamColor || '#8B5CF6' }}>
                                  {action._postHome}
                                </span>
                                <span className="mx-1 text-white/50">-</span>
                                <span className="text-white/70">{action._postAway}</span>
                              </div>
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

                      {/* keep the small dash icon in the center line */}
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
        );
      })()}
    </ul>
  </div>
)
}
{hasPreGame &&

<button
onClick={() => setShowPreGameCard(v => !v)}
// or use toggle: () => setShowPreGameCard(v => !v)
  className={`
    fixed bottom-4 right-4 z-10
    h-12 w-12 rounded-full
    bg-primary-cta hover:bg-primary-cta/90
    text-white shadow-lg shadow-black/30
    flex items-center justify-center
    transition-transform active:scale-95
  `}
  aria-label={showPreGameCard ? "Hide pregame card" : "Show pregame card"}
  title={showPreGameCard ? "Hide pregame card" : "Show pregame card"}
>
  {/* X when open, info icon when closed */}
  {showPreGameCard ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  )}
</button>
}

{/* )} */}
<InGameScoreSheet
  homeScore={gameData?.score?.home ?? 0}
  awayScore={gameData?.score?.away ?? 0}
  quarter={gameData?.quarter ?? 1}
  clock={sheetClock}
  colors={{home:gameData.homeTeamColor,away:gameData.awayTeamColor}}
  logos={{home:gameData?.logos?.home, away:gameData?.logos?.away}}
  
  homeTeamName={homeTeamName || "Home"}
  awayTeamName={awayTeamName || "Away"}
  rows={scoresheetRows}
/>

    </div>
  );
}