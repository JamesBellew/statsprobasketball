import React from "react";
import QuarterScoreSplitTable from './QuarterScoreSplitTable' 
import ScoringSplitPie from "./ScoringSplitPie";
import QuarterFGBarChart from "./QuarterFGBarChart";
export default function CourtShotMapAll({ gameActions = [] }) {
  return (
    <div className=" h-auto ">
    <div className="w-full   mx-auto ">
      {/* Heading */}
      {/* <h2 className="text-white text-xl font-semibold mb-4 text-center">Shot Map</h2> */}
      <div className="w-full h-auto  mb-10  flex items-center ">
      <QuarterScoreSplitTable gameActions={gameActions || []} />


      </div>
      {/* Legend */}
      {/* <div className="flex  justify-center items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-primary-cta" />
          <span className="text-gray-300 text-sm">Made</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-secondary-danger" />
          <span className="text-gray-300 text-sm">Missed</span>
        </div>
      </div> */}

      {/* Court */}
      <div className="relative max-w-[600px] sm:max-w-[640px] md:max-w-[768px] z-50 mx-auto h-[500px] w-full">

        {/* Court Arc */}
        <div className="absolute w-[90%] h-[90%] rounded-b-full left-[6%] relative box-border border-2 border-gray-500">

          {/* Court Key */}
          <div className="absolute sm:w-1/3 w-1/3 left-1/3 border border-gray-500 h-[65%]" />
          <div className="absolute sm:w-1/3 w-1/3 left-1/3 sm:w-1/4 sm:left-[37.5%] border-2 border-gray-500 h-[17.5%] top-[65%] rounded-b-full" />
          <div className="absolute sm:w-1/4 sm:left-[37.5%] w-1/3 left-2/4 border-2 border-gray-500 h-[17.5%] top-[47.5%] rounded-b-full border-dashed rotate-180" />
          
          {/* Semi-circle Key */}
          <div className="absolute w-[15%] left-[42.5%] rounded-t-full h-16 border-t-2 border-t-gray-500 top-[12%] rotate-180" />

          {/* Render all actions as dots */}
          {gameActions
            .filter((action) => typeof action.x === "number" && typeof action.y === "number")
            .map((action, index) => (
              <div
                key={index}
                className={`absolute w-4 h-4 rounded-full ${
                  ["2Pt Miss", "3Pt Miss"].includes(action.actionName)
                    ? "bg-secondary-danger"
                    : "bg-primary-cta"
                }`}
                style={{
                  // Buffer of 8.5 added (sadface)
                  top: `${action.y + 8.5}%`,
                  left: `${action.x}%`,
                  transform: "translate(-50%, -50%)",
                }}
                title={`Action: ${action.actionName} | Quarter: ${action.quarter}`}
              ></div>
            ))}
        </div>
      </div>
      

      
<div className="grid grid-cols-12 h-auto  ">

<div className="col-span-6 h-full ">
<ScoringSplitPie gameActions={gameActions} />

</div>
<div className="col-span-6 h-full ">
<QuarterFGBarChart gameActions={gameActions} />
</div>

</div>


    </div>
    </div>
  );
}
