import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper: Star polygon points
const STAR_POINTS = "16,3 20,12 30,12 22,18 25,28 16,22 7,28 10,18 2,12 12,12";

// Sparkle data for burst (angle in degrees, distance from center)
const SPARKLES = [
  { angle: 10,   dist: 21, color: "#FFD700" },
  { angle: 50,   dist: 18, color: "#FFD700" },
  { angle: 90,   dist: 21, color: "#fffbe8" },
  { angle: 130,  dist: 18, color: "#FFC006" },
  { angle: 170,  dist: 21, color: "#fffbe8" },
  { angle: 210,  dist: 18, color: "#FFD700" },
  { angle: 250,  dist: 21, color: "#FFC006" },
  { angle: 290,  dist: 18, color: "#FFD700" },
  { angle: 330,  dist: 21, color: "#fffbe8" },
];

function getSparkleXY(angle, distance, cx = 16, cy = 16) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: cx + distance * Math.cos(rad),
    y: cy + distance * Math.sin(rad),
  };
}

const Burst = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.g
        key="burst"
        initial={{ opacity: 1, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Burst ring */}
        <motion.circle
          cx={16}
          cy={16}
          r={15}
          stroke="#FFC006"
          strokeWidth={1.6}
          fill="none"
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 1.1, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
        {/* Sparkles */}
        {SPARKLES.map((sp, i) => {
          const { x, y } = getSparkleXY(sp.angle, sp.dist);
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={2.3}
              fill={sp.color}
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 + i * 0.04, ease: "easeOut" }}
            />
          );
        })}
      </motion.g>
    )}
  </AnimatePresence>
);

const StarIcon = ({ filled = false, ...props }) => {
  // The burst only shows when filled turns true
  const [showBurst, setShowBurst] = React.useState(false);
  const prevFilled = React.useRef(false);

  React.useEffect(() => {
    if (filled && !prevFilled.current) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 450); // Hide after burst
    }
    prevFilled.current = filled;
  }, [filled]);

  return (
    <motion.svg
      viewBox="0 0 32 32"
      width={32}
      height={32}
      fill={filled ? "#FFC006" : "none"}
      stroke={filled ? "#FFC006" : "#888"}
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{
        filter: filled ? "drop-shadow(0 0 7px #ffc006bb)" : "none",
        transition: "filter 0.25s",
        display: "block"
      }}
      {...props}
    >
      {/* Burst effect under the star */}
      <Burst show={showBurst} />
      {/* The actual star */}
      <polygon
        points={STAR_POINTS}
        className="star-icon"
      />
    </motion.svg>
  );
};

export default StarIcon;
