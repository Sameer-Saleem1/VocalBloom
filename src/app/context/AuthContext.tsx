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
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
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
