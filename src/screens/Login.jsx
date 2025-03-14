import { useNavigate } from "react-router-dom";

export default function Login({ showLoginModal, setShowLoginModal }) {
  const navigate = useNavigate(); // Initialize the navigation hook

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent form submission reload
    // Perform login logic here (e.g., validation, API call)
    navigate("/homedashboard"); // Navigate to HomeDashboard after login
  };

  return (
    <>
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)} // Close modal on backdrop click
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()} // Prevent close on content click
          >
            <h2 className="text-xl font-bold text-gray-700 mb-4">Version 1.23 (14/03/2025)</h2>
            <h2 className="text-xl font-bold text-indigo-600 mb-4">This is a BETA(calm down) !!</h2>
            <form onSubmit={handleLogin} className=" ">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">Recent Features Added</h5>
        <div className="max-h-[30vh] overflow-auto">
       
<a href="#" class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100
">


<ul class="list-disc py-2 gap-y-3">
<p className="text-gray-400 text-sm">14/03/2025</p>
<hr></hr>
<li className="py-2">More checks to debbug opponenet scoring nullification</li> 
<p className="text-gray-400 text-sm">13/03/2025</p>
<hr></hr>
<li className="py-2">Potential fix cause for Major bug with oppoenentscore DB saving and retreiving</li> 
<p className="text-gray-400 text-sm">11/03/2025</p>
<hr></hr>
<li className="py-2">Major UX/UI improvements</li> 
<li className="py-2">Re-ordered and styled top nav</li> 
<li className="py-2">Nivo charts added for both gamescores and others</li> 
<li className="py-2">Fixed DB bug with scores for opponent not saving/fetching</li> 
<li className="py-2">Now track opponent scores</li> 
<p className="text-gray-400 text-sm">05/03/2025</p>
<hr></hr>
<li className="py-2">Minor UX/UI improvements</li> 
<li className="py-2">Switched layout of top nav buttons for reporting reasons</li> 
<li className="py-2">Score now dynamically shows alone when a player stat is showing</li> 
<li className="py-2">more bg-yellow removals</li> 
<p className="text-gray-400 text-sm">05/03/2025</p>
<hr></hr>
<li className="py-2">Few bg-red-600 left in for testing now removed</li> 
<li className="py-2">Selecting player is now in grid row of two instead of 1 </li> 
<li className="py-2">Lead change timeline styling changes </li> 
<li className="py-2">Scoreboard styling </li> 

<p className="text-gray-400 text-sm">04/03/2025</p>
<hr></hr>
<li className="py-2">New lead change feature within the game stats</li> 
<li className="py-2">Tracking of home and away scores not with button to edit scores</li> 
<li className="py-2">Overall scores split by quarters</li> 
<li className="py-2">New Images added</li> 
<p className="text-gray-400 text-sm">26/02/2025</p>
  <p className="text-gray-400 text-sm">27/02/2025</p>
<hr></hr>
<li className="py-2">Offensive rebound now counts as a rebound also</li> 
<li className="py-2">Player stats new page now shows blocks</li> 
<li className="py-2">Overall playerstats now sorted by most points</li> 
<p className="text-gray-400 text-sm">26/02/2025</p>
<hr></hr>
    <li className="py-2">Player Pictures feature to add to lineout</li> 
    <li className="py-2">Player filter now available to see okayer scores/missus along with player stats</li> 
    <li className="py-2">Hide the player filter with a button</li> 
    <p className="text-gray-400 text-sm">25/02/2025</p>
    <hr></hr>
    <li className="py-2">Added dynamic freethrow stats to the new player stats modal with court</li> 


    </ul></a>
<br></br>
</div>
              <button
                type="submit"
                className="w-full px-3 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
              >
                Begin
              </button>
            </form>
            <button
              className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setShowLoginModal(false)} // Close modal
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
