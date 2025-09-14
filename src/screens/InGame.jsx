import { useState,useEffect ,useRef,useCallback,useMemo} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faForward,faBackward} from '@fortawesome/free-solid-svg-icons';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import { doc as firestoreDoc, getDoc,setDoc } from "firebase/firestore";
import { getFirestore,  deleteDoc } from "firebase/firestore";
import { db } from "../db";
import { Menu } from '@headlessui/react';
import head1 from '../assets/steph-curry.webp';
import opponentJerseyDefault from '../assets/jersey.webp';
import { motion, AnimatePresence } from "framer-motion";
import ravensLogo from '../assets/logo.jpg';
import { v4 as uuidv4 } from 'uuid';  // Install with: npm install uuid
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { uploadGameToCloud } from "../utils/syncGameToCloud"; // adjust path
import useAuth from "../hooks/useAuth"; // if inside component, otherwise pass user in
import { cleanForFirestore } from "../utils/cleanForFirestore";
import { fetchTeamSettings } from "../utils/fetchTeamSettings";
import { firestore } from "../firebase";
import LineChartScoringQuarter from "./Components/Charts/LineChartScoringQuarter";
import ActionButtons from "./InGameComponents/Components/ActionButtons";
import BottomNav from "./InGameComponents/Components/BottomNav";
import QuarterDiv from "./InGameComponents/Components/TopRowSection/QuarterDiv";
import BroadcastDiv from "./InGameComponents/Components/TopRowSection/BroadcastDiv";
import GameStatsDiv from "./InGameComponents/Components/TopRowSection/GameStatsDiv";
import FilterDiv from "./InGameComponents/Components/TopRowSection/FilterDiv";
import PlayerStatsDiv from "./InGameComponents/Components/TopRowSection/PlayerStats";
import Scoreboard from "./InGameComponents/Components/SecondRowTopSection/Scoreboard";
import OpponentActionButtons from "./InGameComponents/Components/SecondRowTopSection/OpponentActionButtons";
import Court from "./InGameComponents/Components/Court";
import LineoutModal from "./InGameComponents/Modals/LineoutModal";
import ExitModal from "./InGameComponents/Modals/ExitModal"
import GameStatsModal from "./InGameComponents/Modals/GameStatsModal";
import PlayerStatsModal from "./InGameComponents/Modals/PlayerStatsModal";
import BroadcastModal from "./InGameComponents/Modals/BroadcastModal";
import BroadcastInfoModal from "./InGameComponents/Modals/BroadcastInfoModal"
import { doc as firestoreDoc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export default function InGame() {
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentGameActionFilter,setCurrentGameActionFilter] = useState(null);
  const [currentGameActionFilters, setCurrentGameActionFilters] = useState([]);
  const [currentQuater,setCurrentQuarter]=useState(1)
  const [leadChanges,setleadChanges] = useState([])
  const location = useLocation();
const [gameFinsihedFlag,setGameFinsihedFlag] = useState(false)
const savedGame = location.state; // passed from dashboard or startGame
const [broadcast, setBroadcast] = useState(false);
const [slug, setSlug] = useState(null);
const [broadcastLinkName,setBroadcastLinkName] = useState("")
const [playerPoints, setPlayerPoints] = useState({}); // Store player points
const [liveBroadcastGameFinished,setLiveBroadcastGameFinished]= useState(false);
  useEffect(() => {
    if (savedGame && savedGame.id) {
      setCurrentGameId(savedGame.id);
    }
  }, [savedGame]);

  useEffect(() => {
    if (location.state) {
      console.log("🛰️ Broadcast?", broadcast);


      setBroadcast(location.state.broadcast || false);
      setSlug(location.state.slug || null);
      console.log("🔗 Slug:", slug);
      setBroadcastLinkName(location.state.slug)
      // Optionally save to localStorage if you want even more persistence
      localStorage.setItem("broadcast", JSON.stringify(location.state.broadcast || false));
      localStorage.setItem("slug", location.state.slug || "");
    } else {
      // fallback if state is lost (e.g. user refreshed)
      const savedBroadcast = JSON.parse(localStorage.getItem("broadcast") || "false");
      const savedSlug = localStorage.getItem("slug") || null;
  
      setBroadcast(savedBroadcast);
      setSlug(savedSlug);
    }
  }, []);
  const [gameActions, setGameActions] = useState(savedGame?.actions || []); // Use saved game actions if present
  const [actionSelected, setActionSelected] = useState(null); // Tracks selected action
  const [alertMessage, setAlertMessage] = useState(""); // Tracks the alert message
  const [fieldGoal,setFieldGoal] = useState({total:0,made:0});
  const [threepoint,setThreePoint] = useState({total:0,made:0});
  const [fieldGoalPercentage, setFieldGoalPercentage] = useState(0);
  const [showFiltersPlayerStat,setShowFiltersPlayerStat] = useState(true)
  const [threePointPercentage,setThreePointPercentage]=useState(0);
  const [SaveGameBtnText,setSaveGameBtnText]= useState('Save Game')
  const [opponentName, setOpponentName] = useState(savedGame?.opponentName || "New Game");
  const [isBroadcasting,setIsBroadcasting] = useState(savedGame?.broadcast || false);
  const [opponentLogo, setOpponentLogo] = useState(savedGame?.opponentLogo || null);
  const [minutesTracked, utesTracked] = useState(savedGame?.minutesTracked || null);
const [selectedVenue, setSelectedVenue] = useState(savedGame?.selectedVenue || "nahh");
const passedLineout = savedGame && savedGame.lineout ? savedGame.lineout : null;
const [currentGameId, setCurrentGameId] = useState(null);
const [dropdownOpen, setDropdownOpen] = useState(false);
const [gameStatsExpanded,setGameStatsExpanded] = useState(false);
const [showEditOpponentScoreModal,setShowEditOpponentScoreModal] = useState(false);
const [teamScore, setTeamScore] = useState(0);
const quarters = [1, 2, 3, 4];
const quartersNew = ["Q1", "Q2", "Q3", "Q4"];
const [selectedQuarter, setSelectedQuarter] = useState("All");
const availableQuarters = [...new Set(leadChanges.map((lead) => lead.q))].sort((a, b) => a - b);
const [prevTeamScore, setPrevTeamScore] = useState(teamScore);
const [teamName, setTeamName] = useState(null);
const [teamImage,setTeamImage] = useState("");
const [teamScoreChange, setTeamScoreChange] = useState(0);
const [opponentScoreChange, setOpponentScoreChange] = useState(0);
const [opponentActions, setOpponentActions] = useState(savedGame?.opponentActions || []);
const [minutes, setMinutes] = useState(savedGame?.quarterTimes?.[savedGame?.lastVisitedQuarter || 1]?.minutes || 10);
const [seconds, setSeconds] = useState(savedGame?.quarterTimes?.[savedGame?.lastVisitedQuarter || 1]?.seconds || 0);
const minutesRef = useRef(minutes);
const secondsRef = useRef(seconds);
const [isRunning, setIsRunning] = useState(false);
const intervalRef = useRef(null); // To keep track of interval
const [showTimeModal, setShowTimeModal] = useState(false);
const [onCourtPlayers, setOnCourtPlayers] = useState([]);
const onCourtPlayersRef = useRef(onCourtPlayers);
const [showBroadcastModal,setShowBroadcastModal] = useState(savedGame?.broadcast || false)
const [showLineoutModal, setShowLineoutModal] = useState(false);
const [playerMinutes, setPlayerMinutes] = useState(savedGame?.playerMinutes || {});
const [hasFirstMinutePassed, setHasFirstMinutePassed] = useState(false);
const [broadcastUpdateSentFlag,setBroadcastUpdateSentFlag] = useState(false)
const [showBroadcastInformationModal,setShowBroadcastInformationModal] = useState(savedGame?.broadcast || false);
const broadcastLink = `${window.location.origin}/liveGames/${slug}`;
const [lastVisitedQuarter, setLastVisitedQuarter] = useState(savedGame?.lastVisitedQuarter || 1); 
// At the top of your component or file
const nowPlus48 = new Date(Date.now() + 48 * 60 * 60 * 1000);
const defaultDate = nowPlus48.toISOString().split('T')[0]; // "YYYY-MM-DD"
const defaultTime = new Date().toTimeString().slice(0, 5);  // "HH:MM"
const [selectedDate, setSelectedDate] = useState(defaultDate);
const [selectedTime, setSelectedTime] = useState(defaultTime);
const [isMobile, setIsMobile] = useState(false);
const [awayLineout, setAwayLineout] = useState(savedGame?.awayLineout || null);
const [quarterTimes, setQuarterTimes] = useState(savedGame?.quarterTimes || {
  1: { minutes: 10, seconds: 0 },
  2: { minutes: 10, seconds: 0 },
  3: { minutes: 10, seconds: 0 },
  4: { minutes: 10, seconds: 0 },
});
const [broadcastUpdate,setBroadcastUpdate]= useState(null);
const broadcastUpdatesText=[
  "Waiting Start",
  "Waiting QTR Start",
  "Timeout",
  "Quarter End",
  "Half Time",
  "Stoppage",
  "🔥Overtime🔥",
  "🔥 2nd OT 🔥",
  "🔥 3rd OT 🔥",
]


const locationGameState = location.state || {};
const [homeTeamName, setHomeTeamName] = useState("Home");
// Add state for awayTeamColor
const [awayTeamColor, setAwayTeamColor] = useState(savedGame?.awayTeamColor || "#0b63fb");
const [leagueId, setLeagueId] = useState(savedGame?.leagueId || "");
const [leagueName, setLeagueName] = useState(savedGame?.leagueName || "");
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768); // 768px is typical mobile breakpoint
  };
  
  // Check on initial load
  checkMobile();
  
  // Add resize listener
  window.addEventListener("resize", checkMobile);
  
  // Cleanup listener on unmount
  return () => window.removeEventListener("resize", checkMobile);
}, []);
// Ensure leagueId and leagueName are always set from navigation state or savedGame
useEffect(() => {
  let id = "";
  let name = "";
  if (location.state) {
    id = location.state.leagueId || "";
    name = location.state.leagueName || "";
  } else if (savedGame) {
    id = savedGame.leagueId || "";
    name = savedGame.leagueName || "";
  }
  // If only one is set, use it for both
  if (id && !name) name = id;
  if (name && !id) id = name;
  setLeagueId(id);
  setLeagueName(name);
  console.log('Setting leagueId:', id, 'leagueName:', name);
}, [location.state, savedGame]);

useEffect(() => {
  const loadTeamSettings = async () => {
    const settings = await fetchTeamSettings(user);
    if (settings?.teamImage) {
      setTeamImage(settings.teamImage); // ✅ local state
    }
  };
  loadTeamSettings();
}, [user]);

useEffect(() => {
  const initTeamName = async () => {
    // 🧠 1. Check if game was opened (location.state is empty) — use savedGame instead
    if (locationGameState.homeTeamName) {
      setHomeTeamName(locationGameState.homeTeamName);
      return;
    }

    // 🧠 2. If game is already saved and has homeTeamName
    if (savedGame?.homeTeamName) {
      setHomeTeamName(savedGame.homeTeamName);
      return;
    }

    // 🧠 3. Fallback: load from settings
    try {
      let name = null;
      if (user) {
        const ref = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          name = snap.data().teamName;
        }
      } else {
        const localSettings = await db.settings.get("preferences");
        name = localSettings?.teamName;
      }

      setHomeTeamName(name || "Home");
    } catch (err) {
      console.error("Error loading team name:", err);
      setHomeTeamName("Home");
    }
  };

  initTeamName();
}, [user, savedGame, locationGameState]);
const opponentScore = gameActions
  .filter(a => a.type === 'score' && a.team === 'away')
  .reduce((sum, a) => sum + a.points, 0);
  const [prevOpponentScore, setPrevOpponentScore] = useState(opponentScore);
