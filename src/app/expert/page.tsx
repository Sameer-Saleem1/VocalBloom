"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import aeroplane from "../../../public/images/aeroplane.jpg";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { grey } from "@mui/material/colors";
import { fetchWords } from "./fetchingExpertWords/fetchExpertWords";
import { updateProgress, fetchProgress } from "../libs/firebaseHelpers";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { storePronunciationAttempt } from "../libs/storePronunciationAttempt";

import Lottie from "lottie-react";
import ReactHowler from "react-howler";
import animation from "../components/animation.json";

interface Word {
  Category: string;
  Content: string;
  ID: string;
  Image: string;
  Level: string;
  Type: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const phoneticSimilarity = (word1: string, word2: string) => {
  const phoneticMap: { [key: string]: string } = {
    a: "æ",
    b: "b",
    c: "k",
    d: "d",
    e: "ɛ",
    f: "f",
    g: "ɡ",
    h: "h",
    i: "ɪ",
    j: "dʒ",
    k: "k",
    l: "l",
    m: "m",
    n: "n",
    o: "oʊ",
    p: "p",
    q: "k",
    r: "ɹ",
    s: "s",
    t: "t",
    u: "ʌ",
    v: "v",
    w: "w",
    x: "ks",
    y: "j",
    z: "z",
  };

  const toPhonetic = (word: string) =>
    word
      .toLowerCase()
      .split("")
      .map((letter) => phoneticMap[letter] || letter)
      .join("");

  const phonetic1 = toPhonetic(word1);
  const phonetic2 = toPhonetic(word2);

  let matches = 0;
  const length = Math.max(phonetic1.length, phonetic2.length);
  for (let i = 0; i < length; i++) {
    if (phonetic1[i] === phonetic2[i]) matches++;
  }
  return matches / length;
};

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

export default function Expert() {
  const [word, setWord] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [correctPronunciations, setCorrectPronunciations] = useState<number>(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [similarityScore, setSimilarityScore] = useState<number>(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState<number>(0);

  const router = useRouter();

  useEffect(() => {
    const loadWords = async () => {
      const words = await fetchWords();
      if (words.length > 0) {
        setWord(words);
      }
      const progress = await fetchProgress("expertLevel");
      setCorrectPronunciations(progress.correctCount || 0);

      if (progress.correctWords && words.length > 0) {
        const lastWordIndex = words.findIndex(
          (w) =>
            w.Content ===
            progress.correctWords[progress.correctWords.length - 1]
        );
        setCurrentIndex(
          lastWordIndex + 1 < words.length ? lastWordIndex + 1 : 0
        );
      }
    };

    loadWords();
  }, []);
  const sanitizeFilename = (str: string) => {
    return str.trim().replace(/[.#$[\]]/g, "");
  };
  const currentWord = word[currentIndex] || null;
  const wordsArray = currentWord?.Content.split(" ") || [];

  const speakWord = () => {
    if (currentWord && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.Content);
      utterance.lang = "en-US";
      utterance.rate = 0.75;

      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;
          const before = currentWord.Content.slice(0, charIndex);
          const currentWordIndex = before.trim().split(/\s+/).length - 1;
          setHighlightIndex(currentWordIndex);
        }
      };

      utterance.onend = () => {
        setHighlightIndex(null);
        setFeedback("Now, try pronouncing it!");
      };

      speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis is not supported in your browser.");
    }
  };

  const listenToUser = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false; // Disable continuous listening
    recognition.interimResults = false;

    let timeout: NodeJS.Timeout;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    // Use a timeout to detect a pause in speech (after a short delay, it will process the speech)
    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const userSpeech = event.results[0][0].transcript.trim().toLowerCase();
      const correctWord = currentWord?.Content.trim().toLowerCase() || "";
      const cleanText = (text: string) =>
        text
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"?']/g, "")
          .replace(/\s{2,}/g, " ")
          .toLowerCase();

      const userSpeechClean = cleanText(userSpeech);
      const correctWordClean = cleanText(correctWord);
      console.log("User said:", userSpeech);
      console.log("Expected word:", correctWord);
      const similarity = phoneticSimilarity(userSpeechClean, correctWordClean);

      console.log("Similarity:", similarity);
      setSimilarityScore(similarity);
      if (similarity >= 0.5) {
        setFeedback(" Great job! Moving to the next word...");
        setShowAnimation(true);
        const newCorrect = correctPronunciations + 1;
        setCorrectPronunciations(newCorrect);

        await storePronunciationAttempt(
          "expertLevel",
          sanitizeFilename(correctWord),
          true,
          similarity
        );
        await updateProgress(
          "expertLevel",
          sanitizeFilename(correctWord),
          similarity
        );

        setTimeout(() => {
          setFeedback("");
          setShowAnimation(false);
          setSimilarityScore(0);
          setCurrentIndex((prevIndex) =>
            prevIndex + 1 < word.length ? prevIndex + 1 : 0
          );
        }, 5000);
      } else {
        setFeedback(`Oops! You said "${userSpeech}". Try again.`);
        setIncorrectAttempts((prev) => prev + 1);

        await storePronunciationAttempt(
          "expertLevel",
          sanitizeFilename(correctWord),
          false,
          similarity
        );

        if (incorrectAttempts >= 4) {
          setFeedback("Too many attempts. Moving to the next word.");
          setCurrentIndex((prevIndex) =>
            prevIndex + 1 < word.length ? prevIndex + 1 : 0
          );
          setIncorrectAttempts(0);
        }
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        recognition.stop();
      }, 2000);
    };

