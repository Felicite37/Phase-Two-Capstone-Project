"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: any) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/auth/login");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-3">Register</h1>

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
}
