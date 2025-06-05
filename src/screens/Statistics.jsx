import { useState, useEffect,useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusMinus, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { db } from "../db"; // Import your Dexie instance
import PlayerStatsTable from "./Components/StatsPage/PlayerStatsTable.jsx";
import GameStatsScoreboard from "./Components/StatsPage/GameStatsScoreboard.jsx";
import GameStats from "./Components/StatsPage/GameStats.jsx";
import ScoringQuarterSplit from "./Components/StatsPage/ScoringQuarterSplit.jsx";
import ExportStatsOptionsModal from "./Components/StatsPage/Modals/ExportStatsOptionsModal.jsx";
import LeadChangeTimeline from "./Components/StatsPage/LeadChangeTimeline.jsx";
import CourtShotMapAll from "./Components/StatsPage/CourtShotMapAll.jsx";
import { useLocation } from "react-router-dom";
// import html2canvas from "html2canvas";
import html2canvas from "html2canvas-pro";
import { faDownload, faHome, faCog, faEllipsisH,faShareNodes,faSliders } from "@fortawesome/free-solid-svg-icons";
import { fetchTeamSettings } from "../utils/fetchTeamSettings.js";
export default function Statistics() {
    //? LOCAL VARIABLES
    const location = useLocation();
    const navigate = useNavigate();
    const savedGame = location.state;
    const exportRef = useRef();
    const playerTable = useRef();
    const exportRefs = {
      scoreboard: useRef(),
      playerStatsTable: useRef(),
      playerTable: useRef(),
         leadChanges: useRef(),
     scoringSplit:useRef(),
    };
    
    

    //? USESTATES VARIABLES
    const [teamImage, setTeamImage] = useState("");
    const { homeTeamName, score, opponentName, opponentLogo } = savedGame || {};
    const [showExportModal, setShowExportModal] = useState(false);
    const [leadChanges, setLeadChanges] = useState([]);
const [selectedQuarter, setSelectedQuarter] = useState("All");
const [currentGameId, setCurrentGameId] = useState(null);


    //? USEEFFECT HOOKS
    useEffect(() => {
        const loadTeamSettings = async () => {
          const settings = await fetchTeamSettings(savedGame.user); 
          if (settings?.teamImage) {
            setTeamImage(settings.teamImage);
          }
        };
      
        loadTeamSettings();
      }, [savedGame.user]);

      //?CLICK HANDLERS
    const homeClickHandler=()=>{
        navigate("/HomeDashboard")
    }
    useEffect(() => {
        if (leadChanges.length === 0) {
          if (score.away > score.home) {
            addNewLeadChange(1, opponentName, `${score.home}-${score.away}`);
          } else if (score.home > score.away) {
            addNewLeadChange(1, "Ravens", `${score.home}-${score.away}`);
          } else {
            addNewLeadChange(1, "Draw", `${score.home}-${score.away}`);
          }
        } else {
          const last = leadChanges[leadChanges.length - 1];
          if (score.away > score.home && last.team !== opponentName) {
            addNewLeadChange(1, opponentName, `${score.home}-${score.away}`);
          } else if (score.home > score.away && last.team !== "Ravens") {
            addNewLeadChange(1, "Ravens", `${score.home}-${score.away}`);
          } else if (score.home === score.away && last.team !== "Draw") {
            addNewLeadChange(1, "Draw", `${score.home}-${score.away}`);
          }
        }
      }, [score]);
      useEffect(() => {
        if (savedGame && savedGame.id) {
          setCurrentGameId(savedGame.id);
          setLeadChanges(savedGame.leadChanges || []);
        }
      }, [savedGame]);
      

    //?FUNCTIONS
    const handleDownload = async () => {
        setShowExportModal(true)

      };
      const addNewLeadChange = async (q, team, score) => {
        const newLeadChanges = [...leadChanges, { q, team, score }];
        setLeadChanges(newLeadChanges);
      
        try {
          if (currentGameId) {
            await db.games.update(currentGameId, { leadChanges: newLeadChanges });
            console.log("Lead Changes updated in DB:", newLeadChanges);
          }
        } catch (error) {
          console.error("Error updating lead changes:", error);
        }
      };

      const exportStats = async (disabledSections = [], format = "pdf") => {
        // Create wrapper
const wrapper = document.createElement("div");
wrapper.style.padding = "24px";
wrapper.style.background = "#0f172a"; // ← This line sets a dark bg manually
wrapper.style.color = "white";
wrapper.style.fontFamily = "Poppins, sans-serif";
wrapper.style.width = "794px";
const page = document.getElementById("page1").cloneNode(true);
const page2 = document.getElementById("page2").cloneNode(true);
page.style.paddingLeft = "32px";  // ~Tailwind's px-8
page2.style.paddingLeft = "32px";  // ~Tailwind's px-8
page.style.paddingRight = "32px";
page2.style.paddingRight = "32px";
wrapper.appendChild(page);

        setShowExportModal(false);
      
        setTimeout(async () => {
          const jsPDF = (await import("jspdf")).default;
          const pdf = new jsPDF("p", "px", [794, 1122]); // A4 size at 96 DPI
      
          const pageIds = ["page1", "page2", "page3"]; // Add your page sections here
          let pageCount = 0;
      
          for (const pageId of pageIds) {
            const el = document.getElementById(pageId);
            if (!el || disabledSections.includes(pageId)) continue;
      
            const canvas = await html2canvas(el, {
              scale: 2,
              useCORS: true,
            });
      
            const imgData = canvas.toDataURL("image/png");
      
            if (pageCount > 0) pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, 0, 794, 1122);
      
            pageCount++;
          }
      
          const date = new Date();
          const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getFullYear()}`;
          const home = savedGame?.homeTeamName || "Home";
          const opponent = savedGame?.opponentName || "Opponent";
          const fileName = `${home} VS ${opponent} (${formattedDate}).pdf`;
      
          pdf.save(fileName);
        }, 100);
      };
      
      
      
      
      


    //? DEBUG LOGS/TESTING
    console.log(savedGame);

  return (
    
<main  
// ref={exportRef}  
 className="bg-primary-bg w-full h-auto py- px-4">

<div id="page1" className="export-page mx-auto bg-dark-700 p-4  h-screen w-full  bg-primary-bg  mx-auto" >
<div   class="h-[18vh]  b space-x-2 flex flex-row rounded-md col-span-12    text-white  ">
    <div className='   flex space-x-2 flex-row items-center justify-center h-full w-[25%]'>
    <button    className="bg-secondary-bg h-full w-1/2 text-center hover:bg-primary-cta transition-all px-3 py-2 rounded-md flex items-center gap-2 text-sm font-semibold" 
    onClick={homeClickHandler}>
    <FontAwesomeIcon icon={faHome} className="text-xl mx-auto text-gray-400" />

    </button>
    <button className="bg-secondary-bg h-full w-1/2 text-center hover:bg-primary-cta transition-all px-3 py-2 rounded-md flex items-center gap-2 text-sm font-semibold">
    <FontAwesomeIcon icon={faSliders} className="text-xl mx-auto text-gray-400" />


    </button>
    </div>
    <div ref={exportRefs.scoreboard} className=' h-[18vh] px-10  mx-auto   w-[50%]'>

    <GameStatsScoreboard
  homeTeamName={homeTeamName}
  opponentName={opponentName}
  gameActions={savedGame.actions} 
  opponentLogo={opponentLogo}
  teamImage={teamImage}
  score={score}
/>
    </div>


    <div className='  h-full flex space-x-2 flex-row items-center justify-center w-[25%]'>
    <button  onClick={handleDownload} className="
    bg-secondary-bg
    
    h-full  w-1/2 text-center  transition-all px-3 py-2 rounded-md flex items-center gap-2 text-sm font-semibold">
 <FontAwesomeIcon icon={faDownload} className="text-xl mx-auto text-gray-400" />


    </button>
    <button className="bg-secondary-bg h-full w-1/2 text-center hover:bg-primary-cta transition-all px-3 py-2 rounded-md flex items-center gap-2 text-sm font-semibold">
    <FontAwesomeIcon icon={faShareNodes} className="text-xl mx-auto text-gray-400" />

    </button>
    </div>
  
    
     </div>


<div className=" w-full h-[45vh]">

<div ref={exportRefs.playerStatsTable}class="h-[45vh]  px-20 items-center justify-center  my-auto  rounded-md col-span-12   text-white  flex">
  <PlayerStatsTable
  gameActions={savedGame.actions || []} 
  playerMinutes={savedGame.playerMinutes || {}}
/>


     </div>
</div>


<div className=" w-full h-[35vh]">
<div ref={exportRefs.playerTable}  class="h-[35vh] px-20  rounded-md col-span-12   text-white ">
  <GameStats gameActions={savedGame?.actions || []} />


  </div>
</div>

</div>

<div id="page2"
className="page2 w-full container mx-auto  min-h-screen"
style={{
  backgroundColor: "#0f172a", // hardcoded to override Tailwind if needed
  color: "white",
}}
>
<div ref={exportRefs.leadChanges}  className="col-span-12   h-[20vh]   items-center justify-center  ">
<LeadChangeTimeline
  leadChanges={leadChanges}
  selectedQuarter={selectedQuarter}
  setSelectedQuarter={setSelectedQuarter}
  teamImage={teamImage}
  opponentLogo={opponentLogo}
  opponentName={opponentName}
  teamScore={score?.home}
  opponentScore={score?.away}
/>


</div>
<div ref={exportRefs.scoringSplit}  class="  rounded-md col-span-12 h-[30vh]   b  text-white ">
  <ScoringQuarterSplit gameActions={savedGame.actions || []} />



  </div>

  <div ref={exportRefs.scoringSplit}  class="  rounded-md col-span-12 h-[30vh]   b  text-white ">
  <ScoringQuarterSplit gameActions={savedGame.actions || []} />



  </div>

</div>

 <div id="page-3" className=" h-auto bg-blue-500  w-full container px-4 mx-auto">
<div class="grid  h-auto min-h-screen    py-3  gap-4">





</div>




<div className="h-auto grid ">

<div ref={exportRefs.shotMap}
className="col-span-12  w-full  min-h-screen  py-12"> 
<CourtShotMapAll   gameActions={savedGame.actions || []} />
 </div>
</div>

</div> 

{/* MODALS */}
{showExportModal && (
  <ExportStatsOptionsModal
    onClose={() => setShowExportModal(false)}
    onExport={exportStats}
  />
)}



</main>
  );
}
