import { useState,useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faForward,faBackward} from '@fortawesome/free-solid-svg-icons';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { db } from "../db";
import { Menu } from '@headlessui/react';
import { v4 as uuidv4 } from 'uuid';  // Install with: npm install uuid
export default function InGame() {
  const navigate = useNavigate();
const [currentGameActionFilter,setCurrentGameActionFilter] = useState(null);
  const [currentQuater,setCurrentQuarter]=useState(1)
  const location = useLocation();
  const savedGame = location.state; // Now savedGame will have the data passed from StartGame/HomeDashboard
  
  const [gameActions, setGameActions] = useState(savedGame?.actions || []); // Use saved game actions if present
  const [actionSelected, setActionSelected] = useState(null); // Tracks selected action
  const [alertMessage, setAlertMessage] = useState(""); // Tracks the alert message
  const [fieldGoal,setFieldGoal] = useState({total:0,made:0});
  const [threepoint,setThreePoint] = useState({total:0,made:0});
  const [fieldGoalPercentage,setFieldGoalPercentage]=useState(null);
  const [threePointPercentage,setThreePointPercentage]=useState(null);
const [SaveGameBtnText,setSaveGameBtnText]= useState('Save Game')
const [opponentName, setOpponentName] = useState(savedGame?.opponentName || "New Game");
const [selectedVenue, setSelectedVenue] = useState(savedGame?.venue || "Home");
// Immediately after your existing state declarations, add:
const passedLineout = savedGame && savedGame.lineout ? savedGame.lineout : null;
const [currentGameId, setCurrentGameId] = useState(null);
const [dropdownOpen, setDropdownOpen] = useState(false);



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
  if (action.actionName === "OffRebound") acc[key].offRebounds += 1;
  if (action.actionName === "Block") acc[key].blocks += 1;

  return acc;
}, {});

const playersStatsArray = Object.values(playersStats);


useEffect(() => {
  // Only auto-save if the game is created (i.e. opponentName is set)
  // and there are some actions recorded.
  if (opponentName && gameActions.length > 0) {
    // Set a timer that will call the save function after 10 seconds of inactivity.
    const autoSaveTimer = setTimeout(() => {
      handleSaveGame('save');
      console.log("Auto-saved game!");
    }, 10000); // 10 seconds

    // Clear the timer if gameActions changes before 10 seconds are up.
    return () => clearTimeout(autoSaveTimer);
  }
}, [gameActions, opponentName]);

useEffect(() => {
  if (savedGame && savedGame.id) {
    setCurrentGameId(savedGame.id);  // Ensure ID persists when reopening
    console.log("Loaded saved game:", savedGame);
  } else {
    console.log("Starting a new game.");
  }
}, [savedGame]);



   // Handle game actions
   const handleGameAction = (action) => {
    const newAction = {
      quarter: currentQuater,
      actionName: action,
      timestamp: Date.now(),
    };
    setGameActions((prev) => [...prev, newAction]);
    setAlertMessage(`${action} recorded.`);
    setTimeout(() => setAlertMessage(""), 3000);
  };
  const handlePlayerSelection = (player) => {
    if (!pendingAction) return;
  
    // Store the action name locally to avoid referencing stale state later
    const actionName = pendingAction.actionName;
  
    const newAction = {
      ...pendingAction,
      playerName: player.name,
      playerNumber: player.number,
      timestamp: Date.now(),
    };
  
    setGameActions((prev) => [...prev, newAction]);
  
    // Close the modal and clear the pending action
    setShowPlayerModal(false);
    setPendingAction(null);
  
    setAlertMessage(`${actionName} recorded for ${player.name}!`);
    setTimeout(() => setAlertMessage(""), 3000);
  };
  
  
