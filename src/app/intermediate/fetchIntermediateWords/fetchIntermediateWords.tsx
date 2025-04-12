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
    const wordsRef = ref(db, "dataset");
    const snapshot = await get(wordsRef);

    if (snapshot.exists()) {
      const wordsData = snapshot.val();
      const wordsArray: Word[] = Object.values(wordsData);

      let filteredWords = wordsArray.filter(
        (word) => word.Level === "Intermediate"
      );

      filteredWords = filteredWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 50);

      return filteredWords;
    }
  } catch (error) {
    console.error("Error fetching words:", error);
  }
  return [];
};
