import React from "react";
//  import { ResponsivePie, ResponsiveBar } from "@nivo/pie";
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
 import LineChartScoringQuarter from "../../Components/Charts/LineChartScoringQuarter";

const GameStatsModal = ({
  showGameStatsModal,
  setShowGameStatsModal,
  setShowEditOpponentScoreModal,
  teamScore,
  opponentScore,
  teamName,
  teamImage,
  ravensLogo,
  opponentName,
  opponentLogo,
  opponentJerseyDefault,
  currentQuater,
  quarterScores,
  fgPercentage,
  fgMade,
  fgAttempts,
  threePtPercentage,
  threePtMade,
  threePtAttempts,
  ftPercentage,
  ftMade,
  ftAttempts,
  blocks,
  asists,
  offRebounds,
  rebounds,
  currentRun,
  runPoints,
  opponentPoints,
  runStartScore,
  leadChanges,
  selectedQuarter,
  setSelectedQuarter,
  availableQuarters,
  filteredLeadChanges,
  latestLeadChange,
  pieData,
  steals,
  turnovers,
  fgPercentages,
  stealsTurnoversData,
  customTheme,
  gameLineChartData,
  homeTeamName
}) => {
  if (!showGameStatsModal) return null;

  return (
    <div
    className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
    onClick={() => setShowGameStatsModal(false)} // Clicking outside closes the modal
  >
    
    {/* Modal Content */}
    <div
      className="relative bg-primary-bg items-end right-0 p-4 rounded-lg w-full max-w-4xl mx-4 my-8 overflow-auto max-h-full"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
              <button
          onClick={() => setShowGameStatsModal(false)}
          className="text-white absolute right-5 top-2 bg-primary-danger  px-2 py-2 rounded"
        >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>


        </button>
      <div className="w-auto   h-auto py-5 flex  ">
    {/* Score Section */}
    <div
  onClick={() => setShowEditOpponentScoreModal(!showEditOpponentScoreModal)}
  className="flex flex-col space-y-2 pe-10 border-r-2 border-r-secondary-bg w-2/5 mr-10 "
>
  {/* Team Score Row */}
  <div className="flex items-center w-full">
    <img className="w-10 h-10 rounded-full mr-2" src={teamImage || ravensLogo} alt="Ravens" />
    
    <span className={`${teamScore > opponentScore ? "text-white" :"text-gray-400"} text-lg font-semibold flex-1`}>{teamName}</span>
    <span className={`${teamScore > opponentScore ? "text-white" :"text-gray-400"} text-lg font-bold`}>{teamScore}</span>
  </div>

  {/* Opponent Score Row */}
  <div className="flex items-center w-full">
    {/* <img className="w-10 h-10 rounded-full mr-2" src={opponentJerseyDefault} alt={opponentName} /> */}
    <img 
  className="w-10 h-10 rounded-full mr-2"
  src={opponentLogo || opponentJerseyDefault} 
  alt={opponentName} 
/>

    <span className={`${teamScore < opponentScore ? "text-white" :"text-gray-400"} text-lg font-semibold flex-1`}>{opponentName}</span>
    <span className={`${teamScore < opponentScore ? "text-white" :"text-gray-400"} text-lg font-bold`}>{opponentScore}</span>
  </div>
</div>

  
  <div className="flex flex-col  w-2/5  ">


  <div class="relative overflow-x-auto ">
  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
  <thead className="text-xs uppercase border-b-4 border-b-secondary-bg">
    <tr>
      {/* Render Q1-Q4 */}
      {[1, 2, 3, 4].map((q) => (
        <th
          key={q}
          className={`px-6 py-3 ${q === 1 ? "rounded-s-lg" : ""} 
          ${q === 4 && currentQuater <= 4 ? "rounded-e-lg" : ""} 
          ${q === currentQuater ? "text-white" : "text-gray-400"}`}
        >
          Q{q}
        </th>
      ))}

      {/* Render OT dynamically if currentQuater > 4 */}
      {currentQuater > 4 &&
        [...Array(currentQuater - 4)].map((_, index) => {
          const otNumber = index + 1;
          return (
            <th
              key={`OT${otNumber}`}
              className={`px-6 py-3 ${currentQuater === otNumber + 4 ? "text-white" : "text-gray-400"} 
              ${otNumber + 4 === currentQuater ? "rounded-e-lg" : ""}`}
            >
              OT{otNumber}
            </th>
          );
        })}
    </tr>
  </thead>
  <tbody>
    <tr className="bg-primary-bg">
      {/* Render Q1-Q4 scores */}
      {[1, 2, 3, 4].map((q) => (
        <td
          key={q}
          className={`px-6 py-4 ${q === currentQuater ? "text-white" : "text-gray-400"}`}
        >
          {quarterScores[q] > 0 ? quarterScores[q] : currentQuater >= q ? "0" : "-"}
        </td>
      ))}

      {/* Render OT scores dynamically */}
      {currentQuater > 4 &&
        [...Array(currentQuater - 4)].map((_, index) => {
          const otNumber = index + 5; // OT starts from Q5 (1st OT)
          return (
            <td
              key={`OT${otNumber}`}
              className={`px-6 py-4 ${currentQuater === otNumber ? "text-white" : "text-gray-400"}`}
            >
              {quarterScores[otNumber] > 0 ? quarterScores[otNumber] : "0"}
            </td>
          );
        })}
    </tr>
  </tbody>
</table>






</div>

  </div>
  
</div>

      <div className=" bg-red-600 flex justify-center">
  <div className="flex items-center justify-start w-screen overflow-x-auto scrollbar-hide bg-primary-bg py-3">
    <div className="flex space-x-3 px-2 w-max">

      {/* FG */}
      <div className={`flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]  
space-y-2`}>

        {/* Icon Badge */}
        <div className={`flex items-center justify-center p-3 rounded-full
          ${fgPercentage === 0
            ? "bg-gray-700"
            : fgPercentage >= 25
              ? "bg-primary-cta"
              : "bg-primary-danger"}`}>
          <span className="text-white text-sm font-bold">FG</span>
        </div>

        {/* Stat */}
        <span className={`text-2xl font-bold 
       text-gray-200`}>
          {fgPercentage}%
        </span>

        {/* Label */}
        <span className="text-sm text-gray-400">{fgMade}-{fgAttempts}</span>
      </div>

      {/* 3PT */}
      <div className={`flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]  space-y-2`}>

        <div className={`flex items-center justify-center p-2 py-3 rounded-full
          ${threePtPercentage === 0
            ? "bg-gray-700"
            : threePtPercentage >= 25
              ? "bg-primary-cta"
              : "bg-primary-danger"}`}>
          <span className="text-white text-sm font-bold">3PT</span>
        </div>

        <span className={`text-2xl font-bold 
        text-gray-200`}>
          {threePtPercentage}%
        </span>

        <span className="text-sm text-gray-400">{threePtMade}-{threePtAttempts}</span>
      </div>

   
     {/* Runs */}
     {currentRun && (
  <div className="flex flex-col items-center text-white w-full space-y-2 bg-[#1e222a9b] p-4 min-w-[240px]">
    {/* Header */}
    <div className="text-md uppercase tracking-wide text-gray-200">Current Run</div>

    {/* Run Score */}
    <div className="text-3xl font-extrabold flex flex-row text-white items-center">
  {/* Left Logo (Ravens) */}
  {currentRun.team === "home" && (
    // <img
    //   src={ravensLogo}
    //   alt="Ravens Logo"
    //   className="w-10 h-10 rounded-full border-2 border-primary-cta shadow mr-3"
    // />
    <img   className="w-10 h-10 rounded-full border-2 border-primary-cta shadow mr-3"     alt="HomeLogo"  src={teamImage || ravensLogo} />
  )}

  {/* Run Score */}
  <span>{runPoints}</span>
<span className="mx-1 text-gray-400">–</span>
<span className="text-gray-400">{opponentPoints ?? ''}</span>



  {/* Right Logo (Opponent) */}
  {currentRun.team === "away" && (
    <img
      src={opponentLogo || opponentJerseyDefault}
      alt="Opponent Logo"
      className="w-10 h-10 rounded-full border-2 border-secondary-cta shadow ml-3"
    />
  )}
</div>


    {/* Subtext */}
    {runStartScore && (
  <div className="flex items-center space-x-2 text-sm text-gray-400">
    {/* Start Score */}
    <span className="bg-gray-700 rounded-full px-2 py-0.5">
      {runStartScore.teamScore}–{runStartScore.opponentScore}
    </span>

    {/* Arrow */}
    <span className="text-lg">→</span>

    {/* Current Score */}
    <span className="bg-gray-700 rounded-full px-2 py-0.5">
      {teamScore}–{opponentScore}
    </span>
  </div>
)}



    {/* Progress Bar */}

  </div>
)}

   {/* FT */}
   <div className={`flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]  space-y-2`}>

<div className={`flex items-center justify-center p-2 rounded-full
  ${ftPercentage === 0
    ? "bg-gray-700"
    : ftPercentage >= 25
      ? "bg-primary-cta"
      : "bg-primary-danger"}`}>
  <span className="text-white text-sm font-bold">FT</span>
</div>

<span className={`text-2xl font-bold 
  text-gray-200`}>
  {ftPercentage}%
</span>

<span className="text-sm text-gray-400">{ftMade}-{ftAttempts}</span>
</div>



      {/* Blocks */}
      <div className="flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px] 
       space-y-2">

        <div className="flex items-center justify-center p-2 rounded-full bg-primary-cta">
          <span className="text-white text-sm font-bold">BLK</span>
        </div>

        <span className="text-2xl text-gray-200 font-bold">{blocks}</span>
        {/* <span className="text-sm text-gray-400">{blocks}</span> */}
      </div>

      {/* Dummy Cards — Similar style, static colors */}
      <div className="flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]  space-y-2">
        <div className="flex items-center justify-center p-2 rounded-full bg-primary-cta">
          <span className="text-white text-sm font-bold">AST</span>
        </div>
        <span className="text-2xl text-gray-200 font-bold">{asists}</span>
        {/* <span className="text-sm text-gray-400">10</span> */}
      </div>

      <div className="flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]   space-y-2">
        <div className="flex items-center justify-center p-2 rounded-full bg-primary-danger">
          <span className="text-white text-sm font-bold">ORB</span>
        </div>
        <span className="text-2xl text-gray-200 font-bold">{offRebounds}</span>
        {/* <span className="text-sm text-gray-400">5</span> */}
      </div>

      <div className="flex flex-col items-center justify-center bg-[#1e222a9b] shadow-lg rounded-lg p-4 min-w-[120px]  space-y-2">
        <div className="flex items-center justify-center p-2 rounded-full bg-primary-cta">
          <span className="text-white text-sm font-bold">RB</span>
        </div>
        <span className="text-2xl text-gray-200 text- font-bold">{rebounds}</span>
        {/* <span className="text-sm text-gray-400">8</span> */}
      </div>

    </div>
  </div>
</div>





<div className=" w-full    h-auto my-4">
  <h1 className="text-md font-semibold text-center mt-2 mb-4 text-white font-semibold ">Lead Changes   <span className="px-3">-</span> 
 {/* renderign the lea changes into the label for space savings ❤️ */}
<span className="text-gray-300 ">
  
        {(() => {
          // Check if Ravens are currently leading
          if (teamScore > opponentScore) {
            // Find when they LAST took the lead
            const lastLeadChange = leadChanges
            .slice()
            .reverse()
            .find((lead) => lead.team === "Ravens");
          
          if (lastLeadChange) {
            return (
              <span className="text-primary-cta">
                Lead since Q{lastLeadChange.q} ({lastLeadChange.score})
              </span>
            );
          }
          

            return <span className="text-primary-cta">Currently Leading</span>;
          }

          // Find the last time Ravens had the lead
          const lastRavensLead = leadChanges
          .slice()
          .reverse()
          .find((lead, index, arr) => {
            // Find the last instance where Ravens were in the lead *before* they lost it
            const nextLead = arr[index - 1]; // The lead change right after it
            return lead.team === "Ravens" && nextLead && nextLead.team !== "Ravens";
          });
        
        if (lastRavensLead) {
          return (
            <span className="text-gray-300">
              Last lead Q{lastRavensLead.q} ({lastRavensLead.score})
            </span>
          );
        }
        
          // If they never led
          return <span className="text-primary-danger">Never in Lead</span>;
        })()}
      </span>

  
  </h1>
  {/* timeline for lead changes will go here  */}
  <div className="w-full  h-auto ">
      {/* 🔹 Quarter Navigation */}
      <div className="flex space-x-2 mb-4 ">
  {/* Always show "All" button */}
  <button
    onClick={() => setSelectedQuarter("All")}
    className={`px-4 py-2 rounded ${
      selectedQuarter === "All" ? "bg-white/10 text-white" : "bg-secondary-bg text-gray-400"
    }`}
  >
    All
  </button>

  {/* Only show quarters that have data */}
  {availableQuarters.map((q) => (
    <button
  key={q}
  onClick={() => setSelectedQuarter(q)}
  className={`px-4 py-2 rounded ${
    selectedQuarter === q ? "bg-white/10 text-white" : "bg-secondary-bg text-gray-400"
  }`}
>
  {q > 4 ? `OT${q - 4}` : `Q${q}`}
</button>

  ))}
</div>

<div className=" h-28 flex flex-row ">
  <div className="h-28 flex flex-col w-1/12 ">
  <div className={`w-14 px-2 flex items-center justify-center h-1/2 bg-white/10 rounded-full
   ${teamScore>opponentScore ? "border-2 border-primary-cta" : ""} `}>
  {/* <img className="w-10  mx-auto h-10 rounded-full " src={ravensLogo} alt={opponentName} /> */}
  <img   className="w-10 h-10 rounded-full "      alt="HomeLogo"  src={teamImage || ravensLogo} />
  </div>
  <div className={`w-14 flex  items-center justify-center h-1/2 bg-white/10 rounded-full mt-2
    
    ${teamScore<opponentScore ? "border-2 border-[#10B981]" : ""}`}>
  {/* <img className="w-10  mx-auto h-10 rounded-full " src={opponentJerseyDefault} alt={opponentName} /> */}
  <img 
  className="w-10 h-10 mx-auto rounded-full "
  src={opponentLogo || opponentJerseyDefault} 
  alt={opponentName} 
/>

  </div>
  </div>
  <ul className="timeline flex overflow-x-auto w-11/12 space-x-2 relative">
  {filteredLeadChanges.map((lead, index) => {
    const isLatest = lead === latestLeadChange; // Now correctly highlighting the first (left-most) lead

    return (
      <li key={index} className="flex-shrink-0 relative flex flex-col items-center">
        {/* Top Score Box (Ravens lead) */}
        {lead.team === "Ravens" && (
          <div className={`timeline-start timeline-box border-none ${isLatest ? "bg-[#0b63fb] text-white" : "bg-secondary-bg text-gray-300"}`}>
            {lead.score}
          </div>
        )}

        {/* Icon + Connecting Line */}
  {/* Icon + Connecting Line */}
<div className={`timeline-middle relative bg-secondary-bg  p-2 rounded-full border-none flex items-center ${lead.team === 'Ravens' ? "text-primary-cta" : "text-gray-400"}`}>
  {(() => {
    // Extract the scores from the lead.score string (assuming format like "6-5")
    const scoreParts = lead.score.split('-');
    const homeScore = parseInt(scoreParts[0], 10);
    const awayScore = parseInt(scoreParts[1], 10);
    const isTied = homeScore === awayScore;
    
    if (lead.team === "Ravens") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    } else if (isTied) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-secondary-cta">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
        </svg>
      );
    }
  })()}
  {/* ✅ Horizontal Line (only if there's another lead change after this one) */}
  {index !== filteredLeadChanges.length - 1 && (
    <div className="absolute top-1/2 left-full w-14 h-1 bg-secondary-bg"></div>
  )}
</div>

        {/* Bottom Score Box (Opponent lead) */}
        {lead.team !== "Ravens" && (
          <div className={`timeline-end border-none timeline-box ${isLatest ? "bg-red-600 text-white" : 
          "bg-secondary-bg text-gray-300"}`}>
            {lead.score}
          </div>
        )}
      </li>
    );
  })}
