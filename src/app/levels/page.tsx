"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProgress } from "../libs/firebaseHelpers";

const Levels = () => {
  const router = useRouter();
  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, boolean>>(
    {}
  );

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

      const unlockedMap: Record<string, boolean> = {
        beginnerLevel: true, // Always unlocked
        intermediateLevel: false,
        proficientLevel: false,
        expertLevel: false,
      };

      if (progressResults[0].correctCount >= 20) {
        unlockedMap.intermediateLevel = true;
      }
      if (progressResults[1].correctCount >= 25) {
        unlockedMap.proficientLevel = true;
      }
      if (progressResults[2].correctCount >= 30) {
        unlockedMap.expertLevel = true;
      }

      setUnlockedLevels(unlockedMap);
    };

    getProgress();
  }, []);

  const renderLevelCard = (
    title: string,
    route: string,
    levelKey: string,
    imageUrl: string,
    stars: number
  ) => {
    const isUnlocked = unlockedLevels[levelKey];
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
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`text-orange-500 text-xl ${
                i < Math.floor(stars) ? "opacity-100" : "opacity-50"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-rose-100">
      <div>
        <button
          onClick={() => router.push("./")}
          className="rounded bg-orange-300 m-4 p-2 font-bold text-lg cursor-pointer tracking-[.03rem] hover:bg-orange-400 transition-colors duration-300"
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
            "/images/sky.jpg",
            5
          )}
          {renderLevelCard(
            "Intermediate",
            "/intermediate",
            "intermediateLevel",
            "/images/greenery.jpg",
            4
          )}
          {renderLevelCard(
            "Proficient",
            "/proficient",
            "proficientLevel",
            "/images/cat.jpg",
            3.5
          )}
          {renderLevelCard(
            "Expert",
            "/expert",
            "expertLevel",
            "/images/aeroplane.jpg",
            3.75
          )}
        </div>
      </div>
    </div>
  );
};

export default Levels;
