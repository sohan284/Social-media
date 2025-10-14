"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { GoSearch } from "react-icons/go";

const Navbar = () => {
  const [activeButton, setActiveButton] = useState("login");

  return (
    <nav className="p-2.5 bg-[#022735BF]">
      <div className="flex items-center justify-between ">
        {/* Left: Logo */}
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={40} height={40} />
        </Link>

        {/* Center: Search */}
        <div className="relative flex-1 flex justify-center">
          <div className="relative w-full max-w-xl">
            <GoSearch className="text-2xl absolute top-1/2 left-5 -translate-y-1/2 text-[#BEBEBE]" />
            <input
              type="text"
              placeholder="Search"
              className="w-full px-14 py-3 bg-transparent border border-[#BEBEBE] rounded-full text-white placeholder-[#BEBEBE] focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-2 bg-[#2F6544] rounded-full p-1">
          <button
            onClick={() => setActiveButton("login")}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              activeButton === "login"
                ? "bg-white text-black"
                : "bg-transparent text-white"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveButton("signup")}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              activeButton === "signup"
                ? "bg-white text-black"
                : "bg-transparent text-white"
            }`}
          >
            Signup
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
