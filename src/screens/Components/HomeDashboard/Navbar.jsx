import { useState, useRef, useEffect } from "react";

const Navbar = ({ user, handleLogout, openSettings }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-secondary-bg w-full px-8">
      <div className="container mx-auto flex items-center justify-between h-16">
        {/* Left Icon */}
        <div className="text-primary-cta">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Dropdown */}
          <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
              type="button"
              className="inline-flex justify-center items-center gap-x-1.5 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
              onClick={() => setOpen(!open)}
            >
              {user?.email || "Guest"}
              <svg className="-mr-1 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Panel */}
            {open && (
              <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-secondary-bg ring-1 ring-white/10 shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      openSettings(); // 🔥 trigger modal from parent
                      setOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    ⚙️    Team Settings
                  </button>
                  {/* <button
                    onClick={() => alert("Support page coming soon")}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    🛠️ Support
                  </button>
                  <button
                    onClick={() => alert("License info coming soon")}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    📄 License
                  </button> */}
                  {/* <hr className=""></hr> */}
                  {user &&
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10"
                  >
                    🚪 Sign Out
                  </button>
}
                </div>
              </div>
            )}
          </div>

          {/* Home Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-primary-cta hover:bg-indigo-600 text-gray-50 rounded-xl flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Home</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
