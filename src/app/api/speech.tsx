import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { audioData } = req.body;

  if (!audioData) {
    return res.status(400).json({ error: "No audio data provided" });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });

  try {
    const response = await openai.audio.transcriptions.create({
      file: audioData,
      model: "whisper-1",
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
