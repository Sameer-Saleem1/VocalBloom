import { ref, get } from "firebase/database";
import { db } from "../../firebase/config";

interface Word {
  Category: string;
  Content: string;
  ID: string;
  Image: string;
  Level: string;
  Type: string;
}

export const fetchWords = async (): Promise<Word[]> => {
  try {
    const wordsRef = ref(db, "dataset"); // ✅ Ensure correct DB path
    const snapshot = await get(wordsRef);

    if (snapshot.exists()) {
      const wordsData = snapshot.val();
      const wordsArray: Word[] = Object.values(wordsData);

      // ✅ Filter only Beginner level words
      let filteredWords = wordsArray.filter(
        (word) => word.Level === "Beginner Level"
      );

      // shuffle and limit the words to 100
      filteredWords = filteredWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 100);

      return filteredWords;
    }
  } catch (error) {
    console.error("Error fetching words:", error);
  }
  return [];
};
