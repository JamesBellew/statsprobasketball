import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState,useEffect } from 'react';

import Login from './screens/Login';
import HomeDashboard from "./screens/HomeDashboard";
import StartGame from './screens/StartGame';
import InGame from './screens/InGame';
import Statistics from './screens/Statistics';
import StatisticsShotMap from './screens/StatisticsShotMap';
import MobileBlocker from './screens/MobileBlocker';
import useAuth from "./hooks/useAuth";
import HomeScreenCourtSVG from './screens/HomescreenCourtSVG'

export default function App() {
  const { user, login, logout } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' or 'error'
  const [showToast, setShowToast] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  console.log(user);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing
      setDeferredPrompt(e);
      setShowInstallButton(true); // Show your custom install button
    };
  
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

const triggerToast = (message, type = "success") => {
  setToastMessage(message);
  setToastType(type);
  setShowToast(true);

  setTimeout(() => setShowToast(false), 4000);
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      triggerToast("Logged in successfully 🔥", "success");
      setShowLoginModal(false);
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
      setError("");
    } catch (err) {
      setError(err.message);
      triggerToast(`❌ ${err.message}`, "error");
    }
  };
  const handleLogout = () => {
    logout(); // your actual logout logic
  
    // Show toast
    setToastMessage("Logged out");
    setShowToast(true);
  
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
    }, 3000);
  };
  
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the A2HS prompt");
      setDeferredPrompt(null);
      setShowInstallButton(false);
    } else {
      console.log("User dismissed the A2HS prompt");
    }
  };
 //UseStates
 const [showLoginModal,setShowLoginModal] = useState(false)
 const [showAuthModal,setShowAuthModal] = useState(false)
 if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}



  return (
    
    <Router>
      <MobileBlocker/>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="bg-primary-bg min-h-screen">
              {/* Passing the state and updater function as props to Login */}
              <Login showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
            <section className="w-full bg-primary-bg px-8 text-gray-700 ">

<div className='container mx-auto'>
              
<div class="navbar bg-primary-bg shadow-sm">
  <div class="flex-1">
    <a class="btn btn-ghost text-white rounded-none text-xl border-r-2 border-r-gray-500">StatsPro</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal text-gray-300 px-1">
      <li><a href='https://www.instagram.com/james_bellew97/'>Request an account</a></li>
 

      {user ?
      <li className=' border-l-2 border-l-primary-cta  rounded-md rounded-l-none'>
        <details>
          <summary className=' text-white'>{user.email}</summary>
          <ul class="shadow-xl bg-primary-bg w-full rounded-t-none p-2">
            {/* <li><a> ⚙️    Team Settings</a></li>
            <hr className='my-2'></hr> */}
            <li   onClick={()=>{handleLogout()}} className='bg-primary-danger rounded-md text-white'><a>Logout</a></li>
          </ul>
        </details>
      </li>
          : <>
              <li className='   w-32 rounded-md '>
        <details>
          <summary>Guest</summary>
          <ul class="shadow-xl bg-primary-bg w-full rounded-t-none p-2">
            
            <li   onClick={()=>{setShowAuthModal(true)}} className='bg-primary-danger rounded-md text-white'><a>Login</a></li>
          </ul>
        </details>
      </li>
          </>}
          {showInstallButton && deferredPrompt && (
  <li>
    <button
      onClick={handleInstallClick}
      className="text-white bg-primary-cta font-medium rounded-md text-sm px-5 py-1 hover:bg-indigo-600"
    >
      Download App
    </button>
  </li>
)}

    </ul>
  </div>
</div>
</div>
            </section>
             <section class="px-2 py-32 bg-primary-bg md:px-0">
       
             <div class="container items-center  px-8 mx-auto ">
               <div class="flex flex-wrap items-center sm:-mx-3">
                 <div class="w-full md:w-1/2 md:px-3">
                   <div class="w-full pb-6 space-y-6 sm:max-w-md lg:max-w-lg md:space-y-4 lg:space-y-8 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0">
                     <h1 class="text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
                       <span class="block xl:inline">Just A Chill </span>
                       <span class="block text-primary-danger  xl:inline">Basketball Stat Tracker.</span>
                     </h1>
                     <p class="mx-auto text-base text-gray-300 sm:max-w-md lg:text-xl md:max-w-3xl">Sport Tracking App. Up and Running In 2 Minutes And Easy To Use .</p>
                     <div class="relative flex flex-col sm:flex-row sm:space-x-4">
                     <a
                onClick={() => {
                  setShowLoginModal(true); // Trigger modal to open
                }}
                className={`flex items-center w-full px-6 py-3 mb-3 text-lg text-white b rounded-md sm:mb-0  sm:w-auto cursor-pointer
                  ${user ? "bg-primary-danger" : 'bg-primary-cta/75 '}
                  `}
              >
  {user ? "Start" : "Guest"}
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
</a>
{!user && (
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-primary-danger flex items-center w-full px-6 py-3 mb-3 text-lg text-white rounded-md sm:mb-0 hover:bg-indigo-700 sm:w-auto"
        >
          Login <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 ml-2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>

        </button>
      )}

      {/* Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center left-[-16px] w-screen h-screen bg-black/50">
          <div className="bg-primary-bg rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-center text-2xl font-bold text-gray-200">Sign in to your account</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-400">Email address</label>
                <input
                  type="email"
                  className="mt-1 block w-full px-3 py-2 rounded-md border 
                  border-gray-300 shadow-sm focus:outline-none text-white bg-primary-bg focus:ring-indigo-500 focus:border-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full px-3 py-2 rounded-md border bg-primary-bg border-gray-300 shadow-sm focus:outline-none text-white focus:ring-indigo-500 focus:border-indigo-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="w-full bg-primary-danger hover:bg-indigo-500 text-white py-2 px-4 rounded"
                >
                  Sign In
                </button>
              </div>
            </form>
            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-4 text-sm  text-indigo-600 hover:text-indigo-500 w-full text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

                   
                     </div>
                   </div>
                 </div>
                 <div className="w-full md:w-1/2">


<div className="w-full h-[350px] overflow-hidden   ">
  <HomeScreenCourtSVG />
</div>

  {showToast && (
  <div className={`fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${showToast ? 'opacity-100' : 'opacity-0'}`}>
    <div className="flex items-center w-full max-w-xs p-4 text-gray-500  rounded-lg shadow-xl bg-primary-bg ">
      <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg 
        ${toastType === 'success' ? 'bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200' 
        : 'bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200'}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 18 20" xmlns="http://www.w3.org/2000/svg">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d={toastType === 'success'
              ? "M5 13l4 4L19 7"
              : "M6 18L18 6M6 6l12 12"} />
        </svg>
      </div>
      <div className="ms-3 text-sm font-normal">{toastMessage}</div>
      <button
        onClick={() => setShowToast(false)}
        className="ms-auto  -my-1.5 bg-primary-bg mx-4 p-2 text-gray-500"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
      </button>
    </div>
  </div>
)}

</div>

               </div>
             </div>
           </section>
           </div>
           </>
          }
        />
        <Route path="/Login" element={<Login />} />
        <Route path="/homedashboard" element={<HomeDashboard />} />
        <Route path="/startgame" element={<StartGame />} />
        <Route path="/ingame" element={<InGame />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/statisticsShotMap" element={<StatisticsShotMap />} />
        

  
      </Routes>
    
    </Router>
  );
}
