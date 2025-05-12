"use client";
import { useEffect, useState } from "react";
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
  const [user, setUser] = useState<User | null>(null);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [reportData, setReportData] = useState<ReportSection[]>([]);
  const router = useRouter();
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

  console.log(setReportData);
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

  const generatePDFReport = () => {
    if (!user) return;

    const doc = new jsPDF();

    // Child Information
    doc.setFontSize(16);
    doc.text("Child Information", 10, 10);
    doc.setFontSize(12);
    doc.text(`Name: ${user.Name}`, 10, 20);
    doc.text(`User ID: ${user.UserID}`, 10, 30);
    doc.text(`Total Time Spent: 5 hrs 42 mins`, 10, 40); // Placeholder
    doc.text(`Sessions Completed: 18`, 10, 50); // Placeholder

    doc.text("Progress Overview", 10, 70);
    doc.text("Levels Completed:", 10, 90);
    doc.text("Beginner", 20, 100);
    doc.text("Intermediate", 20, 120);
    doc.text("Expert", 20, 130);
    doc.text("Proficient", 20, 140);
    doc.text("Total Tasks Attempted: 65", 10, 150);
    doc.text("Tasks Successfully Completed: 52", 10, 160);
    doc.text("Average Pronunciation Accuracy: 74%", 10, 170);

    // Level-wise details (for beginner level as example)
    const generateLevelReport = (
      level: Level,
      levelTitle: string,
      levelY: number
    ) => {
      doc.text(`${levelTitle}`, 10, levelY);
      const levelData = user.progress?.[level];
      const tasks = levelData?.tasks || {};
      let currentY = levelY + 10;

      // Table headers
      doc.text("Word", 10, currentY);
      doc.text("Attempts", 60, currentY);
      doc.text("First Accuracy", 100, currentY);
      doc.text("Final Accuracy", 140, currentY);
      doc.text("Status", 180, currentY);
      currentY += 10;

      Object.entries(tasks).forEach(
        ([taskId, task]: [
          string,
          {
            word: string;
            attempts: { accuracy: number }[];
            mastered: boolean;
          }
        ]) => {
          console.log(taskId);
          doc.text(task.word, 10, currentY);
          doc.text(task.attempts.length.toString(), 60, currentY);
          doc.text(`${task.attempts[0]?.accuracy || 0}%`, 100, currentY); // First accuracy
          doc.text(
            `${task.attempts[task.attempts.length - 1]?.accuracy || 0}%`,
            140,
            currentY
          ); // Final accuracy
          doc.text(
            task.mastered
              ? "✅ Mastered"
              : task.attempts.length > 1
              ? "⚠️ Improved"
              : "❗Struggling",
            180,
            currentY
          );
          currentY += 10;
        }
      );
    };

    // Beginner Level
    generateLevelReport("beginnerLevel", "✅ Beginner Level", 180);

    // Intermediate Level
    generateLevelReport("intermediateLevel", "🟡 Intermediate Level", 250);

    // Insights from data
    doc.text("📊 Insights From This Data", 10, 320);
    doc.text("Frequently mispronounced sounds: /b/, /tʃ/, /th/", 10, 330);
    doc.text(
      'Words needing more focus: "Dog", "Can I go outside?", "The cat is sleeping"',
      10,
      340
    );
    doc.text("Average attempts per difficult word: 3.4", 10, 350);
    doc.text("Child improves after average 2–3 repetitions", 10, 360);

    // Save the PDF
    doc.save("Speech_Therapy_Report.pdf");
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
            onClick={() => setDashboardVisible(!dashboardVisible)}
            className="text-xl font-bold text-center cursor-pointer"
          >
            <MenuIcon fontSize="large" />
          </button>
          <div className="absolute top-24 left-8 text-xl">
            <button
              onClick={generatePDFReport}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg cursor-pointer"
            >
              Generate Report
            </button>
          </div>

          {dashboardVisible && (
            <div className="absolute right-0 mt-2 w-65 bg-white shadow-lg rounded-lg z-10 border border-none p-2">
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

      {/* Display Report Data */}
      {reportData.length > 0 && (
        <div className="mt-8 p-6 bg-white shadow-md rounded-lg w-[80%]">
          <h2 className="text-2xl font-bold mb-4">Generated Report</h2>
          {reportData.map((section) => (
            <div key={section.level} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                {section.level.replace("Level", "")} Level
              </h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Word</th>
                    <th className="px-4 py-2">Attempts</th>
                    <th className="px-4 py-2">Accuracy History</th>
                    <th className="px-4 py-2">Mastered</th>
                  </tr>
                </thead>
                <tbody>
                  {section.tasks.map((task: ReportTask, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2">{task.word}</td>
                      <td className="px-4 py-2">{task.attempts}</td>
                      <td className="px-4 py-2">
                        {task.accuracyHistory.join(" → ")}
                      </td>
                      <td className="px-4 py-2">
                        {task.mastered ? "✅" : "❌"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

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
