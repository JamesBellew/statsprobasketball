import React from 'react';

const LineoutSection = ({
  localLineouts,
  cloudLineouts,
  selectedLineoutId,
  setSelectedLineoutId,
  openLineoutModal,
  openEditModal,
  handleDeleteLineout,
  user,
  displayedLineout,
  activeDropdown,
  setActiveDropdown,
  dropdownRef,
}) => {
  return (
    <div className="bg-secondary-bg p-8 col-span-2 sm:col-span-2 rounded-lg mt-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-lg font-bold">Lineout</p>

        <div className="flex items-center space-x-4">
          {(localLineouts.length > 0 || cloudLineouts.length > 0) && (
            <select
              value={selectedLineoutId || ""}
              onChange={(e) => setSelectedLineoutId(e.target.value)}
              className="ml-4 p-2 rounded bg-white/10 text-white"
            >
              <optgroup label="Local Lineouts">
                {localLineouts.map((lineout) => (
                  <option key={`local-${lineout.id}`} value={`local-${lineout.id}`}>
                    {lineout.name}
                  </option>
                ))}
              </optgroup>

              {user && cloudLineouts.length > 0 && (
                <optgroup label="Cloud Lineouts">
                  {cloudLineouts.map((lineout) => (
                    <option key={`cloud-${lineout.id}`} value={`cloud-${lineout.id}`}>
                      {lineout.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          )}

          <button
            onClick={openLineoutModal}
            className="btn btn-primary px-5 py-2 bg-primary-cta rounded-md"
          >
            Create
          </button>
        </div>
      </div>

      {displayedLineout ? (
        <div className="bg-secondary-bg shadow-lg border-l-4 border-l-primary-cta p-3 rounded flex justify-between items-center mt-3">
          <div className="w-full">
            <p className="font-medium">{displayedLineout.name}</p>
            <div className="mt-2">
              {displayedLineout.players.map((player, index) => (
                <p
                  key={index}
                  className="text-xs py-2 border-b border-dotted border-white/10 text-gray-200"
                >
                  <span className="text-gray-400">({player.number})</span> {player.name}
                </p>
              ))}
            </div>
          </div>

          {/* Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() =>
                setActiveDropdown(
                  activeDropdown === displayedLineout.id ? null : displayedLineout.id
                )
              }
              className="p-2 hover:bg-gray-600 rounded"
            >
              ⋮
            </button>
            {activeDropdown === displayedLineout.id && (
              <div className="absolute right-0 mt-2 w-28 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                <button
                  onClick={() => openEditModal(displayedLineout)}
                  className="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteLineout(displayedLineout.id)}
                  className="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs w-44 text-gray-400">No Lineouts Saved</p>
      )}
    </div>
  );
};

export default LineoutSection;
