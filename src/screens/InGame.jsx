import { useState,useEffect ,useRef,useCallback} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faForward,faBackward} from '@fortawesome/free-solid-svg-icons';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
export default function InGame() {
  const navigate = useNavigate();
  //old singular filter feature
  const { user } = useAuth();
  
  //! remove when multile is implemented
  const [currentGameActionFilter,setCurrentGameActionFilter] = useState(null);
  //for the new multiple filters feature
  const [currentGameActionFilters, setCurrentGameActionFilters] = useState([]);
  const [opponentScore,setOpponentScore] = useState(0)
  const [currentQuater,setCurrentQuarter]=useState(1)
  const [leadChanges,setleadChanges] = useState([])
  const location = useLocation();
  const savedGame = location.state; // Now savedGame will have the data passed from StartGame/HomeDashboard
  const [playerPoints, setPlayerPoints] = useState({}); // Store player points
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
  const [opponentLogo, setOpponentLogo] = useState(savedGame?.opponentLogo || null);
  const [minutesTracked, setMinutesTracked] = useState(savedGame?.minutesTracked || null);

const [selectedVenue, setSelectedVenue] = useState(savedGame?.venue || "Home");
const passedLineout = savedGame && savedGame.lineout ? savedGame.lineout : null;
// const minutesTracked = savedGame.minutesTrackedEnabled;
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
const [prevOpponentScore, setPrevOpponentScore] = useState(opponentScore);
const [teamScoreChange, setTeamScoreChange] = useState(0);
const [opponentScoreChange, setOpponentScoreChange] = useState(0);
const [opponentActions, setOpponentActions] = useState(savedGame?.opponentActions || []);
const [minutes, setMinutes] = useState(savedGame?.quarterTimes?.[1]?.minutes || 10);
const [seconds, setSeconds] = useState(savedGame?.quarterTimes?.[1]?.seconds || 0);

const minutesRef = useRef(minutes);
const secondsRef = useRef(seconds);

const [isRunning, setIsRunning] = useState(false);
const intervalRef = useRef(null); // To keep track of interval
const [showTimeModal, setShowTimeModal] = useState(false);
const [onCourtPlayers, setOnCourtPlayers] = useState([]);
const onCourtPlayersRef = useRef(onCourtPlayers);

const [showLineoutModal, setShowLineoutModal] = useState(false);
const [playerMinutes, setPlayerMinutes] = useState(savedGame?.playerMinutes || {});
const [hasFirstMinutePassed, setHasFirstMinutePassed] = useState(false);
const [quarterTimes, setQuarterTimes] = useState(savedGame?.quarterTimes || {
  1: { minutes: 10, seconds: 0 },
  2: { minutes: 10, seconds: 0 },
  3: { minutes: 10, seconds: 0 },
  4: { minutes: 10, seconds: 0 },
});


useEffect(() => {
  minutesRef.current = minutes;
}, [minutes]);

useEffect(() => {
  secondsRef.current = seconds;
}, [seconds]);

// Filter lead changes based on selected quarter
const filteredLeadChanges =
  selectedQuarter === "All"
    ? leadChanges.slice().reverse()
    : leadChanges
        .slice()
        .reverse()
        .filter((lead) => lead.q === parseInt(String(selectedQuarter).replace("Q", "")
      ));
      const latestLeadChange = filteredLeadChanges.find(lead => lead.team === "Ravens");

useEffect(() => {
  const totalPoints = gameActions.reduce((sum, action) => {
    if (["2 Points", "3 Points", "FT Score"].includes(action.actionName)) {
      return sum + (action.actionName === "2 Points" ? 2 : action.actionName === "3 Points" ? 3 : 1);
    }
    return sum;
  }, 0);
  
  setTeamScore(totalPoints);
}, [gameActions]); // Recalculate when `gameActions` change

//?use effect for the timer 
// useEffect(() => {
//   if (isRunning) {
//     intervalRef.current = setInterval(() => {
//       setSeconds(prevSeconds => {
//         if (prevSeconds === 0) {
//           if (minutes === 0) {
//             clearInterval(intervalRef.current);
//             setIsRunning(false);
//             return 0;
//           } else {
//             setMinutes(prev => prev - 1);
//             return 59;
//           }
//         }
//         return prevSeconds - 1;
//       });
//     }, 1000);
//   } else {
//     clearInterval(intervalRef.current);
//   }

//   return () => clearInterval(intervalRef.current);
// }, [isRunning, minutes]);
useEffect(() => {
  if (isRunning) {
    intervalRef.current = setInterval(() => {
      if (secondsRef.current === 0) {
        if (minutesRef.current === 0) {
          setAlertMessage('finished ',currentQuater)
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          setTimeout(() => setAlertMessage(""), 3000);
        } else {
          setMinutes(prev => prev - 1);
          minutesRef.current = minutesRef.current - 1;

          if (hasFirstMinutePassed) {
            // Only after first full minute
            updatePlayerMinutes();
          } else {
            // First minute passed!
            setHasFirstMinutePassed(true);
          }

          setSeconds(59);
          secondsRef.current = 59;
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
async function saveGame(gameData) {
  try {
    // Add a new game entry; Dexie returns the generated id.
    const id = await db.games.add(gameData);
    console.log("Game saved with id: ", id);
  } catch (error) {
    console.error("Failed to save game:", error);
  }
}
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
      addNewLeadChange(currentQuater, "Ravens", `${teamScore}-${opponentScore}`);
    } else {
      addNewLeadChange(currentQuater, "Draw", `${teamScore}-${opponentScore}`);
    }
  } else {
    // Get the last recorded lead change
    const lastLeadChange = leadChanges[leadChanges.length - 1];

    if (opponentScore > teamScore && lastLeadChange.team !== opponentName) {
      addNewLeadChange(currentQuater, opponentName, `${teamScore}-${opponentScore}`);
    } else if (teamScore > opponentScore && lastLeadChange.team !== "Ravens") {
      addNewLeadChange(currentQuater, "Ravens", `${teamScore}-${opponentScore}`);
    } else if (teamScore === opponentScore && lastLeadChange.team !== "Draw") {
      addNewLeadChange(currentQuater, "Draw", `${teamScore}-${opponentScore}`);
    }
  }

  console.log("useEffect updated for lead history");
}, [teamScore, opponentScore]);


// Example usage:
const gameData = {
  opponentName: "Lakers",
  venue: "Home",
  timestamp: new Date().toISOString(),
  // Add other properties as needed
};

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
}, [gameActions, opponentName]);



const updateOpponentScore = async (newScore, points) => {
  // Create the new action object
  const newAction = { quarter: currentQuater, points, score: newScore, timestamp: Date.now() };
  
  // First update the state
  const updatedActions = [...opponentActions, newAction];
  setOpponentActions(updatedActions);
  
  // Update the opponent score
  setOpponentScore(newScore);
  
  try {
    // Save to database with the updated actions array
    await db.games.update(currentGameId, {
      opponentScore: newScore,
      opponentActions: updatedActions,
    });
    console.log("Opponent score updated in DB:", newScore);
    //calling the save game 
    handleSaveGame();
  } catch (error) {
    console.error("Error updating opponent score:", error);
  }
};

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
      points, // Add points to the action
      timestamp: Date.now(),
    };

    setGameActions((prev) => [...prev, newAction]);

    // Update the player's total points
    setPlayerPoints((prevPoints) => ({
      ...prevPoints,
      [player.name]: (prevPoints[player.name] || 0) + points, // Add to existing points
    }));

    setShowPlayerModal(false);
    setPendingAction(null);
    setAlertMessage(`${actionName} recorded for ${player.name}!`);
    setTimeout(() => setAlertMessage(""), 3000);
  };


// this is the handler for entering the OT
const handleOTClick = ()=>{
  console.log('lets start OT');
  
}
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
  if (gameActions.length === 0) {
    setAlertMessage("No actions to save!");
    setTimeout(() => setAlertMessage(""), 2000);
    return;
  }

  let gameId = currentGameId;

  if (!gameId && savedGame?.id) {
    gameId = savedGame.id;
  } else if (!gameId) {
    // 🔍 Try to find a game by opponentName + venue
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
    opponentScore,
    opponentActions,
    leadChanges,
    lineout: savedGame?.lineout || passedLineout,
    minutesTracked,
    playerMinutes,
    quarterTimes,
    timestamp: new Date().toISOString(),
    opponentLogo,
  };
  try {
    const existingGame = await db.games.get(gameId);
    if (existingGame) {
      await db.games.update(gameId, gameData);
      console.log("Game updated locally:", gameData);
    } else {
      await db.games.put(gameData);
      console.log("New game saved locally:", gameData);
    }

    // 🔥 Cloud sync only if logged in
// ✅ Move this before the testData
if (user) {
  try {
    const fullGameData = {
      ...gameData,
      id: gameId, // just to be sure
      actions: gameActions,
      opponentScore,
      opponentActions,
      leadChanges,
      lineout: savedGame?.lineout || passedLineout,
      minutesTracked,
      playerMinutes,
      quarterTimes,
      opponentLogo,
    };

    const cleaned = cleanForFirestore(fullGameData);
    await uploadGameToCloud(user.uid, cleaned);
    console.log("✅ Game synced to Firestore!");
  } catch (err) {
    console.error("🔥 Failed to sync game:", err);
  }
}


    setAlertMessage("Game saved successfully!");
    setIsGameSaved(true);
    setCurrentGameId(gameId);
  } catch (error) {
    console.error("Error saving game:", error);
    setAlertMessage("Error saving game. Please try again.");
  }

  setTimeout(() => setAlertMessage(""), 3000);
};

