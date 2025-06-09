import React, { useState, useEffect } from "react";
// import { getDocs, collection } from "firebase/firestore";
// import { db } from "../firebase"; // your Firestore setup

const TeamFilter = ({ onFilterChange }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    // 🔁 Replace this with Firestore fetch
    const fetchTeams = async () => {
      // const snapshot = await getDocs(collection(db, "teams"));
      // const teamList = snapshot.docs.map(doc => doc.data().teamName);
      const teamList = ["Ravens", "Dynamites", "Falcons", "Wolves"]; // 🔁 dummy
      setTeams(teamList);
    };

    fetchTeams();
  }, []);

  const handleSelect = (e) => {
    const value = e.target.value;
    setSelectedTeam(value);
    onFilterChange(value);
  };

  const clearFilter = () => {
    setSelectedTeam(null);
    onFilterChange(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      {/* Dropdown */}
      <select
        value={selectedTeam || ""}
        onChange={handleSelect}
        className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
      >
        <option value="">Select a team</option>
        {teams.map((team, index) => (
          <option key={index} value={team}>
            {team}
          </option>
        ))}
      </select>

      {/* Active Filter Chip */}
      {selectedTeam && (
        <div className="flex items-center bg-blue-600 text-white rounded-full px-4 py-1 w-fit text-sm">
          <span>{selectedTeam}</span>
          <button
            onClick={clearFilter}
            className="ml-2 text-white hover:text-gray-200 focus:outline-none"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamFilter;
