import { auth, db } from "../firebase/config";
import { ref, get, set } from "firebase/database";

export const storePronunciationAttempt = async (
  level:
    | "beginnerLevel"
    | "intermediateLevel"
    | "proficientLevel"
    | "expertLevel",
  word: string,
  isCorrect: boolean,
  similarity: number
) => {
  const user = auth.currentUser;
  if (!user) return;

  const attemptRef = ref(
    db,
    `Authentication/users/${user.uid}/pronunciation/${level}/${word}`
  );

  const snapshot = await get(attemptRef);

  let data = {
    attempts: 0,
    correct: 0,
    similarityHistory: [] as number[],
  };

  if (snapshot.exists()) {
    data = snapshot.val();
  }

  data.attempts += 1;
  if (isCorrect) {
    data.correct += 1;
  }
  data.similarityHistory.push(similarity);

  await set(attemptRef, data);
};
