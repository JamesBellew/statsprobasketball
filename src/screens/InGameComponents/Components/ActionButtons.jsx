import React from "react";

const ActionButtons = ({
  savedGame,
  actions,
  passedLineout,
  currentQuater,
  setPendingAction,
  setShowPlayerModal,
  setGameActions,
  setAlertMessage,
  setActionSelected,
  actionSelected,
  isMobile
}) => {
  if (savedGame?.isComplete) {
    return (
      <div className="w-full flex items-center justify-center h-2/4 bg-secondary-bg rounded-md">
        <p>Stats Here</p>
      </div>
    );
  }

  return (
    <div
      className={
        
        isMobile
          ? "grid grid-cols-3 gap-3 w-full my-2 px-1 mb-[15vh]"
          : "grid grid-cols-6 h-2/4 w-full my-auto  gap-1 lg:grid-cols-6 mx-auto xl:grid-cols-6"
      }
    >
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => {
            if (["FT Score", "FT Miss", "Assist", "Steal", "Block", "T/O", "Rebound", "OffRebound"].includes(action.id)) {
              if (passedLineout) {
                setPendingAction((prevAction) =>
                  prevAction?.actionName === action.id
                    ? null
                    : {
                        actionName: action.id,
                        quarter: currentQuater,
                        x: null,
                        y: null,
                        timestamp: Date.now(),
                      }
                );
                setShowPlayerModal(true);
              } else {
                setGameActions((prevActions) => [
                  ...prevActions,
                  {
                    quarter: currentQuater,
                    actionName: action.id,
                    x: null,
                    y: null,
                    timestamp: Date.now(),
                    team: "home",
                  },
                ]);
                setAlertMessage(`${action.name} recorded!`);
                setTimeout(() => setAlertMessage(""), 3000);
              }
              return;
            } else {
              setActionSelected((prevAction) =>
                prevAction === action.id ? null : action.id
              );
            }
          }}
          className={`${
            actionSelected === action.id ? "bg-primary-cta text-white" : "bg-secondary-bg"
          } font-semibold rounded-lg shadow hover:bg-primary-cta transition transform hover:scale-105 focus:ring-4 focus:ring-secondary-bg
          ${action.category === "plus" ? "text-white" : "text-gray-200"}
          flex items-center justify-center
          ${isMobile ? "py-6 text-2xl" : "py-2 px-4"}
          `}
        >
          {action.displayIcon}
          <span className="ml-1 font-bold text-2xl text-white">{action.name}</span>
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
