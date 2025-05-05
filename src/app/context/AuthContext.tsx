"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useRouter, usePathname } from "next/navigation"; // Import router hooks

interface User {
  uid: string;
  name?: string;
  email: string;
  fatherName?: string;
  childAge?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUser({ uid: currentUser.uid, ...snapshot.val() });
        } else {
          setUser({ uid: currentUser.uid, email: currentUser.email ?? "" });
        }

        // Redirect logic after login
        if ((!loading && pathname === "/login") || pathname === "/sign-up") {
          router.push("/");
        }
      } else {
        setUser(null);

        // Redirect to login if not authenticated
        if (!loading && pathname !== "/sign-up" && pathname !== "/login") {
          router.push("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? (
        <p className="bg-[#f3c5a8] min-h-screen flex flex-col justify-center items-center text-3xl font-bold">
          Loading Vocal Bloom
        </p>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
