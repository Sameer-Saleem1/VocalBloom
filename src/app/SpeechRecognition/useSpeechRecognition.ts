"use client";
import { useState, useEffect } from "react";

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const SpeechRecognition =
    typeof window !== "undefined" && (window as any).webkitSpeechRecognition;
  const recognition =
    SpeechRecognition && new (window as any).webkitSpeechRecognition();

  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const spokenWord = event.results[0][0].transcript.trim();
      setTranscript(spokenWord);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };
  }, []);

  const startListening = () => {
    if (!recognition) return;
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    if (!recognition) return;
    setIsListening(false);
    recognition.stop();
  };

  return { transcript, isListening, startListening, stopListening };
};

export default useSpeechRecognition;
