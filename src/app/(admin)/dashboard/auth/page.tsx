"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // SIMPLE DEMO AUTH — replace with your backend auth later
    if (email === "admin@example.com" && password === "123456") {
      router.push("/admin-dashboard");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1F2149] px-4">
        {/* TITLE */}
        <h1 className="text-center text-2xl mb-8">
          Admin Login
        </h1>

      <div className="bg-[#1F2149] border-[2px] border-[#919191] rounded-2xl py-8 px-4 sm:px-10 max-w-2xl w-full text-white shadow-xl">

        {/* SUB TEXT */}
        <p className="text-center text-gray-300 mb-10">
          Please fill in your unique admin login details below
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col ">

          {/* Email */}
          <div>
            <label className="block mb-2 text-sm">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-transparent border border-gray-400 text-white outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-transparent border border-gray-400 text-white outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="text-right mt-1">
              <a href="#" className="text-red-400 text-xs hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <p className="text-red-400 text-center text-sm">{error}</p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="max-w-[280px] w-full self-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-medium transition-all"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
