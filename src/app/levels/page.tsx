"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProgress } from "../libs/firebaseHelpers";

const Levels = () => {
  const router = useRouter();
  const [unlockedLevels, setUnlockedLevels] = useState<
    Record<string, { unlocked: boolean; stars: number }>
  >({});

  useEffect(() => {
    const getProgress = async () => {
      const levels = [
        "beginnerLevel",
        "intermediateLevel",
        "proficientLevel",
        "expertLevel",
      ] as const;

      const progressResults = await Promise.all(
        levels.map((level) => fetchProgress(level))
      );

      const unlockedMap: Record<string, { unlocked: boolean; stars: number }> =
        {
          beginnerLevel: {
            unlocked: true,
            stars: Math.min(5, (progressResults[0].correctCount / 25) * 5),
          },
          intermediateLevel: {
            unlocked: progressResults[0].correctCount >= 50,
            stars: Math.min(5, (progressResults[1].correctCount / 20) * 5),
          },
          proficientLevel: {
            unlocked: progressResults[1].correctCount >= 25,
            stars: Math.min(5, (progressResults[2].correctCount / 15) * 5),
          },
          expertLevel: {
            unlocked: progressResults[2].correctCount >= 10,
            stars: Math.min(5, (progressResults[3].correctCount / 10) * 5),
          },
        };

      setUnlockedLevels(unlockedMap);
    };

    getProgress();
  }, []);

  const renderLevelCard = (
    title: string,
    route: string,
    levelKey: string,
    imageUrl: string
  ) => {
    const levelData = unlockedLevels[levelKey];
    const isUnlocked = levelData?.unlocked ?? false;
    const stars = levelData?.stars ?? 0;

    const handleClick = () => {
      if (isUnlocked) router.push(route);
    };

    return (
      <div className="flex flex-col items-center">
        <h2 className="text-2xl mb-2 font-semibold">{title}</h2>
        <div
          onClick={handleClick}
          className={`rounded-xl border-4 border-gray-800 overflow-hidden transition-all duration-300 ${
            isUnlocked
              ? "cursor-pointer hover:scale-105"
              : "opacity-50 cursor-not-allowed grayscale"
          }`}
        >
          <Image
            src={imageUrl}
            alt={title}
            width={120}
            height={120}
            className="object-cover w-45 h-45"
          />
        </div>

        <div className="flex mt-2">
          {Array.from({ length: 5 }, (_: unknown, i: number) => {
            const diff = stars - i;
            const fillWidth = `${Math.min(1, Math.max(0, diff)) * 100}%`;
            const fillColor = isUnlocked ? "text-orange-500" : "text-gray-400";

            return (
              <span key={i} className="relative text-xl w-5">
                <span
                  className={`absolute top-0 left-0 overflow-hidden ${fillColor}`}
                  style={{ width: fillWidth }}
                >
                  ★
                </span>
                <span className="text-gray-300">★</span>
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-rose-100">
      <div>
        <button
          onClick={() => router.push("./")}
          className=" bg-[#f3c5a8] rounded-2xl border-3 text-xl border-gray-900  m-4 p-2 font-bold  cursor-pointer tracking-[.03rem] hover:bg-orange-300 transition-colors duration-300"
        >
          Back to Home
        </button>
      </div>

      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-bold mb-10 text-center">
          PICK YOUR CHALLENGE
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {renderLevelCard(
            "Beginner",
            "/beginner",
            "beginnerLevel",
            "/images/sky.jpg"
          )}
          {renderLevelCard(
            "Intermediate",
            "/intermediate",
            "intermediateLevel",
            "/images/greenery.jpg"
          )}
          {renderLevelCard(
            "Proficient",
            "/proficient",
            "proficientLevel",
            "/images/cat.jpg"
          )}
          {renderLevelCard(
            "Expert",
            "/expert",
            "expertLevel",
            "/images/aeroplane.jpg"
          )}
        </div>
      </div>
    </div>
  );
};

export default Levels;
