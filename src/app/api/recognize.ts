// import { NextApiRequest, NextApiResponse } from "next";
// import vosk from "vosk";
// import fs from "fs";
// import path from "path";

// // Load the Vosk model
// const modelPath = path.resolve("./models", "vosk-model-small-en-us-0.15");
// const model = new vosk.Model(modelPath);

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === "POST") {
//     const audioData = req.body.audioData; // Base64-encoded audio or buffer

//     const rec = new vosk.KaldiRecognizer(model, 16000); // Assuming the audio is 16kHz

//     // Handle the recognition
//     rec.acceptWaveform(audioData);
//     const result = rec.finalResult();

//     res.status(200).json(JSON.parse(result)); // Send transcribed text back
//   } else {
//     res.status(405).json({ error: "Method Not Allowed" });
//   }
// }
