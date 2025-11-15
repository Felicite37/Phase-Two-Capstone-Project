"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/api";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="w-full py-4 shadow bg-white">
      <nav className="max-w-4xl mx-auto flex justify-between items-center px-4">
        <Link href="/" className="font-bold text-xl">
          Medium Clone
        </Link>

        <div className="flex gap-4 items-center">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : isAuthenticated ? (
            <>
              <Link
                href="/write"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Write
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/signup">Signup</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
