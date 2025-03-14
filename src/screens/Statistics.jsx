import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusMinus, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { db } from "../db"; // Import your Dexie instance

import { useLocation } from "react-router-dom";

export default function Statistics() {
    const location = useLocation();
    const navigate = useNavigate();
    const savedGame = location.state; // Now savedGame will have the data passed from StartGame/HomeDashboard
    console.log(savedGame);
    const StatsShotMapHandler=()=>{
        navigate("/statisticsShotMap", { state: savedGame });
    }
  return (
<main className="bg-primary-bg w-full">
<div className=" h-screen w-full container mx-auto">


{/* this is the start of the home of the stats page  */}
<div class="grid grid-rows-7  h-full pt-4 pb-24 grid-cols-12 gap-4">
  <div class="row-span-3 rounded-md col-span-7 bg-secondary-bg text-white   ...">
    <div className="h-1/4 w-full px-5 ">


    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <h1 className="text-xl  text-center font-bold  p-4">Game Stats</h1>
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-200 uppercase bg-white/10">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Stat
                </th>
                <th scope="col" class="px-6 py-3">
                    Attempts
                </th>
                <th scope="col" class="px-6 py-3">
                    %
                </th>
        
            </tr>
        </thead>
        <tbody>
            <tr class="">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                   Field Goal
                </th>
                <td class="px-6 py-4">
                    25-74
                </td>
                <td class="px-6 py-4">
                    42%
                </td>
            
            </tr>
  
             
            
            
           
            <tr class="">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                   3 Point
                </th>
                <td class="px-6 py-4">
                    25-74
                </td>
                <td class="px-6 py-4">
                    42%
                </td>
            
            </tr>
            <tr class="">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                   Free Throw
                </th>
                <td class="px-6 py-4">
                    25-74
                </td>
                <td class="px-6 py-4">
                    42%
                </td>
            
            </tr>
        </tbody>
    </table>
    
</div>




    </div>
   


    
    </div>
  <div class="row-span-2 rounded-md col-span-5 bg-secondary-bg  text-white text-center flex items-center justify-center ...">Free Throws</div>

  <div class="row-span-1 rounded-md col-span-5 bg-secondary-bg text-white text-center p-4 text-center">
  
            
  <div class="flex  w-full my-auto justify-between mb-1">
  <span class="text-base  text-md font-medium text-blue-700 dark:text-white">Steals</span>
  <span class="text-md font-medium text-blue-700 dark:text-white">T/O</span>
</div>
<div class="flex  w-full my-auto justify-between mb-1">
  <span class="text-base font-medium text-gray-400 ">12</span>
  <span class="text-sm font-medium text-gray-400">7</span>
</div>
<div class="w-full bg-primary-danger rounded-full h-2.5">
  <div class="bg-primary-cta h-2.5 rounded-full w-3/4"  ></div>
</div>
    </div>
  <div
  className="row-span-4 rounded-md col-span-12 bg-secondary-bg text-white text-center flex items-center justify-center"

>
Visuals
</div>



</div>

    {/* Bottom Nav Bar Start */}
<div class="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2  border border-gray-800 rounded-full bottom-4 left-1/2
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
