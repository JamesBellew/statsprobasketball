import React, { useState, useCallback } from "react";

const DropdownButton = ({ label, showDropdown, toggleDropdown, children }) => (
  <div className="relative z-50 h-full">
    <button
      onClick={toggleDropdown}
      className="bg-secondary-bg hover:bg-primary-danger shadow-md h-full px-4 rounded-md flex items-center space-x-1 transition-colors"
    >
      <span className="text-lg font-bold">{label}</span>
      {showDropdown ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      )}
    </button>
    {showDropdown && (
      <div className="absolute top-full left-0 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-[100] min-w-[60px]" role="menu">
        {children}
      </div>
    )}
  </div>
);

const OpponentActionButtons = ({ 
  showFiltersPlayerStat, 
  savedGame, 
  updateOpponentScore,
  updateOpponentAction
}) => {
  if (!showFiltersPlayerStat) return null;
  
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);
  const [showMinusDropdown, setShowMinusDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  }, []);

  const handleUpdateOpponentScore = useCallback((points) => {
    try {
      updateOpponentScore(points);
      showToast(`${points}Pt recorded 🏀`);
    } catch (error) {
      console.error('Error updating opponent score:', error);
      showToast('Failed to update score. Please try again.');
    }
    setShowPlusDropdown(false);
  }, [updateOpponentScore, showToast]);

  const handleUpdateOpponentAction = useCallback((action) => {
    try {
      updateOpponentAction(action);
      showToast(`${action} recorded 🏀`);
    } catch (error) {
      console.error('Error updating opponent action:', error);
      showToast('Failed to update action. Please try again.');
    }
    setShowMinusDropdown(false);
  }, [updateOpponentAction, showToast]);

  const togglePlusDropdown = useCallback(() => {
    setShowPlusDropdown(!showPlusDropdown);
    setShowMinusDropdown(false);
  }, [showPlusDropdown]);

  const toggleMinusDropdown = useCallback(() => {
    setShowMinusDropdown(!showMinusDropdown);
    setShowPlusDropdown(false);
  }, [showMinusDropdown]);

  return (
    <>
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-primary text-white px-6 py-3 rounded-lg shadow-lg">
            {toast.message}
          </div>
        </div>
      )}
      {!savedGame?.isComplete ? (
        <div className="w-full md:w-[40%] bg-primary-bg mt-2 md:mt-0 max-w-4xl mx-auto h-full text-white relative z-50">
          {/* Action buttons container: grid on mobile, flex on md+ */}
          <div className="relative grid grid-cols-5 gap-2 w-full md:flex md:flex-nowrap md:items-center md:space-x-2 h-full">
            <DropdownButton label="+" showDropdown={showPlusDropdown} toggleDropdown={togglePlusDropdown}>
              {[1, 2, 3].map((points) => (
                <button 
                  key={points}
                  onClick={() => handleUpdateOpponentScore(points)}
                  className="w-full py-3 md:py-1 text-left bg-secondary-bg hover:bg-primary-danger transition-colors"
                  role="menuitem"
                >
                  +{points}
                </button>
              ))}
            </DropdownButton>

            <DropdownButton label="-" showDropdown={showMinusDropdown} toggleDropdown={toggleMinusDropdown}>
              {[
                { points: 1, action: 'FT Miss' },
                { points: 2, action: '2PT Miss' },
                { points: 3, action: '3PT Miss' },
              ].map(({ points, action }) => (
                <button 
                  key={points}
                  onClick={() => handleUpdateOpponentAction(action)}
                  className="w-full py-3 md:py-1 text-left bg-secondary-bg hover:bg-primary-danger transition-colors"
                  role="menuitem"
                >
                  -{points}
                </button>
              ))}
            </DropdownButton>

            {/* Other action buttons */}
            {['turnover', 'steal', 'block'].map((action) => (
              <button
                key={action}
                onClick={() => handleUpdateOpponentAction(action)}
                className="bg-secondary-bg hover:bg-primary-danger shadow-md h-full py-3 md:py-1 rounded-md transition-colors w-full"
              >
                {action === 'turnover' ? 'T/O' : action}
              </button>
            ))}
          </div>
        
          {/* Click outside to close dropdowns */}
          {(showPlusDropdown || showMinusDropdown) && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => {
                setShowPlusDropdown(false);
                setShowMinusDropdown(false);
              }}
            />
          )}
        </div>
      ) : (
        <div className="w-full md:w-[45%] h-full bg-secondary-bg flex items-center justify-center mt-2 md:mt-0">
          <p className="text-gray-400">Game completed. Statistics will be available soon.</p>
        </div>
      )}
    </>
  );
};

export default OpponentActionButtons;