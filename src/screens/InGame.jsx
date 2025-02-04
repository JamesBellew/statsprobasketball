import { useState,useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faForward,faBackward} from '@fortawesome/free-solid-svg-icons';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function InGame() {
  const navigate = useNavigate();
  const [currentQuater,setCurrentQuarter]=useState(1)
  const location = useLocation();
  const savedGame = location.state; // Access saved game data if navigated from saved games
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
const [showPlayerModal, setShowPlayerModal] = useState(false);
const [pendingAction, setPendingAction] = useState(null);


useEffect(() => {
  if (savedGame && savedGame.id) {
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
const handleSaveGame = () => {
  // Define a fixed game object for testing
  const fixedGame = {
    id: savedGame?.id || `game_${Date.now()}`,
    opponentName,
    venue: selectedVenue,
    actions: gameActions,
    timestamp: new Date().toISOString(),
  };

  console.log("Fixed Game Data to Save:", fixedGame);

  // Fetch existing saved games from localStorage
  const savedGames = JSON.parse(localStorage.getItem("savedGames")) || [];
  console.log("Previously Saved Games:", savedGames);

  // Add the fixed game object
  const updatedGames = [...savedGames, fixedGame];
  console.log("Updated Games List with Fixed Game:", updatedGames);

  // Save to localStorage
  try {
    localStorage.setItem("savedGames", JSON.stringify(updatedGames));
    console.log("Fixed game saved to localStorage successfully!");
    setAlertMessage("Fixed game saved successfully!");
    setTimeout(() => setAlertMessage(""), 3000);
  } catch (error) {
    console.error("Error saving fixed game to localStorage:", error);
    setAlertMessage("Error saving fixed game. Please try again.");
    setTimeout(() => setAlertMessage(""), 3000);
  }
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






  
  const actions = [
    "2 Points",
    "3 Points",
    "2Pt Miss",
    "3Pt Miss",
    "FT Score",
    "FT Miss",
   

    "T/O",
    "Block",
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
    
    <main className="bg-red-600 bg-gradient-to-b  from-black to-gray-900">
      {/* Top Nav */}
      <div className="container mx-auto bg-gradient-to-b items-center from-black to-gray-900">
        <div className="top-nav w-full h-[12vh]  relative">
          {/* Alert Message */}
          {alertMessage && (
        <div class="absolute w-full  mx-auto text-center px-10 lg:px-4">
        <div class="p-2 h-16 bg-gray-900 rounded-lg items-center text-indigo-100 leading-none lg:rounded-md mx-10 flex z-50 lg:inline-flex" role="alert">
          <span class="flex rounded-lg bg-indigo-500 uppercase px-2 py-1 text-xs font-bold mr-3">New</span>
          <span class="font-semibold mr-2 text-left flex-auto">{alertMessage}</span>
          <svg class="fill-current opacity-75 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z"/></svg>
        </div>
      </div>
          )}


{/* top  of the top nav contents */}
<div className="text-white h-2/5 flex-row flex space-x-2 px-2 w-full">
<div className=" w-1/4 h-full text-center flex items-center  rounded-lg"><p className="text-center capitalize mx-auto"> {opponentName} ({selectedVenue})</p></div>
<div className=" w-2/4 h-full text-center flex items-center rounded-lg "><p className="text-center mx-auto"> Q{currentQuater}</p></div>
{/* <div className=" w-1/4 h-full text-center flex items-center bg-gray-800 rounded-lg "><p className="text-center mx-auto">21-12-2024</p></div> */}
<button onClick={()=>{
  navigate('/homedashboard')}} className=" w-1/4 h-full text-center flex items-center bg-gray-900 rounded-lg "><p className="text-center mx-auto">Exit</p></button>
</div>
{/* bottom  of the top nav contents */}
<div className=" flex flex-row  text-white mb-2 space-x-2 px-2 p-1 h-3/5 w-full">
<div className=" w-1/4 h-full bg-gray-800 text-sm rounded-lg text-center flex items-center"><p className="text-center mx-auto"> Game Stats</p></div>
<div 
// disabled={gameActions===0}

  onClick={handleUndoLastActionHandler} 
  className={`w-1/4 h-full bg-gray-800 rounded-lg text-center flex items-center z-0 cursor-pointer hover:bg-gray-700 transition transform hover:scale-105
  ${gameActions==0 ? "bg-gray-800/50 line-through text-gray-400" : "bg-gray-800"}
  `}
>
  <p className="text-center mx-auto text-sm">Undo Last Action</p>
</div >

<div className=" w-1/4 h-full bg-gray-800 rounded-lg text-center flex items-center"><p className="text-center mx-auto text-sm">Game Settings</p>
</div>
<div onClick={handleSaveGame} className={` w-1/4 h-full  rounded-lg text-center flex items-center
  ${currentQuater===4 ? "bg-indigo-800"  : "bg-gray-800"  }
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
      ? "bg-indigo-400/50" // Highlight outer 3-point area in blue
      : "bg-gray-800" // Default color
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
      className="relative bg-gray-800 p-6 rounded-lg w-72"
      // Stop propagation so clicks inside the modal don't trigger the overlay onClick
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-white text-lg mb-4">Select Player</h3>
      {passedLineout && passedLineout.players && passedLineout.players.length > 0 ? (
        passedLineout.players.map((player, index) => (
          <button
            key={index}
            onClick={() => handlePlayerSelection(player)}
            className="w-full text-left p-2 mb-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            {player.name} ({player.number})
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
        className="mt-4 w-full p-2 bg-red-600 hover:bg-red-500 text-white rounded"
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
        ? "bg-indigo-400/20" // Highlight inner arc in blue for 2-point actions
        : "bg-gray-800" // Default color
    }
    
    
    border-gray-500 border-2`}
  >
    

    {/* <div className="bg-red-600 w-[100%]  h-[50%] absolute"></div>
    <div className="bg-red-300 w-[76%]  top-[50%] h-[30%] left-[12%] absolute"></div>
    <div className="bg-red-100 w-[40%]  top-[80%] h-[15%] left-[30%] absolute"></div>
    <div className="bg-green-100 w-[10%]  top-[95%] h-[5%] left-[45%] absolute"></div> */}

    {/* Court Key */}
    <div
      className={`absolute w-1/3 left-1/3 border border-gray-500 h-[60%]`}
    ></div>
    <div className="absolute w-1/3 left-1/3 border-2 border-gray-500 h-[20%] rounded-b-full top-[60%]"></div>

    {/* Render Actions as Dots */}
   
  </div>
 {/* Render Actions */}
 {gameActions
    .filter((action) => action.quarter === currentQuater) // Only filter by quarter
    .map((action, index) => (
      <div
        key={index}
        className={`absolute w-4 h-4 rounded-full ${
          ["2Pt Miss", "3Pt Miss"].includes(action.actionName)
            ? "bg-red-500" // Red for misses
            : "bg-blue-500" // Blue for successful shots
        }`}
        style={{
          top: `${action.y}%`, // Use percentages for responsive positioning
          left: `${action.x}%`,
          transform: "translate(-50%, -50%)", // Center the dot
        }}
        title={`Action: ${action.actionName} | Quarter: ${action.quarter}`}
      ></div>
    ))}
  {/* Court outline */}

</div>



        {/* Bottom Nav */}
        <div className="bottom-nav  items-center justify-center w-full  h-[33vh] ">
{/* Quick Stats Section */}
        <div className="text-white  items-center justify-center text-center flex-row p-2 space-x-4 flex w-full h-1/4">
        <div className="relative w-1/2 flex flex-row  h-full">
        {currentQuater>1 &&
        <p className="absolute inset-x-0 top-0 text-center text-white">Overall</p>
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
 {currentQuater > 1 && (
    <div className="border-l-2 border-r-2 border-indigo-600 h-full py-2  flex  w-1/2 relative">
      <p className="absolute inset-x-0 top-0 text-center text-white">Q{currentQuater}</p>
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
        <div className="grid grid-cols-4 h-2/4 w-full my-auto gap-1 lg:grid-cols-4 xl:grid-cols-6">
  {actions.map((label, index) => (
    <button
      key={index}
      onClick={() => {
        if (["FT Score", "FT Miss"].includes(label)) {
          if (passedLineout) {
            // Instead of immediately recording, set pending action and show modal
            setPendingAction({
              actionName: label,
              quarter: currentQuater,
              x: 0, // For free throws, position is set to 0
              y: 0,
            });
            setShowPlayerModal(true);
          } else {
            // Record immediately if no lineout is passed
            setGameActions((prevActions) => [
              ...prevActions,
              {
                quarter: currentQuater,
                actionName: label,
                x: 0,
                y: 0,
                timestamp: Date.now(),
              },
            ]);
            setAlertMessage(`${label} recorded!`);
            setTimeout(() => setAlertMessage(""), 3000);
          }
          return; // Exit the onClick handler for free throws
        } else {
          // For non-free throw actions, set as selected (or you may choose to clear the selection)
          setActionSelected(label);
        }
        
      }}
      className={`${
        actionSelected === label ? "bg-blue-700" : "bg-gray-800" // Highlight selected action
      } text-white font-semibold py-2 px-4  rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105 focus:ring-4 focus:ring-blue-300 focus:outline-none ${
        ["FT Miss", "2Pt Miss", "3Pt Miss"].includes(label)
          ? "text-red-500" // Red text for misses
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
          
          flex-row bg-gray-800 rounded-lg  flex w-2/4 my-auto  justify-center items-center
          ${currentQuater==1 ? " line-through bg-gray-800/50 text-gray-400" : "text-white"}
          `}>
        <FontAwesomeIcon className="mr-2 " icon={faBackward} />  Previous Period       
        
        </button>
        <button  
                disabled={currentQuater ===4}
        onClick={handleNextPeriodClick}
        
        className={`h-full flex-row bg-gray-800 rounded-lg  flex w-2/4 my-auto  justify-center items-center
        
           ${currentQuater==4 ? " line-through bg-gray-800/50 text-gray-400" : "text-white"}`}>
Next Period           <FontAwesomeIcon className="text-white ml-2 " icon={faForward} /> 
        
        </button>
    
        
        
        
                </div>
        </div>
      </div>

      </main>
    </>
  );
}