//hanlder for going to next period/quarter
const handleNextPeriodClick =()=>{
  console.log('clicked boii');

  //need to check if the current quarter is less then 4 before adding one to it
  if(currentQuater<4){
    //we can add one to it now, since its less then 4 
    setCurrentQuarter(currentQuater+1)
//also clear the action selected
setActionSelected()
  }
  if(currentQuater==3){
    //we need to change the text to finsih game
    console.log(' change text to finsih game ');
    
  }
      // Show an alert message
      setAlertMessage(`Finished Q${currentQuater} !`);
      setTimeout(() => setAlertMessage(""), 3000);
}
// handler for going back a quarter
const handlePreviousPeriodClick =()=>{
//first we check if the quarter is more than one. I know we already check this in the disabled, but measure twice cut once hai

if(currentQuater>1){
  //we good to minus one
  setCurrentQuarter(currentQuater-1);
  //cheeky alert message 
      // Show an alert message
      setAlertMessage(`Back to Q${currentQuater-1} !`);
      setTimeout(() => setAlertMessage(""), 3000);
}else{
  console.log('we have issue');
  
}
  
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
//for saving the gamedata to localstorage
// Save the game
// const handleSaveGame = () => {
//   if (!gameActions.length) {
//     setAlertMessage("No actions to save!");
//     setTimeout(() => setAlertMessage(""), 2000);
//     return;
//   }

//   const gameData = {
//     id: savedGame?.id || `game_${Date.now()}`,
//     opponentName,
//     venue: selectedVenue,
//     actions: gameActions,
//     timestamp: new Date().toISOString(),
//   };

//   console.log("Game Data to Save:", gameData);

//   // Fetch existing saved games
//   const savedGames = JSON.parse(localStorage.getItem("savedGames")) || [];
//   console.log("Previously Saved Games:", savedGames);

//   const updatedGames = savedGame
//     ? savedGames.map((game) =>
//         game.id === savedGame.id ? gameData : game // Update game
//       )
//     : [...savedGames, gameData]; // Add new game

//   console.log("Updated Games List:", updatedGames);

//   // Try saving to localStorage
//   try {
//     localStorage.setItem("savedGames", JSON.stringify(updatedGames));
//     console.log("Saved to localStorage successfully!");
//     setAlertMessage("Game saved successfully!");
//     setTimeout(() => setAlertMessage(""), 3000);
//   } catch (error) {
//     console.error("Error saving to localStorage:", error);
//     setAlertMessage("Error saving game. Please try again.");
//     setTimeout(() => setAlertMessage(""), 3000);
//   }
// };
const handleSaveGame = async () => {
  if (gameActions.length === 0) {
    setAlertMessage("No actions to save!");
    setTimeout(() => setAlertMessage(""), 2000);
    return;
  }

  let gameId = currentGameId;

  // If it's a new game, generate a UUID
  if (!gameId) {
    gameId = savedGame?.id || uuidv4();  // Use existing ID or create a new one
    setCurrentGameId(gameId); // Persist the game ID
  }

  const gameData = {
    id: gameId,  // Unique ID that remains consistent
    opponentName,
    venue: selectedVenue,
    actions: gameActions,
    lineout: savedGame?.lineout || passedLineout,
    timestamp: new Date().toISOString(), // Keep timestamp for sorting but NOT as ID
  };

  try {
    await db.games.put(gameData);  // Upsert instead of creating a new entry
    setAlertMessage("Game saved successfully!");
    setIsGameSaved(true);
  } catch (error) {
    console.error("Error saving game:", error);
    setAlertMessage("Error saving game. Please try again.");
  }

  setTimeout(() => setAlertMessage(""), 3000);
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
  const x = e.clientX - court.left; // X relative to court
  const y = e.clientY - court.top;  // Y relative to court
  const normalizedX = (x / court.width) * 100;
  const normalizedY = (y / court.height) * 100;

  if (passedLineout) {
    // If a lineout exists, wait for player selection
    setPendingAction({
      actionName: actionSelected,
      quarter: currentQuater,
      x: normalizedX,
      y: normalizedY,
    });
    setShowPlayerModal(true);
  } else {
    // Otherwise, record action immediately
    const newAction = {
      quarter: currentQuater,
      actionName: actionSelected,
      x: normalizedX,
      y: normalizedY,
      timestamp: Date.now(),
    };
    setGameActions((prev) => [...prev, newAction]);
    setAlertMessage(`${actionSelected} recorded.`);
    setTimeout(() => setAlertMessage(""), 3000);
  }
};





const filteredActions=[
  "2 Points",
  "3 Points",
  "2Pt Miss",
  "3Pt Miss",

 

]
  
  const actions = [
    "2 Points",
    "3 Points",
    "2Pt Miss",
    "3Pt Miss",
    "FT Score",
    "FT Miss",
    "Assist",
    "Steal",
    "Block",
    "T/O",
    "Rebound",
    "OffRebound",
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
  


  return (
    <>
    
    <main className=" bg-primary-bg">
      
      {/* Top Nav */}
      <div className="container mx-auto  items-center bg-primary-bg" >
        <div className="top-nav w-auto h-[12vh]  relative">
          {/* Alert Message */}
          {alertMessage && (
        <div class="absolute w-full  mx-auto text-center px-10 lg:px-4">
        <div class="p-2 h-auto bg-secondary-bg shadow-lg py-2 rounded-lg items-center text-indigo-100 leading-none lg:rounded-md mx-10 flex z-50 lg:inline-flex" role="alert">
        {alertMessage === "Saved" ? (
          <svg
  xmlns="http://www.w3.org/2000/svg"
  className="h-6 w-6 text-primary-cta inline-block"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zM12 19v-6h6"
  />
</svg>

) : (
  <>
  <span class="flex rounded-lg bg-primary-cta uppercase px-2 py-1 text-xs font-bold mr-3">New</span>
  <span class="font-semibold mr-2 text-left flex-auto">{alertMessage}</span>
  <svg class="fill-current opacity-75 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z"/></svg>
  </>
)}


       
        </div>
      </div>
          )}


{/* top  of the top nav contents */}
<div className="text-white h-2/5 flex-row flex space-x-2 px-2 w-full">
<div className=" w-1/4 h-full text-center flex items-center  rounded-lg"><p className="text-center capitalize mx-auto"> {opponentName} 
  {/* ({selectedVenue}) */}
  </p></div>
<div className=" w-2/4 h-full text-center flex items-center rounded-lg "><p className="text-center mx-auto"> Q{currentQuater}</p></div>


{/* <div className=" w-1/4 h-full text-center flex items-center bg-secondary-bg rounded-lg "><p className="text-center mx-auto">21-12-2024</p></div> */}
<button
  onClick={() => {
    // If there are unsaved actions and the game hasn't been saved, show the exit modal.
    if (!isGameSaved && gameActions.length > 0) {
      setShowExitModal(true);
    } else {
      navigate('/homedashboard');
    }
  }}
  className="w-1/4 h-full text-center flex items-center bg-secondary-bg hover:bg-primary-danger/50 rounded-lg"
>
  <p className="text-center mx-auto">Exit</p>
</button>


</div>
{/* bottom  of the top nav contents */}
<div className=" flex flex-row  text-white mb-2 space-x-2 px-2 p-1 h-3/5 w-full">
<div 
// disabled={gameActions===0}

  onClick={handleUndoLastActionHandler} 
  className={`w-1/4 h-full bg-blue-900 rounded-lg text-center flex items-center z-0 cursor-pointer hover:bg-white/10 transition transform hover:scale-105
  ${gameActions==0 ? "bg-secondary-bg/50 line-through text-gray-400" : "bg-secondary-bg "}
  `}
>
  <p className="text-center mx-auto text-sm flex text-gray-200 items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mr-5 text-primary-cta">
  <path stroke-linecap="round" stroke-linejoin="round" d="m7.49 12-3.75 3.75m0 0 3.75 3.75m-3.75-3.75h16.5V4.499" />
</svg>
Undo </p>
</div >
<Menu as="div" className="relative inline-block text-left w-1/4 h-full">
  <Menu.Button 
  
  className={`w-full h-full bg-secondary-bg   hover:bg-white/10 rounded-lg flex items-center justify-center text-sm 
  ${currentGameActionFilter ? "bg-primary-bg  text-primary-cta  rounded-none" : "text-white" }

  
  `}>
    {currentGameActionFilter ? currentGameActionFilter  : "Filters"}
  </Menu.Button>
  <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right  bg-primary-bg divide-y divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999]">
    <div className="px-1 py-1">

      {currentGameActionFilter &&
      <Menu.Item>
        {({ active }) => (
          <button
          onClick={()=>{
            setCurrentGameActionFilter(null)
          }}
            className={`${
              active ? 'bg-gray-700 bg-red-600 text-white' : 'text-gray-200'
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
            setCurrentGameActionFilter('All Game')
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
          setCurrentGameActionFilter(action);
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
                  setCurrentGameActionFilter(player.name);
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

<div
  onClick={() => setShowGameStatsModal(true)}
  className="w-1/4 h-full bg-secondary-bg text-sm rounded-lg text-center flex items-center cursor-pointer hover:bg-white/10 transition"
>
  <p className="text-center mx-auto">Game Stats</p>
</div>

{/* <div
  onClick={() => setShowGameStatsModal(true)}
  className="w-1/4 h-full bg-secondary-bg text-sm rounded-lg text-center flex items-center cursor-pointer hover:bg-white/10 transition"
>
  <p className="text-center mx-auto">Filters</p>
</div> */}

<div onClick={()=>{
  setShowPlayerStatsModal(true)
}} className=" w-1/4 h-full bg-secondary-bg cursor-pointer hover:bg-white/10 rounded-lg text-center flex items-center"><p className="text-center mx-auto text-sm">Player Stats</p>
</div>



<div onClick={handleSaveGame} className={` w-1/4 h-full cursor-pointer hover:bg-primary-cta  rounded-lg text-center flex items-center
  ${currentQuater===4 ? "bg-primary-cta"  : "bg-secondary-bg"  }
  `}>
<p className="text-center mx-auto text-sm"> {SaveGameBtnText}</p></div>

</div>

        </div>

{/* Court */}
<div
  onClick={handleCourtClick} // Make the court clickable
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
    // Optional: clicking the overlay also closes the modal
    onClick={() => {
      setShowPlayerModal(false);
      setPendingAction(null);
    }}
  >
    {/* Modal Overlay */}
    <div className="absolute inset-0 bg-black opacity-50"></div>
    {/* Modal Content */}
    <div
      className="relative bg-secondary-bg p-6 rounded-lg w-72"
      // Stop propagation so clicks inside the modal don't trigger the overlay onClick
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-white text-lg mb-4">Select Player</h3>
      {passedLineout && passedLineout.players && passedLineout.players.length > 0 ? (
        passedLineout.players.map((player, index) => (
          <button
            key={index}
            onClick={() => handlePlayerSelection(player)}
            className="w-full text-left p-2 mb-2 bg-white/10 hover:bg-primary-cta group text-white rounded"
          >
         <span className="text-gray-400 group-hover:text-black">  ({player.number}) </span>{player.name} 
          </button>
        ))
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
    

    {/* <div className="bg-primary-danger w-[100%]  h-[50%] absolute"></div>
    <div className="bg-red-300 w-[76%]  top-[50%] h-[30%] left-[12%] absolute"></div>
    <div className="bg-red-100 w-[40%]  top-[80%] h-[15%] left-[30%] absolute"></div>
    <div className="bg-green-100 w-[10%]  top-[95%] h-[5%] left-[45%] absolute"></div> */}

    {/* Court Key */}
    <div
      className={`absolute sm:w-1/4 w-1/3 left-1/3 sm:left-[37.5%] border border-gray-500   h-[60%]`}
    ></div>
    <div className="absolute sm:w-1/4 w-1/3 left-1/3 sm:left-[37.5%] border-2 border-gray-500  lg:h-[30%] h-[25%] sm:h-[25%] rounded-b-full top-[60%]"></div>

    {/* Render Actions as Dots */}
   
  </div>
 {/* Render Actions */}
 {gameActions
.filter((action) => 
  currentGameActionFilter === "All Game" || action.quarter === currentQuater
)
.filter((action) => 
  !currentGameActionFilter || currentGameActionFilter === "All Game" ||
  action.actionName === currentGameActionFilter ||
  action.playerName === currentGameActionFilter
)

  .map((action, index) => {
    // Only render a dot if both x and y are valid numbers.
    if (typeof action.x === "number" && typeof action.y === "number") {
      return (
        <div
          key={index}
          className={`absolute w-4 h-4 rounded-full ${
            ["2Pt Miss", "3Pt Miss"].includes(action.actionName)
              ? "bg-primary-danger"
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
    } else {
      return null;
    }
  })}



  {/* Court outline */}

</div>



        {/* Bottom Nav */}
        <div className="bottom-nav  items-center justify-center w-full  h-[33vh] ">
{/* Quick Stats Section */}
        <div className="text-white   items-center justify-center  flex-row p-2 space-x-4 flex w-auto  h-1/4">
        {currentGameActionFilter &&
        <div onClick={()=>{
          setCurrentGameActionFilter(null)
        }} className="relative w-[20%] items-center group hover:bg-primary-cta  cursor-pointer justify-center bg-secondary-bg px-3 rounded-md  flex flex-row  h-auto py-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 mr-2 text-primary-cta group-hover:text-primary-bg">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
</svg>
        <span className="flex-1 text-primary-cta group-hover:text-primary-bg">{currentGameActionFilter}</span>
        <div className=" text-center justify-center items-center text-primary-cta flex group-hover:text-primary-bg">X</div>
</div>
}

        <div className="relative w-[40%]  flex flex-row  h-full">
        {currentQuater>1 &&
        <p className="absolute inset-x-0 top-0 text-center text-gray-400">Overall</p>
}
<div className="h-full flex w-2/4 my-auto flex-col justify-center items-center">
<p>FG  
{
fieldGoal.made>0 &&
" "+Math.round((fieldGoal.made/fieldGoal.total)*100)+'%'}
  </p>
<p>{fieldGoal.made}-{fieldGoal.total}</p>

</div>
<div className="h-full flex w-2/4  my-auto flex-col justify-center items-center">
<p>3PT
{
threepoint.made>0 &&
" "+Math.round((threepoint.made/threepoint.total)*100)+'%'}
  </p>
<p>{threepoint.made}-{threepoint.total}</p>

</div>
</div>
{/* this only needs to be rendered if the current quarter is more than 1 */}
 {/* Current Quarter Stats */}
 {currentQuater > 1 &&(
    <div className={`border-l-2 border-r-2 border-primary-cta h-full py-2  flex  w-[40%] relative`}>
      <p className="absolute inset-x-0 top-0 text-center text-gray-400">Q{currentQuater}</p>
      <div className="h-full flex w-2/4 my-auto flex-col justify-center items-center">
        <p>
          FG {fieldGoalPercentage.current || 0}%
        </p>
        <p className="">
          {fieldGoal.currentMade}-{fieldGoal.currentTotal}
        </p>
      </div>
      <div className="h-full flex w-2/4 my-auto flex-col justify-center items-center">
        <p>
          3PT {threePointPercentage.current || 0}%
        </p>
        <p className="">
          {threepoint.currentMade}-{threepoint.currentTotal}
        </p>
      </div>
    </div>
  )}


        </div>
        {/* Main Actions Buttons Section */}
        <div className="grid grid-cols-6 h-2/4 w-full my-auto gap-1 lg:grid-cols-6 mx-auto xl:grid-cols-6">
        {actions.map((label, index) => (
  <button
    key={index}
    onClick={() => {
      if (["FT Score", "FT Miss", "Assist", "Steal","Block","T/O","Rebound","OffRebound"].includes(label)) {
        if (passedLineout) {
          // Set x and y to null to indicate no court position
          setPendingAction({
            actionName: label,
            quarter: currentQuater,
            x: null,
            y: null,
            timestamp: Date.now(),
          });
          setShowPlayerModal(true);
        } else {
          // Record action immediately without position coordinates
          setGameActions((prevActions) => [
            ...prevActions,
            {
              quarter: currentQuater,
              actionName: label,
              x: null,
              y: null,
              timestamp: Date.now(),
            },
          ]);
          setAlertMessage(`${label} recorded!`);
          setTimeout(() => setAlertMessage(""), 3000);
        }
        return; // Exit the onClick handler
      } else {
        // For other actions, proceed as before.
        setActionSelected(label);
      }
    }}
    className={`${
      actionSelected === label ? "bg-primary-cta" : "bg-secondary-bg"
      
    }
  

     
    
  text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-primary-cta transition transform hover:scale-105 focus:ring-4 focus:ring-secondary-bg focus:outline-none ${
      ["FT Miss", "2Pt Miss", "3Pt Miss"].includes(label)
        ? "text-red-500"
        : ""
    }`}
  >
    {label}
  </button>
))}

</div>
{/* Game Quick Settings Section */}
<div className="text-white   text-center flex-row p-2 space-x-4 flex w-full h-1/4">
        
        <button 
        disabled={currentQuater ===1}
        onClick={
         handlePreviousPeriodClick
          
        }
        className={`h-full
          
          flex-row bg-secondary-bg rounded-lg  flex w-2/4 my-auto  justify-center items-center
          ${currentQuater==1 ? " line-through bg-secondary-bg/50 text-gray-400" : "text-white"}
          `}>
        <FontAwesomeIcon className="mr-2 " icon={faBackward} />  Previous Period       
        
        </button>
        <button  
                disabled={currentQuater ===4}
        onClick={handleNextPeriodClick}
        
        className={`h-full flex-row bg-secondary-bg rounded-lg  flex w-2/4 my-auto  justify-center items-center
        
           ${currentQuater==4 ? " line-through bg-secondary-bg/50 text-gray-400" : "text-white"}`}>
Next Period           <FontAwesomeIcon className="text-white ml-2 " icon={faForward} /> 
        
        </button>
    
        
        
        
                </div>
        </div>
      </div>
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
      className="relative bg-secondary-bg p-6 rounded-lg w-full max-w-4xl mx-4 my-8 overflow-auto max-h-full"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex">
          <h2 className="text-white text-2xl font-bold">Game Stats</h2>
          {/* <div className="mt-2 ml-5 space-x-3 flex  items-center text-sm text-gray-100">
            <div>FG: {fgMade}-{fgAttempts}<span className="text-gray-400">({fgPercentage}%)</span> </div>
            <div>3PT: {threePtMade}-{threePtAttempts} <span className="text-gray-400">({threePtPercentage}%)</span></div>
            <div>FT: {ftMade}-{ftAttempts} <span className="text-gray-400">({ftPercentage}%)</span></div>
          </div> */}
        </div>
        <button
          onClick={() => setShowGameStatsModal(false)}
          className="text-white bg-primary-danger  px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
      <div className=" py-2 flex justify-center">
              {/* <div className="mt-2 ml-5 space-x-3 flex  items-center text-sm text-gray-100">
            <div className="bg-white/10 px-4 py-2 rounded-md text-lg font-semibold text-center"><span className="text-gray-400">FG</span><br></br> {fgMade}-{fgAttempts}<span className="text-gray-400 ml-2">({fgPercentage}%)</span> </div>
            <div>3PT: {threePtMade}-{threePtAttempts} <span className="text-gray-400">({threePtPercentage}%)</span></div>
            <div>FT: {ftMade}-{ftAttempts} <span className="text-gray-400">({ftPercentage}%)</span></div>
          </div> */}
     
<div class="flex items-center justify-center w-screen  text-gray-800  ">

<div className="grid lg:grid-cols-3 md:grid-cols-3 gap-1 w-full max-w-6xl">
  {/* Field Goal */}
  <div className="flex items-center p-2 bg-secondary-bg shadow-md shadow-primary-bg">
  <div className={`flex flex-shrink-0 items-center justify-center border-b-2
    
    ${fgPercentage === 0 
      ? "border-b-gray" 
      : (fgPercentage >= 25 
          ? "border-b-primary-cta" 
          : "border-b-primary-danger")}
    
    
    h-14 w-14`}>



      <span className="text-xl text-gray-200 font-bold">{fgPercentage}%</span>
    </div>
    <div className="flex-grow flex flex-col ml-4">
      <span className="text-xl text-gray-300 font-bold">Field Goal</span>
      <div className="flex items-center justify-between">
        <span className="text-gray-300">{fgMade}-{fgAttempts}</span>
      </div>
    </div>
  </div>

  {/* 3 Point */}
  <div className="flex items-center p-2 bg-secondary-bg shadow-md shadow-primary-bg rounded">
  <div className={`flex flex-shrink-0 items-center justify-center border-b-2
    
    ${threePtPercentage === 0 
      ? "border-b-gray" 
      : (threePtPercentage >= 25 
          ? "border-b-primary-cta" 
          : "border-b-primary-danger")}
    
    
    h-14 w-14`}>
      <span className="text-xl text-gray-200 font-bold">{threePtPercentage}%</span>
    </div>
    <div className="flex-grow flex flex-col ml-4">
      <span className="text-xl text-gray-100 font-bold">3 Point</span>
      <div className="flex items-center justify-between">
        <span className="text-gray-300">{threePtMade}-{threePtAttempts}</span>
      </div>
    </div>
  </div>

  {/* Free Throw */}
  <div className="flex items-center p-2 bg-secondary-bg shadow-md shadow-primary-bg rounded">
    <div className={`flex flex-shrink-0 items-center justify-center border-b-2
    
    ${ftAttempts === 0 
      ? "border-b-gray" 
      : (ftPercentage >= 25 
          ? "border-b-primary-cta" 
          : "border-b-primary-danger")}
    
    
    h-14 w-14`}>
      <span className="text-xl text-gray-200 font-bold">{ftPercentage}%</span>
    </div>
    <div className="flex-grow flex flex-col ml-4">
      <span className="text-xl text-gray-100 font-bold">Free Throw</span>
      <div className="flex items-center justify-between">
        <span className="text-gray-300">{ftMade}-{ftAttempts}</span>
      </div>
    </div>
  </div>

  {/* T/O-Steals (Example: replace with your dynamic variables) */}
  <div className="flex items-center p-2 bg-secondary-bg shadow-md shadow-primary-bg rounded">
  <div className="flex flex-shrink-0 items-center justify-center border-b-2 border-b-primary-cta h-14 w-14">
    <span className="text-xl text-gray-200 font-bold">{blocks}</span>
  </div>
  <div className="flex-grow flex flex-col ml-4">
    <span className="text-xl text-gray-100 font-bold">Blocks</span>
    <div className="flex items-center justify-between">
      <span className="text-gray-300">{blocks}</span>
    </div>
  </div>
</div>

<div className="flex items-center p-2 bg-secondary-bg shadow-md shadow-primary-bg rounded">
  {/* <div className="flex flex-shrink-0 items-center justify-center border-b-2 border-b-primary-cta h-14 w-14">
    { (turnovers === 0 && steals === 0) ? (
      <span className="text-xl text-gray-200 font-bold">-</span>
    ) : (
      <span className="text-xl text-gray-200 font-bold">{(turnovers/steals)*100}</span>
    )}
  </div> */}
  <div className="flex-grow flex flex-col ml-4">
    <span className="text-xl text-gray-100 font-bold">T/O – Steals</span>
    <div className="flex items-center justify-between">
      <span className="text-gray-300">
        <span className="text-primary-danger">{turnovers}</span>-
        <span className="text-primary-cta">{steals}</span>
      </span>
    </div>
  </div>
</div>

  {/* OfRebounds (Example) */}
  {/* <div className="flex items-center p-2 bg-secondary-bg shadow-md shadow-primary-bg rounded">
    <div className="flex flex-shrink-0 items-center justify-center border-b-2 border-b-primary-cta h-14 w-14">
      <span className="text-xl text-gray-200 font-bold">{rebPercentage ? rebPercentage : 'N/A'}%</span>
    </div>
    <div className="flex-grow flex flex-col ml-4">
      <span className="text-xl text-gray-100 font-bold">OfRebounds</span>
      <div className="flex items-center justify-between">
        <span className="text-gray-300">
          <span className="text-primary-danger">{rebMade ? rebMade : '12'}</span>
          -
          <span className="text-primary-cta">{rebAttempts ? rebAttempts : '24'}</span>
        </span>
      </div>
    </div>
  </div> */}

  {/* Blocks (Example) */}
  {/* <div className="flex items-center p-2 bg-secondary-bg shadow-md shadow-primary-bg rounded">
    <div className="flex-grow flex flex-col ml-4">
      <span className="text-xl text-gray-100 font-bold">Blocks</span>
      <div className="flex items-center justify-between">
        <span className="text-gray-300">{blocks ? blocks : '6'}</span>
      </div>
    </div>
  </div> */}
</div>



</div>
      </div>
      <div className="overflow-x-auto max-h-80 overflow-auto">
        <table className="min-w-full text-white border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Quarter</th>
              <th className="px-4 py-2 border-b">Action</th>
              <th className="px-4 py-2 border-b">Time</th>
              <th className="px-4 py-2 border-b">Player</th>
              {/* <th className="px-4 py-2 border-b">Position</th> */}
            </tr>
          </thead>
          <tbody>
            {gameActions.map((action, index) => (
              <tr key={index} className="hover:bg-white/10">
                <td className="px-4 py-2 border-b text-center">{action.quarter}</td>
                <td className="px-4 py-2 border-b text-center">{action.actionName}</td>
                <td className="px-4 py-2 border-b text-center">
                  {action.timestamp ? new Date(action.timestamp).toLocaleTimeString() : "-"}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  {action.playerName ? `${action.playerName} (${action.playerNumber})` : "-"}
                </td>
                {/* <td className="px-4 py-2 border-b text-center">
                  {typeof action.x === "number" && typeof action.y === "number"
                    ? `(${action.x.toFixed(1)}%, ${action.y.toFixed(1)}%)`
                    : "-"}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      <div className="flex justify-between items-center mb-4">
        <div className="flex">
          <h2 className="text-white text-2xl font-bold">Player Stats</h2>
     
        </div>
        <button
          onClick={() => setShowPlayerStatsModal(false)}
          className="text-white bg-primary-danger/50 hover:bg-red-500 px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-white border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b  text-left">PlayerName</th>
              <th className="px-4 py-2 border-b text-left">FG</th>
              <th className="px-4 py-2 border-b text-left">3PT</th>
              <th className="px-4 py-2 border-b text-left">FT</th>
              <th className="px-4 py-2 border-b text-left">AST</th>
              <th className="px-4 py-2 border-b text-left">RB</th>
              <th className="px-4 py-2 border-b text-left">BLK</th>
              <th className="px-4 py-2 border-b text-left">STL</th>
              <th className="px-4 py-2 border-b text-left">T/O</th>
              <th className="px-4 py-2 border-b text-left">ORB</th>
            </tr>
          </thead>
          <tbody>
            {playersStatsArray.length > 0 ? (
              playersStatsArray.map((stat, index) => {
                const fgPct = stat.fgAttempts ? Math.round((stat.fgMade / stat.fgAttempts) * 100) : 0;
                const threePct = stat.threePtAttempts ? Math.round((stat.threePtMade / stat.threePtAttempts) * 100) : 0;
                const ftPct = stat.ftAttempts ? Math.round((stat.ftMade / stat.ftAttempts) * 100) : 0;
                const blocks = stat.blocks;
                return (
                  <tr key={index} className="hover:bg-primary-cta group odd:bg-secondary-bg  even:bg-white/10 text-white hover:text-primary-bg">
                    <td className="px-4 py-2 border-b border-b-gray-500">{stat.player}</td>
                    <td className="px-4 py-2 border-b border-b-gray-500 ">{stat.fgMade}-{stat.fgAttempts} <span className="text-gray-400 group-hover:text-gray-700">({fgPct}%)</span></td>
                    <td className="px-4 py-2 border-b border-b-gray-500 ">{stat.threePtMade}-{stat.threePtAttempts}  <span className="text-gray-400 group-hover:text-gray-700">({threePct}%)</span></td>
                    <td className="px-4 py-2 border-b border-b-gray-500 ">{stat.ftMade}-{stat.ftAttempts}  <span className="text-gray-400 group-hover:text-gray-700">({ftPct}%)</span></td>
                    <td className="px-4 py-2 border-b border-b-gray-500 ">{stat.steals}</td>
                    <td className="px-4 py-2 border-b border-b-gray-500 ">{stat.assists}</td>
                    <td className="px-4 py-2 border-b border-b-gray-500 ">{stat.blocks}</td>
                    <td className="px-4 py-2 border-b border-b-gray-500 ">{stat.rebounds}</td>
                    <td className="px-4 py-2 border-b border-b-gray-500 ">{stat.turnovers}</td>
                    <td className="px-4 py-2 border-b border-b-gray-500 ">{stat.offRebounds}</td>
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
