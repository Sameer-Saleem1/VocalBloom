"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const levels = [
  { title: "Beginner", image: "/images/sky.jpg", rating: 3.5 },
  { title: "Intermediate", image: "/images/greenery.jpg", rating: 4 },
  { title: "Proficient", image: "/images/cat.jpg", rating: 4.5 },
  { title: "Expert", image: "/images/aeroplane.jpg", rating: 4 },
];

const Levels = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-100 to-rose-100 p-8">
      <h1 className="text-5xl font-bold mb-10 text-center">
        PICK YOUR CHALLENGE
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {levels.map((level, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* {index === 0 && (
              <div className="animate-bounce mb-2 text-orange-500">▼</div>
            )} */}
            <h2 className="text-2xl mb-2 font-semibold">{level.title}</h2>
            <div className="rounded-xl border-4 border-gray-800 overflow-hidden">
              <Image
                src={level.image}
                alt={level.title}
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
                    i < Math.floor(level.rating) ? "opacity-100" : "opacity-50"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Levels;
