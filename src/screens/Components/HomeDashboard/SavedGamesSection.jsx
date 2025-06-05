import React, { useState, useEffect ,useRef} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck,faChartLine } from "@fortawesome/free-solid-svg-icons";
import { doc as firestoreDoc, getDoc } from "firebase/firestore";
import { firestore } from "../../../firebase"; // adjust if needed
import { db } from "../../../db"; // adjust if needed
import opponentJerseyDefault from "../../../assets/jersey.webp"
import homeLogo from "../../../assets/logo.jpg"
import { fetchTeamSettings } from "../../../utils/fetchTeamSettings";
import EditGameModal from "./Modals/EditGameModal";
import {  faStopwatch ,faPeopleGroup,faVideo} from "@fortawesome/free-solid-svg-icons";
const SavedGamesSection = ({
  savedGames,
  user,
  handleGameClick,
  handleStatisticsClick,
  handleCompleteGameClick,
  handleSetInProgress,
  handleDeleteGame,
  handleSyncToCloud,
  syncingGameId,
  justSyncedGameId,
  totalSavedGames,
}
)=> {
  const [teamName, setTeamName] = useState("Home");
  const [teamImage,setTeamImage] = useState("")
  const [activeMenu, setActiveMenu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editedOpponentName, setEditedOpponentName] = useState("");
  const [editedVenue, setEditedVenue] = useState("");

 
  



  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  
console.log(savedGames)
  useEffect(() => {
    const fetchTeamName = async () => {
      try {
        let name = null;
        if (user) {
          const ref = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
          const snap = await getDoc(ref);
          name = snap.exists() ? snap.data()?.teamName : null;
        } else {
          const localSettings = await db.settings.get("preferences");
          name = localSettings?.teamName;
        }

        setTeamName(name?.length > 0 ? name : "Home");
        console.log("🏀 Team Name:", name || "Home");
      } catch (err) {
        console.error("Error fetching team name:", err);
        setTeamName("Home");
      }
    };

    fetchTeamName();
  }, [user]);
  useEffect(() => {
    const loadTeamSettings = async () => {
      const settings = await fetchTeamSettings(user);
      if (settings?.teamImage) {
        setTeamImage(settings.teamImage); // ✅ local state
      }
    };
    loadTeamSettings();
  }, [user]);
  const menuRef = useRef(null);

  return (
<div className="bg-primary-bg pb-24 p-8 rounded-lg">
<div className="flex items-center space-x-3">
  <h4 className="text-xl font-medium">Saved Games</h4>
  <p className="text-sm text-gray-400 font-light">
    ({totalSavedGames || "No"} {totalSavedGames === 1 ? "Game" : "Games"})
  </p>
</div>



  {/* In Progress Section */}
  <div className="border-l-4 px-5 border-l-primary-danger">
    <h3 className="mt-8 mb-3">In Progress</h3>
  </div>
  <div className="h-auto bg-secondary-bg rounded-md py-10 px-5 overflow-auto">
  {/* Local Games */}
  {/* {user &&
  <h4 className="text-sm text-white font-semibold mb-2">Local</h4>
} */}
{!user && savedGames.local.filter(game => !game.isComplete).length === 0 && (
  <h4 className="text-sm text-white font-semibold mb-2">
    Local
  </h4>
)}

  <ul className="grid grid-cols-6 gap-4 mb-6">
    {savedGames.local.filter(game => !game.isComplete).length > 0 ? (
      savedGames.local
        .filter(game => !game.isComplete)
        .map((game) => (
          <li key={game.id} className="bg-white/5  border-l-primary-danger
           border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10">
         {game.score?.home !== undefined && game.score?.opponent !== undefined ? (
  <div className="flex items-center bg-dark-700 text-white mb-2   rounded overflow-hidden w-full">
  {/* Home Team */}
  <div className="flex flex-col items-center justify-center  p-1 w-1/3">
    <img
src={teamImage || homeLogo}
      alt="Home Team Logo"
      className="w-8 h-8 mb-1 rounded-full"
    />
<p className="text-sm font-semibold text-center break-words leading-tight">

      {game.homeTeamName || teamName || "Home"}
    </p>
  </div>

  {/* Score */}
  <div className="flex-1  w-1/3 flex items-center justify-center">
    <p className="text-xl font-bold text-gray-100">
      {game.score?.home ?? "-"} <span className="mx-1">–</span> {game.score?.opponent ?? "-"}
    </p>
  </div>

  {/* Opponent Team */}
  <div className="flex flex-col items-center justify-center   w-1/3">
  <img
  src={game.opponentLogo || opponentJerseyDefault}
  alt="Opponent Team Logo"
  className="w-8 h-8 mb-1 rounded-full"
/>
    <p className="text-sm font-semibold  break-words text-center leading-tight">
      {game.opponentName || "Opponent"}
    </p>
  </div>
</div>
 


) : (
  <p className="text-sm font-medium mb-2 text-white">
    {game.opponentName || "Opponent"} {teamName ? "vs " + teamName : ""}
  </p>
)}

 
            <div className="flex justify-start items-center">
  <button
    onClick={() => handleGameClick(game)}
    className="py-1 bg-white/10 px-3 text-white font-semibold rounded"
  >
    {game.isComplete ? "Open" : "Continue"}
  </button>
  <span className="flex px-2 text-white/10 items-center">|</span>
    {/* <span className="px-2 text-gray-400">|</span> */}
   
  {/* <button
  onClick={() => {
    setEditingGame(game);
    setEditedOpponentName(game.opponentName || "");
    setEditedVenue(game.venue || "");
    setActiveMenu(null);
    setShowEditModal(true);
  }}
  className="text-white font-medium bg-white/10 hover:bg-white/20 px-4 py-1 rounded w-auto"
>
  Edit
</button> */}


  <div className="flex gap-2 items-center">
{user && (
  <button
    onClick={() => handleSyncToCloud(game)}
    className={`text-xs px-3 py-2 rounded flex items-center font-semibold transition-all
      ${
        syncingGameId === game.id
          ? "bg-blue-600 cursor-not-allowed"
          : justSyncedGameId === game.id
          ? "bg-green-600"
          : "bg-primary-danger hover:bg-blue-600"
      }
      text-white`}
    disabled={syncingGameId === game.id}
  >
    {syncingGameId === game.id ? (
      <>
        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Syncing...
      </>
    ) : justSyncedGameId === game.id ? (
      <>
        <span className="mr-2">✅</span> Synced!
      </>
    ) : (
      <>
        Sync<span className="mx-2">|</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257A3 3 0 0015.574 8.4a5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      </>
    )}
  </button>
)}


    <button
      onClick={() => handleCompleteGameClick(game)}
      className="py-1 bg-white/10 px-4 text-white font-semibold rounded"
    > 
      <FontAwesomeIcon className="text-primary-danger" icon={faCheck} />
    </button>
  </div>
  <div className="flex space-x-2 ml-3">
  {/* ⏱️ Show only if trackingMinutes is true */}
  {game.trackingMinutes && (
    <p title="Minutes Tracked">
      <FontAwesomeIcon icon={faStopwatch} className="text-md text-white/75" />
    </p>
  )}

  {/* 👥 Show only if trackingPlayers is true */}
  {game.trackingPlayers && (
    <p title="Player Scoring Tracked">
      <FontAwesomeIcon icon={faPeopleGroup} className="text-md text-white/75" />
    </p>
  )}
 
 

</div>
</div>

          </li>
        ))
    ) : (
      !user && savedGames.local.filter(game => !game.isComplete).length === 0 && (
        <li className="text-gray-400 my-auto w-96">
          No local games in progress
        </li>
      )
      
    )}
  </ul>
{/* onyl want to show this is the user is logged in  */}
{user &&
<>
  {/* Synced Games */}
  <h4 className="text-sm text-white font-semibold mb-2">Cloud</h4>
  <ul className="grid grid-cols-6 gap-4">
    {savedGames.synced.filter(game => !game.isComplete).length > 0 ? (
      savedGames.synced
        .filter(game => !game.isComplete)
        .map((game) => (
          <li key={game.id} className="bg-white/5 border-l-primary-danger border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10">

<div className="flex items-center bg-dark-700 text-white mb-2   rounded overflow-hidden w-full">
   {/* Home Team */}
   <div className="flex flex-col  w-1/3 items-center justify-center  p-1 w-1/3">
     <img
 src={teamImage || homeLogo}
       alt="Home Team Logo"
       className="w-8 h-8 mb-1 rounded-full"
     />
<p className="text-sm font-semibold text-center break-words text-center leading-tight">

       {game.homeTeamName || teamName || "Home"}
     </p>
   </div>
 
   {/* Score */}

  <div className="flex-1  t flex flex-col   w-1/3 items-center justify-center">
    <div className=" px-1 py-1 rounded">    
      <p className="text-xl font-bold text-gray-100">
        {game.score?.home ?? "-"} <span className="mx-1">–</span> {game.score?.opponent ?? "-"}
      </p>
    </div>

    <div className=" px-2 py-1 rounded mt-1">     
      <p className="text-white text-md font-semibold" >FT</p>
    </div>
  </div>



 
   {/* Opponent Team */}
   <div className="flex flex-col items-center justify-center  p-1 w-1/3">
   <img
  src={game.opponentLogo || opponentJerseyDefault}
  alt="Opponent Team Logo"
  className="w-8 h-8 mb-1 rounded-full"
/>

     <p className="text-sm font-semibold text-center  break-words leading-tight">
       {game.opponentName || "Opponent"}
     </p>
   </div>
 </div>


            <div className="flex justify-start space-x-1 items-center">
              <button onClick={() => handleGameClick(game)} className="py-1 bg-white/10 px-3 text-white font-semibold rounded">
                Continue
              </button>
              <button onClick={() => handleCompleteGameClick(game)} className="py-1 text-secondary-cta
               px-4 bg-white/10 font-semibold rounded">
                <FontAwesomeIcon icon={faCheck} />
              </button>
              
              <div className="flex space-x-2">
              {
    game.broadcast && (
      <>
      <span className="px-2 text-gray-400">|</span>
      <p title="Player Scoring Tracked">
      <FontAwesomeIcon icon={faVideo} className="text-md text-primary-cta animate-pulse" />
    </p>
    </>
    )

  }
  {/* ⏱️ Show only if trackingMinutes is true */}
  {game.trackingMinutes && (
    <p title="Minutes Tracked">
      <FontAwesomeIcon icon={faStopwatch} className="text-md text-white/75 " />
    </p>
  )}

  {/* 👥 Show only if trackingPlayers is true */}
  {game.trackingPlayers && (
    <p title="Player Scoring Tracked">
      <FontAwesomeIcon icon={faPeopleGroup} className="text-md text-white/75" />
    </p>
  )}

</div>
       
       
            </div>
          </li>
        ))
    ) : (
      <li className="text-gray-400 w-96 mx-2">No cloud games in progress</li>
    )}
  </ul>
  </>
}
</div>


{/* Completed Section */}
<div className="border-l-4 px-5 border-l-primary-cta mt-8">
  <h3 className="mt-8 mb-3">Completed</h3>
</div>

<div className="h-auto bg-secondary-bg rounded-md py-10 px-5 overflow-auto">

{user && 
<>
  {/* Synced Completed Games */}
  <h4 className="text-sm text-white font-semibold mb-2">Cloud</h4>
  <ul className="grid grid-cols-6 gap-4">
    {savedGames.synced.filter(game => game.isComplete).length > 0 ? (
      savedGames.synced
        .filter(game => game.isComplete)
        .map((game) => (
//           <li key={game.id} className="bg-white/5 border-l-primary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10 flex flex-col">
//  <div className="flex items-center bg-dark-700 text-white mb-2   rounded overflow-hidden w-full">
//    {/* Home Team */}
//    <div className="flex flex-col items-center justify-center  p-1 w-1/3">
//      <img
//      src={teamImage || homeLogo}
//        alt="Home Team Logo"
//        className="w-8 h-8 mb-1 rounded-full"
//      />
// <p className="text-sm font-semibold text-center break-words leading-tight">

//        {game.homeTeamName || teamName || "Home"}
//      </p>
//    </div>
 
//    {/* Score */}
//    <div className="flex-1  flex items-center justify-center">
//      <p className="text-xl font-bold text-gray-100">
//        {game.score?.home ?? "-"} <span className="mx-1">–</span> {game.score?.opponent ?? "-"}
//      </p>
//    </div>
 
//    {/* Opponent Team */}
//    <div className="flex flex-col items-center justify-center  p-1 w-1/3">
//    <img
//   src={game.opponentLogo || opponentJerseyDefault}
//   alt="Opponent Team Logo"
//   className="w-8 h-8 mb-1 rounded-full"
// />
//      <p className="text-sm font-semibold  break-words  leading-tight text-center">
//        {game.opponentName || "Opponent"}
//      </p>
//    </div>
//  </div>
//             <div className="flex justify-between">
//               <div className="flex space-x-2 w-full">
//                 <button
//                   onClick={() => handleGameClick(game)}
//                   className="py-1 bg-white/10 px-4 text-white font-semibold rounded flex items-center text-md ml-1"
//                 >
//                   Open
//                 </button>
//                 <div className="flex justify-end space-x-2 w-full">
//                   <button
//                     onClick={() => handleSetInProgress(game)}
//                     className="py-1 rounded flex text-gray-400 items-center text-xs"
//                   >
//                     Restore
//                   </button>
//                   <button
//                     onClick={() => handleDeleteGame(game.id)}
//                     className="py-1 text-gray-400 rounded text-xs"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </li>
<li key={game.id} className="relative bg-white/5 border-l-primary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10 flex flex-col">
<div className="flex items-center bg-dark-700 text-white mb-2 rounded overflow-hidden w-full">
  {/* Home Team */}
  <div className="flex overflow-auto h-auto flex-col items-center justify-center p-1 w-1/3">
    <img src={teamImage || homeLogo} alt="Home Team Logo" className="w-8 h-8 mb-1 rounded-full" />
    <p className="text-sm font-semibold text-center break-words leading-tight">
      {game.homeTeamName || teamName || "Home"}
    </p>
  </div>

  {/* Score */}
  <div className="flex-1 w-1/3 flex items-center justify-center">
    <p className="text-xl font-bold text-gray-100">
      {game.score?.home ?? "-"} <span className="mx-1">–</span> {game.score?.opponent ?? "-"}
    </p>
  </div>

  {/* Opponent Team */}
  <div className="flex flex-col items-center justify-center w-1/3">
    <img src={game.opponentLogo || opponentJerseyDefault} alt="Opponent Team Logo" className="w-8 h-8 mb-1 rounded-full" />
    <p className="text-sm font-semibold text-center">
      {game.opponentName || "Opponent"}
    </p>
  </div>
</div>

<div className="flex justify-between items-center relative">
  <div className="flex space-x-1 w-full">
  <button
      onClick={() => handleStatisticsClick(game)}
      className="py-1 bg-primary-bg text-primary-cta px-3 font-semibold rounded flex items-center text-md "
    >
   Statistics   <FontAwesomeIcon className="text-primary-cta ml-3" icon={faChartLine} />
    </button>
    <button
      onClick={() => handleGameClick(game)}
      className="py-1 bg-white/10 px-4 text-white font-semibold rounded flex items-center text-md ml-1"
    >
      Open
    </button>
    {/* <span className="flex text-white/10 items-center">|</span> */}

    <span className="flex text-white/10 items-center">|</span>
    {/* <span className="px-2 text-gray-400">|</span> */}
              <div className="flex space-x-1">
  {/* ⏱️ Show only if trackingMinutes is true */}
  {game.trackingMinutes && (
    <p title="Minutes Tracked">
      <FontAwesomeIcon icon={faStopwatch} className="text-md text-white/75" />
    </p>
  )}

  {/* 👥 Show only if trackingPlayers is true */}
  {game.trackingPlayers && (
    <p title="Player Scoring Tracked">
      <FontAwesomeIcon icon={faPeopleGroup} className="text-md text-white/75" />
    </p>
  )}
</div>
    <button
      onClick={() => setActiveMenu(game.id)}
      className="py-1  px-1 text-white font-semibold rounded text-md ml-1"
    >
      ...
    </button>
  </div>
</div>

{/* Overlay Menu */}
{activeMenu === game.id && (
  <div
  ref={menuRef}
className={`absolute top-0 right-0 h-full w-full bg-secondary-bg z-50 
flex flex-crowol justify-center items-center space-x-4 px-10
rounded-r-md shadow-lg transition-all duration-300 ease-in-out
${activeMenu === game.id ? 'translate-x-0' : 'translate-x-full'}
`}
onClick={(e) => e.stopPropagation()}
>
<button
onClick={() => {
handleSetInProgress(game);
setActiveMenu(null);
}}
className="text-white font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded w-3/4"
>
Restore
</button>
{/* <button
// onClick={() => {
// handleDeleteGame(game.id);
// setActiveMenu(null);
// }}
className="text-white font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded w-3/4"
>
Edit
</button> */}
<button
onClick={() => {
handleDeleteGame(game.id);
setActiveMenu(null);
}}
className="text-primary-cta font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded w-3/4"
>
Delete
</button>
</div>


)}
</li>
        ))
    ) : (
      <li className="text-gray-400 min-w-96">No cloud completed games</li>
    )}
  </ul>
  </>
}

{/* {user && savedGames.local.filter(game => game.isComplete).length > 0 &&
<> */}
  {/* Local Completed Games */}

  {user &&  savedGames.local.filter(game => game.isComplete).length > 0 &&
  <h4 className="text-sm mt-5 text-white font-semibold mb-2">Local</h4>
  }
  <ul className="grid grid-cols-6 gap-4 mb-6">
    {savedGames.local.filter(game => game.isComplete).length > 0 ? (
      savedGames.local
        .filter(game => game.isComplete)
        .map((game) => (
          <li key={game.id} className="relative bg-white/5 border-l-primary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10 flex flex-col">
          <div className="flex items-center bg-dark-700 text-white mb-2 rounded overflow-hidden w-full">
            {/* Home Team */}
            <div className="flex overflow-auto h-auto flex-col items-center justify-center p-1 w-1/3">
              <img src={teamImage || homeLogo} alt="Home Team Logo" className="w-8 h-8 mb-1 rounded-full" />
              <p className="text-sm font-semibold text-center break-words leading-tight">
                {game.homeTeamName || teamName || "Home"}
              </p>
            </div>
        
            {/* Score */}
            <div className="flex-1 w-1/3 flex items-center justify-center">
              <p className="text-xl font-bold text-gray-100">
                {game.score?.home ?? "-"} <span className="mx-1">–</span> {game.score?.opponent ?? "-"}
              </p>
            </div>
        
            {/* Opponent Team */}
            <div className="flex flex-col items-center justify-center w-1/3">
              <img src={game.opponentLogo || opponentJerseyDefault} alt="Opponent Team Logo" className="w-8 h-8 mb-1 rounded-full" />
              <p className="text-sm font-semibold text-center">
                {game.opponentName || "Opponent"}
              </p>
            </div>
          </div>
        
          <div className="flex justify-between items-center relative">
            <div className="flex space-x-2 w-full">
            <button
                onClick={() => handleStatisticsClick(game)}
                className="py-1 bg-primary-bg text-primary-cta px-4 font-semibold rounded flex items-center text-md ml-1"
              >
             Statistics   <FontAwesomeIcon className="text-primary-cta ml-3" icon={faChartLine} />
              </button>
              <button
                onClick={() => handleGameClick(game)}
                className="py-1 bg-white/10 px-4 text-white font-semibold rounded flex items-center text-md ml-1"
              >
                Open
              </button>
              {/* <span className="flex text-white/10 items-center">|</span> */}
       
              <span className="flex text-white/10 items-center">|</span>
              <button
                onClick={() => setActiveMenu(game.id)}
                className="py-1 bg-white/10 px-4 text-white font-semibold rounded text-md ml-1"
              >
                ..
              </button>
              <div className="flex justify-center items-center space-x-2 ml-3">
  {/* ⏱️ Show only if trackingMinutes is true */}
  {game.trackingMinutes && (
    <p title="Minutes Tracked">
      <FontAwesomeIcon icon={faStopwatch} className="text-md text-white/75" />
    </p>
  )}

  {/* 👥 Show only if trackingPlayers is true */}
  {game.trackingPlayers && (
    <p title="Player Scoring Tracked">
      <FontAwesomeIcon icon={faPeopleGroup} className="text-md text-white/75" />
    </p>
  )}
</div>
            </div>
            
          </div>
        
          {/* Overlay Menu */}
          {activeMenu === game.id && (
            <div
            ref={menuRef}
  className={`absolute top-0 right-0 h-full w-full bg-secondary-bg z-50 
    flex flex-crowol justify-center items-center space-x-4 px-10
    rounded-r-md shadow-lg transition-all duration-300 ease-in-out
    ${activeMenu === game.id ? 'translate-x-0' : 'translate-x-full'}
  `}
  onClick={(e) => e.stopPropagation()}
>
  <button
    onClick={() => {
      handleSetInProgress(game);
      setActiveMenu(null);
    }}
    className="text-white font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded w-3/4"
  >
    Restore
  </button>
  <button
    onClick={() => {
      handleDeleteGame(game.id);
      setActiveMenu(null);
    }}
    className="text-primary-cta font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded w-3/4"
  >
    Delete
  </button>
</div>

  
          )}
        </li>
        
        ))
    ) : (
      
      <li className="text-gray-400 w-auto min-w-96">
{!user && savedGames.local.filter(game => game.isComplete).length === 0
  ? "No completed games"
  : user &&
    savedGames.local.filter(game => game.isComplete).length === 0 &&
    (savedGames.local.length > 0 || savedGames.synced.length > 0)
  ? "No local completed games"
  : null}



       </li>
    )}
  </ul>
  {/* </>
} */}
</div>
{showEditModal && editingGame && (
  <EditGameModal

  user={user}


    opponentName={editedOpponentName}
    venue={editedVenue}
    setOpponentName={setEditedOpponentName}
    setVenue={setEditedVenue}
    onClose={() => setShowEditModal(false)}
    onSave={async () => {
      if (!editedOpponentName.trim() || !editedVenue.trim()) {
        alert("Please fill in both opponent name and venue.");
        return;
      }
      const updatedGame = {
        ...editingGame,
        opponentName: editedOpponentName,
        venue: editedVenue,
      };
      await db.games.put(updatedGame);
      setShowEditModal(false);
      setEditingGame(null);
      window.location.reload(); // or ideally, refresh parent state
    }}
  />
)}

</div>
  );
};

export default SavedGamesSection;
