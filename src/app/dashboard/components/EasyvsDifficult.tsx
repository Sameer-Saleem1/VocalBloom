"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  easyCount: number;
  difficultCount: number;
}

export default function EasyVsDifficultChart({
  easyCount,
  difficultCount,
}: Props) {
  const data = [
    { type: "Easy Words", count: easyCount },
    { type: "Difficult Words", count: difficultCount },
  ];

  const colors = ["#4CAF50", "#F44336"]; // green, red

  return (
    <div className="w-full h-72   p-4 rounded-2xl">
      <h2 className="text-xl font-bold mb-4 text-center">
        Pronunciation Difficulty
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="type" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
