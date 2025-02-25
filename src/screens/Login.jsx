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
            <h2 className="text-xl font-bold text-gray-700 mb-4">Version 1.03 (25/02/2025)</h2>
            <h2 className="text-xl font-bold text-indigo-600 mb-4">This is a BETA !!</h2>
            <form onSubmit={handleLogin}>
        
       
<a href="#" class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100
">

<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">Recent Features Added</h5>
<ul class="list-disc py-2 gap-y-3">
    <li className="py-2">Player Pictures feature to add to lineout</li> 
    <li className="py-2">Player filter now available to see okayer scores/missus along with player stats</li> 
    <li className="py-2">Hide the player filter with a button</li> 


    </ul></a>
<br></br>
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
