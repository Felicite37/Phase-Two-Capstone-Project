"use client";
import useAuth from "@/hooks/useAuth";

export default function Profile() {
  const { session } = useAuth();

  if (!session) return null;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <p>
        <strong>Email:</strong> {session.user?.email}
      </p>
      <p>
        <strong>Name:</strong> {session.user?.name || "No name set"}
      </p>
    </div>
  );
}
