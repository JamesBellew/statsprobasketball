import React from "react";
import { Menu } from "@headlessui/react";

const FilterDiv = ({
  currentQuater,
  currentGameActionFilters,
  currentGameActionFilter,
  gameActions,
  filteredActions,
  passedLineout,
  handleFilterSelection,
  setCurrentGameActionFilter,
}) => {
  return (
    <Menu as="div" className="relative inline-block mt-1 text-left md:w-[15%] w-full h-full">
      <Menu.Button
        className={`w-full h-full bg-secondary-bg hover:bg-white/10 rounded-lg flex items-center justify-center text-sm
          ${currentGameActionFilters.length >= 1 ? "bg-primary-bg text-primary-cta rounded-none" : "text-white"}
        `}
      >
        {
          currentGameActionFilters.length === 1 ? currentGameActionFilters :
          currentGameActionFilters.length === 2 ? "Filters" :
          "Filter"
        }
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right bg-primary-bg divide-y divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999]">
        <div className="px-1 py-1">
          {currentGameActionFilter && (
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleFilterSelection('Current Q')}
                  className={`${active ? 'bg-gray-700 text-white' : 'text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                >
                  Current Q
                </button>
              )}
            </Menu.Item>
          )}

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => handleFilterSelection('All Game')}
                className={`${active ? 'bg-gray-700 text-white' : 'text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
              >
                All Game
              </button>
            )}
          </Menu.Item>

          {/* Action Submenu */}
          <Menu.Item>
            {({ active }) => (
              <div
                className={`relative group flex rounded-md items-center w-full px-2 py-2 text-sm ${active ? "bg-gray-700 text-white" : "text-gray-200"}`}
              >
                <span className="flex-1">Action</span>
                <svg className={`w-4 h-4 ml-auto ${filteredActions.includes(currentGameActionFilter) ? "text-primary-cta" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>

                <div className="hidden group-hover:block absolute left-full top-0 w-48 bg-secondary-bg border border-gray-700 rounded-md shadow-lg z-50">
                  {gameActions.length === 0 ? (
                    <div className="px-3 py-2 text-gray-400">No actions recorded</div>
                  ) : (
                    filteredActions
                      .filter(action => gameActions.some(g => g.actionName === action))
                      .map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFilterSelection(action)}
                          className={`block w-full text-left px-3 py-2 hover:bg-gray-700 hover:text-white text-gray-200
                            ${action === currentGameActionFilter ? "text-primary-cta border-r-2 border-r-primary-cta" : ""}
                          `}
                        >
                          {action}
                        </button>
                      ))
                  )}
                </div>
              </div>
            )}
          </Menu.Item>

          {/* Player Submenu */}
          <Menu.Item>
            {({ active }) => (
              <div
                className={`relative group flex rounded-md items-center w-full px-2 py-2 text-sm ${active ? "bg-gray-700 text-white" : "text-gray-200"}`}
              >
                <span className="flex-1">Player</span>
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>

                <div className="hidden group-hover:block absolute left-full top-0 w-48 bg-secondary-bg border border-gray-700 rounded-md shadow-lg z-50">
                  {passedLineout?.players?.filter(player =>
                    gameActions.some(action => action.playerName === player.name)
                  ).length > 0 ? (
                    passedLineout.players
                      .filter(player => gameActions.some(action => action.playerName === player.name))
                      .map((player, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFilterSelection(player.name)}
                          className={`block w-full text-left px-3 py-2 hover:bg-gray-700 hover:text-white text-gray-200
                            ${player.name === currentGameActionFilter ? "text-primary-cta border-r-2 border-r-primary-cta" : ""}
                          `}
                        >
                          {player.name} ({player.number})
                        </button>
                      ))
                  ) : (
                    <div className="px-3 py-2 text-gray-400">No players found</div>
                  )}
                </div>
              </div>
            )}
          </Menu.Item>

          {/* Clear Filter */}
          {currentGameActionFilter && (
            <Menu.Item>
              {({ active }) => (
                <div
                  onClick={() => setCurrentGameActionFilter(null)}
                  className="relative group mt-1 flex rounded-md items-center w-full px-2 py-2 text-sm bg-secondary-bg hover:bg-primary-cta hover:text-primary-bg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 mr-2 text-primary-cta group-hover:text-primary-bg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
                  </svg>
                  <span className="flex-1 text-primary-cta group-hover:text-primary-bg">{currentGameActionFilter}</span>
                  <div className="text-center justify-center items-center text-primary-cta flex group-hover:text-primary-bg">X</div>
                </div>
              )}
            </Menu.Item>
          )}
        </div>
      </Menu.Items>
    </Menu>
  );
};

export default FilterDiv;
