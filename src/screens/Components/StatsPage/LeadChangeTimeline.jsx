import { useState, useEffect } from "react";
import opponentJerseyDefault from '../../../assets/jersey.webp';
export default function LeadChangeTimeline({
  leadChanges = [],
  teamImage,
  opponentLogo,
  opponentName,
  teamScore,
  opponentScore,
}) {
  const [selectedQuarter, setSelectedQuarter] = useState("All");

  const availableQuarters = [...new Set(leadChanges.map((lead) => lead.q))].sort((a, b) => a - b);

  const filteredLeadChanges =
    selectedQuarter === "All"
      ? leadChanges.slice().reverse()
      : leadChanges.slice().reverse().filter((lead) => lead.q === parseInt(String(selectedQuarter).replace("Q", "")));

  const latestLeadChange = filteredLeadChanges.find((lead) => lead.team === "Ravens");

  return (
    <div className="w-full  my-auto justify-center h-full p-4 rounded-md  border-gray-200   ">
      {/* <h1 className="mb-4 text-2xl font-semibold tracking-tight text-center text-white">Lead Changes</h1> */}
      <div className="flex  space-x-2 mb-4">
        <button
          onClick={() => setSelectedQuarter("All")}
          className={`px-4 py-2 rounded ${
            selectedQuarter === "All" ? "bg-white/10 text-white" : "bg-secondary-bg text-gray-400"
          }`}
        >
          All
        </button>
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

      <div className="h-28 flex flex-row">
        <div className="h-28 flex flex-col w-1/12">
          <div
            className={`w-14 px-2 flex items-center justify-center h-1/2 bg-white/10 rounded-full ${
              teamScore > opponentScore ? "border-2 border-primary-cta" : ""
            }`}
          >
            <img className="w-10 h-10 rounded-full" alt="HomeLogo" src={teamImage} />
          </div>
          <div
            className={`w-14 flex items-center justify-center h-1/2 bg-white/10 rounded-full mt-2 ${
              teamScore < opponentScore ? "border-2 border-[#10B981]" : ""
            }`}
          >
            <img className="w-10 h-10 mx-auto rounded-full" src={opponentLogo || opponentJerseyDefault} alt={opponentName} />
          </div>
        </div>

        <ul className="timeline flex overflow-x-auto w-11/12 space-x-2 relative">
          {filteredLeadChanges.map((lead, index) => {
            const isLatest = lead === latestLeadChange;
            const [homeScore, awayScore] = lead.score.split("-").map(Number);
            const isTied = homeScore === awayScore;

            return (
              <li key={index} className="flex-shrink-0 relative flex flex-col items-center">
                {lead.team === "Ravens" && (
                  <div className={`timeline-start timeline-box border-none ${isLatest ? "bg-[#0b63fb] text-white" : "bg-secondary-bg text-gray-300"}`}>
                    {lead.score}
                  </div>
                )}
                <div className={`timeline-middle relative bg-secondary-bg p-2 rounded-full flex items-center ${lead.team === "Ravens" ? "text-primary-cta" : "text-gray-400"}`}>
                  {lead.team === "Ravens" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  ) : isTied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 text-secondary-cta">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                    </svg>
                  )}
                  {index !== filteredLeadChanges.length - 1 && (
                    <div className="absolute top-1/2 left-full w-14 h-1 bg-secondary-bg"></div>
                  )}
                </div>

                {lead.team !== "Ravens" && (
                  <div className={`timeline-end timeline-box border-none ${isLatest ? "bg-red-600 text-white" : "bg-secondary-bg text-gray-300"}`}>
                    {lead.score}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
