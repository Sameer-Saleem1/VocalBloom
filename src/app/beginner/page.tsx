"use client";
// import Image from "next/image";
import { useEffect, useState } from "react";
// import useSpeechRecognition from "../SpeechRecognition/useSpeechRecognition";
import { fetchWords } from "./fetchWords/page";
import { useRouter } from "next/navigation";
// import MicIcon from "@mui/icons-material/Mic";
// import { grey } from "@mui/material/colors";
interface Word {
  Category: string;
  Content: string;
  ID: string;
  Image: string;
  Level: string;
  Type: string;
}

export default function LearningCard() {
  const [word, setWord] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    const loadWords = async () => {
      const words = await fetchWords();
      if (words.length > 0) {
        setWord(words);
      }
    };

    loadWords();
  }, []);

  const currentWord = word[currentIndex] || null;

  const speakWord = () => {
    if (word && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.Content);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
      setFeedback("Now, try pronouncing it!");
    } else {
      alert("Speech synthesis is not supported in your browser.");
    }
  };

  const calculateSimilarity = (str1: string, str2: string) => {
    const length = Math.max(str1.length, str2.length);
    let matches = 0;

    for (let i = 0; i < length; i++) {
      if (str1[i] === str2[i]) matches++;
    }

    return matches / length;
  };

  const listenToUser = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const userSpeech = event.results[0][0].transcript.trim().toLowerCase();
      const correctWord = currentWord?.Content.trim().toLowerCase() || "";

      console.log("User said:", userSpeech);
      console.log("Expected word:", correctWord);

      const similarity = calculateSimilarity(userSpeech, correctWord);
      console.log("Similarity:", similarity);

      if (similarity >= 0.7) {
        setFeedback("✅ Great job! Moving to the next word...");
        setTimeout(() => {
          setFeedback("");
          setCurrentIndex((prevIndex) =>
            prevIndex + 1 < word.length ? prevIndex + 1 : 0
          );
        }, 2000);
      } else {
        setFeedback(`❌ Oops! You said "${userSpeech}". Try again.`);
      }
    };

    recognition.start();
  };

  const router = useRouter();

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">Pronunciation Practice</h2>

      {currentWord ? (
        <div className="p-4 border rounded bg-gray-100">
          <p className="text-lg font-semibold">{currentWord.Content}</p>
          {currentWord.Image && (
            <img
              src={currentWord.Image}
              alt={currentWord.Content}
              className="w-20 h-20 mx-auto my-3"
            />
          )}

          <button
            onClick={speakWord}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            🔊 Hear the Word
          </button>

          <button
            onClick={listenToUser}
            className={`ml-3 px-4 py-2 rounded-lg transition ${
              listening
                ? "bg-gray-500 text-white"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            🎤 {listening ? "Listening..." : "Repeat the Word"}
          </button>

          {feedback && <p className="mt-4 text-lg">{feedback}</p>}
        </div>
      ) : (
        <p>Loading word...</p>
      )}
    </div>
    // <div className="flex flex-col items-center justify-center min-h-screen  bg-blue-100 relative">
    //   {words.length === 0 ? (
    //     <p>No words available.</p>
    //   ) : (
    //     <ul className="space-y-2">
    //       {words.map((word, index) => (
    //         <li
    //           key={word.ID || index}
    //           className="p-2 border rounded bg-gray-100"
    //         >
    //           <p>
    //             <strong>Word:</strong> {word.Content}
    //           </p>
    //           {word.Image && (
    //             <img
    //               src={word.Image}
    //               alt={word.Content}
    //               className="w-16 h-16 mt-2"
    //             />
    //           )}
    //         </li>
    //       ))}
    //     </ul>
    //   )}
    //   {/* Progress Bar */}
    //   <div className="w-2/4 bg-orange-300 h-3 rounded-full relative mb-10 mt-15">
    //     <div className="w-1/4 h-3 bg-orange-500 rounded-full"></div>
    //   </div>

    //   {/* Card Container */}
    //   <div className="bg-orange-100 p-6 rounded-lg shadow-lg w-4/4 max-w-2xl text-center relative mb-20 ">
    //     <div className="flex items-center justify-center gap-25  ">
    //       {/* Word Display */}
    //       <h1 className="text-5xl font-semibold text-orange-700">Water</h1>

    //       {/* Image */}
    //       <Image
    //         src="/images/sky.jpg"
    //         alt="Image"
    //         width={250}
    //         height={250}
    //         className="rounded-md"
    //       />
    //     </div>

    //     {/* Buttons */}
    //     <div className="flex justify-center items-center mt-6">
    //       <div className="bg-orange-300 p-2 rounded-full shadow-lg cursor-pointer ">
    //         <span>
    //           <MicIcon fontSize="large" sx={{ color: grey[800] }} />
    //         </span>
    //       </div>

    //       {/* <div
    //         className="flex flex-col justify-end items-center bg-black text-white px-4 py-2 rounded-full cursor-pointer"
    //         onClick={() => router.push("/skip")}
    //       >
    //         <span className="text-sm">Ski</span>
    //         <span className="text-xl">❌</span>
    //       </div> */}
    //     </div>
    //   </div>
    //   <div
    //     className="cursor-pointer"
    //     onClick={() => router.push("/fetchWords")}
    //   >
    //     go to words list
    //   </div>
    // </div>
  );
}