    recognition.start();
  };

  const progress = correctPronunciations;

  return (
    <div className="">
      {currentWord ? (
        <div
          className="flex flex-col min-h-screen  bg-blue-100 relative"
          style={{
            backgroundImage: `url(${aeroplane.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex justify-end">
            <button
              className="cursor-pointer font-bold text-xl border-3 border-black bg-[#f3c5a8] rounded-lg px-3 py-1 m-4 shadow-lg hover:bg-orange-300 transition duration-300"
              onClick={() => router.push("./")}
            >
              <ExitToAppIcon fontSize="large" />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="items-center justify-center flex flex-col mt-10">
            <p className="text-2xl bg-[#f3c5a8] border-3 border-black px-5 py-1 rounded-lg font-bold">
              {progress}/10
            </p>
            <div className="w-2/4 bg-[#f3c5a8] h-3 rounded-full relative mb-10 mt-5">
              <div
                className="h-3 bg-[#d97f43] rounded-full"
                style={{ width: `${Math.min((progress / 10) * 100, 100)}%  ` }}
              ></div>
            </div>

            {/* Card Container */}
            <div className="bg-orange-100 p-6 rounded-lg shadow-lg w-4/4 max-w-2xl text-center relative  ">
              <div className="flex items-center justify-center gap-25">
                {/* Word Display */}
                <h1 className="text-3xl font-semibold text-[#d97f43] flex flex-wrap justify-center">
                  {wordsArray.map((word, index) => (
                    <span
                      key={index}
                      className={`mx-1 px-1 rounded ${
                        highlightIndex === index - 1
                          ? "bg-orange-300 font-bold"
                          : ""
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </h1>
              </div>

              {/* Buttons */}
              <div className="flex justify-center items-center mt-6">
                <div
                  onClick={speakWord}
                  className="bg-[#f3c5a8] shadow-[#b39887] p-2 rounded-full shadow-lg cursor-pointer"
                >
                  <span>
                    <VolumeUpIcon fontSize="large" sx={{ color: grey[800] }} />
                  </span>
                </div>
                <div
                  onClick={listenToUser}
                  className="mx-3 bg-[#f3c5a8] shadow-[#b39887] p-2 rounded-full shadow-lg cursor-pointer"
                >
                  <span
                    className={`text-2xl  rounded-lg transition ${
                      listening ? " text-white" : " text-white "
                    }`}
                  >
                    {" "}
                    🎤 {listening ? "Listening..." : ""}
                  </span>
                </div>
              </div>
            </div>
            {feedback && <p className="mt-4 text-lg">{feedback}</p>}
            {similarityScore !== null && (
              <div className="mt-4 w-full max-w-md mx-auto">
                <p className="text-center font-semibold text-xl">
                  Similarity Score: {(similarityScore * 100).toFixed(0)}%
                </p>
                <div className="w-full h-4 bg-[#f3c5a8] rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      similarityScore >= 0.7
                        ? "bg-orange-300"
                        : similarityScore >= 0.5
                        ? "bg-yellow-400"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${similarityScore * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="bg-[#f3c5a8] min-h-screen flex flex-col justify-center items-center text-3xl font-bold">
          Loading Paragraph...
        </p>
      )}
      {showAnimation && (
        <div className="absolute top-1/4 left-1/4 flex justify-center items-center  w-2/4 h-2/4 z-20">
          <Lottie
            animationData={animation}
            loop={false}
            autoplay={true}
            className="w-full h-full object-cover"
          />
          <ReactHowler
            src="/success.wav"
            playing={showAnimation}
            loop={false}
          />
        </div>
      )}
    </div>
  );
}
