import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { doc as firestoreDoc, getDoc } from "firebase/firestore";
import { firestore } from "../../../firebase"; // adjust if needed
import { db } from "../../../db"; // adjust if needed
import opponentJerseyDefault from "../../../assets/jersey.webp"
import homeLogo from "../../../assets/logo.jpg"
import { fetchTeamSettings } from "../../../utils/fetchTeamSettings";
const SavedGamesSection = ({
  savedGames,
  user,
  handleGameClick,
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
  {user &&
  <h4 className="text-sm text-white font-semibold mb-2">Local</h4>
}
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
    <p className="text-sm font-semibold  break-words leading-tight">
      {game.opponentName || "Opponent"}
    </p>
  </div>
</div>
 


) : (
  <p className="text-sm font-medium mb-2 text-white">
    {game.opponentName || "Opponent"} {teamName ? "vs " + teamName : ""}
  </p>
)}

 
            <div className="flex justify-between items-center">
  <button
    onClick={() => handleGameClick(game)}
    className="py-1 bg-white/10 px-4 text-white font-semibold rounded"
  >
    {game.isComplete ? "Open" : "Continue"}
  </button>

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
</div>

          </li>
        ))
    ) : (
      <li className="text-gray-400 my-auto w-96">No local games in progress</li>
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
   <div className="flex-1  flex items-center justify-center">
     <p className="text-xl font-bold text-gray-100">
       {game.score?.home ?? "-"} <span className="mx-1">–</span> {game.score?.opponent ?? "-"}
     </p>
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


            <div className="flex justify-between items-center">
              <button onClick={() => handleGameClick(game)} className="py-1 bg-white/10 px-4 text-white font-semibold rounded">
                Continue
              </button>
              <button onClick={() => handleCompleteGameClick(game)} className="py-1 text-secondary-cta px-4 bg-white/10 font-semibold rounded">
                <FontAwesomeIcon icon={faCheck} />
              </button>
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
          <li key={game.id} className="bg-white/5 border-l-primary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10 flex flex-col">
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
   <div className="flex-1  flex items-center justify-center">
     <p className="text-xl font-bold text-gray-100">
       {game.score?.home ?? "-"} <span className="mx-1">–</span> {game.score?.opponent ?? "-"}
     </p>
   </div>
 
   {/* Opponent Team */}
   <div className="flex flex-col items-center justify-center  p-1 w-1/3">
   <img
  src={game.opponentLogo || opponentJerseyDefault}
  alt="Opponent Team Logo"
  className="w-8 h-8 mb-1 rounded-full"
/>
     <p className="text-sm font-semibold  break-words leading-tight text-center">
       {game.opponentName || "Opponent"}
     </p>
   </div>
 </div>
            <div className="flex justify-between">
              <div className="flex space-x-2 w-full">
                <button
                  onClick={() => handleGameClick(game)}
                  className="py-1 bg-white/10 px-4 text-white font-semibold rounded flex items-center text-md ml-1"
                >
                  Open
                </button>
                <div className="flex justify-end space-x-2 w-full">
                  <button
                    onClick={() => handleSetInProgress(game)}
                    className="py-1 rounded flex text-gray-400 items-center text-xs"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDeleteGame(game.id)}
                    className="py-1 text-gray-400 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
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
          <li key={game.id} className="bg-white/5 border-l-primary-cta border-l-4 shadow-lg col-span-6 md:col-span-3 p-3 rounded-lg hover:bg-white/10 flex flex-col">
 <div className="flex items-center bg-dark-700 text-white mb-2   rounded overflow-hidden w-full">
   {/* Home Team */}
   <div className="flex  overflow-auto h-auto flex-col items-center justify-center  p-1 w-1/3">
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
   <div className="flex-1    w-1/3 flex items-center justify-center">
     <p className="text-xl font-bold text-gray-100">
       {game.score?.home ?? "-"} <span className="mx-1">–</span> {game.score?.opponent ?? "-"}
     </p>
   </div>
 
   {/* Opponent Team */}
   <div className="flex flex-col items-center  justify-center   w-1/3">
   <img
  src={game.opponentLogo || opponentJerseyDefault}
  alt="Opponent Team Logo"
  className="w-8 h-8 mb-1 rounded-full"
/>
     <p className="text-sm font-semibold text-center truncate">
       {game.opponentName || "Opponent"}
     </p>
   </div>
 </div>
            <div className="flex justify-between">
              <div className="flex space-x-2 w-full">
                <button
                  onClick={() => handleGameClick(game)}
                  className="py-1 bg-white/10 px-4 text-white font-semibold rounded flex items-center text-md ml-1"
                >
                  Open
                </button>
                <div className="flex justify-end space-x-2 w-full">
                  <button
                    onClick={() => handleSetInProgress(game)}
                    className="py-1 rounded flex text-gray-400 items-center text-xs"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDeleteGame(game.id)}
                    className="py-1 text-gray-400 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))
    ) : (
      
      <li className="text-gray-400 w-auto min-w-96">
{!user
  ? "No completed games"
  : savedGames.local.filter(game => game.isComplete).length === 0 &&
    (savedGames.local.length > 0 || savedGames.synced.length > 0)
    ? "No local completed games"
    : null}


       </li>
    )}
  </ul>
  {/* </>
} */}
</div>

</div>
  );
};

export default SavedGamesSection;
