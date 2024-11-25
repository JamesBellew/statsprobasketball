export default function StartGame(){
    return(
   <div className="h-screen w-full bg-gradient-to-b flex items-center  from-black to-gray-900">
    <div className="w-2/3 h-1/2 flex rounded-lg mx-auto">
    
<div class="w-full mx-10 mx-auto my-auto  items-center">
  <div>
      <label for="small-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Opponent</label>
      <input type="text" id="small-input" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
  </div>
  <div className="grid grid-cols-4 mt-5  lg:grid-cols-6 gap-4">
          {/* Saved Game Stats Card */}


          {/* Other Cards */}
          <div className=" bg-gray-800 h-32 col-span-2 p-4 rounded-lg">
            <h4 className="text-sm text-gray-200 font-medium mb-2">Match Settings</h4>
            <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="w-6 h-6"
>
  <circle cx="12" cy="12" r="3"></circle>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V20a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V4a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H20a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
</svg>

            <p className="text-xs text-gray-200 mt-2">Customize to your needs</p>
          </div>
          <div className="bg-gray-800 h-32 col-span-2 p-4 rounded-lg">
            <h4 className="text-sm font-medium">Buy me a coffee</h4>
            <p className="text-2xl font-bold">$2</p>
            <p className="text-xs text-gray-400">Saying Thanks </p>
          </div>
          <div className="bg-gray-800 col-span-3 h-32 p-4 rounded-lg">
            <h4 className="text-sm font-medium">Buy me a coffee</h4>
            <p className="text-2xl font-bold">$2</p>
            <p className="text-xs text-gray-400">Saying Thanks </p>
          </div>
          <a 
        //   onClick={handleLogout} 
          className=" flex bg-indigo-600 col-span-1 h-32 p-4 rounded-lg">
            <h4 className="text-sm font-medium mx-auto my-auto">Logout</h4>
       

          </a>
        </div>
</div>

    </div>
    <div className="absolute bottom-0 w-full bg-white/5 h-32 "></div>
   </div>
    )

}