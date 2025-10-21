"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import { IoNotifications } from "react-icons/io5";
import NotificationIcon from "../../Icons/NotificationIcon";
import { FiPlus } from "react-icons/fi";
import ProfileSidebar from "./ProfileSidebar";

const Navbar = () => {
  const [activeButton, setActiveButton] = useState("login");
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const router = useRouter();

  const handleCloseSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsProfileSidebarOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const user = true;

  return (
    <nav className="py-2.5 px-4 bg-[#022735BF] fixed top-0 left-0 right-0 z-40">
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

        {user ? (
          <div className="flex items-center gap-4 text-white">
            <button onClick={() => router.push("/main/create-post")} className="flex items-center gap-3 text-sm cursor-pointer">
              <FiPlus size={24} /> Create Post
            </button>
            <button className="cursor-pointer">
              <AiOutlineMessage size={24} />
            </button>
            <button className="cursor-pointer">
              <NotificationIcon />
            </button>
            {/* profile */}
            <button
              className="cursor-pointer"
              onClick={() => setIsProfileSidebarOpen(true)}
            >
              <Image
                src="/profile.jpg"
                alt="profile"
                width={30}
                height={30}
                className="rounded-full h-[30px] w-[30px] object-cover"
              />
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* Profile Sidebar */}
      {isProfileSidebarOpen && <ProfileSidebar onClose={handleCloseSidebar} />}
    </nav>
  );
};

export default Navbar;
