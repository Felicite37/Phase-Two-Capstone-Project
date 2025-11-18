"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/api"; // adjust path if needed
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

interface Comment {
  id: string;
  text: string;
  createdAt: any;
}

export default function Comments({ postId }: { postId: string }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  // Load comments
  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Comment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(list);
    });

    return unsubscribe;
  }, [postId]);

  // Save comment
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addDoc(collection(db, "posts", postId, "comments"), {
      text: comment,
      createdAt: Timestamp.now(),
    });

    setComment("");
  };

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-3">Comments</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Post
        </button>
      </form>

      {/* Comment List */}
      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        )}

        {comments.map((c) => (
          <div
            key={c.id}
            className="border p-3 rounded bg-gray-50 text-gray-800"
          >
            <p>{c.text}</p>
            <span className="text-xs text-gray-500">
              {c.createdAt?.toDate().toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
