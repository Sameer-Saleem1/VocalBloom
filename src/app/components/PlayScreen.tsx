"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PlayScreen() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#fdecc9] to-[#fde5cf] text-gray-900">
      {/* Greeting */}
      <div className="absolute top-8 left-8 text-3xl font-bold">Hi, Brian</div>

      {/* Score */}
      <div className="absolute top-8 right-8 flex items-center space-x-2 text-3xl font-bold">
        <span>15</span>
        <span>⭐</span>
      </div>

      {/* Animated Buttons */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-4">
          {/* Left arrow (animated) */}
          <motion.div
            animate={{ x: [-5, 0, -5] }} // Moves left & right
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-2xl"
          >
            ▶
          </motion.div>

          {/* Play Button */}
          <button
            onClick={() => router.push("/levels")}
            className="flex items-center space-x-2 px-6 py-3 bg-[#e5b59d] rounded-lg border-3 border-gray-900 shadow-lg text-2xl font-semibold hover:scale-102  transition-transform duration-[200ms] ease cursor-pointer"
          >
            <svg
              className="w-7 h-7 stroke-gray-900"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5l10 7-10 7V5z"></path>
            </svg>
            <span>PLAY</span>
          </button>

          {/* Right arrow (animated) */}
          <motion.div
            animate={{ x: [5, 0, 5] }} // Moves right & left
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-2xl"
          >
            ◀
          </motion.div>
        </div>
        <p className="text-lg text-gray-800">Click the button to start</p>
      </div>
    </div>
  );
}
