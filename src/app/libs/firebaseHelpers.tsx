// ✅ Step 1: Modify firebaseHelpers.ts to include level unlocking logic

import { auth, db } from "../firebase/config";
import { ref, get, set, update, push } from "firebase/database";

export const updateProgress = async (
  level:
    | "beginnerLevel"
    | "intermediateLevel"
    | "proficientLevel"
    | "expertLevel",
  newWord: string,
  score: number
) => {
  const user = auth.currentUser;
  if (!user) return;
  const baseRef = `Authentication/users/${user.uid}/progress/${level}`;

  // 🔹 Step 1: Record the attempt
  const attemptRef = ref(db, `${baseRef}/attempts/${newWord}`);
  const attemptData = {
    score,
    timestamp: new Date().toISOString(),
  };
  await push(attemptRef, attemptData);

  if (score < 65) return;

  const progressRef = ref(
    db,
    `Authentication/users/${user.uid}/progress/${level}`
  );

  const snapshot = await get(progressRef);
  let correctWords: string[] = [];

  if (snapshot.exists()) {
    correctWords = snapshot.val().correctWords || [];
  }

  if (!correctWords.includes(newWord)) {
    correctWords.push(newWord);
  }

  const correctCount = correctWords.length;

  await update(progressRef, {
    correctWords,
    correctCount,
    isUnlocked: true,
  });

  const thresholds: Record<string, number> = {
    beginnerLevel: 100,
    intermediateLevel: 50,
    proficientLevel: 25,
  };

  const nextLevelMap: Record<
    string,
    "intermediateLevel" | "proficientLevel" | "expertLevel"
  > = {
    beginnerLevel: "intermediateLevel",
    intermediateLevel: "proficientLevel",
    proficientLevel: "expertLevel",
  };

  if (level in thresholds && correctCount >= thresholds[level]) {
    const nextLevel = nextLevelMap[level as keyof typeof nextLevelMap];
    if (nextLevel) {
      const nextLevelRef = ref(
        db,
        `Authentication/users/${user.uid}/progress/${nextLevel}`
      );
      await update(nextLevelRef, { isUnlocked: true });
    }
  }
};

export const fetchProgress = async (
  level:
    | "beginnerLevel"
    | "intermediateLevel"
    | "proficientLevel"
    | "expertLevel"
) => {
  const user = auth.currentUser;
  if (!user)
    return {
      correctWords: [],
      correctCount: 0,
      isUnlocked: level === "beginnerLevel",
    };

  const progressRef = ref(
    db,
    `Authentication/users/${user.uid}/progress/${level}`
  );
  const snapshot = await get(progressRef);

  if (snapshot.exists()) {
    const val = snapshot.val();
    return {
      correctWords: val.correctWords || [],
      correctCount: val.correctCount || 0,
      isUnlocked: val.isUnlocked ?? level === "beginnerLevel",
    };
  }

  // Beginner level is unlocked by default
  return {
    correctWords: [],
    correctCount: 0,
    isUnlocked: level === "beginnerLevel",
  };
};
