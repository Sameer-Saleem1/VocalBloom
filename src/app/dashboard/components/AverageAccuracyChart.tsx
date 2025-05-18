"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: Record<string, number>; // level => accuracy %
}

const levelLabels: Record<string, string> = {
  beginnerLevel: "Beginner",
  intermediateLevel: "Intermediate",
  proficientLevel: "Proficient",
  expertLevel: "Expert",
};

export default function AverageAccuracyChart({ data }: Props) {
  const chartData = Object.entries(data).map(([level, accuracy]) => ({
    name: levelLabels[level],
    accuracy,
  }));

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Average Accuracy per Level</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="accuracy" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
