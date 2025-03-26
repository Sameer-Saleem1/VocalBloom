"use client";
import { useState } from "react";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [userData, setUserData] = useState({
    Name: "",
    FatherName: "",
    Email: "",
    childAge: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (userData.password !== userData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.Email,
        userData.password
      );
      const user = userCredential.user;

      await set(ref(db, `Authentication/users/${user.uid}`), {
        Name: userData.Name,
        FatherName: userData.FatherName,
        Email: userData.Email,
        childAge: userData.childAge,
        UserID: user.uid,
      });

      router.push("/"); // Redirect after signup
    } catch (error) {
      console.error(error);
      alert("Error signing up!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Signup</h2>
      <input
        type="text"
        name="Name"
        placeholder="Name"
        onChange={handleChange}
        className="border p-2 m-2"
      />
      <input
        type="text"
        name="FatherName"
        placeholder="Father's Name"
        onChange={handleChange}
        className="border p-2 m-2"
      />
      <input
        type="email"
        name="Email"
        placeholder="Email"
        onChange={handleChange}
        className="border p-2 m-2"
      />
      <input
        type="number"
        name="childAge"
        placeholder="Child's Age"
        onChange={handleChange}
        className="border p-2 m-2"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="border p-2 m-2"
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        onChange={handleChange}
        className="border p-2 m-2"
      />
      <button
        onClick={handleSignup}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Signup
      </button>
    </div>
  );
}
