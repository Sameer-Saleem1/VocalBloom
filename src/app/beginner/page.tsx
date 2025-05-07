"use client";
// import Image from "next/image";
import { useEffect, useState } from "react";
// import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";
import { updateProgress, fetchProgress } from "../libs/firebaseHelpers";
import { fetchWords } from "./fetchingWords/fetchWords";
import MicIcon from "@mui/icons-material/Mic";
import { grey } from "@mui/material/colors";
import sky from "../../../public/images/sky.jpg";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
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

export default function LearningCard() {
  const [word, setWord] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [correctPronunciations, setCorrectPronunciations] = useState<number>(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [similarityScore, setSimilarityScore] = useState<number>(0);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [incorrectAttempts, setIncorrectAttempts] = useState<number>(0); // Track incorrect attempts

  const router = useRouter();

  useEffect(() => {
    const loadWords = async () => {
      const words = await fetchWords();
      const progress = await fetchProgress("beginnerLevel");

      if (words.length > 0) {
        const index = 0;
        console.log("index: ", index);

        if (progress.correctWords && progress.correctWords.length > 0) {
          const lastWordIndex = words.findIndex(
            (w) =>
              w.Content ===
              progress.correctWords[progress.correctWords.length - 1]
          );
          setCurrentIndex(
            lastWordIndex >= 0 && lastWordIndex < words.length
              ? lastWordIndex
              : 0
          );
        }

        setCorrectPronunciations(progress.correctCount || 0);
        setWord(words);
      }
      setDataLoaded(true);
    };

    loadWords();
  }, []);

  if (!dataLoaded) {
    return (
      <div className="bg-[#F3C5A8] flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading Words...</p>
      </div>
    );
  }

  const currentWord = word[currentIndex] || null;

  const speakWord = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.Content);
      utterance.lang = "en-UK";
      utterance.rate = 0.9;

      if (speechSynthesis.speaking) {
        speechSynthesis.cancel(); // Cancel any ongoing speech
      }

      speechSynthesis.speak(utterance);
      setFeedback("Now, try pronouncing it!");
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
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };
    recognition.onend = () => {
      setListening(false);
    };
    (recognition as any).onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setFeedback("Mic error or speech not recognized. Please try again.");
      setListening(false);
    };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const userSpeech = event.results[0][0].transcript.trim().toLowerCase();
      const correctWord = currentWord?.Content.trim().toLowerCase() || "";

      const similarity = phoneticSimilarity(userSpeech, correctWord);
      setSimilarityScore(similarity);
      console.log("RAW:", event.results[0][0].transcript);

      if (similarity >= 0.7) {
        setFeedback(" Great job! Moving to the next word...");
        setShowAnimation(true);
        const newCorrect = correctPronunciations + 1;
        setCorrectPronunciations(newCorrect);

        await updateProgress("beginnerLevel", correctWord);

        setTimeout(() => {
          setFeedback("");
          setSimilarityScore(0);
          setShowAnimation(false);
          setCurrentIndex((prevIndex) =>
            prevIndex + 1 < word.length ? prevIndex + 1 : 0
          );
        }, 3000);
      } else {
        setIncorrectAttempts((prevAttempts) => prevAttempts + 1);
        setFeedback(` Oops! You said "${userSpeech}". Try again.`);
        if (incorrectAttempts >= 4) {
          setFeedback("Too many attempts. Moving to the next word.");
          setCurrentIndex((prevIndex) =>
            prevIndex + 1 < word.length ? prevIndex + 1 : 0
          );
          setIncorrectAttempts(0);
          setSimilarityScore(0);
        }
      }
    };

    recognition.start();
  };
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition not supported");
  }

  const progress = (correctPronunciations / word.length) * 100;
  return (
    <div className="">
      {currentWord ? (
        <div
          className="flex flex-col min-h-screen  bg-blue-100 relative"
          style={{
            backgroundImage: `url(${sky.src})`,
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

          <div className="items-center justify-center flex flex-col mt-0">
            <p className="text-2xl bg-[#f3c5a8] border-3 border-black px-5 py-1 rounded-lg font-bold">
              {Math.floor(progress)}/100
            </p>
            <div className="w-2/4 bg-[#f3c5a8] h-3 rounded-full relative mb-10 mt-5">
              <div
                className="h-3 bg-[#d97f43] rounded-full"
                style={{ width: `${Math.min(progress, 100)}%  ` }}
              ></div>
            </div>

            {/* Card Container */}
            <div className="bg-orange-100 p-6 rounded-lg shadow-lg w-4/4 max-w-2xl text-center relative mb-0 ">
              <div className="flex items-center justify-center gap-25">
                {/* Word Display */}
                <h1 className="text-5xl font-semibold text-[#d97f43]">
                  {currentWord.Content}
                </h1>

                {currentWord.Content ? (
                  <img
                    src={`/DatasetImages/${currentWord?.Content.toLowerCase()}.svg`}
                    alt="Image Not Found"
                    width={150}
                    height={180}
                    className=""
                  />
                ) : (
                  "not found"
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-center items-center mt-6">
                <div
                  onClick={speakWord}
                  className="bg-[#f3c5a8] p-2 rounded-full shadow-lg cursor-pointer"
                >
                  <span>
                    <MicIcon fontSize="large" sx={{ color: grey[800] }} />
                  </span>
                </div>
                <div
                  onClick={listenToUser}
                  className=" mx-3 bg-[#f3c5a8] p-2 rounded-full shadow-lg cursor-pointer"
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
          Loading word...
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
