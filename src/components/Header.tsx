"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="w-full py-4 shadow bg-white">
      <nav className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
        <Link href="/" className="font-bold text-xl">
          Medium Clone
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Search
            </button>
          </div>
        </form>

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
