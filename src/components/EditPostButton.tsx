"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/api";
import { onAuthStateChanged, User } from "firebase/auth";

interface EditPostButtonProps {
  postId: string;
  authorId: string;
}

export default function EditPostButton({ postId, authorId }: EditPostButtonProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Only show edit button if user is the author
  if (!user || user.uid !== authorId) {
    return null;
  }

  return (
    <button
      onClick={() => router.push(`/write?id=${postId}`)}
      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Edit
    </button>
  );
}

