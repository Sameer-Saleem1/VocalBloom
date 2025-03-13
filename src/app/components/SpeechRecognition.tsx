"use client";
import { useState } from "react";

const SpeechRecognitionComponent = () => {
  const [text, setText] = useState<string>();
  const isActive = false;
  const isSpeechDetectted = false;
  const language = "en-US";

  function handleOnRecord() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recogniton = new SpeechRecognition();

    recogniton.onresult = async function (event) {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      console.log(event);
    };
    recogniton.start();
  }
  return (
    <div className="flex flex-col items-center p-4">
      <button
        onClick={handleOnRecord}
        className={`p-4 rounded-full  "bg-red-500" : "bg-blue-500"
        } text-white shadow-lg transition-transform transform active:scale-90`}
      ></button>
      <p>Spoken Text: {text}</p>
    </div>
  );
};

export default SpeechRecognitionComponent;
