"use client";
import Link from "next/link";
import "./homepage.css";
import MicButton from "./components/MicButton";
import SpeechRecognitionComponent from "./components/SpeechRecognition";
import { IoMdStar } from "react-icons/io";
import { IoMdArrowDropleft } from "react-icons/io";
import { IoMdArrowDropright } from "react-icons/io";
import { TbPlayerPlay } from "react-icons/tb";
import SignIn from "./auth/signin";

export default function Homepage() {
  return (
    <div className="homepage-mainDiv min-h-screen">
      <div className=" text-3xl font-bold userDetails flex justify-between">
        <div className="">Hi, user_name</div>
        <div className="flex items-center">
          15 <IoMdStar className="ml-1" />
        </div>
      </div>
      <div className="homepage-BtnDiv flex flex-col justify-center items-center  text-3xl font-[family-name:var(--font-geist-sans)]">
        {" "}
        <div className="flex items-center ">
          <IoMdArrowDropright />
          <Link href={"./challenge"}>
            <button className="playBtn font-medium no-underline">
              {" "}
              <div className="flex items-center ">
                <TbPlayerPlay className="font-medium mx-2" />{" "}
                <span
                  className="no-underline"
                  style={{ textDecoration: "none" }}
                >
                  Play
                </span>
              </div>
            </button>
          </Link>
          <IoMdArrowDropleft />
        </div>
        <h1 className="clickBtn font-medium">Click the Button to Start</h1>
      </div>
      {/* <MicButton /> */}
      {/* <SpeechRecognitionComponent /> */}
      <SignIn />
    </div>
  );
}
