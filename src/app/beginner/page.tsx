"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MicIcon from "@mui/icons-material/Mic";
import { grey } from "@mui/material/colors";

export default function LearningCard() {
  // const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-blue-100 relative">
      {/* Progress Bar */}
      <div className="w-2/4 bg-orange-300 h-3 rounded-full relative mb-10 mt-15">
        <div className="w-1/4 h-3 bg-orange-500 rounded-full"></div>
      </div>

      {/* Card Container */}
      <div className="bg-orange-100 p-6 rounded-lg shadow-lg w-4/4 max-w-2xl text-center relative mb-20 ">
        <div className="flex items-center justify-center gap-25  ">
          {/* Word Display */}
          <h1 className="text-5xl font-semibold text-orange-700">Water</h1>

          {/* Image */}
          <Image
            src="/images/sky.jpg"
            alt="Image"
            width={250}
            height={250}
            className="rounded-md"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center items-center mt-6">
          <div className="bg-orange-300 p-2 rounded-full shadow-lg cursor-pointer ">
            <span>
              <MicIcon fontSize="large" sx={{ color: grey[800] }} />
            </span>
          </div>

          {/* <div
            className="flex flex-col justify-end items-center bg-black text-white px-4 py-2 rounded-full cursor-pointer"
            onClick={() => router.push("/skip")}
          >
            <span className="text-sm">Ski</span>
            <span className="text-xl">❌</span>
          </div> */}
        </div>
      </div>
    </div>
  );
}
