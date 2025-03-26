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
        <div className="flex flex-col items-center">
          {/* BEGINNER */}

          <h2 className="text-2xl mb-2 font-semibold">Beginner</h2>
          <div
            onClick={() => router.push("/beginner")}
            className="rounded-xl border-4 border-gray-800 overflow-hidden cursor-pointer hover:scale-105 transition-scale duration-400"
          >
            <Image
              src="/images/sky.jpg"
              alt="Sky"
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
                  i < Math.floor(5) ? "opacity-100" : "opacity-50"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* INTERMEDIATE */}

        <div className="flex flex-col items-center">
          <h2 className="text-2xl mb-2 font-semibold">Intermediate</h2>
          <div
            onClick={() => router.push("/intermediate")}
            className="rounded-xl border-4 border-gray-800 overflow-hidden cursor-pointer hover:scale-105 transition-scale duration-400"
          >
            <Image
              src="/images/greenery.jpg"
              alt="Sky"
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
                  i < Math.floor(4) ? "opacity-100" : "opacity-50"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* PROFICIENT */}

        <div className="flex flex-col items-center">
          <h2 className="text-2xl mb-2 font-semibold">Proficient</h2>
          <div
            onClick={() => router.push("/proficient")}
            className="rounded-xl border-4 border-gray-800 overflow-hidden cursor-pointer hover:scale-105 transition-scale duration-400"
          >
            <Image
              src="/images/cat.jpg"
              alt="Sky"
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
                  i < Math.floor(3.5) ? "opacity-100" : "opacity-50"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* EXPERT */}

        <div className="flex flex-col items-center">
          <h2 className="text-2xl mb-2 font-semibold">Expert</h2>
          <div
            onClick={() => router.push("/expert")}
            className="rounded-xl border-4 border-gray-800 overflow-hidden cursor-pointer hover:scale-105 transition-scale duration-400"
          >
            <Image
              src="/images/aeroplane.jpg"
              alt="Aeroplane"
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
                  i < Math.floor(3.75) ? "opacity-100" : "opacity-50"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Levels;
