import React from "react";

const Court = ({
  savedGame,
  handleCourtClick,
  actionSelected,
  showPlayerModal,
  setShowPlayerModal,
  setPendingAction,
  passedLineout,
  onCourtPlayers,
  handlePlayerSelection,
  pendingAction,
  gameActions,
  currentGameActionFilters,
  currentQuater,
}) => {
  return (
    <div
      onClick={!savedGame.isComplete ? handleCourtClick : undefined}
      className={`
        relative z-50 mx-auto h-[55vh] w-full 
        max-w-[600px] sm:max-w-[640px] md:max-w-[768px] 
        ${actionSelected && ["3 Points", "3Pt Miss"].includes(actionSelected)
          ? "bg-white/10"
          : "bg-secondary-bg"
        }
      `}
    >
      {/* Player Modal */}
      {showPlayerModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => {
            setShowPlayerModal(false);
            setPendingAction(null);
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div
            className="relative p-6 rounded-lg w-1/2 bg-secondary-bg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-lg mb-4">Select Player</h3>
            {passedLineout?.players?.length > 0 ? (
              (() => {
                const sortedPlayers = [...passedLineout.players].sort((a, b) => {
                  const aOn = onCourtPlayers.includes(a.number);
                  const bOn = onCourtPlayers.includes(b.number);
                  return aOn === bOn ? 0 : aOn ? -1 : 1;
                });
                const onFloorPlayers = sortedPlayers.slice(0, 5);
                const benchPlayers = sortedPlayers.slice(5);

                return (
                  <div className="flex flex-col space-y-2">
                    <p className="text-gray-400 text-sm mb-1">On Floor</p>
                    <div className="grid grid-cols-2 gap-2">
                      {onFloorPlayers.map((player, index) => (
                        <button
                          key={index}
                          onClick={() => handlePlayerSelection(player)}
                          className={`w-full text-left p-2 rounded group transition-all bg-white/10 hover:bg-primary-cta text-white border-l-2 ${
                            onCourtPlayers.includes(player.number)
                              ? 'border-l-primary-cta'
                              : 'border-l-gray-400'
                          }`}
                        >
                          <span className={`${
                            onCourtPlayers.includes(player.number) ? 'text-white' : 'text-gray-400'
                          } group-hover:text-black`}>
                            ({player.number}){" "}
                          </span>
                          {player.name}
                        </button>
                      ))}
                    </div>
                    <hr className="border-gray-600 my-2" />
                    <p className="text-gray-400 text-sm mb-1">Bench</p>
                    <div className="grid grid-cols-2 gap-2">
                      {benchPlayers.map((player, index) => (
                        <button
                          key={index}
                          onClick={() => handlePlayerSelection(player)}
                          className={`w-full text-left p-2 rounded group transition-all bg-white/10 hover:bg-primary-cta text-white border-l-2 ${
                            onCourtPlayers.includes(player.number)
                              ? 'border-l-primary-cta'
                              : 'border-l-gray-400'
                          }`}
                        >
                          <span className={`${
                            onCourtPlayers.includes(player.number) ? 'text-white' : 'text-gray-400'
                          } group-hover:text-black`}>
                            ({player.number}){" "}
                          </span>
                          {player.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-gray-400">No players available.</p>
            )}
            <button
              onClick={() => {
                setShowPlayerModal(false);
                setPendingAction(null);
              }}
              className="mt-4 w-full p-2 bg-primary-danger/50 hover:bg-primary-danger text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Court Graphics */}
      <div className={`absolute w-[90%] h-[90%] rounded-b-full left-[6%] relative box-border z-auto ${
        actionSelected && ["2 Points", "2Pt Miss"].includes(actionSelected)
          ? "bg-white/10"
          : "bg-secondary-bg"
      } border-gray-500 border-2`}>

        {/* Key Areas */}
        <div className="absolute sm:w-1/3 w-1/3 left-1/3 sm:left-1/3 border-2 border-gray-500 h-[65%]"></div>
        <div className="absolute sm:w-1/4 sm:left-[37.5%] w-1/3 left-2/4 border-2 border-gray-500 h-[17.5%] top-[47.5%] rounded-b-full border-dashed rotate-180"></div>
        <div className="absolute sm:w-1/4 sm:left-[37.5%] border-2 border-gray-500 h-[17.5%] top-[65%] rounded-b-full"></div>
        <div className="absolute w-[15%] left-[42.5%] rounded-t-full h-16 border-t-2 border-t-gray-500 top-[12%] rotate-180"></div>
      </div>

      {/* Pending Action Dot */}
      {pendingAction && (
        <div
          className="absolute w-4 h-4 rounded-full bg-blue-500 opacity-75"
          style={{
            top: `${pendingAction.y}%`,
            left: `${pendingAction.x}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Render Game Action Dots */}
      {gameActions
        .filter((action) => {
          if (currentGameActionFilters.length === 0) return action.quarter === currentQuater;

          const allGameSelected = currentGameActionFilters.includes("All Game");
          const playerFilters = currentGameActionFilters.filter((f) => !["All Game", "2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(f));
          const actionFilters = currentGameActionFilters.filter((f) => ["2 Points", "3 Points", "2Pt Miss", "3Pt Miss"].includes(f));

          return (
            (allGameSelected || action.quarter === currentQuater) &&
            (playerFilters.length === 0 || playerFilters.includes(action.playerName)) &&
            (actionFilters.length === 0 || actionFilters.includes(action.actionName))
          );
        })
        .map((action, index) =>
          typeof action.x === "number" && typeof action.y === "number" ? (
            <div
              key={index}
              className={`absolute w-4 h-4 rounded-full ${
                ["2Pt Miss", "3Pt Miss"].includes(action.actionName)
                  ? "bg-secondary-danger"
                  : "bg-primary-cta"
              }`}
              style={{
                top: `${action.y}%`,
                left: `${action.x}%`,
                transform: "translate(-50%, -50%)",
              }}
              title={`Action: ${action.actionName} | Quarter: ${action.quarter}`}
            ></div>
          ) : null
        )}
    </div>
  );
};

export default Court;
