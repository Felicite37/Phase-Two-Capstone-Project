"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full py-4 shadow bg-white">
      <nav className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">
          Medium Clone
        </Link>

        <div className="flex gap-4">
          <Link href="/auth/login">Login</Link>
          <Link href="/auth/signup">Signup</Link>
        </div>
      </nav>
    </header>
  );
}
