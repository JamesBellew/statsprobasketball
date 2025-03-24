import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import Login from './screens/Login';
import HomeDashboard from "./screens/HomeDashboard";
import StartGame from './screens/StartGame';
import InGame from './screens/InGame';
import Statistics from './screens/Statistics';
import StatisticsShotMap from './screens/StatisticsShotMap';
import MobileBlocker from './screens/MobileBlocker';

export default function App() {

 //UseStates
 const [showLoginModal,setShowLoginModal] = useState(false)
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
              <div className="bg-white min-h-screen">
              {/* Passing the state and updater function as props to Login */}
              <Login showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
            <section className="w-full bg-white px-8 text-gray-700 ">
              <div className="container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl">
                <div className="relative flex flex-col md:flex-row">
                  <a href="#_" className="flex items-center mb-5 font-medium text-gray-900 lg:w-auto lg:items-center lg:justify-center md:mb-0">
                    <span className="mx-auto text-xl font-black leading-none text-gray-900 select-none">
                      Statspro<span className="text-indigo-600">.</span>
                    </span>
                  </a>
                  <nav className="flex flex-wrap items-center mb-5 text-base md:mb-0 md:pl-8 md:ml-8 md:border-l md:border-gray-200">
                    <a href="#_" className="mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900">
                      Start
                    </a>
                    <a href="#_" className="mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900">
                      Walkthroughs
                    </a>
                    <a href="#_" className="mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900">
                      Examples
                    </a>
                  </nav>
                </div>
              </div>
            </section>
             <section class="px-2 py-32 bg-white md:px-0">
       
             <div class="container items-center max-w-6xl px-8 mx-auto xl:px-5">
               <div class="flex flex-wrap items-center sm:-mx-3">
                 <div class="w-full md:w-1/2 md:px-3">
                   <div class="w-full pb-6 space-y-6 sm:max-w-md lg:max-w-lg md:space-y-4 lg:space-y-8 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0">
                     <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
                       <span class="block xl:inline">Just A Chill</span>
                       <span class="block text-indigo-600 xl:inline">Basketball Stat Tracker.</span>
                     </h1>
                     <p class="mx-auto text-base text-gray-500 sm:max-w-md lg:text-xl md:max-w-3xl">No Bullshit Sport Tracking app. Up and Running In 2 Minutes And Easy To Use .</p>
                     <div class="relative flex flex-col sm:flex-row sm:space-x-4">
                     <a
                onClick={() => {
                  setShowLoginModal(true); // Trigger modal to open
                }}
                className="flex items-center w-full px-6 py-3 mb-3 text-lg text-white bg-indigo-600 rounded-md sm:mb-0 hover:bg-indigo-700 sm:w-auto cursor-pointer"
              >
  Start
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
</a>

                   
                     </div>
                   </div>
                 </div>
                 <div className="w-full md:w-1/2">
  <div className="w-full h-auto overflow-hidden rounded-md shadow-xl sm:rounded-xl">
    <img 
      src="https://image-cdn.essentiallysports.com/wp-content/uploads/20200702223509/kobe-2001-1.jpg" 
      alt="Example"
    />
  </div>
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
