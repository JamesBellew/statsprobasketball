import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusMinus ,faPlay} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
export default function StartGame(){
  const navigate = useNavigate();
const [opponentName,setOpponentName] = useState(null)
  const [selectedVenue, setSelectedVenue] = useState("home");
  const handleClick = (venue) => {
    setSelectedVenue(venue);
  };

  const handleOpponentInputChange = (event)=>{
    setOpponentName(event.target.value);
  }
  const handleGameStart = () => {
    navigate('/ingame', {
      state: {
        opponentName,
        selectedVenue,
      },
    });
  };
  
  return(
   <div className="h-screen w-full bg-gradient-to-b flex items-center  from-black to-gray-900">

    <div className="container mx-auto">
<div class="w-full lg:w-3/4 px-10  mx-10 mx-auto my-auto  justify-center items-center">
  <div>
      <label for="small-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Opponent</label>
      <input required onChange={handleOpponentInputChange} type="text" id="small-input" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
  </div>
  <div className="grid grid-cols-4 mt-5 w-full  lg:grid-cols-6 gap-4">
          {/* Saved Game Stats Card */}


          {/* Other Cards */}
          <div className="bg-gray-800 h-24 col-span-2 p-2 lg:p-4  rounded-lg flex items-center justify-center">
  <label className="inline-flex items-center cursor-pointer">
    <input type="checkbox" value="" className="sr-only peer mx-auto" />
    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Game Timer</span>
  </label>
</div>

          <div className="bg-gray-800 h-24 col-span-2 p-2 lg:p-4 rounded-lg flex items-center justify-center">
          <label className="inline-flex items-center cursor-pointer">
    <input type="checkbox" value="" className="sr-only peer mx-auto" />
    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Player Stats</span>
  </label>
          </div>
    
          <div className="bg-gray-800 h-24 col-span-2 p-2 lg:p-4  rounded-lg flex items-center justify-center">
          <label className="inline-flex items-center cursor-pointer">
    <input type="checkbox" value="" className="sr-only peer mx-auto" />
    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Track Score</span>
  </label>
          </div>
  <div className="bg-gray-800 h-24 col-span-2 p-2 lg:p-4   hover:bg-indigo-500 cursor-pointer rounded-lg flex items-center justify-center">
          <label className="inline-flex items-center cursor-pointer">

          <FontAwesomeIcon className="text-white " icon={faPlusMinus} />
    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Game Stats</span>
  </label>
          </div>

          <div className="bg-gray-800 col-span-4 lg:col-span-2 flex h-24 rounded-lg relative">
      {/* Slider Background */}
      <div className="absolute inset-0 flex">
        <div
          className={`h-full w-1/2 transition-all duration-300 
    
          
          `
        
        }
        />
      </div>

      {/* Slider Indicator */}
      <div
        className={`absolute w-1/2 h-full bg-white rounded-lg transition-transform duration-300 ${
          selectedVenue === 'home' ? 'transform translate-x-0' : 'transform translate-x-full'
        }`}
      ></div>

    {/* Home Button */}
<div
  className="z-10 w-1/2 h-full flex justify-center items-center cursor-pointer"
  onClick={() => setSelectedVenue('home')}
>
  <button
    className={`px-4 py-2 rounded ${
      selectedVenue === 'home' ? 'text-gray-800 font-bold' : 'text-white'
    }`}
  >
    Home
  </button>
</div>

{/* Away Button */}
<div
  className="z-10 w-1/2 h-full flex justify-center items-center cursor-pointer"
  onClick={() => setSelectedVenue('away')}
>
  <button
    className={`px-4 py-2 rounded ${
      selectedVenue === 'away' ? 'text-gray-800 font-bold' : 'text-white'
    }`}
  >
    Away
  </button>
</div>

    </div>

    <button 
    onClick={()=>{
      handleGameStart()
    }}
    disabled={!opponentName} className={`bg-gray-800 h-24 col-span-4 lg:col-span-2 p-2 lg:p-4 
      ${opponentName ? "bg-indigo-500 cursor-pointer":"bg-gray-500 cursor-not-allowed"}

      
      cursor-pointer rounded-lg flex items-center justify-center`}>
          <label className="inline-flex items-center ">

          <FontAwesomeIcon className="text-white " icon={faPlay} /> 
    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Start Game</span>
  </label>
          </button>

        </div>
</div>
</div>
 

   </div>
    )

}