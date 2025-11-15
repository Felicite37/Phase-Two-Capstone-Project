"use client";

import Container from "@/components/Container";

export default function LoginPage() {
  return (
    <Container>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          <button className="w-full bg-black text-white py-2 rounded">
            Login
          </button>
        </form>
      </div>
    </Container>
  );
}