</ul>




</div>
    </div>
    {/* strart */}
    <LineChartScoringQuarter
  gameLineChartData={gameLineChartData}
  customTheme={customTheme}
  homeTeamName={homeTeamName}
/>


  {/* end */}
  <div className="w-full mt-10 flex flex-row">
  <div className=" rounded-md  w-1/2" style={{ height: "200px" }}>
  <h4 style={{ textAlign: 'center', color: '#fff', marginBottom: '10px' }}>Scoring Split</h4>
      <ResponsivePie
        data={pieData}
        margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors={({ data }) => data.color}
        borderWidth={2}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        enableArcLabels={true}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#FFFFFF"
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'FG Percentage',
          legendPosition: 'middle',
          legendOffset: 40,
        }}
        theme={customTheme}
      />
      
    </div>
    
    <div className="w-1/2 ">

    <ResponsiveBar
  data={[{ category: "Possessions", steals: steals, turnovers: turnovers }]} // Example data
  keys={["steals", "turnovers"]}
  indexBy="category"
  layout="horizontal" // ✅ Horizontal bar
  margin={{ top: 20, right: 20, bottom: 50, left: 20 }} // Extra space for legend
  padding={0.5}
  colors={["#0b63fb", "#10B981"]} // ✅ Yellow (steals) & Blue (turnovers)
  axisLeft={null} // ✅ No left axis labels
  axisBottom={null} // ✅ No bottom axis labels
  enableGridX={false} // ✅ No gridlines
  borderRadius={5} // ✅ Rounded corners
  labelSkipWidth={10} // ✅ Only show label if bar is wide enough
  labelSkipHeight={10}
  labelTextColor="black" // ✅ Numbers inside bars
  theme={{
    axis: { ticks: { text: { fill: "#fff" } } }
  }}
  legends={[
    {
      data: [
        { id: "steals", label: "Steals", color: "#0b63fb" },
        { id: "turnovers", label: "Turnovers", color: "#10B981" }
      ],
      anchor: "top",
      direction: "row",

      justify: false,
      translateY: 10, // ✅ Space below for legend
      itemsSpacing: 10,
      itemWidth: 80,
      itemHeight: 20,
      itemDirection: "left-to-right",
      symbolSize: 15,
      symbolShape: "square",
      itemTextColor: "#fff"
    }
  ]}
