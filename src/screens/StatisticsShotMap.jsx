import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function CourtOnly() {
  const location = useLocation();
  const savedGame = location.state;
  const [gameActions, setGameActions] = useState(savedGame?.actions || []);
  const [currentQuarter, setCurrentQuarter] = useState(1);

  return (
    <main className="bg-primary-bg">
        <div className="h-[7vh] bg-primary-bg w-full"></div>
    <div className="bg-primary-bg h-[86vh]  flex items-center justify-center">
<div
  
  className={`top-nav w-full relative z-50  h-full bg-secondary-bg"
   
  
  `}
>



<div
    className={`absolute w-[90%] h-[90%] rounded-b-full left-[6%] relative box-border bg-secondary-bg"
      z-auto

    
    
    border-gray-500 border-2`}
  >
    

    {/* <div className="bg-primary-danger w-[100%]  h-[50%] absolute"></div>
    <div className="bg-red-300 w-[76%]  top-[50%] h-[30%] left-[12%] absolute"></div>
    <div className="bg-red-100 w-[40%]  top-[80%] h-[15%] left-[30%] absolute"></div>
    <div className="bg-green-100 w-[10%]  top-[95%] h-[5%] left-[45%] absolute"></div> */}

    {/* Court Key */}
    <div
      className={`absolute sm:w-1/4 w-1/3 left-1/3 sm:left-[37.5%] border border-gray-500   h-[60%]`}
    ></div>
    <div className="absolute sm:w-1/4 w-1/3 left-1/3 sm:left-[37.5%] border-2 border-gray-500  lg:h-[30%] h-[25%] sm:h-[25%] rounded-b-full top-[60%]"></div>

    {/* Render Actions as Dots */}
   
  </div>
 {/* Render Actions */}
 {gameActions.map((action, index) => {
  if (typeof action.x === "number" && typeof action.y === "number") {
    return (
      <div
        key={index}
        className={`absolute w-4 h-4 rounded-full ${
          ["2Pt Miss", "3Pt Miss"].includes(action.actionName)
            ? "bg-primary-danger"
            : "bg-primary-cta"
        }`}
        style={{
          top: `calc(${action.y}% * (65 / 55))`, // Scale Y in the opposite direction
          left: `${action.x}%`,
          transform: "translate(-50%, -50%)",
        }}
        title={`Action: ${action.actionName} | Quarter: ${action.quarter}`}
      ></div>
    );
  } else {
    return null;
  }
})}




  {/* Court outline */}

</div>
    </div>
    <div className="h-[7vh]  w-full">

    {/* Bottom Nav Bar Start */}
<div class="fixed z-50 w-full h-16 mt-2 max-w-lg -translate-x-1/2  border border-gray-800 rounded-full  left-1/2
 bg-secondary-bg">
    <div class="grid h-full max-w-lg grid-cols-5 mx-auto">
        <button onClick={()=>{
            StatsShotMapHandler()}} data-tooltip-target="tooltip-home" type="button" class="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-50 dark:hover:bg-white/10 group">
            <svg class="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary-cta dark:group-hover:text-primary-cta" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
            </svg>
            <span class="sr-only">Home</span>
        </button>
        <div id="tooltip-home" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
            Home
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
        <button data-tooltip-target="tooltip-wallet" type="button" class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-white/10 group">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-gray-400">
  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
</svg>

            <span class="sr-only">Wallet</span>
        </button>
        <div id="tooltip-wallet" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
            Wallet
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
        <div class="flex items-center justify-center">
            <button data-tooltip-target="tooltip-new" type="button" class="inline-flex items-center justify-center w-10 h-10 font-medium bg-primary-cta rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800">
            <svg class="w-5 h-5 mb-1 text-gray-500 dark:text-gray-200 group-hover:text-primary-cta dark:group-hover:text-primary-cta" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
            </svg>
                <span class="sr-only">New item</span>
            </button>
        </div>
        <div id="tooltip-new" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
            Create new item
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
        <button data-tooltip-target="tooltip-settings" type="button" class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-white/10 group">
            <svg class="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary-cta dark:group-hover:text-primary-cta" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"/>
            </svg>
            <span class="sr-only">Settings</span>
        </button>
        <div id="tooltip-settings" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
            Settings
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
        <button data-tooltip-target="tooltip-profile" type="button" class="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-white/10 group">
            <svg class="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary-cta dark:group-hover:text-primary-cta" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
            </svg>
            <span class="sr-only">Profile</span>
        </button>
        <div id="tooltip-profile" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
            Profile
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
    </div>
</div>
{/* bottom Navbar End */}
    </div>
    </main>
  );
}
