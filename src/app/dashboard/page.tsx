"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";

type Level =
  | "beginnerLevel"
  | "intermediateLevel"
  | "proficientLevel"
  | "expertLevel";

const levels: Level[] = [
  "beginnerLevel",
  "intermediateLevel",
  "proficientLevel",
  "expertLevel",
];

const levelLabels: Record<Level, string> = {
  beginnerLevel: "Beginner",
  intermediateLevel: "Intermediate",
  proficientLevel: "Proficient",
  expertLevel: "Expert",
};

interface PronunciationData {
  attempts: number;
  correct: number;
  similarityHistory: number[];
}

export default function DashboardReport() {
  const [userData, setUserData] = useState<{
    Name: string;
    FatherName: string;
    uid: string;
    childAge: string;
    Email: string;
  } | null>(null);

  const [levelUnlocks, setLevelUnlocks] = useState<Record<Level, boolean>>({
    beginnerLevel: true,
    intermediateLevel: false,
    proficientLevel: false,
    expertLevel: false,
  });
  const [averageAccuracy, setAverageAccuracy] = useState<Record<Level, number>>(
    {
      beginnerLevel: 0,
      intermediateLevel: 0,
      proficientLevel: 0,
      expertLevel: 0,
    }
  );
  const [easyWords, setEasyWords] = useState<Record<string, PronunciationData>>(
    {}
  );
  const [difficultWords, setDifficultWords] = useState<
    Record<string, PronunciationData>
  >({});
  const [date, setDate] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const uid = user.uid;
      const userRef = ref(db, `Authentication/users/${uid}`);
      const userSnap = await get(userRef);
      const userInfo = userSnap.val();
      setUserData({ ...userInfo, uid });

      const unlocks: Record<Level, boolean> = {
        beginnerLevel: true,
        intermediateLevel: false,
        proficientLevel: false,
        expertLevel: false,
      };
      const accuracies: Record<Level, number> = {
        beginnerLevel: 0,
        intermediateLevel: 0,
        proficientLevel: 0,
        expertLevel: 0,
      };

      const easy: Record<string, PronunciationData> = {};
      const hard: Record<string, PronunciationData> = {};

      for (const level of levels) {
        const progressRef = ref(
          db,
          `Authentication/users/${uid}/progress/${level}`
        );
        const progressSnap = await get(progressRef);
        const isUnlocked = progressSnap.exists()
          ? progressSnap.val().isUnlocked
          : level === "beginnerLevel";
        unlocks[level] = isUnlocked;

        const pronunciationRef = ref(
          db,
          `Authentication/users/${uid}/pronunciation/${level}`
        );
        const pronSnap = await get(pronunciationRef);
        if (!pronSnap.exists()) continue;

        const wordsData = pronSnap.val();
        let totalSimilarity = 0;
        let totalCount = 0;

        for (const word in wordsData) {
          const data: PronunciationData = wordsData[word];
          const averageSim =
            data.similarityHistory.reduce((a, b) => a + b, 0) /
            data.similarityHistory.length;

          totalSimilarity += averageSim;
          totalCount++;

          if (averageSim >= 0.7 && data.attempts === 1) {
            easy[word] = data;
          } else {
            hard[word] = data;
          }
        }

        accuracies[level] =
          totalCount > 0 ? Math.round((totalSimilarity / totalCount) * 100) : 0;
      }

      setLevelUnlocks(unlocks);
      setAverageAccuracy(accuracies);
      setEasyWords(easy);
      setDifficultWords(hard);
      setDate(new Date().toLocaleDateString());
    };

    loadData();
  }, []);

  return (
    <div className="bg-[#f3c5a8] p-6 pl-10 space-y-8">
      <div className=" items-center">
        <button
          onClick={() => router.push("./")}
          className=" bg-[#f3c5a8] rounded-2xl border-3 text-lg border-gray-900 shadow-lg m-2 p-1 font-bold cursor-pointer tracking-[.05rem] hover:bg-orange-300 transition-colors duration-300"
        >
          Back to Home
        </button>
        <div className="flex justify-center">
          <h1 className="text-3xl font-extrabold ">User Details</h1>
        </div>
      </div>

      {userData && (
        <div className="space-y-1 text-gray-900 text-xl ">
          <p className="mb-3">
            <strong>Child Name:</strong> {userData.Name}
          </p>
          <p className="mb-3">
            <strong>Guardian Name:</strong> {userData.FatherName}
          </p>
          <p className="mb-3">
            <strong>Child Age:</strong> {userData.childAge}
          </p>
          <p className="mb-3">
            <strong>Email ID:</strong> {userData.Email}
          </p>
          <p className="mb-3">
            <strong>Date of Report:</strong> {date}
          </p>
        </div>
      )}

      <div>
        <div className="flex justify-center">
          <h1 className="text-3xl font-extrabold">User Progress</h1>
        </div>
        <h2 className="text-xl font-semibold mt-6">Levels</h2>
        <ul className="list-disc ml-6 mt-2">
          {levels.map((level) => (
            <li key={level} className="ml-4 mb-3">
              {levelLabels[level]} —{" "}
              {levelUnlocks[level] ? "✅ Unlocked" : "🔒 Locked"}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6">Average Accuracy</h2>
        <ul className="list-disc ml-6 mt-2">
          {levels.map((level) => (
            <li key={level} className="ml-4 mb-3">
              {levelLabels[level]}: {averageAccuracy[level] ?? 0}%
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-5"> Easily Pronounced</h2>
        {Object.keys(easyWords).length === 0 ? (
          <p className="text-gray-600 ml-4">No easy words recorded yet.</p>
        ) : (
          <ul className="list-disc ml-6 mt-2 ">
            {Object.entries(easyWords).map(([word, data]) => (
              <li key={word} className="ml-4 mb-3">
                <strong>{word}</strong> — Attempts: {data.attempts}
                <strong>,</strong> Accuracy <strong>:</strong>{" "}
                {data.similarityHistory
                  .map((sim) => `${(sim * 100).toFixed(2)}%`)
                  .join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-5">
          Difficulty Pronunciation
        </h2>
        {Object.keys(difficultWords).length === 0 ? (
          <p className="text-gray-600 ml-4">No difficult words found.</p>
        ) : (
          <ul className="list-disc ml-6 mt-2">
            {Object.entries(difficultWords).map(([word, data]) => (
              <li key={word} className="ml-4 mb-3">
                <strong>{word}</strong> — Attempts: {data.attempts}{" "}
                <strong>,</strong> Accuracy <strong>:</strong>{" "}
                {data.similarityHistory
                  .map((sim) => `${(sim * 100).toFixed(2)}%`)
                  .join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