useEffect(() => {
  minutesRef.current = minutes;
}, [minutes]);

useEffect(() => {
  secondsRef.current = seconds;
}, [seconds]);
const handleSaveAwayLineout = (lineoutData) => {
  console.log("🔍 Saving away lineout data:", lineoutData); // ADD THIS
  setAwayLineout(lineoutData);
  setAlertMessage("Opponent lineout saved!");
  setTimeout(() => setAlertMessage(""), 3000);
  
  setTimeout(() => {
    handleSaveGame();
  }, 500);
};
// Filter lead changes based on selected quarter
const filteredLeadChanges =
  selectedQuarter === "All"
    ? leadChanges.slice().reverse()
    : leadChanges
        .slice()
        .reverse()
        .filter((lead) => lead.q === parseInt(String(selectedQuarter).replace("Q", "")
      ));
      const latestLeadChange = filteredLeadChanges.find(lead => lead.team === homeTeamName);

useEffect(() => {
  const totalPoints = gameActions.reduce((sum, action) => {
    if (["2 Points", "3 Points", "FT Score"].includes(action.actionName)) {
      return sum + (action.actionName === "2 Points" ? 2 : action.actionName === "3 Points" ? 3 : 1);
    }
    return sum;
  }, 0);
  
  setTeamScore(totalPoints);
}, [gameActions]); // Recalculate when `gameActions` change


const updateLiveClock = async () => {
  console.log('updaiting da clock haii');
  
  console.log('⏱️ Clock Minutes Left:', minutesRef.current);

  if (broadcast && slug) {
    await setDoc(firestoreDoc(firestore, "liveGameClocks", slug), {
      currentQuarter: currentQuater,
      minutesLeft: minutesRef.current,
      secondsLeft: secondsRef.current,
      lastUpdated: new Date(),
    }, { merge: true });
  }
};
const previousMinuteRef = useRef(minutes);
// useeffect for the clock timer
useEffect(() => {
  if (isRunning) {
    intervalRef.current = setInterval(() => {
      if (secondsRef.current === 0) {
        if (minutesRef.current === 0) {


          console.log("Clock hit 0:00"); // ✅ Log when timer hits 0:00


          setAlertMessage('finished ' + currentQuater);
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          setTimeout(() => setAlertMessage(""), 3000);
      updateLiveClock()
   
        } else {
          setMinutes(prev => prev - 1);
          minutesRef.current = minutesRef.current - 1;

          if (hasFirstMinutePassed) {
            updatePlayerMinutes();
          } else {
            setHasFirstMinutePassed(true);
          }

          setSeconds(59);
          secondsRef.current = 59;

          if (minutesRef.current !== previousMinuteRef.current) {
            previousMinuteRef.current = minutesRef.current;
            updateLiveClock();
          }
        }
      } else {
        setSeconds(prev => prev - 1);
        secondsRef.current = secondsRef.current - 1;
      }
    }, 1000);
  } else {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  return () => clearInterval(intervalRef.current);
}, [isRunning, hasFirstMinutePassed]);

useEffect(() => {
  const fetchTeamName = async () => {
    let name = null;

    try {
      if (user) {
        const ref = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          name = snap.data()?.teamName;
        }
      } else {
        const localSettings = await db.settings.get("preferences");
        name = localSettings?.teamName;
      }
    } catch (err) {
      console.error("Error fetching team name:", err);
    }

    setTeamName(name || "Opponent");
    console.log("🏀 Team Name:", name || "Opponent");
  };

  fetchTeamName();
}, [user]);

const updatePlayerMinutes = () => {
  onCourtPlayersRef.current.forEach(playerNumber => {
    setPlayerMinutes(prev => ({
      ...prev,
      [playerNumber]: (prev[playerNumber] || 0) + 1
    }));
  });
};

const extractPlayerNumber = (playerString) => {
  const match = playerString.match(/\((\d+)\)/);
  return match ? match[1] : null; // returns the number as string (e.g., "2")
};
//? use effect for counting minutes for players 
//4 overtimes added
const calculateQuarterScores = () => {
  const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 , 6: 0 , 7: 0 , 8: 0 }; // ✅ Add OT1 (Q5)

  gameActions.forEach((action) => {
    if (["2 Points", "3 Points", "FT Score"].includes(action.actionName)) {
      const points =
        action.actionName === "FT Score" ? 1 :
        action.actionName === "2 Points" ? 2 :
        3;
      scores[action.quarter] += points; // ✅ Ensure Q5 is updated
    }
  });

  return scores;
};

useEffect(() => {
  setQuarterScores(calculateQuarterScores());
}, [gameActions]);



// Use this function in state:
const [quarterScores, setQuarterScores] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });

// Update scores whenever gameActions change
useEffect(() => {
  setQuarterScores(calculateQuarterScores());
}, [gameActions]); 

// this is the start of the testing of the new db (glhf)
// Function to save a game

// this is the function to track leadchanges to add a new lradchange
const addNewLeadChange = async (q, team, score) => {
  const newLeadChanges = [...leadChanges, { q, team, score }];
  setleadChanges(newLeadChanges);

  try {
    if (currentGameId) {
      await db.games.update(currentGameId, { leadChanges: newLeadChanges });
      console.log("Lead Changes updated in DB:", newLeadChanges);
    }
  } catch (error) {
    console.error("Error updating lead changes:", error);
  }
};

const [prevScore, setPrevScore] = useState(teamScore);
  const [scoreChange, setScoreChange] = useState(0);
// this is the useeffect for updating the leadvchange history 
useEffect(() => {
  if (leadChanges.length === 0) {
    // If no lead change has been recorded yet, add the first one
    if (opponentScore > teamScore) {
      addNewLeadChange(currentQuater, opponentName, `${teamScore}-${opponentScore}`);
    } else if (teamScore > opponentScore) {
      addNewLeadChange(currentQuater, homeTeamName, `${teamScore}-${opponentScore}`);
    } else {
      addNewLeadChange(currentQuater, "Draw", `${teamScore}-${opponentScore}`);
    }
  } else {
    // Get the last recorded lead change
    const lastLeadChange = leadChanges[leadChanges.length - 1];

    if (opponentScore > teamScore && lastLeadChange.team !== opponentName) {
      addNewLeadChange(currentQuater, opponentName, `${teamScore}-${opponentScore}`);
    } else if (teamScore > opponentScore && lastLeadChange.team !== homeTeamName) {
      addNewLeadChange(currentQuater, homeTeamName, `${teamScore}-${opponentScore}`);
    } else if (teamScore === opponentScore && lastLeadChange.team !== "Draw") {
      addNewLeadChange(currentQuater, "Draw", `${teamScore}-${opponentScore}`);
    }
  }

  console.log("useEffect updated for lead history");
}, [teamScore, opponentScore]);

// this is the end of the testing of the db
const [showPlayerModal, setShowPlayerModal] = useState(false);
const [pendingAction, setPendingAction] = useState(null);
const [isGameSaved, setIsGameSaved] = useState(false);
const [showExitModal, setShowExitModal] = useState(false);
const [showGameStatsModal, setShowGameStatsModal] = useState(false);
const [showPlayerStatsModal, setShowPlayerStatsModal] = useState(false);

// Compute overall stats for display in the modal header
// Compute overall stats from gameActions:
const blocks = gameActions.filter(action => action.actionName === "Block").length;
const asists = gameActions.filter(action => action.actionName === "Assist").length;
const offRebounds = gameActions.filter(action => action.actionName === "OffRebound").length;
const rebounds = gameActions.filter(action => 
  action.actionName === "Rebound" || action.actionName === "OffRebound"
).length;

const turnovers = gameActions.filter(action => action.actionName === "T/O").length;
const steals = gameActions.filter(action => action.actionName === "Steal").length;

