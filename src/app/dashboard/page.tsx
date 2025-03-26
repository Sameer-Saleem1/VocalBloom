"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";

interface User {
  Name: string;
  FatherName: string;
  Email: string;
  childAge: string;
  UserID: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">User Dashboard</h1>
      {user ? (
        <div className="border p-4 rounded shadow-md mt-4">
          <p>
            <strong>Name:</strong> {user.Name}
          </p>
          <p>
            <strong>FatherName:</strong> {user.FatherName}
          </p>
          <p>
            <strong>Email:</strong> {user.Email}
          </p>
          <p>
            <strong>childAge:</strong> {user.childAge}
          </p>
          <p>
            <strong>UserID:</strong> {user.UserID}
          </p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white p-2 rounded mt-4"
      >
        Logout
      </button>
    </div>
  );
}
