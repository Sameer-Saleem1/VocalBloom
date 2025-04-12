import { auth, db } from "../firebase/config";
import { ref, get, set } from "firebase/database";

export const updateProgress = async (
  level:
    | "beginnerLevel"
    | "intermediateLevel"
    | "proficientLevel"
    | "expertLevel",
  newWord: string
) => {
  const user = auth.currentUser;
  if (!user) return;

  const progressRef = ref(
    db,
    `Authentication/users/${user.uid}/progress/${level}`
  );

  const snapshot = await get(progressRef);
  let correctWords: string[] = [];

  if (snapshot.exists()) {
    correctWords = snapshot.val().correctWords || [];
  }

  // Avoid duplicate entries
  if (!correctWords.includes(newWord)) {
    correctWords.push(newWord);
  }

  await set(progressRef, {
    correctWords,
    correctCount: correctWords.length,
  });
};

export const fetchProgress = async (
  level:
    | "beginnerLevel"
    | "intermediateLevel"
    | "proficientLevel"
    | "expertLevel"
) => {
  const user = auth.currentUser;
  if (!user) return { correctWords: [], correctCount: 0 };

  const progressRef = ref(
    db,
    `Authentication/users/${user.uid}/progress/${level}`
  );
  const snapshot = await get(progressRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }

  return { correctWords: [], correctCount: 0 };
};
