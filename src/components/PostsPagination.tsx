"use client";

import Link from "next/link";

interface PostsPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function PostsPagination({
  currentPage,
  totalPages,
}: PostsPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={`/posts?page=${currentPage - 1}`}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          Previous
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={`/posts?page=${page}`}
          className={`px-4 py-2 rounded ${
            page === currentPage
              ? "bg-blue-600 text-white"
              : "border border-gray-300 hover:bg-gray-100"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={`/posts?page=${currentPage + 1}`}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          Next
        </Link>
      )}
    </div>
  );
}
