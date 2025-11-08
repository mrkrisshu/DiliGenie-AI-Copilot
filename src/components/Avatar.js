/**
 * Avatar Component
 * Animated assistant avatar with listen/think/speak states
 */

import { motion } from "framer-motion";

export default function Avatar({ state = "idle" }) {
  // state: 'idle', 'listening', 'thinking', 'speaking'

  const getAnimation = () => {
    switch (state) {
      case "listening":
        return {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
          transition: { duration: 0.8, repeat: Infinity },
        };
      case "thinking":
        return {
          scale: [1, 1.05, 1],
          opacity: [1, 0.8, 1],
          transition: { duration: 1.2, repeat: Infinity },
        };
      case "speaking":
        return {
          scale: [1, 1.08, 1.04, 1],
          transition: { duration: 0.6, repeat: Infinity },
        };
      default:
        return {
          scale: 1,
          rotate: 0,
        };
    }
  };

  const getGlow = () => {
    switch (state) {
      case "listening":
        return "shadow-[0_0_30px_rgba(0,217,255,0.6)]";
      case "thinking":
        return "shadow-[0_0_30px_rgba(255,0,110,0.6)]";
      case "speaking":
        return "shadow-[0_0_30px_rgba(0,153,255,0.6)]";
      default:
        return "shadow-[0_0_20px_rgba(0,217,255,0.4)]";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={getAnimation()}
        className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-jarvis-primary via-jarvis-secondary to-jarvis-accent flex items-center justify-center ${getGlow()}`}
      >
        {/* Inner circle */}
        <div className="w-28 h-28 rounded-full bg-jarvis-darker flex items-center justify-center">
          {/* Avatar icon */}
          <div className="text-5xl">
            {state === "listening" && "👂"}
            {state === "thinking" && "🧠"}
            {state === "speaking" && "💬"}
            {state === "idle" && "🤖"}
          </div>
        </div>

        {/* Pulse rings */}
        {state !== "idle" && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.5, 1.5],
                opacity: [0.5, 0, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute inset-0 rounded-full border-2 border-jarvis-primary"
            />
            <motion.div
              animate={{
                scale: [1, 1.8, 1.8],
                opacity: [0.3, 0, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.4,
              }}
              className="absolute inset-0 rounded-full border-2 border-jarvis-secondary"
            />
          </>
        )}
      </motion.div>

      {/* State label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-semibold text-jarvis-primary uppercase tracking-wider"
      >
        {state}
      </motion.div>

      {/* Visual equalizer for speaking state */}
      {state === "speaking" && (
        <div className="flex gap-1 items-end h-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: ["8px", "24px", "12px", "24px", "8px"],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
              }}
              className="w-1 bg-jarvis-primary rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
