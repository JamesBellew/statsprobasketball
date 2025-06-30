// components/QuarterDiv.jsx
import { AnimatePresence, motion } from "framer-motion";

const QuarterDiv = ({ currentQuater }) => {
  return (
    <div className="md:w-[15%] w-full h-full bg-secondary-bg mt-1 flex items-center rounded-md overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentQuater}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute w-full text-center"
        >
          {currentQuater > 4 ? `OT ${currentQuater - 4}` : `Q${currentQuater}`}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default QuarterDiv;
