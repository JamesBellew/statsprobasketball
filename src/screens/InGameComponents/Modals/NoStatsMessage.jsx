import React, { useState } from "react";

export default function NoStatsMessage() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-3">

      {/* Message + Expand button as a vertical stack */}
      <div className="flex flex-col items-center gap-2">

        {/* Pill */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-primary-green/10 border border-primary-green/20 rounded-full">
          <svg
            className="w-4 h-4 text-primary-green"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>

          <span className="text-sm font-medium text-primary-green">
            No stats for this game 😔
          </span>
        </div>

        {/* Expand button under pill */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 
          border border-white/10 rounded-full transition-colors"
        >
          <span className="text-xs font-medium text-gray-300">More info</span>

          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Expandable section */}
      <div
        className={`grid transition-all duration-300 ease-in-out text-center ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2 max-w-xs text-center">
            <p className="text-lg text-white font-medium">😔</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Stats weren't tracked for this game. 
            </p>

            {/* <ul className="text-sm text-gray-400 space-y-1.5 text-left mx-auto w-fit">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                Finished game — score only recorded
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                Stats were tracked offline/manual
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                Friendly/scrimmage match
              </li>
            </ul> */}

            <p className="text-xs text-gray-500 pt-2 border-t border-white/10">
              Stats may be entered in at a later date if provided/aquired
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
