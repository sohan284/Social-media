"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { GoSearch } from "react-icons/go";

const Navbar = () => {
  const [activeButton, setActiveButton] = useState("login");

  const router = useRouter();

  return (
    <nav className="p-2.5 bg-[#022735BF] fixed top-0 left-0 right-0 z-40">
      <div className="relative flex items-center justify-between">
        <div className="flex-shrink-0">
          <Link href="/">
            <Image src="/logo.svg" alt="logo" width={40} height={40} />
          </Link>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-xl">
          <div className="relative">
            <GoSearch className="text-2xl absolute top-1/2 left-5 -translate-y-1/2 text-[#BEBEBE]" />
            <input
              type="text"
              placeholder="Search"
              className="w-full px-14 py-3 bg-transparent border border-[#BEBEBE] rounded-full text-white placeholder-[#BEBEBE] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center bg-[#2F6544] rounded-full flex-shrink-0">
          <button
            onClick={() => {
              setActiveButton("login");
              router.push("/auth/login");
            }}
            className={`px-6 py-3 rounded-full transition-all duration-300 cursor-pointer ${
              activeButton === "login"
                ? "bg-white text-black"
                : "bg-transparent text-white"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setActiveButton("signup");
              router.push("/auth/sign-up");
            }}
            className={`px-6 py-3 rounded-full transition-all duration-300 cursor-pointer ${
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
