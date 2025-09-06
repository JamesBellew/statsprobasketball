import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState,useEffect,useRef } from 'react';
import { useNavigate } from "react-router-dom";

import Login from './screens/Login';
import HomeDashboard from "./screens/HomeDashboard";
import StartGame from './screens/StartGame';
import InGame from './screens/InGame';
import Statistics from './screens/Statistics';
import TeamsDashboard from './screens/TeamsDashboard';
import StatisticsShotMap from './screens/StatisticsShotMap';
import MobileBlocker from './screens/MobileBlocker';
import kobe from './assets/kobe.jpg';
import useAuth from "./hooks/useAuth";
import Users from './screens/Users';
import HomeScreenCourtSVG from './screens/HomescreenCourtSVG'
import LiveGameView from './screens/LiveGameView';
import LiveGamesHomeDashboard from './screens/LiveGameHomeDashboard';
import LandingPageTiles from './screens/Components/HomeScreen/LandingPageTiles';
import TeamPage from './screens/TeamPage';

export default function App() {
  // const navigate = useNavigate();
  const hamburgerRef = useRef(null);
const mobileMenuRef = useRef(null); 
const closeMenuRef = useRef(null);
  const { user, login, logout } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' or 'error'
  const [showToast, setShowToast] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ✅ Add React state for mobile menu
  const [error, setError] = useState("");
 const liveGamesNavigationHandler=()=>{
//I want to navigate to 

 }
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
useEffect(() => {
  const hamburger = hamburgerRef.current;
  const mobileMenu = mobileMenuRef.current;
  const closeMenu = closeMenuRef.current;

  if (!hamburger || !mobileMenu || !closeMenu) return;

  const openMenu = () => {
    mobileMenu.classList.remove("hidden");
    setTimeout(() => {
      mobileMenu.classList.remove("-translate-x-full");
    }, 10);
  };

  const closeMenuFn = () => {
    mobileMenu.classList.add("-translate-x-full");
    setTimeout(() => {
      mobileMenu.classList.add("hidden");
    }, 300);
  };

  hamburger.addEventListener("click", openMenu);
  closeMenu.addEventListener("click", closeMenuFn);
  mobileMenu.addEventListener("click", (e) => {
    if (e.target === mobileMenu) closeMenuFn();
  });

  return () => {
    hamburger.removeEventListener("click", openMenu);
    closeMenu.removeEventListener("click", closeMenuFn);
    mobileMenu.removeEventListener("click", closeMenuFn);
  };
}, []);

const handleOpenMobileMenu = () => {
  setIsMobileMenuOpen(true);
};

const handleCloseMobileMenu = () => {
  setIsMobileMenuOpen(false);
};

  return (
    <div className="bg-[url('/assets/bg-pattern.svg')]   bg-repeat bg-[length:150px_150px]">
    <Router>
      {/* <MobileBlocker/> */}
      <Routes>
        <Route
          path="/"
          element={
            <>
 <header className="bg-primary-bg bg-opacity-60 shadow w-full px-2 z-50">
        <div className="container mx-auto">
          <div className="flex cursor-pointer justify-between items-center py-4 mx-auto">
            <a 
            // onClick={() => { navigate("/") }}
             className="text-xl font-bold text-white">
              StatsPro <span className="text-sm text-gray-400">| Basketball</span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-6 text-gray-300 text-sm">
        <ul class="menu menu-horizontal text-gray-300 px-1">
      {/* <li>
        <a href='https://www.instagram.com/james_bellew97/'>Live Games</a></li> */}
        <li>
        <a href='https://www.instagram.com/james_bellew97/'>Request an account</a></li>

      {user ?
      <li className=' border-l-2 z-50 border-l-primary-cta  rounded-md rounded-l-none'>
        <details>
          <summary className=' text-white'>{user.email}</summary>
          <ul class="shadow-xl bg-primary-bg w-full rounded-t-none p-2">
            <li><a>Settings</a></li>
            <hr className='my-2'></hr>
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
            </nav>

            {/* Mobile Hamburger - ✅ Use React onClick instead of DOM manipulation */}
            <button 
               onClick={handleOpenMobileMenu}
              className="text-white md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>


      {/* ✅ Mobile Menu - Use React state and conditional rendering */}
      <div 
        className={`fixed inset-0 bg-primary-bg bg-opacity-98 md:hidden z-50 transition-transform duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => {
          // Close menu when clicking outside
          if (e.target === e.currentTarget) {
            handleCloseMobileMenu();
          }
        }}
      >
        <div className="flex flex-col justify-between h-full p-6 text-white">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">StatsPro</h2>
            <button 
              onClick={handleCloseMobileMenu}
              className="text-2xl text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
          <nav className="space-y-6 text-lg">
            {/* <a onClick={() => {
              navigate('/');
              handleCloseMobileMenu(); // Close menu after navigation
            }} className="block hover:text-blue-400 border-l-2 pl-4 border-l-primary-cta">Home</a>
            <a onClick={()=>{
              navigate("/../liveGameHomeDashboard")
            }} className="block hover:text-blue-400 text-white  ">Live Games</a>
                <a onClick={()=>{
              navigate("/../teamsDashboard")
            }} className="block hover:text-blue-400 text-white  ">Teams</a> */}
                    <ul class="menu w-full menu-horizontal text-gray-300 px-1">
              {user ?
      <li className=' border-l-2 z-50 border-l-primary-cta  rounded-md rounded-l-none'>
        <details>
          <summary className=' text-white'>{user.email}</summary>
          <ul class="shadow-xl bg-primary-bg w-full rounded-t-none p-2">
            <li><a>Settings</a></li>
            <hr className='my-2'></hr>
            <li   onClick={()=>{handleLogout()}} className='bg-primary-danger rounded-md text-white'><a>Logout</a></li>
          </ul>
        </details>
      </li>
          : <>
              <li className='   w-1/3 mx-auto text-center  bg-white/5 rounded-md '>
        <details>
          <summary>Guest</summary>
          <ul class="shadow-xl bg-primary-bg w-full rounded-t-none p-2">
            
            <li   onClick={()=>{setShowAuthModal(true)}} className='bg-primary-danger rounded-md text-white'><a>Login</a></li>
          </ul>
        </details>
      </li>
          </>}
          </ul>
          </nav>
          <div>
          <div className="block text-center text-blue-500 font-semibold text-gray-400 py-3 rounded-lg">
     StatsPro | Basketball<br></br> Beta
      </div>
          </div>
        </div>
      </div>
              <div className=" min-h-screen  " >
              {/* Passing the state and updater function as props to Login */}
              <Login showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
            <section className="w-full bg-primary-bg px-8 text-gray-700 ">


            </section>
            <section class="  bg-repeat bg-[length:50px_50px w-full min-h-[50vh] py-12 ">
  <LandingPageTiles/>
</section>

             <section class="px-2 py-32 min-h-[90vh]  md:px-0">
       
             <div class="container items-center  px-8 mx-auto ">
               <div class="flex flex-wrap items-center sm:-mx-3">
                 <div class="w-full md:w-1/2 md:px-3">
                   <div class="w-full pb-6 space-y-6 sm:max-w-md lg:max-w-lg md:space-y-4 lg:space-y-8 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0">
                   <h1 class="text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
  <span class="block xl:inline">  Track Every Play. </span>
  <span class="block text-primary-danger xl:inline"> Elevate Your Team.</span>
</h1>

                     <p class="mx-auto text-base text-gray-300 sm:max-w-md lg:text-xl md:max-w-3xl"> Log in to manage your team, track live stats, broadcast live games to viewers,  and get real-time insights that help you win more games</p>
                     <div class="relative flex flex-col sm:flex-row sm:space-x-4">
                    {user &&
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
          }
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



<footer class="flex flex-col space-y-10 justify-center pb-5">

<nav class="flex justify-center flex-wrap gap-6 text-gray-500 font-medium">
    <a class="hover:text-gray-900" href="#">Home</a>
    <a class="hover:text-gray-900" href="#">About</a>
    <a class="hover:text-gray-900" href="#">Services</a>
    
</nav>

<div class="flex justify-center space-x-5">
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
        <img src="https://img.icons8.com/fluent/30/000000/facebook-new.png" />
    </a>

    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
        <img src="https://img.icons8.com/fluent/30/000000/instagram-new.png" />
    </a>
    <a href="https://messenger.com" target="_blank" rel="noopener noreferrer">
        <img src="https://img.icons8.com/fluent/30/000000/facebook-messenger--v2.png" />
    </a>
 
</div>
<p class="text-center text-gray-700 font-medium">&copy; 2022 Company Ltd. All rights reservered.</p>
</footer>

           </div>
           </>
          }
        />
        <Route path="/Login" element={<Login />} />
        <Route path="/homedashboard" element={<HomeDashboard />} />
        <Route path="/teamsDashboard" element={<TeamsDashboard />} />
        <Route path="/startgame" element={<StartGame />} />
        <Route path="/users" element={<Users />} />
        <Route path="/liveGames/:slug" element={<LiveGameView />} />
 
        <Route path="/teams/:teamName" element={<TeamPage />} />
        <Route path="/ingame" element={<InGame />} />
        <Route path="/liveGameHomeDashboard" element={<LiveGamesHomeDashboard />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/statisticsShotMap" element={<StatisticsShotMap />} />

        

  
      </Routes>
    
    </Router>
    </div>
  );
}
