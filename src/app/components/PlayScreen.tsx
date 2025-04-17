"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CancelIcon from "@mui/icons-material/Cancel";

type Level =
  | "beginnerLevel"
  | "intermediateLevel"
  | "expertLevel"
  | "proficientLevel";

interface User {
  Name: string;
  FatherName: string;
  Email: string;
  childAge: string;
  UserID: string;
  progress?: {
    [key in Level]?: {
      correctCount: number;
    };
  };
}

export default function PlayScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const router = useRouter();

  const handleDashboard = () => {
    setDashboardVisible(!dashboardVisible);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        const userRef = ref(db, `Authentication/users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUser(snapshot.val());
        }
      }
    });

    return () => unsubscribe();
  }, []);
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
    setUser(null);
  };
  const levels: Level[] = [
    "beginnerLevel",
    "intermediateLevel",
    "expertLevel",
    "proficientLevel",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#fdecc9] to-[#fde5cf] text-gray-900">
      {/* Greeting */}
      <div className="absolute top-8 left-8 text-3xl font-bold">
        Hi,{" "}
        {user ? (
          <>
            {user.Name}
            <div className="mt-20">
              <div className="  bg-white rounded-xl shadow-lg p-3 ">
                <button
                  onClick={() => {
                    setDashboardVisible(true);
                  }}
                  className="text-xl font-bold mb-2 text-center cursor-pointer"
                >
                  Click to view Dashboard
                </button>
                {dashboardVisible && (
                  <span
                    className="ml-30 cursor-pointer "
                    onClick={() => {
                      setDashboardVisible(false);
                    }}
                  >
                    <CancelIcon />
                  </span>
                )}
                {dashboardVisible &&
                  levels.map((level) => {
                    const levelData = user?.progress?.[level];
                    const isUnlocked = levelData !== undefined;

                    return (
                      <div
                        key={level}
                        className={`flex text-lg mb-4 justify-between p-3 border rounded-lg ${
                          isUnlocked
                            ? "bg-green-100 border-green-400"
                            : "bg-gray-200 border-gray-300 text-gray-500"
                        }`}
                      >
                        <span className=" capitalize pr-5">
                          {level.replace("Level", "")} Level
                        </span>
                        {isUnlocked ? (
                          <span>
                            {levelData?.correctCount ?? 0} tasks completed
                          </span>
                        ) : (
                          <span>Locked</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        ) : (
          " "
        )}
      </div>
      {/* Score */}
      <div className="absolute top-8 right-8 flex items-center space-x-2 text-xl font-bold">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-2 rounded cursor-pointer"
        >
          Logout
        </button>
        {/* <span>15</span>
        <span>⭐</span> */}
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
      </div>{" "}
    </div>
  );
}
