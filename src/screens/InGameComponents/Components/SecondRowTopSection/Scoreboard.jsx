import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Scoreboard = ({
  opponentName,
  opponentLogo,
  opponentScore,
  opponentScoreChange,
  opponentJerseyDefault,
  teamScore,
  teamScoreChange,
  teamImage,
  teamName,
  ravensLogo
}) => {
  return (
    <motion.div className="w-full  md:w-[50%] px-2 md:px-7 mb-2 py-4 md:mb-0 h-full text-center flex items-center rounded-lg bg-secondary-bg md:mt-0 mt-2" >
      <p className="text-center text-nd capitalize mx-auto flex flex-wrap md:flex-nowrap items-center justify-center w-full">
        {/* Opponent Team */}
        <img 
          className="w-8 h-8 rounded-full mr-2"
          src={opponentLogo || opponentJerseyDefault} 
          alt={opponentName} 
        />
        <span className="relative">
          <span className={`text-md font-semibold ${opponentScoreChange > 0 ? "text-white" : "text-gray-400"}`}>
            {opponentName}
          </span>
          <AnimatePresence>
            {opponentScoreChange > 0 && (
              <motion.span
                className="absolute -top-4 left-full text-gray-200 font-bold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                +{opponentScoreChange}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className={`ml-2 text-md font-semibold ${opponentScoreChange > 0 ? "text-primary-cta font-bold" : "text-gray-400"}`}>
          {opponentScore}
        </span>
        <span className="mx-2">-</span>
        {/* Team Score */}
        <span className={`text-md relative font-bold ${teamScoreChange > 0 ? "text-green-400" : "text-gray-400"}`}>
          {teamScore}
          <AnimatePresence>
            {teamScoreChange > 0 && (
              <motion.span
                className="absolute -top-4 left-full text-green-400 font-bold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                +{teamScoreChange}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {/* Team Logo */}
        <img 
          className="w-8 h-8 rounded-full ml-2"
          src={teamImage || ravensLogo}
          alt="HomeLogo" 
        />
        {/* Team Name */}
        <span className={`ml-2 font-semibold ${teamScoreChange > 0 ? "text-white" : "text-gray-400"}`}>
          {teamName}
        </span>
      </p>
    </motion.div>
  );
};

export default Scoreboard;