/>


    </div>

    </div>
    <div className="w-full h-48 flex flex-row">
      <div className="w-1/2 h-full">
      <ResponsiveBar
     
  data={fgPercentages}
  keys={['percentage']}
  indexBy="quarter"
  margin={{ top: 20, right: 50, bottom: 50, left: 60 }}
  padding={0.3}
  colors="#0b63fb"
  theme={customTheme}
  valueScale={{ type: 'linear' }}
  indexScale={{ type: 'band', round: true }}
  axisTop={null}
  axisRight={null}
  legends={[
    {
      anchor: "top", // 🔥 Position it at the top
      direction: "row",
      justify: false,
      translateY: -20, // Move it up/down if needed
      itemsSpacing: 10,
      itemWidth: 100,
      itemHeight: 18,
      itemTextColor: "#fff", // Customize text color
      symbolSize: 18,
      symbolShape: "circle",
    }
  ]}
  axisLeft={null} // ✅ Remove Y-axis numbers
  enableGridX={false} // ✅ Remove grid lines
  enableGridY={false}
  labelSkipWidth={12}
  labelSkipHeight={12}
  labelTextColor="#ffffff"
  label={({ value }) => `${value}%`} // ✅ Adds % to inside bar labels
  animate={true}
  motionConfig="wobbly"
