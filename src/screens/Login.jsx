import { useNavigate } from "react-router-dom";

export default function Login({ showLoginModal, setShowLoginModal }) {
  const navigate = useNavigate(); // Initialize the navigation hook

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent form submission reload
    // Perform login logic here (e.g., validation, API call)
    navigate("/homedashboard"); // Navigate to HomeDashboard after login
    setShowLoginModal(false)
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
            <h2 className="text-xl font-bold text-gray-700 mb-4">Version 1.86 (12/06/2025)</h2>
            <h2 className="text-xl font-bold text-primary-danger">This is in Alpha(calm down) !!</h2>
            <h2 className="text-xl font-semibold text-gray-600 mb-4">This shit will break <span className="font-bold underline text-primary-danger">A LOT</span></h2>
            <form onSubmit={handleLogin} className=" ">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">Recent Features Added</h5>
        <div className="max-h-[30vh] overflow-auto">
       
<a href="#" class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100
">


<ul class="list-disc py-2 gap-y-3 text-gray-700">
<p className="font-bold text-primary-danger text-sm">12/06/2025 - Version 1.87</p>
<li className="py-2">Player scores in livegame view is now sorted by most points</li>
<li className="py-2">Major UI for game stats in livegameview</li>
<p className="font-bold text-primary-danger text-sm">12/06/2025 - Version 1.86</p>
<li className="py-2">Added in new section in livegame game stats</li>
<p className="font-bold text-primary-danger text-sm">12/06/2025 - Version 1.85</p>
<li className="py-2">Added in new section in livegame for PlayerStats</li>
<li className="py-2">Added in new section in livegame for gamestats</li>
<li className="py-2">Fixed Homescreen mobile nav not working</li>
<p className="font-bold text-primary-danger text-sm">10/06/2025 - Version 1.84</p>
<li className="py-2">Scoring quarter split table added into live game view</li>
<p className="font-bold text-primary-danger text-sm">10/06/2025 - Version 1.83</p>
<li className="py-2">Fixed Home screen background issue with bg-opacity </li>
<li className="py-2">Fixed Home Dashbaord Header background issue with bg-opacity </li>
<p className="font-bold text-primary-danger text-sm">09/06/2025 - Version 1.82</p>
<li className="py-2">Better UX/UI for hover states in homedashboard for games, easily readable</li>
<li className="py-2">Scheduled/Recent games now are ordered by the most rcent games</li>
<li className="py-2">Dynamically render the live/FT/minutes/Quarters sectionw ithin the live game depending on the state of the game ie(live/scheduled/done)</li>
<li className="py-2">Shows scheduled date/time within game if clicked on a scheduled game</li>
<li className="py-2">New filtering system added in for filtering on Scheduled/Recent games</li>
<li className="py-2">Navigation fixes within the livegame view to go back to livegames dashboard </li>
<p className="font-bold text-primary-danger text-sm">05/06/2025 - Version 1.81</p>
<li className="py-2">Newly created broadcast now defaults to not finished</li>
<li className="py-2">Background pattern added in LiveGameView</li>
<li className="py-2">Fixed broken mobile nav menu in LiveGameView</li>
<li className="py-2">Fixed Rectn/Scheduled games overlap logic</li>
<li className="py-2">InGame user side now shows you when you have agame finsihed with a big warning</li>
<li className="py-2">Minor UX/UI Improvements</li>
<p className="font-bold text-primary-danger text-sm">05/06/2025 - Version 1.80</p>
<li className="py-2">Re-design of home page to allow user to go to live games page</li>
<li className="py-2">New LiveGameView dashboard to show all live/recent/scheduled games any viewer can visit</li>
<li className="py-2">New LiveGameView page that shows updates from the livegames(scores etc.)</li>
<li className="py-2">New Database Slug implementation that can send multiple slugs to live game view from the s=ingame stats page to serve to the clients viewing the livegame</li>
<li className="py-2">InGame page is now completley modular to future proof further work, makiing it 10x easier to work on </li>
<li className="py-2">HomeDashboard page is now completley modular to future proof further work, makiing it 10x easier to work on </li>
<li className="py-2">Major amount of UX/UI improvements </li>
<hr></hr>
<li className="py-2">Court now scales for horizontal viewing on tablets</li>
<p className="font-bold text-primary-danger text-sm">07/04/2025 - Version 1.70</p>
<hr></hr>
<li className="py-2">Some animations for when games are savign and when games are synching </li>
<li className="py-2">More redundencie checks when user uploads to database to prevent overwrite's and leaks. using UID instead of email prevents overlaps</li>
<li className="py-2">HomeDashbaord(saved games) - now shows the opponent logo instead of placeholder jersey</li>
<li className="py-2">User database is now using user UID instead of email for storing of the data(makes more sense)</li>
<li className="py-2">HomeDashboard is now split up into compoenents for future proofing</li>
<li className="py-2">Team image and name or now dynamic with a fallback on OG ravesn icon</li>
<li className="py-2">Fixed deletion of cloud games</li>
<li className="py-2">Major UX/UI improvements to the home dashboard saved games section</li>
<li className="py-2">Added a pop up modal if the user tries to start a game with no team name in settings saved</li>
<li className="py-2">Added a settings page to allow user to upload team image and change name, for other teams besides the Ravens</li>
<li className="py-2">Added more flexibility to the current run, can now do multiple itterations like 12-2</li>
<p className="font-bold text-primary-danger text-sm">01/04/2025</p>
<p className="font-bold text-primary-danger text-sm">01/04/2025</p>
<hr></hr>
<li className="py-2">Sync to cloud UX/UI change needed</li>
<p className="font-bold text-primary-danger text-sm">01/04/2025</p>
<hr></hr>
<li className="py-2">In game stats now has a current run card to show the run the team is on</li>
<li className="py-2">In Game stats card re-design</li>
<li className="py-2">Now can handle multiple lineouts</li>
<li className="py-2">Lineouts now saved to database</li>
<li className="py-2">Opponent score leak has finally been sealed ❤️</li>
<li className="py-2">Homedashboard theme change to match app</li>
<li className="py-2">Homedashboard new animated image</li>
<li className="py-2">Animation on synching games to the cloud when uplaoding</li>
<li className="py-2">Animation on synching lineouts to the cloud when uplaoding</li>
<li className="py-2">New accounts now created for Alpha use</li>
<li className="py-2">Now have the ability to store a game locally and synch it to the cloud</li>
<li className="py-2">CRUD for cloud features implemented</li>
<li className="py-2">Lineouts now have a select if you have multiple lineouts, split into local and cloud</li>
<p className="font-bold text-primary-danger text-sm">27/03/2025</p>
<hr></hr>
<li className="py-2">Conditionally render overtimes in graphs/charts</li>
<p className="font-bold text-primary-danger text-sm">27/03/2025</p>
<hr></hr>
<li className="py-2">Added Firebasee Authentication for user login🔥</li>
<li className="py-2">Created two Firebase accounts for Auth testing, works well 👍</li>
<li className="py-2">Fixed huge issue with OT edge case with new opponent structure. Can now handle up to 4 OT's</li>
<li className="py-2">When in a game with no tracking of the time, you can now substitute player for ease of selecting for actions.</li>
<li className="py-2">Login system UX/UI for Firebase🔥(More needed, looks like shit)</li>
<li className="py-2">More security for Opponent score leakage, I will eventually squash this bug, but can still happen on refresh in offline mode 😭</li>
<li className="py-2">App now have two states for saving/retreiving data. 1 is Dexie for local and offline storage. 2 is Firebase for user Authentication and account sharing database storage</li>
<p className="font-bold text-primary-danger text-sm">25/03/2025</p>
<hr></hr>
<li className="py-2">More ddatabase leak protection for opponenet score to hopefully fix sever leak</li>
<li className="py-2">UX/UI Improvements</li>

<p className="font-bold text-primary-danger text-sm">24/03/2025</p>
<hr></hr>
<li className="py-2">Added a mobile blocker feature to prevent the app from being used on a mobile device, will be working with mobile in later versions</li> 
<li className="py-2">Making a substitution now shows who is on the floor and who is on the bench</li> 
<li className="py-2">When selecting a player for an acition the players on the floor are highlighted and players who are on the floor are now sorted to the top of the list</li> 
<li className="py-2">More security measures to try and prevent opponent scores database leak. It can still leak with a few edge cases😭 </li> 
<li className="py-2">New animations for game clock, animates on minutes decrease and when clock strikes zero</li> 
<li className="py-2">Added 3 new cards to Gamestats modal for offensive rebounds, rebounds and assists to show totals</li> 
<p className="font-bold text-primary-danger text-sm">23/03/2025</p>
<hr></hr>
<li className="py-2">Now Can track minutes InGame </li> 
<li className="py-2">Can make substitutions to who is on the floor </li> 
<li className="py-2">True Shooting% </li> 
<p className="font-bold text-primary-danger text-sm">13/03/2025</p>
<hr></hr>
<li className="py-2">Added new chart to display t/o steals split by quarter</li> 
<p className="font-bold text-primary-danger text-sm">19/03/2025</p>
<hr></hr>
<li className="py-2">Fixed lead change coloring issue for opponent</li> 
<p className="font-bold text-primary-danger text-sm">19/03/2025</p>
<hr></hr>
<li className="py-2">New theme added overall</li> 
<li className="py-2">UX/UI improvements</li> 
<p className="font-bold text-primary-danger text-sm">18/03/2025</p>
<hr></hr>
<li className="py-2">Fixed saved games overflowing on home dashboard</li> 
<li className="py-2">Labeling of the gamestats</li> 
<li className="py-2">True shooting percentage UX/UI</li> 
<li className="py-2">Filtered player quarter stats table now fitted to new nav row</li> 
<li className="py-2">Gamestats re-strcuturing, still in porgress. Done by next version</li> 
<li className="py-2">Game Leads now intergated within the label to save space</li> 
<p className="font-bold text-primary-danger text-sm">18/03/2025</p>
<hr></hr>
<li className="py-2">4 new charts displayed in the game stats page</li> 
<li className="py-2">Opponent score now more stable, can still leak</li> 
<li className="py-2">Dynamic player stats displayed when viewing all game plaer stats</li> 
<li className="py-2">Can now complete games and dynamically renders out the actions if game is complete</li> 
<li className="py-2">Major UX/UI improvements</li> 
<li className="py-2">Auto save for opponents actions</li> 
<li className="py-2">Navigation re-ordering to make more sense UX wise</li> 
<p className="font-bold text-primary-danger text-sm">14/03/2025</p>
<hr></hr>
<li className="py-2">More checks to debbug opponenet scoring nullification</li> 
<p className="font-bold text-primary-danger text-sm">13/03/2025</p>
<hr></hr>
<li className="py-2">Potential fix cause for Major bug with oppoenentscore DB saving and retreiving</li> 
<p className="font-bold text-primary-danger text-sm">11/03/2025</p>
<hr></hr>
<li className="py-2">Major UX/UI improvements</li> 
<li className="py-2">Re-ordered and styled top nav</li> 
<li className="py-2">Nivo charts added for both gamescores and others</li> 
<li className="py-2">Fixed DB bug with scores for opponent not saving/fetching</li> 
<li className="py-2">Now track opponent scores</li> 
<p className="font-bold text-primary-danger text-sm">05/03/2025</p>
<hr></hr>
<li className="py-2">Minor UX/UI improvements</li> 
<li className="py-2">Switched layout of top nav buttons for reporting reasons</li> 
<li className="py-2">Score now dynamically shows alone when a player stat is showing</li> 
<li className="py-2">more bg-yellow removals</li> 
<p className="font-bold text-primary-danger text-sm">05/03/2025</p>
<hr></hr>
<li className="py-2">Few bg-red-600 left in for testing now removed</li> 
<li className="py-2">Selecting player is now in grid row of two instead of 1 </li> 
<li className="py-2">Lead change timeline styling changes </li> 
<li className="py-2">Scoreboard styling </li> 

<p className="font-bold text-primary-danger text-sm">04/03/2025</p>
<hr></hr>
<li className="py-2">New lead change feature within the game stats</li> 
<li className="py-2">Tracking of home and away scores not with button to edit scores</li> 
<li className="py-2">Overall scores split by quarters</li> 
<li className="py-2">New Images added</li> 
<p className="font-bold text-primary-danger text-sm">26/02/2025</p>
  <p className="font-bold text-primary-danger text-sm">27/02/2025</p>
<hr></hr>
<li className="py-2">Offensive rebound now counts as a rebound also</li> 
<li className="py-2">Player stats new page now shows blocks</li> 
<li className="py-2">Overall playerstats now sorted by most points</li> 
<p className="font-bold text-primary-danger text-sm">26/02/2025</p>
<hr></hr>
    <li className="py-2">Player Pictures feature to add to lineout</li> 
    <li className="py-2">Player filter now available to see okayer scores/missus along with player stats</li> 
    <li className="py-2">Hide the player filter with a button</li> 
    <p className="font-bold text-primary-danger text-sm">25/02/2025</p>
    <hr></hr>
    <li className="py-2">Added dynamic freethrow stats to the new player stats modal with court</li> 


    </ul></a>
<br></br>
</div>
              <button
                type="submit"
                className="w-full px-3 py-2 text-white bg-primary-danger rounded hover:bg-indigo-700"
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
