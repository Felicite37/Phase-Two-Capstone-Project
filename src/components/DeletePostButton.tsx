"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { onAuthStateChanged, User } from "firebase/auth";
import { deletePost, softDeletePost } from "@/lib/posts";

interface DeletePostButtonProps {
  postId: string;
  authorId: string;
  softDelete?: boolean;
}

export default function DeletePostButton({
  postId,
  authorId,
  softDelete = true,
}: DeletePostButtonProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Only show delete button if user is the author
  if (!user || user.uid !== authorId) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (softDelete) {
        await softDeletePost(postId);
      } else {
        await deletePost(postId);
      }
      router.push("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Delete
    </button>
  );
}

