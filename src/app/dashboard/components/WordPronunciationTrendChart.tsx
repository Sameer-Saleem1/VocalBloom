"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Props {
  wordAccuracies: Record<string, number>; // e.g., { "apple": 90, "banana": 75 }
}

export default function WordPronunciationTrendChart({ wordAccuracies }: Props) {
  const data = Object.entries(wordAccuracies).map(([word, accuracy]) => ({
    word,
    accuracy,
  }));

  return (
    <div className="w-full h-96 bg-[#c5a591] mt-19 p-4 rounded-2xl">
      <h2 className="text-xl font-bold mb-4 text-center">
        Pronunciation Trends
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="word"
            angle={-45}
            tick={false}
            textAnchor="end"
            height={30}
            interval={0}
          />
          <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
