"use client";

import { auth } from "@/firebase/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState, useEffect } from "react";
import { signInWithRedirect } from "firebase/auth";
import { getRedirectResult } from "firebase/auth";

const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
};

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) console.log("User:", result.user);
    });
  }, []);

  const handleGoogleSignIn = async () => {
    if (loading) return; // Prevent multiple popups
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("User:", result.user);
    } catch (error: any) {
      if (error.code !== "auth/cancelled-popup-request") {
        console.error("Error signing in:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="bg-blue-500 text-white p-2 rounded"
    >
      {loading ? "Signing in..." : "Sign in with Google"}
    </button>
  );
}
