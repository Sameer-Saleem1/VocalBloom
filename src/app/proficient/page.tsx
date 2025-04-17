"use client";
import { useEffect, useState } from "react";
import { updateProgress, fetchProgress } from "../libs/firebaseHelpers";
import { useRouter } from "next/navigation";
import { fetchWords } from "./fetchProficientWords/fetchProficientWords";
import cat from "../../../public/images/cat.jpg";
import MicIcon from "@mui/icons-material/Mic";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { grey } from "@mui/material/colors";
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

export default function Proficient() {
  const [word, setWord] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [correctPronunciations, setCorrectPronunciations] = useState<number>(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [similarityScore, setSimilarityScore] = useState<number>(0);

  const router = useRouter();

  useEffect(() => {
    const loadWords = async () => {
      const words = await fetchWords();
      if (words.length > 0) {
        setWord(words);
      }
      const progress = await fetchProgress("proficientLevel");
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
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const userSpeech = event.results[0][0].transcript.trim().toLowerCase();
      const correctSentence = currentWord?.Content.trim().toLowerCase() || "";

      console.log("User said:", userSpeech);
      console.log("Expected sentence:", correctSentence);

      const userWords = userSpeech.split(" ");
      const correctWords = correctSentence.split(" ");
      let correctCount = 0;

      // Calculate how many words are correctly pronounced
      userWords.forEach((word, index) => {
        if (phoneticSimilarity(word, correctWords[index] || "") >= 0.6) {
          correctCount++;
        }
      });

      const accuracy = (correctCount / correctWords.length) * 100;
      console.log("Sentence accuracy:", accuracy);
      setSimilarityScore(accuracy / 100);
      if (accuracy >= 60) {
        setFeedback("✅ Great job! You're doing well, keep it up!");
        setShowAnimation(true);
        const newCorrect = correctPronunciations + 1;
        setCorrectPronunciations(newCorrect);

        await updateProgress("proficientLevel", correctSentence);

        setTimeout(() => {
          setFeedback("");
          setShowAnimation(false);
          setSimilarityScore(0);
          setCurrentIndex((prevIndex) =>
            prevIndex + 1 < word.length ? prevIndex + 1 : 0
          );
        }, 3000);
      } else {
        setFeedback(`❌ Oops! You said "${userSpeech}". Try again.`);
      }
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
            backgroundImage: `url(${cat.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex justify-end">
            <button
              className="cursor-pointer font-bold text-xl bg-orange-300 rounded p-1 m-4 shadow-lg hover:bg-orange-400 transition duration-300"
              onClick={() => router.push("./")}
            >
              <ExitToAppIcon fontSize="medium" />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="items-center justify-center flex flex-col mt-10">
            <p className="text-2xl bg-orange-300 px-5 rounded font-bold">
              {progress}/25
            </p>
            <div className="w-2/4 bg-orange-300 h-3 rounded-full relative mb-10 mt-5">
              <div
                className="h-3 bg-orange-500 rounded-full"
                style={{ width: `${Math.min((progress / 25) * 100, 100)}%` }}
              ></div>
            </div>

            {/* Card Container */}
            <div className="bg-orange-200 p-6 rounded-lg shadow-lg w-4/4 max-w-2xl text-center relative mb-20 ">
              <div className="flex items-center justify-center gap-25">
                {/* Word Display */}
                <h1 className="text-4xl font-semibold text-orange-700 flex flex-wrap justify-center">
                  {wordsArray.map((word, index) => (
                    <span
                      key={index}
                      className={`mx-1 px-2 rounded ${
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
                <div className="bg-orange-300 p-2 rounded-full shadow-lg cursor-pointer">
                  <span onClick={speakWord}>
                    <MicIcon fontSize="large" sx={{ color: grey[800] }} />
                  </span>
                </div>
                <div className=" mx-3 bg-orange-300 p-2 rounded-full shadow-lg cursor-pointer">
                  <span
                    onClick={listenToUser}
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
                <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      similarityScore >= 0.7
                        ? "bg-green-500"
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
        <p className="bg-orange-300 min-h-screen flex flex-col justify-center items-center text-3xl font-bold">
          Loading sentence...
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
