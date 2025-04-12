"use client";
import Image from "next/image";
import LoginBG from "../../../public/images/loginBG.svg";
import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";

export default function Login() {
  const [userData, setUserData] = useState({
    Email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/"); // Redirect if user is authenticated
      }
    });
    return () => unsubscribe(); // Cleanup the listener
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, userData.Email, userData.password);
      router.push("/"); // Redirect to dashboard after successful login
    } catch (error) {
      console.error(error);
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen "
      style={{
        backgroundImage: `url(${LoginBG.src})`,
        backgroundSize: "cover",
      }}
    >
      <PersonIcon
        sx={{
          fontSize: 100,
          color: "#cfa78f",
          padding: "20",
          backgroundColor: "#F3C5A8",
          borderRadius: "50%",
          marginBottom: "20px",
        }}
      />
      <h2 className="text-xs font-semibold text-gray-700 mb-4">
        Type your email and then type your password below, in the boxes
      </h2>
      <div className="p-8 rounded-lg shadow-lg backdrop-blur-md w-96 text-center">
        <div className="relative mb-4">
          <input
            type="email"
            name="Email"
            placeholder="myname@email.com"
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#e9bfa3] text-gray-800 placeholder-gray-700 outline-none"
          />
        </div>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="mypassword"
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#e9bfa3] text-gray-800 placeholder-gray-700 outline-none"
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </button>
        </div>
        <p
          className="absolute text-2xl font-bold left-25
        bottom-11"
        >
          →
        </p>
        <button
          onClick={handleLogin}
          className=" ml-25 flex items-center justify-center w-1/3 p-3 rounded-lg bg-[#e9bfa3] text-gray-800 font-semibold hover:bg-[#d9a58c] transition cursor-pointer"
        >
          Login
        </button>
      </div>
      <p className="mt-3 text-gray-700">
        Already have an account?{" "}
        <span
          className="cursor-pointer underline hover:text-[#d9a58a] transition"
          onClick={() => router.push("/sign-up")}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
}
