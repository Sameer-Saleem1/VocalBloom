"use client";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import { jsPDF } from "jspdf";

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
      tasks?: {
        [taskId: string]: {
          word: string;
          attempts: { accuracy: number }[];
          mastered: boolean;
        };
      };
    };
  };
}
type ReportTask = {
  word: string;
  attempts: number;
  accuracyHistory: number[];
  mastered: boolean;
};

type ReportSection = {
  level: Level;
  tasks: ReportTask[];
};

export default function PlayScreen() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [reportData, setReportData] = useState<ReportSection[]>([]);
  const router = useRouter();
  console.log(reportData);
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
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dashboardVisible &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setDashboardVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dashboardVisible]);

  console.log(setReportData);
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
    setUser(null);
  };

  const levels: Level[] = [
    "beginnerLevel",
    "intermediateLevel",
    "proficientLevel",
    "expertLevel",
  ];

  const levelRequirements: {
    [key in Level]?: {
      prevLevel: Level;
      requiredCount: number;
    };
  } = {
    intermediateLevel: {
      prevLevel: "beginnerLevel",
      requiredCount: 20,
    },
    proficientLevel: {
      prevLevel: "intermediateLevel",
      requiredCount: 15,
    },
    expertLevel: {
      prevLevel: "proficientLevel",
      requiredCount: 10,
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#fdecc9] to-[#fde5cf] text-gray-900">
      {/* Greeting */}
      <div className="absolute top-8 left-8 text-3xl font-bold">
        Hi, {user ? user.Name : ""}
      </div>

      {/* Score & Menu */}
      <div className="absolute top-8 right-8 flex items-center space-x-4 text-xl font-bold">
        <div className="relative">
          <button
            onClick={() => setDashboardVisible((prev) => !prev)}
            className="text-xl font-bold text-center cursor-pointer"
          >
            <MenuIcon fontSize="large" />
          </button>

          {dashboardVisible && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-65 bg-white shadow-lg rounded-lg z-10 border border-none p-2"
            >
              <button
                onClick={() => {
                  router.push("./dashboard");
                }}
                className=" cursor-pointer font-bold text-xl w-full border-3 border-black bg-[#f3c5a8] rounded-lg px-3 py-1 mt-2 mb-3 shadow-lg hover:bg-orange-300 transition duration-300"
              >
                View Profile
              </button>
              {levels.map((level) => {
                const levelData = user?.progress?.[level];
                let isUnlocked = false;

                if (level === "beginnerLevel") {
                  isUnlocked = true;
                } else {
                  const requirement = levelRequirements[level];
                  if (requirement) {
                    const prevLevelData =
                      user?.progress?.[requirement.prevLevel];
                    const prevCorrectCount = prevLevelData?.correctCount ?? 0;
                    if (prevCorrectCount >= requirement.requiredCount) {
                      isUnlocked = true;
                    }
                  }
                }

                return (
                  <>
                    {" "}
                    <div
                      key={level}
                      className={`flex flex-col mb-3 p-2 rounded-lg ${
                        isUnlocked
                          ? "bg-orange-200 text-black-800"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <span className="capitalize">
                        {level.replace("Level", "")} Level
                      </span>
                      <span className="text-sm tracking-wide">
                        {isUnlocked
                          ? `${levelData?.correctCount ?? 0} tasks completed`
                          : "Locked"}
                      </span>
                    </div>
                  </>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="text-2xl bg-[#f3c5a8] rounded-2xl px-4 py-2 border-3 border-gray-900 cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Animated Buttons */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-4">
          {/* Left arrow (animated) */}
          <motion.div
            animate={{ x: [-5, 0, -5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-2xl"
          >
            ▶
          </motion.div>

          {/* Play Button */}
          <button
            onClick={() => router.push("/levels")}
            className="flex items-center space-x-2 px-6 py-2 bg-[#f3c5a8] rounded-2xl border-3 border-gray-900 shadow-lg text-2xl font-semibold hover:scale-102 transition-transform duration-200 ease cursor-pointer"
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
            animate={{ x: [5, 0, 5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-2xl"
          >
            ◀
          </motion.div>
        </div>
        <p className="text-lg text-gray-800">Click the button to start</p>
      </div>
      {showLogoutModal && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md border border-white/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#f3c5a8] border-3 border-gray-900 rounded-xl shadow-xl p-6 w-[90%] max-w-md text-center space-y-4">
            <h2 className="text-xl font-bold">Confirm Logout</h2>
            <p className="text-gray-700">Are you sure you want to logout?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 cursor-pointer"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
