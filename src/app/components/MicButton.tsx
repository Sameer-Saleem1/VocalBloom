import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { Mic } from "lucide-react";

export default function MicButton() {
  const { text, listening, setListening } = useSpeechRecognition();

  return (
    <div className="flex flex-col items-center space-y-3">
      <button
        onClick={() => setListening(!listening)}
        className={`p-3 rounded-full ${
          listening ? "bg-red-500 animate-pulse" : "bg-gray-700"
        }`}
      >
        <Mic className="text-white w-6 h-6" />
      </button>
      <p className="text-lg font-semibold">{text}</p>
    </div>
  );
}
