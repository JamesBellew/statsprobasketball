import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function HomeScreenCourtSVG() {
  const [markers, setMarkers] = useState([]);
  const [frame, setFrame] = useState(0);

  // Generate 5 markers at a time, rotating through 10 total
  useEffect(() => {
    const interval = setInterval(() => {
      const newMarkers = Array.from({ length: 5 }, () => ({
        x: Math.random() * 400 + 50,
        y: Math.random() * 250 + 30,
        type: Math.random() > 0.5 ? "circle" : "x",
      }));
      setMarkers((prev) => {
        const updated = [...prev.slice(5), ...newMarkers];
        return updated;
      });
      setFrame((f) => f + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative border-t-2   border-t-[#222] w-full h-[40vh] bg-[#12131A] bg-opacity-0 flex justify-center items-start">
      <svg
        viewBox="0 0 500 300"
        className="absolute top-0 w-[80%] h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Court Background */}
        <rect width="100%" height="300" fill="#12131A" opacity="0.6"  rx="20" />

        {/* 3-point Arc */}
        <path d="M25,0 A225,300 0 0,0 475,0" fill="none" stroke="#222" strokeWidth="4" />

        {/* Key */}
        <rect x="175" y="0" width="150" height="180" fill="none" stroke="#222" strokeWidth="4" />

        {/* Free Throw Arc */}
        <path d="M175,180 A75,75 0 0,0 325,180" fill="none" stroke="#222" strokeWidth="4" />

        {/* Animated arrows + motion paths */}
        <motion.path
          d="M150 270 Q250 200 250 120"
          stroke="#222"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M350 270 Q250 200 250 120"
          stroke="#222"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Purple Dots moving along path */}
        <motion.circle
  r="10"
  fill="#8B5CF6"
  animate={{ cx: [150, 250, 150], cy: [270, 120, 270] }}
  transition={{
    duration: 30,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
  }}
/>

<motion.circle
  r="10"
  fill="#8B5CF6"
  animate={{ cx: [350, 250, 350], cy: [270, 120, 270] }}
  transition={{
    duration: 30,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
    delay: 1,
  }}
/>

        {/* Cycling Markers (blue circles & red Xs) */}
        {markers.map((marker, idx) =>
          marker.type === "circle" ? (
            <motion.circle
              key={`circle-${idx}-${frame}`}
              cx={marker.x}
              cy={marker.y}
              r="8"
              stroke="#3B82F6"
              strokeWidth="2"
              fill="none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.2 }}
            />
          ) : (
            <motion.g
              key={`x-${idx}-${frame}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.2 }}
            >
              <line
                x1={marker.x - 5}
                y1={marker.y - 5}
                x2={marker.x + 5}
                y2={marker.y + 5}
                stroke="#ef4444"
                strokeWidth="2"
              />
              <line
                x1={marker.x + 5}
                y1={marker.y - 5}
                x2={marker.x - 5}
                y2={marker.y + 5}
                stroke="#ef4444"
                strokeWidth="2"
              />
            </motion.g>
          )
        )}
      </svg>
    </div>
  );
}