/>

    </div>
    <div className="w-1/2 h-full">
    <ResponsiveBar
  data={stealsTurnoversData}
  keys={['steals', 'turnovers']}
  indexBy="quarter"
  margin={{ top: 20, right: 50, bottom: 50, left: 50 }}
  padding={0.3}
  layout="vertical"
  valueScale={{ type: 'linear' }}
  indexScale={{ type: 'band', round: true }}
  colors={({ id }) => (id === 'steals' ? '#0b63fb' : '#10B981')} // Green & Red split
  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
  theme={customTheme} // Using your theme
  labelTextColor="#fff"
  axisTop={null}
  axisRight={null}
  axisLeft={null} // Remove numbers
  axisBottom={{
    tickSize: 5,
    tickPadding: 5,
    tickRotation: 0,
    legend: '',
    legendPosition: 'middle',
    legendOffset: 40,
  }}
  enableGridX={false}
  enableGridY={false}
  labelSkipWidth={12}
  labelSkipHeight={12}
  label={({ value }) => `${value}`} // Show values
  legends={[
    {
      anchor: 'top',
      direction: 'row',
      translateY: -20,
      itemsSpacing: 10,
      itemWidth: 80,
      itemHeight: 20,
      itemTextColor: '#fff',
      symbolSize: 18,
      symbolShape: 'circle',
      data: [
        { id: 'steals', label: 'Steals', color: '#0b63fb' },
        { id: 'turnovers', label: 'Turnovers', color: '#10B981' },
      ],
    },
  ]}
/>
    </div>
    </div>
</div>
    
    </div>
  </div>
  );
};

export default GameStatsModal;