useEffect(() => {
  if (savedGame && savedGame.id) {
    setCurrentGameId(savedGame.id);
    if (typeof savedGame.opponentScore === "number") {
      setOpponentScore(savedGame.opponentScore);
    }
    
    setOpponentActions(savedGame.opponentActions || []);
    setleadChanges(savedGame.leadChanges || []);
    setOpponentLogo(savedGame.opponentLogo || null);
    setMinutesTracked(savedGame.minutesTracked || null);
    setPlayerMinutes(savedGame.playerMinutes || {});

    if (savedGame.quarterTimes) {
      setQuarterTimes(savedGame.quarterTimes);

      // ✅ Apply Q1 saved time immediately
      const q1Time = savedGame.quarterTimes[1];
      if (q1Time) {
        setMinutes(q1Time.minutes);
        setSeconds(q1Time.seconds);
      }
    } else {
      // Default fallback
      setMinutes(10);
      setSeconds(0);
    }

    console.log("Loaded saved game:", savedGame);
  } else {
    console.log("Starting a new game.");
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
      ...timeData, // ✅ Attach clock time
    });
    setShowPlayerModal(true);
  } else {
    // No player modal, save immediately
    const newAction = {
      quarter: currentQuater,
      actionName: actionSelected,
      x,
      y,
      ...timeData, // ✅ Attach clock time
    };
    setGameActions((prev) => [...prev, newAction]);
    setAlertMessage(`${actionSelected} recorded.`);
    setPendingAction(null); // Clear temp dot
    setTimeout(() => setAlertMessage(""), 3000);
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
    // Overall stats
    const overallFieldGoalAttempts = gameActions.filter((action) =>
      ["2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(action.actionName)
    );
    const overallFieldGoalMakes = overallFieldGoalAttempts.filter(
      (action) => !action.actionName.includes("Miss")
    );

    const overallThreePointAttempts = gameActions.filter((action) =>
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
    const currentQuarterActions = gameActions.filter(
      (action) => action.quarter === currentQuater
    );

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
  
  // console.log('ddedededede');
  
  // console.log(points);
  
  
// const tsPercentage = (points / (2 * (selectedPlayerStat.fgAttempts + (0.44 * selectedPlayerStat.ftAttempts)))) * 100;
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
  console.log("No selected player found.");
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
  const transformGameActionsToLineData = (gameActions, opponentActions, currentQuarter) => {
    const quarterPoints = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    const quarterOpponentPoints = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    
    // Team actions
    gameActions.forEach(action => {
      if (["2 Points", "3 Points", "FT Score"].includes(action.actionName)) {
        const points = action.actionName === "2 Points" ? 2 : action.actionName === "3 Points" ? 3 : 1;
        quarterPoints[action.quarter] += points;
      }
    });
    
    // Opponent actions - use a single loop
    if (Array.isArray(opponentActions)) {
      opponentActions.forEach(action => {
        if (action && action.quarter && action.points) {
          quarterOpponentPoints[action.quarter] += action.points;
        }
      });
    }
    

    
    // Filtered quarters logic...
    const filteredQuarters = [1, 2, 3, 4].concat(
      currentQuarter > 4 ? Array.from({ length: currentQuarter - 4 }, (_, i) => i + 5) : []
    );
    
    return [
      {
        id: "Ravens",
        color: "#007AFF",
        data: filteredQuarters.map(quarter => ({
          x: `Q${quarter}`,
          y: quarterPoints[quarter]
        }))
      },
      {
        id: "Opponent",
        color: "#FF5733",
        data: filteredQuarters.map(quarter => ({
          x: `Q${quarter}`,
          y: quarterOpponentPoints[quarter]
        }))
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



  
  // Update the line chart data with opponentActions
  // const gameLineChartData = transformGameActionsToLineData(gameActions, opponentActions);
  const gameLineChartData = transformGameActionsToLineData(gameActions, opponentActions);
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
<div className="w-1/5  h-full bg-secondary-bg mt-1 flex items-center rounded-md overflow-hidden relative">
  <AnimatePresence mode="wait">
    <motion.p
      key={currentQuater} // Ensures animation triggers when quarter changes
      initial={{ x: 50, opacity: 0 }} // New quarter slides in from right
      animate={{ x: 0, opacity: 1 }} // Comes to center
      exit={{ x: -50, opacity: 0 }} // Old quarter slides out left
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="absolute w-full text-center"
    >
      {currentQuater > 4 ? `OT ${currentQuater - 4}` : `Q${currentQuater}`}
    </motion.p>
  </AnimatePresence>
</div>
<div
  onClick={() => setShowGameStatsModal(true)}
  className="w-1/5 bg-secondary-bg h-full mt-1  text-sm rounded-lg text-center flex items-center cursor-pointer hover:bg-white/10 transition"
>
  <p className="text-center mx-auto">Game Stats</p>
</div>
<Menu as="div" className="relative inline-block mt-1 text-left w-1/5 h-full">
  <Menu.Button

  className={`w-full h-full bg-secondary-bg   hover:bg-white/10 rounded-lg flex items-center justify-center text-sm
  ${currentGameActionFilters.length >=1 ? "bg-primary-bg  text-primary-cta  rounded-none" : "text-white" }


  `}>
    {
    currentGameActionFilters.length ==1 ? currentGameActionFilters :
    currentGameActionFilters.length ==2 ? "Filters"
    : "Filter"}
  </Menu.Button>
  <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right  bg-primary-bg divide-y divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999]">
    <div className="px-1 py-1">

      {currentGameActionFilter &&
      <Menu.Item>
        {({ active }) => (
          <button
          onClick={()=>{
            // setCurrentGameActionFilter(null)   ,
            handleFilterSelection('Current Q')
          }}
            className={`${
              active ? 'bg-gray-700  text-white' : 'text-gray-200'
            } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
          >
            Current Q
          </button>
        )}
      </Menu.Item>
}



      <Menu.Item>
        {({ active }) => (
          <button
          onClick={()=>{
            // setCurrentGameActionFilter('All Game'),
            handleFilterSelection('All Game')
          }}
            className={`${
              active ? 'bg-gray-700 text-white' : 'text-gray-200'
            } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
          >
           All Game
          </button>
        )}
      </Menu.Item>
      <Menu.Item>
  {({ active }) => (
    <div
      className={`relative group flex rounded-md items-center w-full px-2 py-2 text-sm ${
        active ? "bg-gray-700 text-white" : "text-gray-200"
      }`}
    >
      <span className="flex-1">Action</span>
      {/* Optional arrow icon */}
      <svg
        className={`w-4 h-4 ml-auto
          ${filteredActions.includes(currentGameActionFilter) ? " text-primary-cta" : ""}
         `}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>

      {/* Sub-menu (hidden by default, visible on hover) */}
      <div
        className="hidden group-hover:block absolute left-full top-0
                   w-48 bg-secondary-bg border border-gray-700 rounded-md
                   shadow-lg z-50"
      >
{gameActions.length === 0 ? (
  <div className="px-3 py-2 text-gray-400">No actions recorded</div>
) : (
  filteredActions
    .filter(action => gameActions.some(g => g.actionName === action))
    .map((action, idx) => (
      <button
        key={idx}
        onClick={() => {
          // setCurrentGameActionFilter(action),
          handleFilterSelection(action)
        }}
        className={`block w-full text-left px-3 py-2
                   hover:bg-gray-700 hover:text-white text-gray-200
                   ${action === currentGameActionFilter ? "text-primary-cta border-r-2 border-r-primary-cta" : ""}
                  `}
      >
        {action}
      </button>
    ))
)}


      </div>
    </div>
  )}
</Menu.Item>
<Menu.Item>
  {({ active }) => (
    <div
      className={`relative group flex rounded-md items-center w-full px-2 py-2 text-sm ${
        active ? "bg-gray-700 text-white" : "text-gray-200"
      }`}
    >
      <span className="flex-1">Player</span>
      {/* Optional arrow icon */}
      <svg
         className="w-4 h-4 ml-auto"
         fill="none"
         stroke="currentColor"
         strokeWidth={2}
         viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>

      {/* Sub-menu: Only show players with recorded actions */}
      <div
        className="hidden group-hover:block absolute left-full top-0
                   w-48 bg-secondary-bg border border-gray-700 rounded-md
                   shadow-lg z-50"
      >
        {passedLineout?.players?.filter(player =>
          gameActions.some(action => action.playerName === player.name)
        ).length > 0 ? (
          passedLineout.players
            .filter(player => gameActions.some(action => action.playerName === player.name))
            .map((player, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // setCurrentGameActionFilter(player.name),
                  handleFilterSelection(player.name)
                }}
                className={`block w-full text-left px-3 py-2
                hover:bg-gray-700 hover:text-white text-gray-200
                ${player.name === currentGameActionFilter ? "text-primary-cta border-r-2 border-r-primary-cta" : ""}
                `}
              >
                {player.name} ({player.number})
              </button>
            ))
        ) : (
          <div className="px-3 py-2 text-gray-400">No players found</div>
        )}
      </div>
    </div>
  )}
</Menu.Item>



{currentGameActionFilter &&
<>
  {/* <div className="h-[.5px] w-full bg-primary-danger"></div> */}
<Menu.Item>
  {({ active }) => (
    <div
    onClick={()=>{
      setCurrentGameActionFilter(null)
    }}
      className={`relative group mt-1  flex rounded-md items-center w-full px-2 py-2 text-sm bg-secondary-bg hover:bg-primary-cta hover:text-primary-bg group`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 mr-2 text-primary-cta group-hover:text-primary-bg">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
</svg>

      <span className="flex-1 text-primary-cta group-hover:text-primary-bg">{currentGameActionFilter}</span>
      <div className=" text-center justify-center items-center text-primary-cta flex group-hover:text-primary-bg">X</div>
      {/* Optional arrow icon */}


    </div>
  )}
</Menu.Item>
</>
}
    </div>
  </Menu.Items>

</Menu>

{/* <div className="w-1/5 bg-indigo-300 rounded-md"></div> */}
{/* <div className=" w-1/4 h-full text-center flex items-center bg-secondary-bg rounded-lg "><p className="text-center mx-auto">21-12-2024</p></div> */}



<div onClick={()=>{
  setShowPlayerStatsModal(true)
}} className=" w-1/5 bg-secondary-bg h-full  mt-1 cursor-pointer hover:bg-white/10 rounded-lg text-center flex items-center"><p className="text-center mx-auto text-sm">Player Stats</p>
</div> 

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
<motion.div className="w-[45%] px-7 h-full text-center flex items-center rounded-lg   bg-secondary-bg">
  <p className="text-center text-nd capitalize mx-auto flex items-center">
    
    {/* Away Team (Opponent) */}
    <img 
      className="w-8 h-8 rounded-full mr-2"
      src={opponentLogo || opponentJerseyDefault} 
      alt={opponentName} 
    />

    <span className="relative">
      <span className={`text-md font-semibold text-white ${opponentScoreChange > 0 ? "text-white" : "text-gray-400"}`}>
        {opponentName}
      </span>
      <AnimatePresence>
        {opponentScoreChange > 0 && (
          <motion.span
            className="absolute -top-4 left-full text-gray-200 font-bold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            +{opponentScoreChange}
          </motion.span>
        )}
      </AnimatePresence>
    </span>

    <span className={`ml-2 text-md text-gray-400 font-semibold ${opponentScoreChange > 0 ? "text-primary-cta font-bold" : "text-gray-400"}`}>
      {opponentScore}
    </span>
    
    <span className="mx-2">-</span>

    <span className={` text-md font-bold text-gray-400 relative ${teamScoreChange > 0 ? "font-bold text-green-400" : "font-normal text-gray-400"}`}>
      {teamScore}
      <AnimatePresence>
        {teamScoreChange > 0 && (
          <motion.span
            className="absolute -top-4 left-full text-green-400 font-bold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            +{teamScoreChange}
          </motion.span>
        )}
      </AnimatePresence>
    </span>

    {/* Home Team (Ravens) */}
    <img 
      className="w-8 h-8 rounded-full ml-2"
      src={ravensLogo} 
      alt="Ravens" 
    />

    <span className={`text-white ml-2 font-semibold ${teamScoreChange > 0 ? "font-bold text-white font-bold" : "font-normal text-gray-400"}`}>
      Ravens
    </span>

  </p>
</motion.div>

{showFiltersPlayerStat ?
<>
{!savedGame.isComplete ?
  <div className={`w-[45%]

     h-full text-center flex space-x-1 px-1 items-center rounded-lg `}>
  <button
   onClick={() => updateOpponentScore(opponentScore + 2, 2)}
    className="bg-secondary-bg shadow-md w-1/2 h-full rounded-md"
  >
    +2
  </button>
  <button
   onClick={() => updateOpponentScore(opponentScore + 3, 3)}
    className="bg-secondary-bg shadow-md w-1/2 h-full rounded-md"
  >
    +3
  </button>
  <button
onClick={() => updateOpponentScore(opponentScore + 1, 1)}
    className="bg-secondary-bg shadow-md w-1/2 h-full rounded-md"
  >
    +1
  </button>
  <button
onClick={() => updateOpponentScore(opponentScore -1 , -1)}
    className="bg-secondary-bg shadow-md w-1/2 h-full rounded-md"
  >
    -1
  </button>
</div>
:<div className='w-[45%] h-full bg-secondary-bg flex items-center justify-center'>
  <p>BarChart here</p>
</div>
}



<div onClick={handleSaveGame} className={` w-[10%] px-5 h-full cursor-pointer hover:bg-primary-cta hover:text-black rounded-lg text-center flex items-center
 text-primary-cta bg-secondary-bg
  `}>
<p className="text-center mx-auto text-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z" />
</svg>
</p></div>
</>
:
<div className=" bg-primary-bg w-[55%] space-x-1 grid grid-cols-3 h-full rounded-md">

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

{/* Court */}
<div
  onClick={!savedGame.isComplete ? handleCourtClick : undefined} // Disable click if game is not complete
  className={`top-nav w-full relative z-50  h-[55vh]
    ${
    actionSelected && ["3 Points", "3Pt Miss"].includes(actionSelected)
      ? "bg-white/10" // Highlight outer 3-point area in blue
      : "bg-secondary-bg" // Default color
  }

  `}
>
{showPlayerModal && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    onClick={() => {
      setShowPlayerModal(false);
      setPendingAction(null);
    }}
  >
    {/* Modal Overlay */}
    <div className="absolute inset-0 bg-black opacity-50"></div>

    {/* Modal Content */}
    <div
      className="relative p-6 rounded-lg w-1/2 bg-secondary-bg"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-white text-lg mb-4">Select Player</h3>

      {passedLineout && passedLineout.players && passedLineout.players.length > 0 ? (
        <>
          {(() => {
            const sortedPlayers = [...passedLineout.players].sort((a, b) => {
              const aOn = onCourtPlayers.includes(a.number);
              const bOn = onCourtPlayers.includes(b.number);
              return aOn === bOn ? 0 : aOn ? -1 : 1;
            });

            const onFloorPlayers = sortedPlayers.slice(0, 5);
            const benchPlayers = sortedPlayers.slice(5);

            return (
              <div className="flex flex-col space-y-2">
                {/* On Floor Label */}
                <p className="text-gray-400 text-sm mb-1">On Floor</p>

                {/* On Floor Players */}
                <div className="grid grid-cols-2 gap-2">
                  {onFloorPlayers.map((player, index) => (
                    <button
                      key={index}
                      onClick={() => handlePlayerSelection(player)}
                      className={`w-full text-left p-2 rounded group transition-all bg-white/10 hover:bg-primary-cta text-white border-l-2 ${
                        onCourtPlayers.includes(player.number)
                          ? 'border-l-primary-cta'
                          : 'border-l-gray-400'
                      }`}
                    >
                      <span className={`${
                        onCourtPlayers.includes(player.number) ? 'text-white' : 'text-gray-400'
                      } group-hover:text-black`}>
                        ({player.number}){" "}
                      </span>
                      {player.name}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <hr className="border-gray-600 my-2" />

                {/* Bench Label */}
                <p className="text-gray-400 text-sm mb-1">Bench</p>

                {/* Bench Players */}
                <div className="grid grid-cols-2 gap-2">
                  {benchPlayers.map((player, index) => (
                    <button
                      key={index}
                      onClick={() => handlePlayerSelection(player)}
                      className={`w-full text-left p-2 rounded group transition-all bg-white/10 hover:bg-primary-cta text-white border-l-2 ${
                        onCourtPlayers.includes(player.number)
                          ? 'border-l-primary-cta'
                          : 'border-l-gray-400'
                      }`}
                    >
                      <span className={`${
                        onCourtPlayers.includes(player.number) ? 'text-white' : 'text-gray-400'
                      } group-hover:text-black`}>
                        ({player.number}){" "}
                      </span>
                      {player.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        <p className="text-gray-400">No players available.</p>
      )}

      <button
        onClick={() => {
          setShowPlayerModal(false);
          setPendingAction(null);
        }}
        className="mt-4 w-full p-2 bg-primary-danger/50 hover:bg-primary-danger text-white rounded"
      >
        Cancel
      </button>
    </div>
  </div>
)}


<div
    className={`absolute w-[90%] h-[90%] rounded-b-full left-[6%] relative box-border
      z-auto
      ${
      actionSelected && ["2 Points", "2Pt Miss"].includes(actionSelected)
        ? "bg-white/10" // Highlight inner arc in blue for 2-point actions
        : "bg-secondary-bg" // Default color
    }
    border-gray-500 border-2`}
  >

    {/* Court Key */}
    <div
      className={`absolute
        sm:w-1/3
        border-2
        w-1/3
         left-1/3 sm:left-1/3 border border-gray-500    h-[65%]`}
    ></div>
    <div className="absolute 
    sm:w-1/3 w-1/3 left-1/3 sm:left-1/3
      sm:w-1/4 sm:left-[37.5%]
    border-2 border-gray-500 
     h-[17.5%] top-[65%]
      rounded-b-full "></div>
       <div className="absolute 
    sm:w-1/4 sm:left-[37.5%]
    w-1/3 left-2/4 
    border-2 border-gray-500 
    h-[17.5%] top-[47.5%]
      rounded-b-full 
       border-dashed rotate-180"></div>

{/* semi key */}
<div className="absolute w-[15%] left-[42.5%] rounded-t-full h-16 border-t-2 border-t-gray-500 top-[12%] rotate-180 "></div>

    {/* Render Actions as Dots */}

  </div>

 {/* Render Actions */}

 {pendingAction && (
  <div
    className="absolute w-4 h-4 rounded-full bg-blue-500 opacity-75"
    style={{
      top: `${pendingAction.y}%`,
      left: `${pendingAction.x}%`,
      transform: "translate(-50%, -50%)",
    }}
  />
)}



{

gameActions.filter((action) => {
  if (currentGameActionFilters.length === 0) {
    return action.quarter === currentQuater;
  }

  const allGameSelected = currentGameActionFilters.includes("All Game");
  const playerFilters = currentGameActionFilters.filter((f) => !["All Game", "2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(f));
  const actionFilters = currentGameActionFilters.filter((f) => ["2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(f));

  if (allGameSelected) {
    // If "All Game" is selected, allow all quarters but filter by actions & player
    return (
      (playerFilters.length === 0 || playerFilters.includes(action.playerName)) &&
      (actionFilters.length === 0 || actionFilters.includes(action.actionName))
    );
  }

  // If "All Game" is NOT selected, restrict to current quarter while filtering
  return (
    action.quarter === currentQuater &&
    (playerFilters.length === 0 || playerFilters.includes(action.playerName)) &&
    (actionFilters.length === 0 || actionFilters.includes(action.actionName))
  );
})


  .map((action, index) => {
    if (typeof action.x === "number" && typeof action.y === "number") {
      return (
        <div
          key={index}
          className={`absolute w-4 h-4 rounded-full ${
            ["2Pt Miss", "3Pt Miss"].includes(action.actionName)
              ? "bg-secondary-danger"
              : "bg-primary-cta"
          }`}
          style={{
            top: `${action.y}%`,
            left: `${action.x}%`,
            transform: "translate(-50%, -50%)",
          }}
          title={`Action: ${action.actionName} | Quarter: ${action.quarter}`}
        ></div>
      );
    }
    return null;
  })}






  {/* Court outline */}

</div>



        {/* Bottom Nav */}
        <div className="bottom-nav  items-center justify-center w-full  h-[33vh] ">
{/* Quick Stats Section */}
     {/* Quick Stats Section */}
{/* Quick Stats Section */}
<div className={`text-white items-center  justify-center flex-row space-x-4 flex 
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
        <div className="relative w-[40%]  flex flex-row h-full">
        {alertMessage && (
  <motion.div
    className="absolute bottom-8 text-center left-0 w-full transform -translate-x-1/2 bg-primary-cta text-white  py-3 rounded-lg shadow-lg flex items-center space-x-3"
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




        {/* quick stats end  */}
        {/* Main Actions Buttons Section */}
        {!savedGame.isComplete ? 
        <div className="grid grid-cols-6 h-2/4 w-full my-auto gap-1 lg:grid-cols-6 mx-auto xl:grid-cols-6">
  {actions.map((action, index) => (
    <button
      key={index}
      onClick={() => {
        if (["FT Score", "FT Miss", "Assist", "Steal", "Block", "T/O", "Rebound", "OffRebound"].includes(action.id)) {
          if (passedLineout) {
            setPendingAction((prevAction) =>
              prevAction?.actionName === action.id ? null : {
                actionName: action.id,
                quarter: currentQuater,
                x: null,
                y: null,
                timestamp: Date.now(),
              }
            );
            setShowPlayerModal(true);
          } else {
            setGameActions((prevActions) => [
              ...prevActions,
              {
                quarter: currentQuater,
                actionName: action.id,
                x: null,
                y: null,
                timestamp: Date.now(),
              },
            ]);
            setAlertMessage(`${action.name} recorded!`);
            setTimeout(() => setAlertMessage(""), 3000);
          }
          return;
        } else {
          // **Deselect action if clicking the same button again**
          setActionSelected((prevAction) => (prevAction === action.id ? null : action.id));
        }
      }}
      className={`${
        actionSelected === action.id ? "bg-primary-cta text-white" : "bg-secondary-bg"
      }  font-semibold py-2 px-4 rounded-lg shadow hover:bg-primary-cta transition transform hover:scale-105 focus:ring-4 focus:ring-secondary-bg 
      
      
      ${action.category === "plus" ? "text-white" : "text-gray-200"}
      flex items-center justify-center `}
    >
      {action.displayIcon}
      <span className="ml-1 font-bold text-2xl text-white">{action.name}</span>
    </button>
  ))}
</div>
: 
<div className="w-full flex items-center justify-center h-2/4 bg-secondary-bg rounded-md">
<p>Stats Here</p></div>
}

{/* Game Quick Settings Section */}
<div className="text-white relative    text-center flex-row p-2 space-x-4 flex w-full flex items-center justify-center h-1/4">


        <button
        disabled={currentQuater ===1}
        onClick={
         handlePreviousPeriodClick

        }
        className={`h-full

          flex-row bg-secondary-bg rounded-lg  flex 
          ${minutesTracked ? "w-1/4" : "w-2/4"}
           my-auto  justify-center items-center
          ${currentQuater==1 ? " line-through bg-secondary-bg/50 text-gray-400" : "text-white"}
          `}>
        <FontAwesomeIcon className="mr-2 " icon={faBackward} />  Previous Period

        </button>
        {!minutesTracked &&
        <div className="flex items-center justify-center w-1/4 bg-secondary-bg h-full rounded-md"   id="teamLineoutDiv"
  onClick={() => setShowLineoutModal(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
</svg>

        </div>
}
       {/* renderinf the game clock */}
       {
        minutesTracked &&
        <>
 {showTimeModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-secondary-bg p-6 rounded-md flex flex-col items-center space-y-4">
      <p className="text-white text-lg">Adjust Time</p>

      <div className="flex space-x-4 items-center">
        {/* Minutes Input */}
        <input
          type="number"
          min="0"
          max="59"
          value={minutes}
          onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
          className="bg-gray-800 text-white text-3xl text-center w-16 rounded-md"
        />
        <span className="text-white text-3xl">:</span>
        {/* Seconds Input */}
        <input
          type="number"
          min="0"
          max="59"
          value={seconds}
          onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
          className="bg-gray-800 text-white text-3xl text-center w-16 rounded-md"
        />
      </div>

      <button
        onClick={() => setShowTimeModal(false)}
        className="mt-4 bg-primary-cta px-4 py-2 rounded text-white"
      >
        Done
      </button>
    </div>
  </div>
)}

        <div className="py-1 w-2/4 grid grid-cols-8 grid-flow-col rounded-md h-full">
        
        <div className="flex items-center justify-center col-span-2"   id="teamLineoutDiv"
  onClick={() => setShowLineoutModal(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
</svg>

        </div>
        <div
  className="col-span-4 grid grid-cols-2 px-2 space-x-2 cursor-pointer"
  id="gameClockDiv"
  onClick={() => setShowTimeModal(true)} // Open modal
>
<AnimatePresence mode="wait">
<motion.div
  key={minutes}
  initial={{ y: 50, opacity: 0, rotateX: -90 }}
  animate={{
    y: 0,
    opacity: 1,
    rotateX: 0,
    scale: minutes === 0 && seconds === 0 ? [1, 1.5, 1] : 1, // Pulse when clock hits 0
    color: minutes === 0 && seconds === 0 ? '#8B5CF6' : undefined // Flash red at 0
  }}
  exit={{ y: -50, opacity: 0, rotateX: 90 }}
  transition={{ duration: 0.4, ease: "easeInOut" }}
  className={`relative h-full bg-secondary-bg rounded-md text-3xl items-center justify-center
    ${isRunning ? "text-primary-cta" : "text-gray-400"}
    flex`}
>
  <p>{minutes}</p>
</motion.div>

</AnimatePresence>

<motion.div
  key={seconds}
  animate={{
    scale: minutes === 0 && seconds === 0 ? [1, 1.5, 1] : 1, // Pulse at 0
    color: minutes === 0 && seconds === 0 ? '#8B5CF6' : undefined, // Flash red
  }}
  transition={{ duration: 0.4, ease: "easeInOut" }}
  className={`h-full bg-secondary-bg rounded-md text-3xl items-center justify-center 
    ${isRunning ? "text-primary-cta" : "text-gray-400"} flex`}
>
  <p>{seconds < 10 ? `0${seconds}` : seconds}</p>
</motion.div>

</div>

        <div
  className="col-span-2 justify-center flex items-center cursor-pointer"
  id="gameClockControlsDiv"
  onClick={() => setIsRunning(!isRunning)} // Toggle play/pause
>
  {isRunning ? (
    // Pause Icon
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
  ) : (
    // Play Icon
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  )}
</div>

        </div>
        </>
       }
        <button
          disabled={currentQuater ===8}
        onClick={handleNextPeriodClick}

        className={`h-full flex-row bg-secondary-bg rounded-lg  flex 
              ${minutesTracked ? "w-1/4" : "w-2/4"}
   my-auto  justify-center items-center

           ${currentQuater==4 ? "  bg-secondary-bg text-gray-200" : ""}
           
              ${currentQuater === 8  ? "line-through text-gray-500" : ""}
           `}

           >


            {currentQuater<=3 ? "Next Period" : "OT "+ (currentQuater-3)}

          
{/* Next Period  */}
          <FontAwesomeIcon className={` ml-2 ${currentQuater===4 ? "   text-primary-cta" : "text-white"}`}
            icon={faForward} />

        </button>

                </div>
        </div>
      </div>
      {showLineoutModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-secondary-bg p-6 rounded-md flex flex-col space-y-4 w-80">
      <h3 className="text-white text-lg text-center mb-4">Manage On-Court Players</h3>

      {/* Sort first */}
      {(() => {
        const sortedPlayers = [...passedLineout.players].sort((a, b) => {
          const aOn = onCourtPlayers.includes(a.number);
          const bOn = onCourtPlayers.includes(b.number);
          return aOn === bOn ? 0 : aOn ? -1 : 1;
        });

        const onFloorPlayers = sortedPlayers.slice(0, 5);
        const benchPlayers = sortedPlayers.slice(5);

        return (
          <>
            {/* On Floor Section */}
            <p className="text-gray-400 text-sm mb-1">On Floor</p>
            {onFloorPlayers.map((player) => (
              <div key={player.number} className="flex justify-between items-center text-white">
                <span>{player.name} #{player.number}</span>
                <input
                  type="checkbox"
                  checked={onCourtPlayers.includes(player.number)}
                  onChange={() => handleTogglePlayer(player.number)}
                  className="w-5 h-5"
                />
              </div>
            ))}

            {/* Divider */}
            <hr className="border-gray-600 my-2" />

            {/* Bench Section */}
            <p className="text-gray-400 text-sm mb-1">Bench</p>
            {benchPlayers.map((player) => (
              <div key={player.number} className="flex justify-between items-center text-white">
                <span>{player.name} #{player.number}</span>
                <input
                  type="checkbox"
                  checked={onCourtPlayers.includes(player.number)}
                  onChange={() => handleTogglePlayer(player.number)}
                  className="w-5 h-5"
                />
              </div>
            ))}
          </>
        );
      })()}

      <button
        onClick={() => setShowLineoutModal(false)}
        className="mt-4 bg-primary-cta px-4 py-2 rounded text-white"
      >
        Done
      </button>
    </div>
  </div>
)}


      {showExitModal && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    onClick={() => {
      setShowExitModal(false);
    }}
  >
    {/* Modal Overlay */}
    <div className="absolute inset-0 bg-black opacity-50"></div>
    {/* Modal Content */}
    <div
      className="relative bg-secondary-bg p-6 rounded-lg w-72"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
      <h3 className="text-white text-lg mb-4">Exit Game?</h3>
      <p className="text-gray-300 mb-4">
        Unsaved game data will be lost. Are you sure you want to exit?
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowExitModal(false)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => navigate('/homedashboard')}
          className="px-4 py-2 bg-primary-danger hover:bg-red-500 text-white rounded"
        >
          Exit
        </button>
      </div>
    </div>
  </div>
)}

{/* this is the modal for the game stats  */}
{showGameStatsModal && (
  <div
    className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
    onClick={() => setShowGameStatsModal(false)} // Clicking outside closes the modal
  >
    
    {/* Modal Content */}
    <div
      className="relative bg-primary-bg items-end right-0 p-4 rounded-lg w-full max-w-4xl mx-4 my-8 overflow-auto max-h-full"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
              <button
          onClick={() => setShowGameStatsModal(false)}
          className="text-white absolute right-5 top-2 bg-primary-danger  px-2 py-2 rounded"
        >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>


        </button>
      <div className="w-auto   h-auto py-5 flex  ">
    {/* Score Section */}
    <div
  onClick={() => setShowEditOpponentScoreModal(!showEditOpponentScoreModal)}
  className="flex flex-col space-y-2 pe-10 border-r-2 border-r-secondary-bg w-2/5 mr-10 "
>
  {/* Team Score Row */}
  <div className="flex items-center w-full">
    <img className="w-10 h-10 rounded-full mr-2" src={ravensLogo} alt="Ravens" />
    <span className={`${teamScore > opponentScore ? "text-white" :"text-gray-400"} text-lg font-semibold flex-1`}>Ravens</span>
    <span className={`${teamScore > opponentScore ? "text-white" :"text-gray-400"} text-lg font-bold`}>{teamScore}</span>
  </div>

  {/* Opponent Score Row */}
  <div className="flex items-center w-full">
    {/* <img className="w-10 h-10 rounded-full mr-2" src={opponentJerseyDefault} alt={opponentName} /> */}
    <img 
  className="w-10 h-10 rounded-full mr-2"
  src={opponentLogo || opponentJerseyDefault} 
  alt={opponentName} 
/>

    <span className={`${teamScore < opponentScore ? "text-white" :"text-gray-400"} text-lg font-semibold flex-1`}>{opponentName}</span>
    <span className={`${teamScore < opponentScore ? "text-white" :"text-gray-400"} text-lg font-bold`}>{opponentScore}</span>
  </div>
</div>

  
  <div className="flex flex-col  w-2/5  ">


  <div class="relative overflow-x-auto ">
  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
  <thead className="text-xs uppercase border-b-4 border-b-secondary-bg">
    <tr>
      {/* Render Q1-Q4 */}
      {[1, 2, 3, 4].map((q) => (
        <th
          key={q}
          className={`px-6 py-3 ${q === 1 ? "rounded-s-lg" : ""} 
          ${q === 4 && currentQuater <= 4 ? "rounded-e-lg" : ""} 
          ${q === currentQuater ? "text-white" : "text-gray-400"}`}
        >
          Q{q}
        </th>
      ))}

      {/* Render OT dynamically if currentQuater > 4 */}
      {currentQuater > 4 &&
        [...Array(currentQuater - 4)].map((_, index) => {
          const otNumber = index + 1;
          return (
            <th
              key={`OT${otNumber}`}
              className={`px-6 py-3 ${currentQuater === otNumber + 4 ? "text-white" : "text-gray-400"} 
              ${otNumber + 4 === currentQuater ? "rounded-e-lg" : ""}`}
            >
              OT{otNumber}
            </th>
          );
        })}
    </tr>
  </thead>
  <tbody>
    <tr className="bg-primary-bg">
      {/* Render Q1-Q4 scores */}
      {[1, 2, 3, 4].map((q) => (
        <td
          key={q}
          className={`px-6 py-4 ${q === currentQuater ? "text-white" : "text-gray-400"}`}
        >
          {quarterScores[q] > 0 ? quarterScores[q] : currentQuater >= q ? "0" : "-"}
        </td>
      ))}

      {/* Render OT scores dynamically */}
      {currentQuater > 4 &&
        [...Array(currentQuater - 4)].map((_, index) => {
          const otNumber = index + 5; // OT starts from Q5 (1st OT)
          return (
            <td
              key={`OT${otNumber}`}
              className={`px-6 py-4 ${currentQuater === otNumber ? "text-white" : "text-gray-400"}`}
            >
              {quarterScores[otNumber] > 0 ? quarterScores[otNumber] : "0"}
            </td>
          );
        })}
    </tr>
  </tbody>
</table>






</div>

  </div>
  
</div>

      <div className=" bg-red-600 flex justify-center">
  <div className="flex items-center justify-start w-screen overflow-x-auto scrollbar-hide bg-primary-bg py-3">
    <div className="flex space-x-3 px-2 w-max">

      {/* FG */}
      <div className={`flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]  
space-y-2`}>

        {/* Icon Badge */}
        <div className={`flex items-center justify-center p-3 rounded-full
          ${fgPercentage === 0
            ? "bg-gray-700"
            : fgPercentage >= 25
              ? "bg-primary-cta"
              : "bg-primary-danger"}`}>
          <span className="text-white text-sm font-bold">FG</span>
        </div>

        {/* Stat */}
        <span className={`text-2xl font-bold 
       text-gray-200`}>
          {fgPercentage}%
        </span>

        {/* Label */}
        <span className="text-sm text-gray-400">{fgMade}-{fgAttempts}</span>
      </div>

      {/* 3PT */}
      <div className={`flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]  space-y-2`}>

        <div className={`flex items-center justify-center p-2 py-3 rounded-full
          ${threePtPercentage === 0
            ? "bg-gray-700"
            : threePtPercentage >= 25
              ? "bg-primary-cta"
              : "bg-primary-danger"}`}>
          <span className="text-white text-sm font-bold">3PT</span>
        </div>

        <span className={`text-2xl font-bold 
        text-gray-200`}>
          {threePtPercentage}%
        </span>

        <span className="text-sm text-gray-400">{threePtMade}-{threePtAttempts}</span>
      </div>

      {/* FT */}
      <div className={`flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]  space-y-2`}>

        <div className={`flex items-center justify-center p-2 rounded-full
          ${ftPercentage === 0
            ? "bg-gray-700"
            : ftPercentage >= 25
              ? "bg-primary-cta"
              : "bg-primary-danger"}`}>
          <span className="text-white text-sm font-bold">FT</span>
        </div>

        <span className={`text-2xl font-bold 
          text-gray-200`}>
          {ftPercentage}%
        </span>

        <span className="text-sm text-gray-400">{ftMade}-{ftAttempts}</span>
      </div>

      {/* Blocks */}
      <div className="flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px] 
       space-y-2">

        <div className="flex items-center justify-center p-2 rounded-full bg-primary-cta">
          <span className="text-white text-sm font-bold">BLK</span>
        </div>

        <span className="text-2xl text-gray-200 font-bold">{blocks}</span>
        {/* <span className="text-sm text-gray-400">{blocks}</span> */}
      </div>

      {/* Dummy Cards — Similar style, static colors */}
      <div className="flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]  space-y-2">
        <div className="flex items-center justify-center p-2 rounded-full bg-primary-cta">
          <span className="text-white text-sm font-bold">AST</span>
        </div>
        <span className="text-2xl text-gray-200 font-bold">{asists}</span>
        {/* <span className="text-sm text-gray-400">10</span> */}
      </div>

      <div className="flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]   space-y-2">
        <div className="flex items-center justify-center p-2 rounded-full bg-primary-danger">
          <span className="text-white text-sm font-bold">ORB</span>
        </div>
        <span className="text-2xl text-gray-200 font-bold">{offRebounds}</span>
        {/* <span className="text-sm text-gray-400">5</span> */}
      </div>

      <div className="flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]  space-y-2">
        <div className="flex items-center justify-center p-2 rounded-full bg-primary-cta">
          <span className="text-white text-sm font-bold">RB</span>
        </div>
        <span className="text-2xl text-gray-200 text- font-bold">{rebounds}</span>
        {/* <span className="text-sm text-gray-400">8</span> */}
      </div>

    </div>
  </div>
</div>





<div className=" w-full    h-auto my-4">
  <h1 className="text-md font-semibold text-center mt-2 mb-4 text-white font-semibold ">Lead Changes   <span className="px-3">-</span> 
 {/* renderign the lea changes into the label for space savings ❤️ */}
<span className="text-gray-300 ">
  
        {(() => {
          // Check if Ravens are currently leading
          if (teamScore > opponentScore) {
            // Find when they LAST took the lead
            const lastLeadChange = leadChanges
            .slice()
            .reverse()
            .find((lead) => lead.team === "Ravens");
          
          if (lastLeadChange) {
            return (
              <span className="text-primary-cta">
                Lead since Q{lastLeadChange.q} ({lastLeadChange.score})
              </span>
            );
          }
          

            return <span className="text-primary-cta">Currently Leading</span>;
          }

          // Find the last time Ravens had the lead
          const lastRavensLead = leadChanges
          .slice()
          .reverse()
          .find((lead, index, arr) => {
            // Find the last instance where Ravens were in the lead *before* they lost it
            const nextLead = arr[index - 1]; // The lead change right after it
            return lead.team === "Ravens" && nextLead && nextLead.team !== "Ravens";
          });
        
        if (lastRavensLead) {
          return (
            <span className="text-gray-300">
              Last lead Q{lastRavensLead.q} ({lastRavensLead.score})
            </span>
          );
        }
        
          // If they never led
          return <span className="text-primary-danger">Never in Lead</span>;
        })()}
      </span>

  
  </h1>
  {/* timeline for lead changes will go here  */}
  <div className="w-full h-auto ">
      {/* 🔹 Quarter Navigation */}
      <div className="flex space-x-2 mb-4 ">
  {/* Always show "All" button */}
  <button
    onClick={() => setSelectedQuarter("All")}
    className={`px-4 py-2 rounded ${
      selectedQuarter === "All" ? "bg-white/10 text-white" : "bg-secondary-bg text-gray-400"
    }`}
  >
    All
  </button>

  {/* Only show quarters that have data */}
  {availableQuarters.map((q) => (
    <button
  key={q}
  onClick={() => setSelectedQuarter(q)}
  className={`px-4 py-2 rounded ${
    selectedQuarter === q ? "bg-white/10 text-white" : "bg-secondary-bg text-gray-400"
  }`}
>
  {q > 4 ? `OT${q - 4}` : `Q${q}`}
</button>

  ))}
</div>

<div className=" h-28 flex flex-row ">
  <div className="h-28 flex flex-col w-1/12 ">
  <div className={`w-14 px-2 flex items-center justify-center h-1/2 bg-white/10 rounded-full
   ${teamScore>opponentScore ? "border-2 border-primary-cta" : ""} `}>
  <img className="w-10  mx-auto h-10 rounded-full " src={ravensLogo} alt={opponentName} />
  </div>
  <div className={`w-14 flex  items-center justify-center h-1/2 bg-white/10 rounded-full mt-2
    
    ${teamScore<opponentScore ? "border-2 border-[#10B981]" : ""}`}>
  {/* <img className="w-10  mx-auto h-10 rounded-full " src={opponentJerseyDefault} alt={opponentName} /> */}
  <img 
  className="w-10 h-10 mx-auto rounded-full "
  src={opponentLogo || opponentJerseyDefault} 
  alt={opponentName} 
/>

  </div>
  </div>
  <ul className="timeline flex overflow-x-auto w-11/12 space-x-2 relative">
  {filteredLeadChanges.map((lead, index) => {
    const isLatest = lead === latestLeadChange; // Now correctly highlighting the first (left-most) lead

    return (
      <li key={index} className="flex-shrink-0 relative flex flex-col items-center">
        {/* Top Score Box (Ravens lead) */}
        {lead.team === "Ravens" && (
          <div className={`timeline-start timeline-box border-none ${isLatest ? "bg-[#0b63fb] text-white" : "bg-secondary-bg text-gray-300"}`}>
            {lead.score}
          </div>
        )}

        {/* Icon + Connecting Line */}
  {/* Icon + Connecting Line */}
<div className={`timeline-middle relative bg-secondary-bg  p-2 rounded-full border-none flex items-center ${lead.team === 'Ravens' ? "text-primary-cta" : "text-gray-400"}`}>
  {(() => {
    // Extract the scores from the lead.score string (assuming format like "6-5")
    const scoreParts = lead.score.split('-');
    const homeScore = parseInt(scoreParts[0], 10);
    const awayScore = parseInt(scoreParts[1], 10);
    const isTied = homeScore === awayScore;
    
    if (lead.team === "Ravens") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    } else if (isTied) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-secondary-cta">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
        </svg>
      );
    }
  })()}
  {/* ✅ Horizontal Line (only if there's another lead change after this one) */}
  {index !== filteredLeadChanges.length - 1 && (
    <div className="absolute top-1/2 left-full w-14 h-1 bg-secondary-bg"></div>
  )}
</div>

        {/* Bottom Score Box (Opponent lead) */}
        {lead.team !== "Ravens" && (
          <div className={`timeline-end border-none timeline-box ${isLatest ? "bg-red-600 text-white" : 
          "bg-secondary-bg text-gray-300"}`}>
            {lead.score}
          </div>
        )}
      </li>
    );
  })}
</ul>




</div>
    </div>

<div className=" rounded-xl p-2" style={{ height: "200px", width: "100%",marginTop:"40px" }}>
<h4 className="" style={{ textAlign: 'center', color: '#fff', marginBottom: '10px' }}>Scoring Quarter Split</h4>

<div className="bg-primary-bg h-full w-full  py-2 rounded-md">
  <ResponsiveLine
    animate={true} 
    motionConfig={{ mass: 1, tension: 250, friction: 20 }}
    data={gameLineChartData}
    margin={{ top: 20, right: 50, bottom: 50, left: 50 }}
    xScale={{ type: "point" }}
    yScale={{
      type: "linear",
      min: 0,
      max: "auto",
      stacked: false,
      nice: true
    }}
    axisBottom={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Quarter",
      legendOffset: 36,
      legendPosition: "middle"
    }}
    pointLabel={(point) => `${point.data.y}`}
    pointLabelYOffset={-12}
    pointLabelTextColor={{ from: "color", modifiers: [["brighter", 1.5]] }}
    theme={customTheme}
    axisLeft={{
      tickValues: Array.from({ length: 21 }, (_, i) => i * 5),
      legend: "Score",
      legendOffset: -40,
      legendPosition: "middle"
    }}
    pointLabelColor="#FFFFFFF"
    colors={({ id }) => (id === "Ravens" ? "#0b63fb" : "#10B981")}
    pointColor={({ id }) => (id === "Opponent" ? "#10B981" : "#0b63fb")}
    pointSize={10}
    pointBorderWidth={2}
    pointBorderColor={{ from: "serieColor" }}
    enablePointLabel={true}
    useMesh={true}
  />
</div>


  </div>
  <div className="w-full mt-10 flex flex-row">
  <div className=" rounded-md  w-1/2" style={{ height: "200px" }}>
  <h4 style={{ textAlign: 'center', color: '#fff', marginBottom: '10px' }}>Scoring Split</h4>
      <ResponsivePie
        data={pieData}
        margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors={({ data }) => data.color}
        borderWidth={2}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        enableArcLabels={true}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#FFFFFF"
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'FG Percentage',
          legendPosition: 'middle',
          legendOffset: 40,
        }}
        theme={customTheme}
      />
      
    </div>
    
    <div className="w-1/2 ">

    <ResponsiveBar
  data={[{ category: "Possessions", steals: steals, turnovers: turnovers }]} // Example data
  keys={["steals", "turnovers"]}
  indexBy="category"
  layout="horizontal" // ✅ Horizontal bar
  margin={{ top: 20, right: 20, bottom: 50, left: 20 }} // Extra space for legend
  padding={0.5}
  colors={["#0b63fb", "#10B981"]} // ✅ Yellow (steals) & Blue (turnovers)
  axisLeft={null} // ✅ No left axis labels
  axisBottom={null} // ✅ No bottom axis labels
  enableGridX={false} // ✅ No gridlines
  borderRadius={5} // ✅ Rounded corners
  labelSkipWidth={10} // ✅ Only show label if bar is wide enough
  labelSkipHeight={10}
  labelTextColor="black" // ✅ Numbers inside bars
  theme={{
    axis: { ticks: { text: { fill: "#fff" } } }
  }}
  legends={[
    {
      data: [
        { id: "steals", label: "Steals", color: "#0b63fb" },
        { id: "turnovers", label: "Turnovers", color: "#10B981" }
      ],
      anchor: "top",
      direction: "row",

      justify: false,
      translateY: 10, // ✅ Space below for legend
      itemsSpacing: 10,
      itemWidth: 80,
      itemHeight: 20,
      itemDirection: "left-to-right",
      symbolSize: 15,
      symbolShape: "square",
      itemTextColor: "#fff"
    }
  ]}
/>


    </div>

    </div>
    <div className="w-full h-48 flex flex-row">
      <div className="w-1/2 h-full">
      <ResponsiveBar
     
  data={fgPercentages}
  keys={['percentage']}
  indexBy="quarter"
  margin={{ top: 20, right: 50, bottom: 50, left: 60 }}
  padding={0.3}
  colors="#0b63fb"
  theme={customTheme}
  valueScale={{ type: 'linear' }}
  indexScale={{ type: 'band', round: true }}
  axisTop={null}
  axisRight={null}
  legends={[
    {
      anchor: "top", // 🔥 Position it at the top
      direction: "row",
      justify: false,
      translateY: -20, // Move it up/down if needed
      itemsSpacing: 10,
      itemWidth: 100,
      itemHeight: 18,
      itemTextColor: "#fff", // Customize text color
      symbolSize: 18,
      symbolShape: "circle",
    }
  ]}
  axisLeft={null} // ✅ Remove Y-axis numbers
  enableGridX={false} // ✅ Remove grid lines
  enableGridY={false}
  labelSkipWidth={12}
  labelSkipHeight={12}
  labelTextColor="#ffffff"
  label={({ value }) => `${value}%`} // ✅ Adds % to inside bar labels
  animate={true}
  motionConfig="wobbly"
/>

    </div>
    <div className="w-1/2 h-full">
    <ResponsiveBar
  data={stealsTurnoversData}
  keys={['steals', 'turnovers']}
  indexBy="quarter"
  margin={{ top: 20, right: 50, bottom: 50, left: 50 }}
  padding={0.3}
  layout="vertical"
  valueScale={{ type: 'linear' }}
  indexScale={{ type: 'band', round: true }}
  colors={({ id }) => (id === 'steals' ? '#0b63fb' : '#10B981')} // Green & Red split
  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
  theme={customTheme} // Using your theme
  labelTextColor="#fff"
  axisTop={null}
  axisRight={null}
  axisLeft={null} // Remove numbers
  axisBottom={{
    tickSize: 5,
    tickPadding: 5,
    tickRotation: 0,
    legend: '',
    legendPosition: 'middle',
    legendOffset: 40,
  }}
  enableGridX={false}
  enableGridY={false}
  labelSkipWidth={12}
  labelSkipHeight={12}
  label={({ value }) => `${value}`} // Show values
  legends={[
    {
      anchor: 'top',
      direction: 'row',
      translateY: -20,
      itemsSpacing: 10,
      itemWidth: 80,
      itemHeight: 20,
      itemTextColor: '#fff',
      symbolSize: 18,
      symbolShape: 'circle',
      data: [
        { id: 'steals', label: 'Steals', color: '#0b63fb' },
        { id: 'turnovers', label: 'Turnovers', color: '#10B981' },
      ],
    },
  ]}
/>
    </div>
    </div>
</div>
      {/* <div className="flex w-full flex-row  mt-10 ">
        <svg onClick={()=>{
          setGameStatsExpanded(!gameStatsExpanded)
        }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mr-2 my-auto text-gray-400">

  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />

</svg>


      <div className={`overflow-x-auto max-h-80 overflow-auto w-full
      ${gameStatsExpanded ? "h-auto" : " h-10"}

      `}>
        <table className="min-w-full  w-full text-white border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Quarter</th>
              <th className="px-4 py-2 border-b">Action</th>
              <th className="px-4 py-2 border-b">Time</th>
              <th className="px-4 py-2 border-b">Player</th>
           
            </tr>
          </thead>
          <tbody>
            {gameActions.map((action, index) => (
              <tr key={index} className="hover:bg-white/10">
                <td className={`px-4 py-2 border-b text-center  `}>{action.quarter}</td>
                <td className="px-4 py-2 border-b text-center">{action.actionName}</td>
                <td className="px-4 py-2 border-b text-center">
                  {action.timestamp ? new Date(action.timestamp).toLocaleTimeString() : "-"}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  {action.playerName ? `${action.playerName} (${action.playerNumber})` : "-"}
                </td>
 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div> */}
    </div>
  </div>
)}
{/* this will be the modal for the player stats
 */}
{showPlayerStatsModal && (
  <div
    className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
    onClick={() => setShowPlayerStatsModal(false)} // Clicking outside closes the modal
  >
    {/* Modal Content */}
    <div
      className="relative bg-secondary-bg p-6 rounded-lg w-full max-w-4xl mx-4 my-8 overflow-auto max-h-full"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
   
   <div className="flex  justify-between items-center mb-4 p-4 ">
  {/* Player Stats Header */}
  {/* <div className="flex">
    <h2 className="text-white text-2xl font-bold  px-4 py-2">Player Stats</h2>
  </div> */}

  {/* Score Section */}
  <div
  onClick={() => setShowEditOpponentScoreModal(!showEditOpponentScoreModal)}
  className="flex flex-col space-y-2 pe-10 border-r-2 border-r-gray-400 w-2/5 "
>
  {/* Team Score Row */}
  <div className="flex items-center w-full">
    <img className="w-10 h-10 rounded-full mr-2" src={ravensLogo} alt="Ravens" />
    <span className={`${teamScore > opponentScore ? "text-white" :"text-gray-400"} text-lg font-semibold flex-1`}>Ravens</span>
    <span className={`${teamScore > opponentScore ? "text-white" :"text-gray-400"} text-lg font-bold`}>{teamScore}</span>
  </div>

  {/* Opponent Score Row */}
  <div className="flex items-center w-full">
  <img 
  className="w-10 h-10 mx-auto rounded-full mr-2"
  src={opponentLogo || opponentJerseyDefault} 
  alt={opponentName} 
/>
    <span className={`${teamScore < opponentScore ? "text-white" :"text-gray-400"} text-lg font-semibold flex-1`}>{opponentName}</span>
    <span className={`${teamScore < opponentScore ? "text-white" :"text-gray-400"} text-lg font-bold`}>{opponentScore}</span>
  </div>
</div>

  
  <div className="flex flex-col  w-2/5  ">


  <div class="relative overflow-x-auto ">
  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
  <thead className="text-xs uppercase bg-primary-bg">
    <tr>
      {/* Render Q1-Q4 dynamically */}
      {[1, 2, 3, 4].map((q) => (
        <th
          key={q}
          className={`px-6 py-3 ${q === 1 ? "rounded-s-lg" : ""} 
          ${q === 4 && currentQuater <= 4 ? "rounded-e-lg" : ""} 
          ${q === currentQuater ? "text-white" : "text-gray-400"}`}
        >
          Q{q}
        </th>
      ))}

      {/* Render OT dynamically if currentQuater > 4 */}
      {currentQuater > 4 &&
        [...Array(currentQuater - 4)].map((_, index) => {
          const otNumber = index + 1;
          return (
            <th
              key={`OT${otNumber}`}
              className={`px-6 py-3 ${currentQuater === otNumber + 4 ? "text-white" : "text-gray-400"} 
              ${otNumber + 4 === currentQuater ? "rounded-e-lg" : ""}`}
            >
              OT{otNumber}
            </th>
          );
        })}
    </tr>
  </thead>
  <tbody>
    <tr className="bg-secondary-bg">
      {/* Render Q1-Q4 scores dynamically */}
      {[1, 2, 3, 4].map((q) => (
        <td
          key={q}
          className={`px-6 py-4 ${q === currentQuater ? "text-white" : "text-gray-400"}`}
        >
          {quarterScores[q] > 0 ? quarterScores[q] : currentQuater >= q ? "0" : "-"}
        </td>
      ))}

      {/* Render OT scores dynamically */}
      {currentQuater > 4 &&
        [...Array(currentQuater - 4)].map((_, index) => {
          const otNumber = index + 5; // OT starts from Q5 (1st OT)
          return (
            <td
              key={`OT${otNumber}`}
              className={`px-6 py-4 ${currentQuater === otNumber ? "text-white" : "text-gray-400"}`}
            >
              {quarterScores[otNumber] > 0 ? quarterScores[otNumber] : "0"}
            </td>
          );
        })}
    </tr>
  </tbody>
</table>





</div>

  </div>
<div className=" h-full">
  {/* Close Button */}
  <button
    onClick={() => setShowPlayerStatsModal(false)}
    className="text-white bg-primary-danger/50 hover:bg-red-500 px-4 py-2 rounded"
  >
    Close
  </button>
  </div>
</div>
<div>
{showEditOpponentScoreModal &&
<>
<div className="flex  items-center">
<form className="max-w-56 my-5 px-5">
    <label htmlFor="number-input" className="block mb-2 text-sm font-medium text-white">
        {opponentName} Score
    </label>
    <input 
    type="number" 
    id="number-input" 
    aria-describedby="helper-text-explanation" 
    className="bg-primary-bg border border-secondary-bg text-gray-200 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400"
    placeholder="0" 
    value={opponentScore} // Bind input value to state
    onChange={(e) => {
        let value = e.target.value.replace(/^0+(?=\d)/, ""); // Remove leading zeros
        setOpponentScore(value === "" ? 0 : Number(value)); // If empty, reset to 0
    }} 
    required 
/>

</form>
<svg onClick={()=>{
  setShowEditOpponentScoreModal(!showEditOpponentScoreModal)
}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-primary-cta">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
</div>
</>
}

      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-white border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b  text-left">PlayerName</th>
              
              {minutesTracked && (
      <th className="px-4 py-2 border-b text-left">Mins</th>
    )}
              <th className="px-4 py-2 border-b  text-left">PTS</th>
              <th className="px-4 py-2 border-b text-left">FG</th>
              <th className="px-4 py-2 border-b text-left">3PT</th>
              <th className="px-4 py-2 border-b text-left">FT</th>
              <th className="px-4 py-2 border-b text-left">AST</th>
              <th className="px-4 py-2 border-b text-left">RB</th>
              <th className="px-4 py-2 border-b text-left">BLK</th>
              <th className="px-4 py-2 border-b text-left">STL</th>
              <th className="px-4 py-2 border-b text-left">TO</th>
              <th className="px-4 py-2 border-b text-left">ORB</th>
            </tr>
          </thead>
          <tbody>
          {playersStatsArray.length > 0 ? (
  [...playersStatsArray] // Create a copy to avoid mutating the original array
    .map(stat => ({
      ...stat,
      totalPoints: (stat.fgMade * 2) + (stat.threePtMade * 1) + (stat.ftMade * 1)
    })) // Compute points
    .sort((a, b) => b.totalPoints - a.totalPoints) // Sort by points (highest first)
    .map((stat, index) => {
      const fgPct = stat.fgAttempts ? Math.round((stat.fgMade / stat.fgAttempts) * 100) : 0;
      const threePct = stat.threePtAttempts ? Math.round((stat.threePtMade / stat.threePtAttempts) * 100) : 0;
      const ftPct = stat.ftAttempts ? Math.round((stat.ftMade / stat.ftAttempts) * 100) : 0;

      // Calculate total points for the player
      const totalPoints = (stat.fgMade * 2) + (stat.threePtMade * 1) + (stat.ftMade * 1);
        // 🔥 Get player's minutes based on playerNumber or name
        const playerNumber = extractPlayerNumber(stat.player);
        const minutesPlayed = playerNumber ? playerMinutes[playerNumber] || 0 : 0;
        



        


      return (
        <tr key={index} className="hover:bg-primary-cta group odd:bg-secondary-bg even:bg-white/10 text-white hover:text-primary-bg">
          <td className="px-4 py-2 border-b border-b-gray-500 "><span className="text-gray-200 group-hover:text-black">{stat.player}</span></td>
          {minutesTracked && (
<>

             {/* New Minutes Column */}
             <td className="px-4 py-2 border-b border-b-gray-500 font-bold text-white">

              <span className="text-gray-200 group-hover:text-black">{minutesPlayed}</span>
            </td>
            </>
                )}
          <td className="px-4 py-2 border-b border-b-gray-500 font-bold text-white"><span className="text-gray-200 group-hover:text-black">{totalPoints}</span></td> {/* Player Points */}
          <td className="px-4 py-2 border-b border-b-gray-500">{stat.fgMade}-{stat.fgAttempts} <span className="text-gray-400 group-hover:text-black">({fgPct}%)</span></td>
          <td className="px-4 py-2 border-b border-b-gray-500">{stat.threePtMade}-{stat.threePtAttempts}  <span className="text-gray-400 group-hover:text-black">({threePct}%)</span></td>
          <td className="px-4 py-2 border-b border-b-gray-500">{stat.ftMade}-{stat.ftAttempts}  <span className="text-gray-500 group-hover:text-black">({ftPct}%)</span></td>
          <td className={`px-4 py-2 border-b border-b-gray-500 ${stat.assists === 0 ? "text-gray-500" : ""}`}>{stat.assists}</td>
          <td className={`px-4 py-2 border-b border-b-gray-500 ${stat.rebounds === 0 ? "text-gray-500" : ""}`}>{stat.rebounds}</td>
          <td className={`px-4 py-2 border-b border-b-gray-500 ${stat.blocks === 0 ? "text-gray-500" : ""}`}>{stat.blocks}</td>
          <td className={`px-4 py-2 border-b border-b-gray-500 ${stat.steals === 0 ? "text-gray-500" : ""}`}>{stat.steals}</td>
          <td className={`px-4 py-2 border-b border-b-gray-500 ${stat.turnovers === 0 ? "text-gray-500" : ""}`}>{stat.turnovers}</td>
          <td className={`px-4 py-2 border-b border-b-gray-500 ${stat.offRebounds === 0 ? "text-gray-500" : ""}`}>{stat.offRebounds}</td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td className="px-4 py-2 border-b text-center" colSpan="8">
        No player stats available.
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>
    </div>
  </div>
)}




      </main>
    </>
  );
}