// Field Goal: count both 2pt and 3pt attempts and makes.
const fgAttempts = gameActions.filter(a =>
  ["2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(a.actionName)
).length;
const fgMade = gameActions.filter(a =>
  ["2 Points", "3 Points"].includes(a.actionName)
).length;
const fgPercentage = fgAttempts ? Math.round((fgMade / fgAttempts) * 100) : 0;

// 3-Point: only count 3pt attempts/makes
const threePtAttempts = gameActions.filter(a =>
  ["3 Points", "3Pt Miss"].includes(a.actionName)
).length;
const threePtMade = gameActions.filter(a =>
  a.actionName === "3 Points"
).length;
const threePtPercentage = threePtAttempts ? Math.round((threePtMade / threePtAttempts) * 100) : 0;

// Free Throws (same as before)
const ftAttempts = gameActions.filter(a =>
  ["FT Score", "FT Miss"].includes(a.actionName)
).length;
const ftMade = gameActions.filter(a =>
  a.actionName === "FT Score"
).length;
const ftPercentage = ftAttempts ? Math.round((ftMade / ftAttempts) * 100) : 0;

const playersStats = gameActions.reduce((acc, action) => {
  // Only include actions with an assigned player
  if (!action.playerName) return acc;

  // Use a unique key for each player (e.g. "James Bellew (10)")
  const key = `(${action.playerNumber}) ${action.playerName} `;
  if (!acc[key]) {
    acc[key] = {
      player: key,
      fgMade: 0,
      fgAttempts: 0,
      threePtMade: 0,
      threePtAttempts: 0,
      ftMade: 0,
      ftAttempts: 0,
      steals: 0,
      assists: 0,
      rebounds: 0,
      offRebounds: 0,
      turnovers: 0,
      blocks: 0,
    };
  }

  // Count FG attempts and makes (includes both 2PT and 3PT)
  if (["2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(action.actionName)) {
    acc[key].fgAttempts += 1;
    if (["2 Points", "3 Points"].includes(action.actionName)) {
      acc[key].fgMade += 1;
    }
  }

  // Count 3PT attempts and makes (only count 3PT actions)
  if (["3 Points", "3Pt Miss"].includes(action.actionName)) {
    acc[key].threePtAttempts += 1;
    if (action.actionName === "3 Points") {
      acc[key].threePtMade += 1;
    }
  }

  // Count free throw attempts and makes
  if (["FT Score", "FT Miss"].includes(action.actionName)) {
    acc[key].ftAttempts += 1;
    if (action.actionName === "FT Score") {
      acc[key].ftMade += 1;
    }
  }

  // Count other actions
  if (action.actionName === "Assist") acc[key].assists += 1;
  if (action.actionName === "Steal") acc[key].steals += 1;
  if (action.actionName === "T/O") acc[key].turnovers += 1;
  if (action.actionName === "Rebound") acc[key].rebounds += 1;
  if (action.actionName === "OffRebound") {
    acc[key].offRebounds += 1;
    acc[key].rebounds += 1;  // Automatically count it as a general rebound too
  }
  if (action.actionName === "Block") acc[key].blocks += 1;

  return acc;
}, {});
const customTheme = {
  axis: {
    ticks: {
      text: { fill: "#FFFFFF" } // X and Y axis text
    },
    legend: {
      text: { fill: "#FFFFFF" } // Axis legend text
    }
  },
  grid: {
    line: {
      stroke: "#262626",
      strokeWidth: 1
    }
  },
  labels: {
    text: {
      fill: "#ffffff", // White text
      fontSize: 14,
      fontWeight: "bold",
    },
  },
  tooltip: {
    container: {
      background: "#222",
      color: "#fff",
      fontSize: "14px",
      borderRadius: "5px",
      padding: "8px"
    }
  }
};


const playersStatsArray = Object.values(playersStats);
//preventing accidental refreshing
useEffect(() => {
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // Some browsers require this for the warning to show
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);



useEffect(() => {
  if (opponentName && gameActions.length > 0) {
    // Auto-save every 10 seconds
    const autoSaveTimer = setTimeout(() => {
      handleSaveGame('auto-save');  // Now it updates, no duplicate games!
      console.log("Auto-saved game!");
    }, 10000);

    return () => clearTimeout(autoSaveTimer);
  }
  //update the last visited quarter
  setLastVisitedQuarter(currentQuater);

}, [gameActions, opponentName]);


const updateLiveBroadcast = async () => {
  console.log('haliiiii  bruhh');
  
  if (!broadcast || !slug) return;
  
  const resolvedVenue = selectedVenue === "away"
    ? opponentName || "Home"
    : homeTeamName || "Home";
  console.log(selectedVenue,' is he him');

  // Debug the league values
  console.log('🏀 League Debug - leagueId:', leagueId, 'leagueName:', leagueName);
  
  // Ensure we have proper league values
  const finalLeagueId = leagueId && leagueId.trim() !== "" ? leagueId : "Ireland";
  const finalLeagueName = leagueName && leagueName.trim() !== "" ? leagueName : "Basketball Ireland Development League (BIDL) - Men's";
  
  console.log('🏀 Final League Values - id:', finalLeagueId, 'name:', finalLeagueName);

  // --- NEW: Map gameActions to include x/y for home team actions ---
  const mappedGameActions = gameActions.map(action => {
    if (action.team === 'home' && typeof action.x === 'number' && typeof action.y === 'number') {
      return { ...action, x: action.x, y: action.y };
    }
    return action;
  });

  try {
    // Structure the data to match your Firestore schema
    const liveGameData = {
      gameState: liveBroadcastGameFinished,
      teamNames: {
        home: homeTeamName,
        away: opponentName
      },
      logos: {
        home: teamImage,       // Your local variable or image URL
        away: opponentLogo     // Your local variable or image URL
      },
      leadChanges:leadChanges,
      scheduledStart: {
        date: selectedDate,
        time: selectedTime
      },
  
      awayLineout: awayLineout,
      lineout: passedLineout,
      onCourtPlayers: onCourtPlayers,
      stats: {
        fieldGoalPct: fgPercentage,
        fieldGoalMade: fgMade,
        fieldGoalMissed: (fgAttempts - fgMade),
        
        threePointPct: threePtPercentage,
        threePointMade: threePtMade,
        threePointMissed: (threePtAttempts - threePtMade),
        
        freeThrowPct: ftPercentage,
        freeThrowMade: ftMade,
        freeThrowMissed: (ftAttempts - ftMade),
        
        blocks: blocks,
        steals: steals,
        turnovers: turnovers,
      },
      venue: selectedVenue,
      link: broadcastLink,
      score: {
        home: teamScore,
        away: opponentScore,
      },
      quarter: currentQuater,
      gameActions: mappedGameActions,
      lastUpdated: new Date(),
      
      // Structure league data to match your Firestore schema
      league: {
        id: finalLeagueId,
        name: finalLeagueName
      },
      
      // You might also want to include these for backward compatibility
      leagueId: finalLeagueId,
      leagueName: finalLeagueName,
       opponentGroup: savedGame?.opponentGroup || null,
      // Additional fields that might be useful
      homeTeamColor: "#6366F1", // Your team color
      awayTeamColor: awayTeamColor,
      createdAt: new Date(),
      isLive: true
    };

    await setDoc(
      firestoreDoc(firestore, "liveGames", slug),
      liveGameData,
      { merge: true }
    );
    
    console.log("📡 Live broadcast updated:", slug);
    console.log("📡 League data saved:", { id: finalLeagueId, name: finalLeagueName });
  } catch (err) {
    console.error("❌ Error updating live game broadcast:", err);
  }
};

const updateOpponentScore = async (points) => {
  const newAction = {
    type: 'score',
    team: 'away',
    points,
    quarter: currentQuater,
    timestamp: Date.now()
  };

  const updatedGameActions = [...gameActions, newAction];
  setGameActions(updatedGameActions); // 🔥 This will trigger re-renders + animations

  try {
    await db.games.update(currentGameId, {
      gameActions: updatedGameActions,
    });

    console.log("✅ Opponent action saved via gameActions:", newAction);
    handleSaveGame(); // Optional: only call if auto-saving now
  } catch (error) {
    console.error("❌ Error updating opponent score:", error);
  }
};
const updateOpponentAction = async (actionType) => {
  const newAction = {
    type: 'action',
    team: 'away',
    actionType, // 'turnover', 'steal', 'block', etc.
    quarter: currentQuater,
    timestamp: Date.now()
  };

  const updatedGameActions = [...gameActions, newAction];
  setGameActions(updatedGameActions); // 🔥 This will trigger re-renders + animations

  try {
    await db.games.update(currentGameId, {
      gameActions: updatedGameActions,
    });

    console.log("✅ Opponent action saved via gameActions:", newAction);
    handleSaveGame(); // Optional: only call if auto-saving now
  } catch (error) {
    console.error("❌ Error updating opponent action:", error);
  }
};
const  handlebroadcastUpdate=async(isFinished = gameFinsihedFlag)=>{
    await setDoc(firestoreDoc(firestore, "liveGameupdates", slug), {
    gameFinsihedFlag:gameFinsihedFlag,
    message: broadcastUpdate,
    cleared: false,
    update: true,
    timestamp: new Date(),
  }, { merge: true });
   setShowBroadcastModal(false)
  setBroadcastUpdateSentFlag(true)

}
const handleFinishGame = async (slug) => {
    //checking to see if there is a valid gamelink 
    if(broadcastLinkName.length >=1){
     
      console.log(broadcastLinkName);
    }else{
      console.log('we have a problem with the broadcastlink name ');
    }
      const confirmFinish = window.confirm(
        "Are you sure you want to finish this game?\n\nThis action cannot be undone and the live broadcast will be removed."
      );
      if (!confirmFinish){ console.log('nononononono');
       return;
      }
      try {
        console.log('we in this bitchhhhaa');
        setLiveBroadcastGameFinished(true)
        // const db = getFirestore();
        // await deleteDoc(firestoreDoc(db, "liveGames", slug));
        // console.log("Live game removed successfully.");
        // setBroadcast(false)
        handleSaveGame('wee small update')
        // navigate("/homedashboard")
        // Optional: show a success toast or navigate somewhere
      } catch (error) {
        console.error("Error removing live game:", error);
        // Optional: show error feedback
      }
  


};







const handleResumeGame = async (slug) =>{
if(broadcastLinkName.length >=1){
}else{
  console.log('we have a problem with the broadcastlink name ');
}
  const confirmResume = window.confirm(
    "Are you sure you want to Resume this game?\n\n."
  );
  if (!confirmResume) return;
setLiveBroadcastGameFinished(false)
handleSaveGame('game Resumed ! auto save');
}

const handleBroadcastUpdateClear=async()=>{
  await setDoc(firestoreDoc(firestore, "liveGameupdates", slug), {
    cleared: true,
    update: false,
    message: null, // <-- better than "" for clearing
    timestamp: new Date(),
  }, { merge: true });
  
  setBroadcastUpdateSentFlag(false)
  setBroadcastUpdate("")
}
  const handleGameAction = (action) => {
    if (!actionSelected) {
      setAlertMessage("Please select an action before plotting!");
      setTimeout(() => setAlertMessage(""), 3000);
      return;
    }
  
    const newAction = {
      quarter: currentQuater,
      actionName: action,
      timestamp: Date.now(),
    };
  
    setGameActions((prev) => [...prev, newAction]);
    setAlertMessage(`${action} recorded.`);
  
    // **If the action is an Offensive Rebound, also record a general Rebound**
    if (action === "OffRebound") {
      const reboundAction = {
        quarter: currentQuater,
        actionName: "Rebound",
        timestamp: Date.now(),
      };
      setGameActions((prev) => [...prev, reboundAction]);
      setAlertMessage(`Offensive Rebound and Rebound recorded.`);
    }
  
    setTimeout(() => setAlertMessage(""), 3000);
  };
  
  const handlePlayerSelection = (player) => {
    if (!pendingAction) return;
  
    const actionName = pendingAction.actionName;
  
    // Determine how many points this action is worth
    let points = 0;
    if (actionName === "2 Points") points = 2;
    if (actionName === "3 Points") points = 3;
    if (actionName === "FT Score") points = 1;
  
    const newAction = {
      ...pendingAction,
      playerName: player.name,
      playerNumber: player.number,
      points,
      team: 'home',           // ✅ add this
      type: 'score',          // ✅ add this
      timestamp: Date.now(),
    };
  
    setGameActions((prev) => [...prev, newAction]);
  
    setPlayerPoints((prevPoints) => ({
      ...prevPoints,
      [player.name]: (prevPoints[player.name] || 0) + points,
    }));
  
    setShowPlayerModal(false);
    setPendingAction(null);
    setAlertMessage(`${actionName} recorded for ${player.name}!`);
    setTimeout(() => setAlertMessage(""), 3000);
  };

//hanlder for going to next period/quarter
const handleNextPeriodClick = () => {
  // Save current quarter time before moving
  setQuarterTimes(prev => ({
    ...prev,
    [currentQuater]: { minutes, seconds },
  }));

  const nextQuarter = currentQuater + 1;

  // Restore if previously visited
  const storedTime = quarterTimes[nextQuarter];
  if (storedTime) {
    setMinutes(storedTime.minutes);
    setSeconds(storedTime.seconds);
  } else {
    setMinutes(10);
    setSeconds(0);
  }

  setCurrentQuarter(nextQuarter);

  setActionSelected();

  if (currentQuater === 3) {
    console.log('Change text to Finish Game');
  }

  setAlertMessage(`Finished Q${currentQuater} !`);
  setTimeout(() => setAlertMessage(""), 3000);
};

// handler for going back a quarter
const handlePreviousPeriodClick = () => {
  if (currentQuater > 1) {

    // ✅ First: Save current quarter's clock time before leaving!
    setQuarterTimes(prev => ({
      ...prev,
      [currentQuater]: { minutes, seconds },
    }));

    const prevQuarter = currentQuater - 1;

    // ✅ Restore clock to whatever was saved for previous quarter
    const storedTime = quarterTimes[prevQuarter];
    if (storedTime) {
      setMinutes(storedTime.minutes);
      setSeconds(storedTime.seconds);
    } else {
      // Default fallback (unlikely)
      setMinutes(10);
      setSeconds(0);
    }

    setCurrentQuarter(prevQuarter);

    setAlertMessage(`Back to Q${prevQuarter} !`);
    setTimeout(() => setAlertMessage(""), 3000);
  } else {
    console.log('we have issue');
  }
};
const BroadcastLinkCopyHandler = (link)=>{
  if (!navigator.clipboard) {
    console.warn("Clipboard API not available");
    return;
  }
  navigator.clipboard.writeText(link)
    .then(() => {
      console.log("Copied to clipboard:", link);
      // Optionally show success toast or feedback
      setAlertMessage("Copied to Clipboard!");
      setTimeout(() => setAlertMessage(""), 2000);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      setAlertMessage("Failed to copy:", err);
      setTimeout(() => setAlertMessage(""), 2000);
    });
  
}
const handleUndoLastActionHandler = () => {
  if (gameActions.length === 0) {
    setAlertMessage("No actions to undo!");
    setTimeout(() => setAlertMessage(""), 2000);
    return;
  }

  // Get the most recent action
  const lastAction = gameActions[gameActions.length - 1];

  // Check if the most recent action is in the current quarter
  if (lastAction.quarter !== currentQuater) {
    setAlertMessage(
      `Cannot undo! Last action is in Q${lastAction.quarter}.`
    );
    setTimeout(() => setAlertMessage(""), 3000);
    return;
  }

  // Remove the most recent action
  setGameActions((prevActions) => prevActions.slice(0, -1));

  // Show an alert message
  setAlertMessage("Last action undone!");
  setTimeout(() => setAlertMessage(""), 3000);
};

const fetchOpponentGameActions = async () => {
  try {
    console.log("Fetching opponent actions for game ID:", currentGameId);
    const gameData = await db.games.get(currentGameId);
    console.log("Fetched game data:", gameData);
    if(savedGame?.lastVisitedQuarter){

      setCurrentQuarter(lastVisitedQuarter)
      console.log('yaaa brah');
      console.log('we want to make the current quarter ', lastVisitedQuarter);
      
      
    }else{
      console.log('nahh brahh');
      
    }
    // Check for both potential property names
    if (gameData) {
      if (gameData.opponentActions && gameData.opponentActions.length > 0) {
        console.log("Found opponentActions:", gameData.opponentActions);
        setOpponentActions(gameData.opponentActions);
      } else if (gameData.opponentGameActions && gameData.opponentGameActions.length > 0) {
        console.log("Found opponentGameActions:", gameData.opponentGameActions);
        setOpponentActions(gameData.opponentGameActions);
        
        // Optionally migrate the data to the correct property name
        try {
          await db.games.update(currentGameId, {
            opponentActions: gameData.opponentGameActions
          });
          console.log("Migrated opponentGameActions to opponentActions");
        } catch (migrationError) {
          console.error("Error migrating actions:", migrationError);
        }
      } else {
        console.log("No opponent actions found in game data");
        // Don't reset if we already have data loaded - only set empty for new games
        if (opponentActions.length === 0) {
          setOpponentActions([]);
        } else {
          console.log("Keeping existing opponent actions:", opponentActions);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching opponent game actions:", error);
  }
};
useEffect(() => {
  if (currentGameId) {
    fetchOpponentGameActions();
  }
}, [currentGameId]);

const handleSaveGame = async () => {
  const trackingMinutes = minutesTracked !== null;
  const trackingPlayers = gameActions.some(action => action.playerName);

  console.log("🔍 awayLineout state when saving:", awayLineout); 
  setLastVisitedQuarter(currentQuater)
  setQuarterTimes(prev => ({
    ...prev,
    [currentQuater]: { minutes, seconds },
  }));
  //* We may want to uncomment this back in for safety
// console.log("what the fuck is going on")
//   if (gameActions.length === 0 && opponentActions.length === 0 && broadcastUpdate === null) {
//     setAlertMessage("No actions to save!");
//     console.log("No Actions to save");
    
//     setTimeout(() => setAlertMessage(""), 2000);
//     return;
//   }

  let gameId = currentGameId;

  if (!gameId && savedGame?.id) {
    gameId = savedGame.id;
  } else if (!gameId) {
    const existing = await db.games.where({ opponentName, selectedVenue }).first();
    if (existing) {
      gameId = existing.id;
    } else {
      gameId = `game_${opponentName}_${Date.now()}`;
    }
  }

  const gameData = {
    id: gameId,
    opponentName,
    venue: selectedVenue,
    actions: gameActions,
    awayLineout: awayLineout,  
    opponentActions,
    leadChanges,
    lineout: savedGame?.lineout || passedLineout,
    minutesTracked,
    trackingMinutes,
    trackingPlayers,
    lastVisitedQuarter:lastVisitedQuarter,
    playerMinutes,
    quarterTimes,
    timestamp: new Date().toISOString(),
  
    opponentLogo,
    score: {
      home: teamScore,
      opponent: opponentScore,
    },
    homeTeamName,
    userId: user ? user.uid : null,
    synced: !!user,
    broadcast,
    slug,
    awayTeamColor, // <-- Save the away team color
    leagueId,
    leagueName,
    opponentGroup: savedGame?.opponentGroup || null,
  };

  try {
    if (user) {
  console.log("🔍 Original gameData.awayLineout:", gameData.awayLineout);
    const cleaned = cleanForFirestore(gameData);
    console.log("🔍 Cleaned data.awayLineout:", cleaned.awayLineout);
    console.log("🔍 Cleaned data keys:", Object.keys(cleaned));
    
    const docRef = firestoreDoc(firestore, "users", user.uid, "games", gameId);
    await setDoc(docRef, cleaned);
    console.log("✅ Game synced to Firestore!");
    } else {
      const existingGame = await db.games.get(gameId);
      if (existingGame) {
        await db.games.update(gameId, gameData);
        console.log("📝 Game updated locally:", gameData);
      } else {
        await db.games.put(gameData);
        console.log("🆕 New game saved locally:", gameData);
      }
    }

    await updateLiveBroadcast(); // ✅ Externalized live sync

    setAlertMessage("Game saved successfully!");
    setIsGameSaved(true);
    setCurrentGameId(gameId);
  } catch (error) {
    console.error("❌ Error saving game:", error);
    setAlertMessage("Error saving game. Please try again.");
  }

  setTimeout(() => setAlertMessage(""), 3000);


console.log('we just saved the modafukin game');


};

// this is the use effect for chekcing if its a loaded saved game andif so then set all the usestates to saved data, if not it is a new game 
useEffect(() => {
  const loadFinishedFlagIfNeeded = async () => {
    console.log('🙈🙈🙈🙈🙈 WE RE IN THE LOAD FUNCTION🙈🙈🙈🙈🙈🙈');
    if (savedGame && savedGame.id) {
      console.log('🙈🙈🙈🙈🙈🙈 WE ARE IN THE SAVED GAME LOOP');
      
      setCurrentGameId(savedGame.id);
      setOpponentActions(savedGame.opponentActions || []);
      setleadChanges(savedGame.leadChanges || []);
      setOpponentLogo(savedGame.opponentLogo || null);
      setSelectedVenue(savedGame.selectedVenue || "fuck");
      // setMinutesTracked(savedGame.minutesTracked || null);
//       setPlayerMinutes(savedGame.playerMinutes || {});
//       setSelectedVenue(savedGame.selectedVenue);
// console.log('🙈🙈🙈🙈yep venue', selectedVenue);

      // if (savedGame.selectedVenue) {
      //   console.log('🙈🙈🙈🙈yep thats me 🙈');
      //   setSelectedVenue(savedGame.selectedVenue);
      // } else {
      //   setSelectedVenue("Homeddd"); // Fallback just in case
      // }
      
      if (savedGame.quarterTimes) {
        setQuarterTimes(savedGame.quarterTimes);

        const q1Time = savedGame.quarterTimes[1];
        if (q1Time) {
          setMinutes(q1Time.minutes);
          setSeconds(q1Time.seconds);
        }
      } else {
        setMinutes(10);
        setSeconds(0);
      }

      console.log("Loaded saved game: 🙈🙈🙈🙈🙈🙈🙈🙈🙈🙈🙈🙈🙈🙈🙈🙈🙈🙈", savedGame);

      // 🧠 Only fetch if broadcast slug is set
      const gameSlug = savedGame.slug;
      console.log();
      
      if (gameSlug) {
        console.log('we in the slug');
        
        try {
          const updatesDoc = await getDoc(firestoreDoc(firestore, "liveGameupdates", gameSlug));
          if (updatesDoc.exists()) {
            const updateData = updatesDoc.data();
            if (updateData.gameFinsihedFlag) {
              setGameFinsihedFlag(true);
              console.log("✅ Game finished flag found:", updateData.gameFinsihedFlag);
            }
            if(updateData.message){
              setBroadcastUpdate(updateData.message)
              console.log("🐒 we have some broadcast update", updateData.message);
              
            }else{
              setBroadcastUpdate(null)
console.log('no update 😭');

            }
          }
        } catch (err) {
          console.error("Error fetching broadcast update:", err);
        }
      }else{
        console.log('no slug found for saved game');
        
      }

    } else {
      console.log("Starting a new game.");
    }
  };

   loadFinishedFlagIfNeeded();
}, [savedGame]);

useEffect(() => {
  if (savedGame && savedGame.id) {
    setCurrentGameId(savedGame.id);
  }
}, [savedGame]);

const handleFilterSelection = (filter) => {
  setCurrentGameActionFilters((prevFilters) => {
    // Toggle filter on/off
    if (prevFilters.includes(filter)) {
      return prevFilters.filter((f) => f !== filter); // Remove filter if already selected
    } else {
      return [...prevFilters, filter]; // Add new filter
    }
  });
};

// Handle click on the court
// Render actions on the court
const handleCourtClick = (e) => {
        // Restore if previously visited
 
 
  if (!actionSelected) {
    setAlertMessage("Please select an action before plotting!");
    setTimeout(() => setAlertMessage(""), 3000);
    return;
  }

  const court = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - court.left) / court.width) * 100;
  const y = ((e.clientY - court.top) / court.height) * 100;

  // Prepare time info: record current game clock time
  const timeData = minutesTracked
    ? { clockMinutesLeft: minutes, clockSecondsLeft: seconds }
    : {};

  // Store pending action if player modal is needed
  if (passedLineout) {
    setPendingAction({
      actionName: actionSelected,
      quarter: currentQuater,
      x,
      y,
      team: 'home',
      ...timeData,
    });
    setShowPlayerModal(true);
  } else {
    // ✅ This is where you want to put the updated newAction
    const newAction = {
      quarter: currentQuater,
      actionName: actionSelected,
      x,
      y,
      team: "home",
      type: "score",
      timestamp: Date.now(),
      points: actionSelected === "3 Points" ? 3
            : actionSelected === "2 Points" ? 2
            : actionSelected === "FT Score" ? 1
            : 0,
      ...timeData,
    };

    setGameActions((prev) => [...prev, newAction]);
    setAlertMessage(`${actionSelected} recorded.`);
    setPendingAction(null);
    setTimeout(() => setAlertMessage(""), 3000);
    //lets save the quarter times 

  }
};

const filteredActions=[
  "2 Points",
  "3 Points",
  "2Pt Miss",
  "3Pt Miss",
"All 3pt",
"All 2pt"


]

const actions = [
  {
    id: "2 Points",
    name: "2",
    category: "plus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>


    
    ),
  },
  {
    id: "3 Points",
    name: "3",
    category: "plus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>


    ),
  },
  {
    id: "Assist",
    name: "AST",
    category: "plus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>


    ),
  },
  {
    id: "Rebound",
    name: "RB",
    category: "plus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>


    ),
  },
  {
    id: "OffRebound",
    name: "O RB",
    category: "plus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>


    ),
  },
  {
    id: "FT Score",
    name: "FT",
    category: "plus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>


    ),
  },
  {
    id: "2Pt Miss",
    name: "2",
    category: "minus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
</svg>

    ),
  },
  {
    id: "3Pt Miss",
    name: "3",
    category: "minus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
</svg>


    ),
  },
  {
    id: "Steal",
    name: "Steal",
    category: "plus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>


    ),
  },
  {
    id: "Block",
    name: "BLK",
    category: "plus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>


    ),
  },  
  {
    id: "T/O",
    name: "T/O",
    category: "minus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
</svg>


    ),
  },  {
    id: "FT Miss",
    name: "FT",
    category: "minus",
    displayIcon: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
</svg>


    ),
  }
];
useEffect(() => {
  // ✅ Filter only actions that have actionName
  const actionsWithNames = gameActions.filter(action => !!action.actionName);
  const currentQuarterActions = actionsWithNames.filter(action => action.quarter === currentQuater);

  // Overall stats
  const overallFieldGoalAttempts = actionsWithNames.filter((action) =>
    ["2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(action.actionName)
  );
  const overallFieldGoalMakes = overallFieldGoalAttempts.filter(
    (action) => !action.actionName.includes("Miss")
  );

  const overallThreePointAttempts = actionsWithNames.filter((action) =>
    action.actionName.includes("3")
  );
  const overallThreePointMakes = overallThreePointAttempts.filter(
    (action) => !action.actionName.includes("Miss")
  );

  setFieldGoal({
    total: overallFieldGoalAttempts.length,
    made: overallFieldGoalMakes.length,
  });

  setThreePoint({
    total: overallThreePointAttempts.length,
    made: overallThreePointMakes.length,
  });

  setFieldGoalPercentage(
    Math.round((overallFieldGoalMakes.length / overallFieldGoalAttempts.length) * 100) || 0
  );
  setThreePointPercentage(
    Math.round((overallThreePointMakes.length / overallThreePointAttempts.length) * 100) || 0
  );

  // Current quarter stats
  const currentFieldGoalAttempts = currentQuarterActions.filter((action) =>
    ["2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(action.actionName)
  );
  const currentFieldGoalMakes = currentFieldGoalAttempts.filter(
    (action) => !action.actionName.includes("Miss")
  );

  const currentThreePointAttempts = currentQuarterActions.filter((action) =>
    action.actionName.includes("3")
  );
  const currentThreePointMakes = currentThreePointAttempts.filter(
    (action) => !action.actionName.includes("Miss")
  );

  setFieldGoal((prevState) => ({
    ...prevState,
    currentTotal: currentFieldGoalAttempts.length,
    currentMade: currentFieldGoalMakes.length,
  }));

  setThreePoint((prevState) => ({
    ...prevState,
    currentTotal: currentThreePointAttempts.length,
    currentMade: currentThreePointMakes.length,
  }));

  setFieldGoalPercentage((prevState) => ({
    ...prevState,
    current: Math.round(
      (currentFieldGoalMakes.length / currentFieldGoalAttempts.length) * 100
    ) || 0,
  }));

  setThreePointPercentage((prevState) => ({
    ...prevState,
    current: Math.round(
      (currentThreePointMakes.length / currentThreePointAttempts.length) * 100
    ) || 0,
  }));
}, [gameActions, currentQuater]);


  useEffect(() => {
    if (savedGame?.actions) {
      console.log("Saved Game Actions on Load:", savedGame.actions);
      setGameActions(savedGame.actions);
    }
  }, [savedGame]);


  
  useEffect(() => {
    if (teamScore > prevScore) {
      setScoreChange(teamScore - prevScore);
      setTimeout(() => setScoreChange(0), 1000); // Hide the +2 after 1s
    }
    setPrevScore(teamScore);
  }, [teamScore]);
  useEffect(() => {
    if (teamScore > prevTeamScore) {
      setTeamScoreChange(teamScore - prevTeamScore);
      setTimeout(() => setTeamScoreChange(0), 1000); // Hide the animation after 1s
    }
    if (opponentScore > prevOpponentScore) {
      setOpponentScoreChange(opponentScore - prevOpponentScore);
      setTimeout(() => setOpponentScoreChange(0), 1000); // Hide the animation after 1s
    }
    setPrevTeamScore(teamScore);
    setPrevOpponentScore(opponentScore);
  }, [teamScore, opponentScore]);

  const selectedPlayer = currentGameActionFilters.find(filter =>
    !["All Game", "2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(filter)
  );
 
  
  let selectedPlayerStat = playersStatsArray.find(player => player.player.includes(selectedPlayer)) || {};
  const twoPtMade = selectedPlayerStat.fgMade - selectedPlayerStat.threePtMade;
  const points = (2 * twoPtMade) + (3 * selectedPlayerStat.threePtMade) + selectedPlayerStat.ftMade;

   const tsPercentage = (points / (2 * (selectedPlayerStat.fgAttempts + (0.44 * selectedPlayerStat.ftAttempts)))) * 100;
let trueShootingPercentage = tsPercentage ? tsPercentage.toFixed(1) : '0.0';




// Set up the state properly
const [selectedPlayerQuarterScores, setSelectedPlayerQuarterScores] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });

if (selectedPlayerStat && selectedPlayerStat.player) {
  const cleanedPlayerName = selectedPlayerStat.player.trim(); // Remove extra spaces safely

  gameActions.forEach((action) => {
    if (action.playerName && action.playerName.trim() === cleanedPlayerName) {
      selectedPlayerQuarterScores[action.quarter] = 
        (selectedPlayerQuarterScores[action.quarter] || 0) + action.points;
    }
  });


} else {
  // console.log("No selected player found.");
}




// This function calculates quarter scores for a selected player
const calculateSelectedPlayerQuarterScores = () => {
  // Initialize scores object with all quarters set to 0
  const quarterScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
  
  // Make sure gameActions is an array and selectedPlayer exists
  if (!Array.isArray(gameActions) || !selectedPlayer) {
    return quarterScores;
  }
  
  // Filter actions for the selected player and calculate points
// Temporary debugging change - hardcode to look for Aaron L
gameActions.forEach((action) => {
  if (action.playerName && action.playerName === "Aaron L") {
    selectedPlayerQuarterScores[action.quarter] = 
      (selectedPlayerQuarterScores[action.quarter] || 0) + action.points;
  }
});




  console.log("Player quarter scores:", quarterScores);
  return quarterScores;
};
  
  //! this is the chart render logic
  const transformGameActionsToLineData = (gameActions, currentQuarter, homeTeamName = "Home") => {
    const quarterPoints = {};        // home
    const quarterOpponentPoints = {}; // away
  
    for (let q = 1; q <= 8; q++) {
      quarterPoints[q] = 0;
      quarterOpponentPoints[q] = 0;
    }
  
    gameActions.forEach(action => {
      if (action.type === 'score' && action.team === 'home') {
        quarterPoints[action.quarter] += action.points;
      } else if (action.type === 'score' && action.team === 'away') {
        quarterOpponentPoints[action.quarter] += action.points;
      }
    });
  
    const filteredQuarters = [1, 2, 3, 4].concat(
      currentQuarter > 4 ? Array.from({ length: currentQuarter - 4 }, (_, i) => i + 5) : []
    );
  
    return [
      {
        id: homeTeamName || "home", // ✅ dynamic label
        color: "#007AFF",
        data: filteredQuarters.map(q => ({ x: `Q${q}`, y: quarterPoints[q] }))
      },
      {
        id: "Opponent",
        color: "#FF5733",
        data: filteredQuarters.map(q => ({ x: `Q${q}`, y: quarterOpponentPoints[q] }))
      }
    ];
  };

  // Function to process gameActions into Pie Chart data
  const transformGameActionsToPieData = (gameActions) => {
    let twoPoints = 0;
    let threePoints = 0;
    let freeThrows = 0;
  
    gameActions.forEach(action => {
      if (action.actionName === "2 Points") {
        twoPoints += 2;
      } else if (action.actionName === "3 Points") {
        threePoints += 3;
      } else if (action.actionName === "FT Score") {
        freeThrows += 1;
      }
    });
  
    return [
      { id: "2PT", label: "2PT", value: twoPoints, color: "#10B981" },  // Tailwind bg-indigo-500
      { id: "3PT", label: "3PT", value: threePoints, color: "#0b63fb" }, // Your CTA color
      { id: "FT", label: "FT", value: freeThrows, color: "#8B5CF6" }     // Free Throw color
    ];
  };
  const transformGameActionsToBarData = (gameActions) => {
    let shotData = {
      "FG": { attempts: 0, makes: 0, misses: 0 }, // Includes both 2PT and 3PT
      "2PT": { attempts: 0, makes: 0, misses: 0 },
      "3PT": { attempts: 0, makes: 0, misses: 0 },
      "FT": { attempts: 0, makes: 0, misses: 0 }
    };

    gameActions.forEach(action => {
        if (["2 Points", "2Pt Miss"].includes(action.actionName)) {
            shotData["FG"].attempts += 1;  // 2PT attempts count as FG attempts
            shotData["2PT"].attempts += 1;

            if (action.actionName === "2 Points") {
                shotData["FG"].makes += 1;  
                shotData["2PT"].makes += 1;
            } else {
                shotData["2PT"].misses += 1;
            }
        }
        if (["3 Points", "3Pt Miss"].includes(action.actionName)) {
            shotData["FG"].attempts += 1;  // 3PT attempts count as FG attempts
            shotData["3PT"].attempts += 1;

            if (action.actionName === "3 Points") {
                shotData["FG"].makes += 1;
                shotData["3PT"].makes += 1;
            } else {
                shotData["3PT"].misses += 1;
            }
        }
        if (["FT Score", "FT Miss"].includes(action.actionName)) {
            shotData["FT"].attempts += 1;

            if (action.actionName === "FT Score") {
                shotData["FT"].makes += 1;
            } else {
                shotData["FT"].misses += 1;
            }
        }
    });

    return [
        { shotType: "FG", makes: shotData["FG"].makes, misses: shotData["FG"].misses, attempts: shotData["FG"].attempts },
        { shotType: "2PT", makes: shotData["2PT"].makes, misses: shotData["2PT"].misses, attempts: shotData["2PT"].attempts },
        { shotType: "3PT", makes: shotData["3PT"].makes, misses: shotData["3PT"].misses, attempts: shotData["3PT"].attempts },
        { shotType: "FT", makes: shotData["FT"].makes, misses: shotData["FT"].misses, attempts: shotData["FT"].attempts }
    ];
};

  const gameLineChartData = transformGameActionsToLineData(gameActions, currentQuater, homeTeamName);


  const barData = transformGameActionsToBarData(gameActions);
  const pieData = transformGameActionsToPieData(gameActions);
  const testdata = [
    { quarter: 'Q1', steals: 3, turnovers: 1 },
    { quarter: 'Q2', steals: 2, turnovers: 1 },
    { quarter: 'Q3', steals: 1, turnovers: 2 },
    { quarter: 'Q4', steals: 2, turnovers: 1 },
  ]

// 2. Log a sample of player names from actions (with quotes)
gameActions.forEach((action, index) => {
  if (index < 3) { // Just log a few to avoid cluttering the console

  }
});

// 3. Test the comparison directly
// Create a clean function to calculate and update scores
const updatePlayerScores = useCallback(() => {
  // Create a new object (important for React to detect changes)
  const newScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  
  // Debug log to check inputs
  console.log(`Calculating scores for ${selectedPlayer} from ${gameActions.length} actions`);
  
  // Process all matching actions
  gameActions.forEach((action) => {
    if (action.playerName === selectedPlayer) {
      // Convert to numbers to ensure proper addition
      const quarter = Number(action.quarter);
      const points = Number(action.points);
      
      if (!isNaN(quarter) && quarter >= 1 && quarter <= 6 && !isNaN(points)) {
        newScores[quarter] += points;
        console.log(`Adding ${points} points to Q${quarter}. New total: ${newScores[quarter]}`);
      }
    }
  });
  
  console.log("Final scores:", newScores);
  setSelectedPlayerQuarterScores(newScores);
}, [selectedPlayer, gameActions]);



// Call this function whenever dependencies change
useEffect(() => {
  updatePlayerScores();
}, [updatePlayerScores]);


const quarterStats = {
  1: { made: 0, attempted: 0 },
  2: { made: 0, attempted: 0 },
  3: { made: 0, attempted: 0 },
  4: { made: 0, attempted: 0 },
  5: { made: 0, attempted: 0 },
  6: { made: 0, attempted: 0 },
  7: { made: 0, attempted: 0 },
  8: { made: 0, attempted: 0 },
}


gameActions.forEach(action => {
  const q = action.quarter;
  
  // Count FGA
  if (["2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(action.actionName)) {
    quarterStats[q].attempted++;
  }
  
  // Count FGM
  if (["2 Points", "3 Points"].includes(action.actionName)) {
    quarterStats[q].made++;
  }
});


const fgPercentages = Object.keys(quarterStats)
  .filter(q => {
    const qNum = parseInt(q);
    // Always show Q1–Q4, and conditionally show Q5–Q8 if currentQuarter is at or beyond them
    return qNum <= 4 || qNum <= currentQuater;
  })
  .map(q => {
    const { made, attempted } = quarterStats[q];
    const percentage = attempted > 0 ? Math.round((made / attempted) * 100) : 0;

    return {
      quarter: `Q${q}`,
      percentage
    };
  });


  const calculateStealsTurnoversPerQuarter = (gameActions, currentQuarter) => {
    // Initialize counters per quarter
    const quarterStats = {
      1: { steals: 0, turnovers: 0 },
      2: { steals: 0, turnovers: 0 },
      3: { steals: 0, turnovers: 0 },
      4: { steals: 0, turnovers: 0 },
      5: { steals: 0, turnovers: 0 },
      6: { steals: 0, turnovers: 0 },
      7: { steals: 0, turnovers: 0 },
      8: { steals: 0, turnovers: 0 },
    };
  
    gameActions.forEach(action => {
      const q = action.quarter;
      if (quarterStats[q]) {
        if (action.actionName === "Steal") {
          quarterStats[q].steals++;
        } 
        if (action.actionName === "T/O") {
          quarterStats[q].turnovers++;
        }
      }
    });
  
    // Only include Q1–Q4 always, and Q5–Q8 if currentQuarter >= that number
    return Object.keys(quarterStats)
      .filter(q => {
        const qNum = parseInt(q);
        return qNum <= 4 || qNum <= currentQuarter;
      })
      .map(q => ({
        quarter: `Q${q}`,
        steals: quarterStats[q].steals,
        turnovers: quarterStats[q].turnovers,
      }));
  };
  
  const stealsTurnoversData = calculateStealsTurnoversPerQuarter(gameActions, currentQuater);


const handleTogglePlayer = (playerNumber) => {
  setOnCourtPlayers((prev) => {
    let updated;
    if (prev.includes(playerNumber)) {
      // Deselect
      updated = prev.filter((num) => num !== playerNumber);
    } else {
      // Add player - check if less than 5
      if (prev.length >= 5) {
        alert("Maximum 5 players allowed on court. Deselect one first.");
        setTimeout(() => setAlertMessage(""), 3000);
        return prev; // No change
      }
      updated = [...prev, playerNumber];
    }

    onCourtPlayersRef.current = updated; // ✅ Sync ref immediately
    return updated;
  });
};


useEffect(() => {
  if (passedLineout && passedLineout.players) {
    const defaultOnCourt = passedLineout.players
      .slice(0, 5)
      .map(player => player.number);

    setOnCourtPlayers(defaultOnCourt);
    onCourtPlayersRef.current = defaultOnCourt; // ✅ Sync ref
  }
}, [passedLineout]);

function getCurrentRun(actions) {
  const minRunPoints = 6; // Start tracking runs only after 6 points
  let run = {
    team: null,
    points: 0,
    opponentPoints: 0,
    opponentScores: 0,
    actions: [],
  };

  for (let i = actions.length - 1; i >= 0; i--) {
    const action = actions[i];
    if (action.type !== "score" || !action.team) continue;

    if (!run.team) {
      // First action in run
      run.team = action.team;
      run.points = action.points;
      run.actions = [action];
    } else if (action.team === run.team) {
      // Same team scored
      run.points += action.points;
      run.actions.unshift(action);
    } else {
      // Opponent scored
      run.opponentScores += 1;
      run.opponentPoints += action.points || 0;

      if (run.opponentScores === 1) {
        // Include the first opposing score in the run (but don't stop it yet)
        run.actions.unshift(action);
      } else {
        break; // Second opponent bucket = run ends
      }
    }
  }

  // Require run to be significant (6–0, 10–2, etc.)
  return run.points >= minRunPoints ? run : null;
}

// const [currentRun, setCurrentRun] = useState(null);
function getOpponentPointsDuringRun(run, allActions) {
  if (!run || !run.actions || run.actions.length === 0) return 0;

  const runStartTime = run.actions[0].timestamp;
  const runEndTime = run.actions[run.actions.length - 1].timestamp;

  // Get the opposing team
  const opposingTeam = run.team === "home" ? "away" : "home";

  // Sum up points from the opposite team **within the same timeframe**
  const points = allActions
    .filter(
      (a) =>
        a.type === "score" &&
        a.team === opposingTeam &&
        a.timestamp >= runStartTime &&
        a.timestamp <= runEndTime
    )
    .reduce((sum, a) => sum + (a.points || 0), 0);

  return points;
}
const currentRun = useMemo(() => {
  return getCurrentRun([...gameActions, ...opponentActions]);
}, [gameActions, opponentActions]);


const runPoints = currentRun?.points || 0;
const opponentPoints = currentRun?.opponentPoints || 0;

// const opponentPoints = currentRun?.opponentPoints ?? 0;
const total = currentRun?.points + opponentPoints;
// const progress = total > 0 ? (currentRun?.points / total) * 100 : 100;
function getRunStartScore(run, allActions) {
  if (!run || run.actions.length === 0) return null;

  const runStartTimestamp = run.actions[0].timestamp;
  let teamScore = 0;
  let opponentScore = 0;
  const team = run.team;
  const opponent = team === "home" ? "away" : "home";

  allActions.forEach(action => {
    if (action.type === "score" && action.timestamp < runStartTimestamp) {
      if (action.team === team) {
        teamScore += action.points || 0;
      } else if (action.team === opponent) {
        opponentScore += action.points || 0;
      }
    }
  });

  return { teamScore, opponentScore };
}
const runStartScore = useMemo(() => {
  return getRunStartScore(currentRun, [...gameActions, ...opponentActions]);
}, [currentRun, gameActions, opponentActions]);

  const prevBroadcastData = useRef(null);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!broadcast || !slug) return;
  
      const newData = {
        score: {
          home: teamScore,
          away: opponentScore,
        },
        quarter: currentQuater,
      };
  
      // Compare to previous broadcast (shallow check)
      const prevData = prevBroadcastData.current;
      const isChanged =
        !prevData ||
        prevData.score.home !== newData.score.home ||
        prevData.score.away !== newData.score.away ||
        prevData.quarter !== newData.quarter;
  
      if (isChanged) {
        updateLiveClock();
        updateLiveBroadcast();
        // if we are pushing the slkug for game actions we should check if the game is full time. If you push an action then the game is not technically full time 
        //so we need to chang the game state to in progress and maybe a notificayion to indicate that the game is going back to in progress
        if(gameFinsihedFlag){
console.log('⚠️ game is set to finihed, we should change that');
//first we set the flag to false
//and now we need to send the slug, but is this already being done in the update, we shall see. It did not
//lets send the update via SHLUGG
setGameFinsihedFlag(false);
handlebroadcastUpdate(false)



        }else{
          console.log('game is already in progress');
          
        }
        prevBroadcastData.current = newData;
      }
    }, 1000); // Delay 1s after changes
  
    return () => clearTimeout(timeout);
  }, [gameActions, teamScore, opponentScore, currentQuater]);
  
  useEffect(() => {
    console.log('running this sluggy thing');
    if(!slug){
      console.log('we have no slug');
      
    }
    if (!slug) return;
  
    const unsub = onSnapshot(firestoreDoc(firestore, "liveGames", slug), (docSnap) => {
      if (docSnap.exists()) {
        console.log('doc exists');
         const data = docSnap.data();
         console.log('this is the doc data', data);
         
         const scheduled = data?.scheduledStart;
  
         if (scheduled?.date){
          setSelectedDate(scheduled.date);
          console.log('we got the correct date');
          
         } else{
          console.log('uhh ohh shaggy, no date in db');
          
         }
         if (scheduled?.time){
          setSelectedTime(scheduled.time);
          console.log('we got the correct time');
          
         } else{
          console.log('uhh ohh shaggy, no time in db');
          
         }
        // else setSelectedDate("");
  
        // if (scheduled?.time) setSelectedTime(scheduled.time);
        // else setSelectedTime("");
      }else{
        console.log('doc does not exist');
        
      }
    });
  
    return () => unsub();
  }, [slug]);
  useEffect(() => {
  if (savedGame?.selectedVenue) {
    setSelectedVenue(savedGame.selectedVenue);
  }
}, [savedGame]);

