"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "../firebase/config";
// import { useRouter } from "next/navigation";
import MicIcon from "@mui/icons-material/Mic";
import { grey } from "@mui/material/colors";

interface Word {
  Category: string;
  Content: string;
  ID: string;
  Image: string;
  Level: string;
  Type: string;
}

const shuffleArray = (array: Word[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function Intermediate() {
  const [beginnerWords, setBeginnerWords] = useState<Word[]>([]);

  useEffect(() => {
    const fetchAndProcessWords = async () => {
      try {
        const wordsRef = ref(db, "dataset"); // Adjust this based on your DB structure
        const snapshot = await get(wordsRef);

        if (snapshot.exists()) {
          const wordsData = snapshot.val();

          const wordsArray: Word[] = Object.values(wordsData);
          // Filter words with Level "Intermediate"
          let filteredWords = wordsArray.filter(
            (word) => word.Level === "Intermediate"
          );
          // Shuffle the filtered words
          filteredWords = shuffleArray(filteredWords);
          filteredWords = filteredWords.slice(0, 50); // Limit to 10 words

          setBeginnerWords(filteredWords);
        }
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };

    fetchAndProcessWords();
  }, []);

  // const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-blue-100 relative">
      {/* Progress Bar */}
      <div className="w-2/4 bg-orange-300 h-3 rounded-full relative mb-10 mt-15">
        <div className="w-1/4 h-3 bg-orange-500 rounded-full"></div>
      </div>

      {/* Card Container */}
      <div className="bg-orange-100 p-6 rounded-lg shadow-lg w-4/4 max-w-2xl text-center relative mb-20 ">
        <div className="flex items-center justify-center gap-25  ">
          {/* Phase Display */}
          <h1 className="text-5xl font-semibold text-orange-700">
            I see the sun.
          </h1>

          {/* Image */}
          <Image
            src="/images/sky.jpg"
            alt="Image"
            width={250}
            height={250}
            className="rounded-md"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center items-center mt-6">
          <div className="bg-orange-300 p-2 rounded-full shadow-lg cursor-pointer ">
            <span>
              <MicIcon fontSize="large" sx={{ color: grey[800] }} />
            </span>

            {/* <div
            className="flex flex-col justify-end items-center bg-black text-white px-4 py-2 rounded-full cursor-pointer"
            onClick={() => router.push("/skip")}
            >
            <span className="text-sm">Ski</span>
            <span className="text-xl">❌</span>
            </div> */}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Intermediate Level Phrases</h2>
        <ul className="space-y-2">
          {beginnerWords.map((word, index) => (
            <li key={index} className="p-2 border rounded bg-gray-100">
              <p>
                <strong>Phrases:</strong> {word.Content}
              </p>
              {word.Image && (
                <img
                  src={word.Image}
                  alt={word.Content}
                  className="w-16 h-16 mt-2"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
