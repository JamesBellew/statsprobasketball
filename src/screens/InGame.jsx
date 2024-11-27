import { useState,useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faForward,faBackward} from '@fortawesome/free-solid-svg-icons';
export default function InGame() {
  const [gameActions, setGameActions] = useState([]); // Stores actions with coordinates
  const [actionSelected, setActionSelected] = useState(null); // Tracks selected action
  const [alertMessage, setAlertMessage] = useState(""); // Tracks the alert message
  const [fieldGoal,setFieldGoal] = useState({total:0,made:0});
  const [threepoint,setThreePoint] = useState({total:0,made:0});
  const [fieldGoalPercentage,setFieldGoalPercentage]=useState(null);
  const [threePointPercentage,setThreePointPercentage]=useState(null);

  // Handle click on the court
  const handleCourtClick = (e) => {
    if (!actionSelected) {
      alert("Please select an action before plotting!");
      return;
    }
  
    const court = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - court.left;
    const y = e.clientY - court.top;
  
    const adjustedX = x - 45;
    const adjustedY = y - 5;
  
    // Create a new action
    const newAction = {
      quarter: 1,
      actionName: actionSelected,
      x: adjustedX,
      y: adjustedY,
    };
  
    // Add the new action to the gameActions array
    setGameActions((prevActions) => [...prevActions, newAction]);
  
    // Update fieldGoal state
    setFieldGoal((prevFieldGoal) => ({
      total: prevFieldGoal.total + 1,
      made: !actionSelected.includes("Miss")
        ? prevFieldGoal.made + 1
        : prevFieldGoal.made,
    }));
  //now checking to see if it was a threepoint attempt
  if(actionSelected.includes('3')){
    //we have a three pointer 
    // Update fieldGoal state
    setThreePoint((prevThreePoint) => ({
      total: prevThreePoint.total + 1,
      made: !actionSelected.includes("Miss")
        ? prevThreePoint.made + 1
        : prevThreePoint.made,
    }));
  }
    // Show an alert message
    setAlertMessage(`${actionSelected} recorded!`);
    setTimeout(() => setAlertMessage(""), 3000);
   
  };
  
  const actions = [
    "2 Points",
    "3 Points",
    "2Pt Miss",
    "3Pt Miss",
    "Free Throw",
    "Free Throw Miss",
   

    "T/O",
    "Block",
  ];
//this useeffect is for the percentages
useEffect(()=>{
setFieldGoalPercentage(Math.round((fieldGoal.made/fieldGoal.total)*100))
setThreePointPercentage(Math.round((threepoint.made/threepoint.total)*100))



},[gameActions])


  return (
    <>
      {/* Top Nav */}
      <div className="container mx-auto bg-gradient-to-b items-center from-black to-gray-900">
        <div className="top-nav w-full h-[15vh] relative">
          {/* Alert Message */}
          {alertMessage && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg">
              {alertMessage}
            </div>
          )}
        </div>

        {/* Court */}
        <div
          onClick={handleCourtClick} // Make the court clickable
          className="top-nav w-full relative bg-gray-800 h-[55vh]"
        >
          {/* Court outline */}
          <div className="absolute w-[88%] h-[90%] rounded-b-full left-[6%] bg-gray-800 border-gray-500 border-2 relative box-border">
            {/* Court Key */}
            <div className="absolute w-1/3 left-1/3 border-2 border-gray-500 h-[60%]"></div>
            <div className="absolute w-1/3 left-1/3 border-2 border-gray-500 h-[20%] rounded-b-full top-[60%]"></div>

{/* Render Actions as Dots */}
{gameActions
  .filter(
    (action) => !["Free Throw", "Free Throw Miss"].includes(action.actionName)
  ) // Exclude free throw actions
  .map((action, index) => (
    <div
      key={index}
      className={`absolute w-4 h-4 rounded-full ${
        ["2Pt Miss", "3Pt Miss"].includes(action.actionName)
          ? "bg-red-500" // Red for misses
          : "bg-blue-500" // Blue for other actions
      }`}
      style={{
        top: `${action.y}px`,
        left: `${action.x}px`,
        transform: "translate(-50%, -50%)", // Center the dot on the exact click point
      }}
      title={`Action: ${action.actionName} | Quarter: ${action.quarter}`} // Tooltip for clarity
    ></div>
  ))}
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="bottom-nav  items-center justify-center w-full h-[30vh]">
{/* Quick Stats Section */}
        <div className="text-white text-center flex-row p-2 space-x-4 flex w-full h-1/4">
        
<div className="h-full flex w-2/4 my-auto flex-col justify-center items-center">
<p>FG 
  {fieldGoalPercentage>=0
  ? " "+fieldGoalPercentage +'%' :""
}
  </p>
<p>{fieldGoal.made}-{fieldGoal.total}</p>

</div>
<div className="h-full flex w-2/4 my-auto flex-col justify-center items-center">
<p>3PT
  {threePointPercentage>=0
  ? " "+threePointPercentage +'%' :""
}
  </p>
<p>{threepoint.made}-{threepoint.total}</p>

</div>



        </div>
        {/* Main Actions Buttons Section */}
        <div className="grid grid-cols-4 h-2/4 w-full my-auto gap-1 lg:grid-cols-4 xl:grid-cols-6">
  {actions.map((label, index) => (
    <button
      key={index}
      onClick={() => {
        if (["Free Throw", "Free Throw Miss"].includes(label)) {
          // Record the free throw action immediately
          setGameActions((prevActions) => [
            ...prevActions,
            {
              quarter: 1, // Default quarterdkndk
              actionName: label,
              x: 0, // No position required for free throws
              y: 0,
            },
          ]);

          // Show an alert message
          setAlertMessage(`${label} recorded!`);
          setTimeout(() => setAlertMessage(""), 3000); // Hide alert after 3 seconds
        } else {
          // For other actions, set as selected
          setActionSelected(label);
        }
      }}
      className={`${
        actionSelected === label ? "bg-blue-700" : "bg-gray-800" // Highlight selected action
      } text-white font-semibold py-3 px-4 h-20 rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105 focus:ring-4 focus:ring-blue-300 focus:outline-none ${
        ["Free Throw Miss", "2Pt Miss", "3Pt Miss"].includes(label)
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
        
        <div className="h-full flex-row bg-gray-800 rounded-lg  flex w-2/4 my-auto  justify-center items-center">
        <FontAwesomeIcon className="text-white mr-2 " icon={faBackward} />  Next Period       
        
        </div>
        <div className="h-full flex-row bg-gray-800 rounded-lg  flex w-2/4 my-auto  justify-center items-center">
Next Period           <FontAwesomeIcon className="text-white ml-2 " icon={faForward} /> 
        
        </div>
    
        
        
        
                </div>
        </div>
      </div>
    </>
  );
}
