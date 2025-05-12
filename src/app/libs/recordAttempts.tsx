import { auth, db } from "../firebase/config";
import { ref, push } from "firebase/database";

export const recordAttempt = async (
  level:
    | "beginnerLevel"
    | "intermediateLevel"
    | "proficientLevel"
    | "expertLevel",
  word: string,
  score: number
) => {
  const user = auth.currentUser;
  if (!user) return;

  const attemptRef = ref(
    db,
    `Authentication/users/${user.uid}/progress/${level}/attempts/${word}`
  );

  const attemptData = {
    score,
    timestamp: new Date().toISOString(),
  };

  await push(attemptRef, attemptData);
};
