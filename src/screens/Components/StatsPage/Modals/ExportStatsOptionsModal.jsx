import React, { useState } from "react";

export default function ExportStatsOptionsModal({ onClose, onExport }) {
  const [options, setOptions] = useState({
    scoreboard: true,
    playerTable: true,
    playerStatsTable: true,
    scoringSplit:true,
    leadChanges:true,
    shotMap: true,
    // rebounds: true,
  });
  // playerTable: useRef(),
  // gameStats: useRef(),
  // scoringTable: useRef(),
  // playerStatsTable: useRef(),
  // shotChart: useRef(),
  // leadChanges: useRef(),
  const handleToggle = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportClick = () => {
    const disabledSections = Object.keys(options).filter((key) => !options[key]);
    onExport(disabledSections, selectedFormat); // 🔥 pass format
    onClose();
  };
  
  const [selectedFormat, setSelectedFormat] = useState("pdf");


  return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div className="bg-secondary-bg p-6 rounded-lg shadow-lg w-11/12 md:w-1/2">
    <h2 className="text-2xl font-bold text-white text-center my-5 mb-10">Export Options</h2>

    <ul className="space-y-4 mb-6">
      {Object.entries(options).map(([key, value]) => (
        <li key={key} className="flex justify-between items-center">
          <span className="text-white capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
          </span>

          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={() => handleToggle(key)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </li>
      ))}
    </ul>

    {/* 🔽 Export Format Selector */}
    <div className="mb-6">
      <label className="block text-white font-medium mb-2">Export Format</label>
      <select
        value={selectedFormat}
        onChange={(e) => setSelectedFormat(e.target.value)}
        className="w-full bg-dark-800 border border-gray-600 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-cta"
      >
        <option value="pdf">PDF</option>
        <option value="image">Image (PNG)</option>
      </select>
    </div>

    <div className="flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
      >
        Cancel
      </button>
      <button
        onClick={handleExportClick}
        className="px-4 py-2 bg-primary-cta hover:bg-indigo-600 rounded text-white"
      >
        Export
      </button>
    </div>
  </div>
</div>

  );
}
