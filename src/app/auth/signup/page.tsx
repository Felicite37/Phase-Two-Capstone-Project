"use client";

import { useState } from "react";
import Container from "./";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Register data:", form);
  };

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-4">Create an Account</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md mt-1"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="font-medium">Email</label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md mt-1"
            placeholder="Email address"
            required
          />
        </div>

        <div>
          <label className="font-medium">Password</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md mt-1"
            placeholder="Create password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md font-medium"
        >
          Sign Up
        </button>
      </form>
    </Container>
  );
}
