"use client";
import { ReactNode, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/sign-up") {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading)
    return (
      <p className="bg-orange-300 min-h-screen flex flex-col justify-center items-center text-3xl font-bold">
        Loading...
      </p>
    );

  return user ? <>{children}</> : null;
}