//!MAIN -----------------------------------------------------
//!RETURN ---------------------------------------------------
//!JSX     --------------------------------------------------

  return (
    <>

    <main className=" bg-primary-bg">

      {/* Top Nav */}
      <div className="container mx-auto  items-center bg-primary-bg" >
        <div className="top-nav w-auto h-[12vh]  relative ">
          {/* Alert Message */}
      


{/* top  of the top nav contents */}
<div className="text-white h-1/2 items-center   flex-row flex space-x-1  px-2 w-full  ">
{!savedGame.isComplete ?
    <div
  onClick={handleUndoLastActionHandler}
  className={`w-[10%] h-full  rounded-lg text-center flex items-center mt-1 z-0 cursor-pointer hover:bg-white/10 transition transform hover:scale-105
  ${gameActions==0 ? "bg-secondary-bg/50 line-through text-gray-400" : "bg-secondary-bg "}
  `}
>
  <p className="text-center mx-auto text-sm flex text-gray-200 items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
    class="size-6  text-primary-cta">
  <path stroke-linecap="round" stroke-linejoin="round" d="m7.49 12-3.75 3.75m0 0 3.75 3.75m-3.75-3.75h16.5V4.499" />
</svg>
 </p>
</div >
: <div className="h-full w-[10%] bg-secondary-bg flex items-center justify-center rounded-md">
  <p>Logo here</p>
  </div>
}
<QuarterDiv currentQuater={currentQuater} />
<BroadcastDiv 
gameFinsihedFlag={gameFinsihedFlag}
liveBroadcastGameFinished={liveBroadcastGameFinished}
 setShowBroadcastModal={setShowBroadcastModal}
  showBroadCastDiv={broadcast} 
  broadcastUpdate={broadcastUpdate}
  />
<GameStatsDiv setShowGameStatsModal={setShowGameStatsModal} />

<FilterDiv
  currentQuater={currentQuater}
  currentGameActionFilters={currentGameActionFilters}
  currentGameActionFilter={currentGameActionFilter}
  gameActions={gameActions}
  filteredActions={filteredActions}
  passedLineout={passedLineout}
  handleFilterSelection={handleFilterSelection}
  setCurrentGameActionFilter={setCurrentGameActionFilter}
/>

<PlayerStatsDiv setShowPlayerStatsModal={setShowPlayerStatsModal} />

<div onClick={handleSaveGame} className={` w-[10%] px-5 h-full bg-secondary-bg cursor-pointer hover:bg-primary-cta hover:text-black rounded-lg text-center flex items-center
 text-primary-cta bg-
  `}>
<p className="text-center mx-auto text-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z" />
</svg>
</p></div>
<button
  onClick={() => {
    // If there are unsaved actions and the game hasn't been saved, show the exit modal.
    if (!isGameSaved && gameActions.length > 0) {
      setShowExitModal(true);
    } else {
      navigate('/homedashboard');
    }
  }}
  className="w-[10%] h-full text-center   justify-center mt-1 flex items-center bg-secondary-bg  hover:bg-primary-danger/50 rounded-lg"
>
  {/* <p className="text-center mx-auto">Exit</p> */}
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
</svg>

</button>


</div>



{/* bottom  of the top nav contents */}
<div className=" flex flex-row  text-white space-x-1 px-2 p-1 h-1/2 items-center    w-full">

<Scoreboard
  opponentName={opponentName}
  opponentLogo={opponentLogo}
  opponentScore={opponentScore}
  opponentScoreChange={opponentScoreChange}
  opponentJerseyDefault={opponentJerseyDefault}
  teamScore={teamScore}
  teamScoreChange={teamScoreChange}
  teamImage={teamImage}
  teamName={teamName}
  ravensLogo={ravensLogo}
/>
{showFiltersPlayerStat ?
<>
<OpponentActionButtons 
  showFiltersPlayerStat={showFiltersPlayerStat}
  savedGame={savedGame}
  updateOpponentScore={updateOpponentScore}
  updateOpponentAction={updateOpponentAction}
/>



{/* <div onClick={handleSaveGame} className={` w-[10%] px-5 h-full bg-secondary-bg cursor-pointer hover:bg-primary-cta hover:text-black rounded-lg text-center flex items-center
 text-primary-cta bg-
  `}>
<p className="text-center mx-auto text-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z" />
</svg>
</p></div> */}



</>
:
<div className=" bg-primary-bg w-[55%]  space-x-1 grid grid-cols-3 h-full rounded-md">

<div className="bg-primary-bg col-span-2">
<table className="w-full text-sm text-left rtl:text-right h-full border-separate border-spacing-0 rounded-md overflow-hidden bg-secondary-bg shadow-md text-gray-500 dark:text-gray-400">
  <thead className="text-xs border-2 border-white  uppercase shadow-md">
    <tr>
      {[1, 2, 3, 4].map((q) => (
        <th
          key={q}
          className={`px-6   bg-secondary-bg border-b-2 border-b-primary-bg ${q === 1 ? "" : ""}
            ${q === 4 && currentQuater <= 4 ? "" : ""}
            ${q === currentQuater ? "text-white" : "text-gray-400"}`}
        >
          Q{q}
        </th>
      ))}
      {currentQuater > 4 &&
        [...Array(currentQuater - 4)].map((_, index) => {
          const otNumber = index + 5;
          return (
            <th
              key={`OT${otNumber}`}
              className={`px-6  bg-secondary-bg ${currentQuater === otNumber ? "text-white" : "text-gray-400"}
                ${otNumber === currentQuater ? "rounded-e-lg" : ""}`}
            >
              OT{index + 1}
            </th>
          );
        })}
    </tr>
  </thead>
  <tbody>
    <tr className="bg-secondary-bg ">
      {[1, 2, 3, 4].map((q) => (
        <td key={q} className={`px-6  ${q === currentQuater ? "text-white" : "text-gray-400"}`}>
          {selectedPlayerQuarterScores[q] !== undefined ? selectedPlayerQuarterScores[q] : "0"}
        </td>
      ))}
      {currentQuater > 4 &&
        [...Array(currentQuater - 4)].map((_, index) => {
          const otNumber = index + 5;
          return (
            <td key={`OT${otNumber}`} className={`px-6  ${currentQuater === otNumber ? "text-white" : "text-gray-400"}`}>
              {selectedPlayerQuarterScores[otNumber] !== undefined ? selectedPlayerQuarterScores[otNumber] : "0"}
            </td>
          );
        })}
    </tr>
  </tbody>
</table>



</div>
<div className="bg-secondary-bg flex w-auto flex-col justify-center items-center px-2 py-1 rounded-md">
  <p className="text-gray-400 text-sm">TS%</p> {/* Title text */}
  <p className="text-white text-lg font-bold">{trueShootingPercentage}%</p> {/* Dummy percentage */}
</div>

</div>
}







</div>

        </div>
<div className=" md:block hidden">
<Court
  savedGame={savedGame}
  handleCourtClick={handleCourtClick}
  actionSelected={actionSelected}
  showPlayerModal={showPlayerModal}
  setShowPlayerModal={setShowPlayerModal}
  setPendingAction={setPendingAction}
  passedLineout={passedLineout}
  onCourtPlayers={onCourtPlayers}
  handlePlayerSelection={handlePlayerSelection}
  pendingAction={pendingAction}
  gameActions={gameActions}
  currentGameActionFilters={currentGameActionFilters}
  currentQuater={currentQuater}
/>
</div>


        {/* Bottom Nav */}
        <div className="bottom-nav  items-center justify-center w-full  md:h-[33vh] h- ">
{/* Quick Stats Section */}
     {/* Quick Stats Section */}
{/* Quick Stats Section */}
<div className={`text-white items-center hidden md:flex  justify-center flex-row space-x-4  
  w-auto 
  ${currentGameActionFilters.some(filter => !["All Game", "2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(filter)) ? "h-[33%]" : "h-1/4"}
`}>

  {/* Display Filters */}
{/* Display Filters */}
{currentGameActionFilters.length>=1 &&
<div
  className={`relative flex flex-col justify-start items-start  gap-y-[2px] py-1 
    transition-all duration-300 ease-in-out 
    ${showFiltersPlayerStat ? "w-[25%] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-2 overflow-hidden"}
  `}
>
  {currentGameActionFilters.map((filter, index) => (
    <div
      key={index}
      onClick={() => handleFilterSelection(filter)} // Clicking removes it
      className="relative text-sm px-3 py-1 bg-secondary-bg rounded-md flex items-end h-8 group cursor-pointer hover:bg-primary-cta"
    >
      <span className="text-gray-400 group-hover:text-primary-bg">{filter}</span>
      <div className="ml-2 text-center text-primary-cta group-hover:text-primary-bg">X</div>
    </div>
  ))}
    {/* Toggle Button */}
{currentGameActionFilters.length >=1 &&

  <button
    onClick={() => setShowFiltersPlayerStat(!showFiltersPlayerStat)}
    className="absolute top-1/4 right-0 px-2 h-2/4 "
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-4 transition-transform duration-300 ease-in-out"
      style={{
        transform: showFiltersPlayerStat ? "rotate(0deg)" : "rotate(180deg)"
      }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  </button>
}
</div>
}


  {/* Check if a player filter is active */}
  {(() => {
    const selectedPlayer = currentGameActionFilters.find(filter =>
      !["All Game", "2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(filter)
    );
    // const selectedPlayerStat = playersStatsArray.find(player => player.player.includes(selectedPlayer));
    // Extract the player number and name separately
    // let selectedPlayerStat = playersStatsArray.find(player => player.player.includes(selectedPlayer));
    // If selectedPlayerStat is found, get the player details
    let selectedPlayerStat = playersStatsArray.find(player => player.player.includes(selectedPlayer)) || {};
let playerDetails = {
    number: selectedPlayerStat.player?.match(/\((\d+)\)/)?.[1] || "",
    name: selectedPlayerStat.player?.replace(/\(\d+\)\s*/, "") || selectedPlayer || "Unknown",
    image: selectedPlayerStat.image || null, // Default to null if no image is found
};    
  // Now, check if the player's image exists in the lineout
  if (!playerDetails.image && savedGame?.lineout?.players) {
    const lineoutPlayer = savedGame.lineout.players.find(
      (p) => p.name.trim() === playerDetails.name.trim() &&
             p.number.toString() === playerDetails.number.toString()
    );
    if (lineoutPlayer?.image) {
      playerDetails.image = lineoutPlayer.image;
    }
  }
  
    if (selectedPlayer) {
      // Get player stats
      const playerStats = playersStatsArray.find(player => player.player.includes(selectedPlayer)) || {
        player: selectedPlayer, // Default to selected player name
        fgMade: 0, fgAttempts: 0,
        threePtMade: 0, threePtAttempts: 0,
        ftMade: 0, ftAttempts: 0,
        assists: 0, rebounds: 0,
        offRebounds: 0, turnovers: 0,
        steals: 0, blocks: 0
      };

      // Extract stats for easy use
      const {
        fgMade, fgAttempts, threePtMade, threePtAttempts,
        ftMade, ftAttempts, assists, rebounds,
        offRebounds, turnovers, steals, blocks
      } = playerStats;

      // Calculate percentages
      const fgPercentage = fgAttempts ? Math.round((fgMade / fgAttempts) * 100) : 0;
      const threePtPercentage = threePtAttempts ? Math.round((threePtMade / threePtAttempts) * 100) : 0;
      const ftPercentage = ftAttempts ? Math.round((ftMade / ftAttempts) * 100) : 0;
      const minutesPlayed = playerDetails.number ? playerMinutes[playerDetails.number] || 0 : 0;

console.log('what player do we have here below');

console.log("Final Selected Player Details:", playerDetails);


      return (
        <div className="relative text-sm w-full rounded-md flex flex-row h-[90%]  ">
          {/* Player Image */}
        {/* Player Image */}
        {!showFiltersPlayerStat && currentGameActionFilters.length >1 &&
        <div className=" w-9 h-full flex justify-center bg-primary-bg">

          <button onClick={()=>{
            setShowFiltersPlayerStat(!showFiltersPlayerStat)
          }} className="my-auto ">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 mx-auto">
  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
</svg>


          </button>
        </div>
    }
        <div className="bg-secondary-bg  rounded-s-md w-[22%] relative mx-auto h-auto border-r-4 border-r-primary-cta flex items-center justify-center">
          <img
            className="w-full h-full rounded-s-md"
            src={playerDetails.image || head1} // Use player's image if available, otherwise fallback to head1
            alt="Player Avatar"
          />
        </div>


          {/* Points */}
          <div className="w-1/6 bg-secondary-bg text-gray-200 text-center text-sm flex flex-col justify-center h-full">
          <p className="absolute text-white top-1 ml-4 text-md font-semibold mt-1">
  <span className="text-gray-400 mr-1">({playerDetails.number})</span> 
  {playerDetails.name}
</p>
      <p className="text-2xl font-semibold">{(fgMade * 2) + (threePtMade * 1) + (ftMade * 1)}</p>
            <div className="flex bg-secondary-bg justify-center">
              <p className="text-white bg-primary-cta rounded-sm px-2 py-[2px] text-xs uppercase font-bold w-fit inline-block">PTS</p>
            </div>
          </div>
    
          {/* Assists */}
          <div className="w-1/6 text-gray-200 bg-secondary-bg text-center text-sm flex flex-col justify-center h-full">
            <p className="text-2xl font-semibold">{assists}</p>
            <div className="flex justify-center">
              <p className="text-white bg-primary-cta rounded-sm px-2 py-[2px] text-xs uppercase font-bold w-fit inline-block">AST</p>
            </div>
          </div>

          {/* Rebounds */}
          <div className="w-1/6 text-gray-200 bg-secondary-bg text-center text-sm flex flex-col justify-center h-full">
            <p className="text-2xl font-semibold">{rebounds}</p>
            <div className="flex justify-center">
              <p className="text-white bg-primary-cta rounded-sm px-2 py-[2px] text-xs uppercase font-bold w-fit inline-block">RB</p>
            </div>
          </div>

          {/* Steals */}
          <div className="w-1/6 text-gray-200 bg-secondary-bg text-center text-sm flex flex-col justify-center h-full">
            <p className="text-2xl font-semibold">{steals}</p>
            <div className="flex justify-center">
              <p className="text-white bg-primary-cta px-2 py-[2px] rounded-sm text-xs uppercase font-bold w-fit inline-block">STL</p>
            </div>
          </div>
             {/* Blocks (conditionaly rendered based on view) */}
          {!showFiltersPlayerStat &&
                 <>
                    <div className="w-1/6 bg-secondary-bg text-gray-200 text-center text-sm flex flex-col justify-center h-full">
            <p className="text-2xl font-semibold">{blocks}</p>
            <div className="flex justify-center">
              <p className="text-white bg-primary-cta px-2 py-[2px] rounded-sm text-xs uppercase font-bold w-fit inline-block">BLK</p>
            </div>
          </div>
          {minutesTracked &&
                  <div className="w-1/6 bg-secondary-bg text-gray-300 text-center text-sm flex flex-col justify-center h-full">
                  <p className="text-2xl font-semibold">{minutesPlayed}</p>
                  <div className="flex justify-center">
                    <p className="text-gray-400  px-2 py-[2px] rounded-sm text-xs uppercase font-bold w-fit inline-block">MINS</p>
                  </div>
                </div>
    }
                </>
    }

          {/* Field Goals */}
          <div className="w-1/6 flex flex-col bg-secondary-bg text-center justify-center h-full">
            <p className="text-white text-lg">{fgPercentage}%</p>
            <p className="text-gray-200 text-md mb-1">{fgMade}-{fgAttempts}</p>
            <div className="flex justify-center">
              <p className="text-white bg-white/10 px-2 py-[2px] rounded-sm text-xs uppercase font-bold w-fit inline-block">FG</p>
            </div>
          </div>

          {/* 3PT */}
          <div className="w-1/6 flex flex-col bg-secondary-bg text-center justify-center h-full">
            {/* <p className="text-md font-semibold">3PT</p> */}
            <p className="text-white text-lg">{threePtPercentage}%</p>
            <p className="text-gray-200 text-md mb-1">{threePtMade}-{threePtAttempts}</p>
       
            <div className="flex justify-center bg-secondary-bg">
              <p className="text-white bg-white/10 px-2 py-[2px] rounded-sm text-xs uppercase font-bold w-fit inline-block">3PT</p>
            </div>
          </div>
           {/* FT */}
          {!showFiltersPlayerStat &&
                 
                  <div className="w-1/6 flex transition-all duration-300 ease-in-out  flex-col text-center justify-center h-full bg-secondary-bg rounded-e-md">
            {/* <p className="text-md font-semibold">3PT</p> */}
            <p className="text-white text-lg">{ftPercentage}%</p>
            <p className="text-gray-300 text-md mb-1">{ftMade}-{ftAttempts}</p>
       
            <div className="flex justify-center">
              <p className="text-white bg-white/10 px-2 py-[2px] rounded-sm text-xs uppercase font-bold w-fit inline-block">FT</p>
            </div>
          </div>
    }
        </div>
      );
    }

    // ❌ Default Layout (Red & Blue Stats)
    return (
      <>
  
        {/* All Game Stats */}
        <div className="relative w-[40%]   flex flex-row h-full">
        {alertMessage && (
  <motion.div
    className="absolute bottom-8  text-center left-0 w-full transform -translate-x-1/2 bg-primary-cta -z-50  text-white  py-3 rounded-lg shadow-lg flex items-center space-x-3"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.3 }}
  >
    {/* Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-primary-cta"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>

    {/* Message */}
    <p className="text-sm font-medium">{alertMessage}</p>

    {/* Close Button */}
    <button
      className="text-gray-400 hover:text-white"
      onClick={() => setAlertMessage("")}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9l-3-3a1 1 0 011.414-1.414L10 6.586l3-3a1 1 0 011.414 1.414L11.414 8l3 3a1 1 0 01-1.414 1.414L10 9.414l-3 3a1 1 0 01-1.414-1.414l3-3z" clipRule="evenodd" />
      </svg>
    </button>
  </motion.div>
)}
          {currentQuater > 1 && currentGameActionFilters.length === 0 && (
            <p className="absolute inset-x-0 top-0 text-center text-gray-400">Overall</p>
          )}
          <div className="h-full flex w-2/4 mt-1 my-auto flex-col justify-center items-center">
            <p>FG {fieldGoal.made > 0 && ` ${Math.round((fieldGoal.made / fieldGoal.total) * 100)}%`}</p>
            <p>{fieldGoal.made}-{fieldGoal.total}</p>
          </div>
          <div className="h-full mt-1 flex w-2/4 my-auto flex-col justify-center items-center">
            <p>3PT {threepoint.made > 0 && ` ${Math.round((threepoint.made / threepoint.total) * 100)}%`}</p>
            <p>{threepoint.made}-{threepoint.total}</p>
          </div>
        </div>
   
        {/* Current Quarter Stats */}
        {(currentQuater > 1 || gameActions.some(action => action.quarter > 1)) &&
          !currentGameActionFilters.includes("All Game") && (
            <div className="border-l-2  border-white/10 h-full py-2 flex w-[40%] relative">
              <p className="absolute inset-x-0 top-0 text-center text-gray-400">
                {currentQuater<=4 ? "Q"+currentQuater : "OT"+(currentQuater-4)}
                {/* Q{currentQuater} */}
                
                </p>
              <div className="h-full flex w-2/4 my-auto flex-col justify-center items-center">
                <p>FG {fieldGoalPercentage.current || 0}%</p>
                <p>{fieldGoal.currentMade}-{fieldGoal.currentTotal}</p>
              </div>
              <div className="h-full flex w-2/4 my-auto flex-col justify-center items-center">
                <p>3PT {threePointPercentage.current || 0}%</p>
                <p>{threepoint.currentMade}-{threepoint.currentTotal}</p>
              </div>
            </div>
        )}
      </>
    );
  })()}
  
</div>



<ActionButtons
  savedGame={savedGame}
  actions={actions}
  passedLineout={passedLineout}
  currentQuater={currentQuater}
  setPendingAction={setPendingAction}
  setShowPlayerModal={setShowPlayerModal}
  setGameActions={setGameActions}
  setAlertMessage={setAlertMessage}
  setActionSelected={setActionSelected}
  actionSelected={actionSelected}
  isMobile={isMobile}
/>


<BottomNav
passedLineout={passedLineout}
  currentQuater={currentQuater}
  minutesTracked={minutesTracked}
  handlePreviousPeriodClick={handlePreviousPeriodClick}
  handleNextPeriodClick={handleNextPeriodClick}
  setShowLineoutModal={setShowLineoutModal}
  showTimeModal={showTimeModal}
  setShowTimeModal={setShowTimeModal}
  minutes={minutes}
  seconds={seconds}
  setMinutes={setMinutes}
  setSeconds={setSeconds}
  isRunning={isRunning}
  setIsRunning={setIsRunning}
  isMobile={isMobile}
/>




        </div>
      </div>
      <LineoutModal 
  showLineoutModal={showLineoutModal}
  setShowLineoutModal={setShowLineoutModal}
  passedLineout={passedLineout}
  onCourtPlayers={onCourtPlayers}
  handleTogglePlayer={handleTogglePlayer}
  awayLineout={awayLineout}           // ADD THIS LINE
  onSaveAwayLineout={handleSaveAwayLineout}  // ADD THIS LINE
/>


<ExitModal
      showExitModal={showExitModal}
      setShowExitModal={setShowExitModal}
      onExit={() => navigate("/homedashboard")}
    />

<GameStatsModal
  showGameStatsModal={showGameStatsModal}
  setShowGameStatsModal={setShowGameStatsModal}
  setShowEditOpponentScoreModal={setShowEditOpponentScoreModal}
  teamScore={teamScore}
  opponentScore={opponentScore}
  teamName={teamName}
  teamImage={teamImage}
  ravensLogo={ravensLogo}
  opponentName={opponentName}
  opponentLogo={opponentLogo}
  opponentJerseyDefault={opponentJerseyDefault}
  currentQuater={currentQuater}
  quarterScores={quarterScores}
  fgPercentage={fgPercentage}
  fgMade={fgMade}
  fgAttempts={fgAttempts}
  threePtPercentage={threePtPercentage}
  threePtMade={threePtMade}
  threePtAttempts={threePtAttempts}
  ftPercentage={ftPercentage}
  ftMade={ftMade}
  ftAttempts={ftAttempts}
  blocks={blocks}
  asists={asists}
  offRebounds={offRebounds}
  rebounds={rebounds}
  currentRun={currentRun}
  runPoints={runPoints}
  opponentPoints={opponentPoints}
  runStartScore={runStartScore}
  leadChanges={leadChanges}
  selectedQuarter={selectedQuarter}
  setSelectedQuarter={setSelectedQuarter}
  availableQuarters={availableQuarters}
  filteredLeadChanges={filteredLeadChanges}
  latestLeadChange={latestLeadChange}
  pieData={pieData}
  steals={steals}
  turnovers={turnovers}
  fgPercentages={fgPercentages}
  stealsTurnoversData={stealsTurnoversData}
  customTheme={customTheme}
  gameLineChartData={gameLineChartData}
  homeTeamName={homeTeamName}
/>
{/* this will be the modal for the player stats
 */}
<PlayerStatsModal
  showPlayerStatsModal={showPlayerStatsModal}
  setShowPlayerStatsModal={setShowPlayerStatsModal}
  teamImage={teamImage}
  ravensLogo={ravensLogo}
  teamScore={teamScore}
  teamName={teamName}
  opponentLogo={opponentLogo}
  opponentJerseyDefault={opponentJerseyDefault}
  opponentScore={opponentScore}
  opponentName={opponentName}
  setShowEditOpponentScoreModal={setShowEditOpponentScoreModal}
  showEditOpponentScoreModal={showEditOpponentScoreModal}
  currentQuater={currentQuater}
  quarterScores={quarterScores}
  // opponentScoreInput={opponentScoreInput}
  // setOpponentScoreInput={setOpponentScoreInput}
  minutesTracked={minutesTracked}
  playersStatsArray={playersStatsArray}
  extractPlayerNumber={extractPlayerNumber}
  playerMinutes={playerMinutes}
/>

<BroadcastModal
  showBroadcastModal={showBroadcastModal}
  setShowBroadcastModal={setShowBroadcastModal}
  liveBroadcastGameFinished={liveBroadcastGameFinished}
  slug={slug}
  gameFinsihedFlag={gameFinsihedFlag}
  setGameFinsihedFlag={setGameFinsihedFlag}
  broadcastUpdate={broadcastUpdate}
  setBroadcastUpdate={setBroadcastUpdate}
  broadcastUpdatesText={broadcastUpdatesText}
  BroadcastLinkCopyHandler={BroadcastLinkCopyHandler}
  selectedDate={selectedDate}
  setSelectedDate={setSelectedDate}
  selectedTime={selectedTime}
  setSelectedTime={setSelectedTime}
  handlebroadcastUpdate={handlebroadcastUpdate}
  handleBroadcastUpdateClear={handleBroadcastUpdateClear}
  handleFinishGame={handleFinishGame}
  handleResumeGame={handleResumeGame}
  broadcastLinkName={broadcastLinkName}
/>




<BroadcastInfoModal
  showBroadcastInformationModal={showBroadcastInformationModal}
  setShowBroadcastInformationModal={setShowBroadcastInformationModal}
  broadcastLink={broadcastLink}
/>




      </main>
    </>
  );
}
