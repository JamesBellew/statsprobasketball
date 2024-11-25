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
            <h2 className="text-xl font-bold text-gray-700 mb-4">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                />
              </div>
              <button
                type="submit"
                className="w-full px-3 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
              >
                Login
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
