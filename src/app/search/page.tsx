"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchPosts } from "@/lib/posts";
import { Post } from "@/types";
import PostCard from "@/components/PostCard";
import Container from "@/components/Container";
import Link from "next/link";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500); // 500ms debounce

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchPosts(searchTerm);
      setPosts(results);
    } catch (error) {
      console.error("Error searching posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update URL when query changes (debounced)
  useEffect(() => {
    if (debouncedQuery) {
      router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, {
        scroll: false,
      });
    } else {
      router.replace("/search", { scroll: false });
    }
  }, [debouncedQuery, router]);

  // Perform search when debounced query changes
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Initial search if query param exists
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []); // Only run on mount

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold mb-4">Search Posts</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, content, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        {debouncedQuery && (
          <div className="mb-4">
            <p className="text-gray-600">
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  {posts.length} {posts.length === 1 ? "result" : "results"} for "
                  <span className="font-semibold">{debouncedQuery}</span>"
                </>
              )}
            </p>
          </div>
        )}

        {!debouncedQuery ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">
              Enter a search term to find posts
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg mb-2">No posts found</p>
            <p className="text-gray-400 text-sm">
              Try different keywords or check your spelling
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

