"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import NotificationIcon from "../../Icons/NotificationIcon";
import { FiPlus } from "react-icons/fi";
import ProfileSidebar from "./ProfileSidebar";
import { FaAlignRight } from "react-icons/fa";
import MessagePopup from "../../Message/MessagePopup";
import { useGetCurrentUserProfileQuery } from "@/store/authApi";

interface NavbarProps {
  onMenuToggle?: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const [activeButton, setActiveButton] = useState("login");
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);

  const router = useRouter();
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetCurrentUserProfileQuery();

  const profile = profileData?.data;

  const handleCloseSidebar = () => {
    setIsProfileSidebarOpen(false);
  };

  const user = true;
  const avatarUrl =
    (profile?.profile_image as string) ||
    (profile?.avatar as string) ||
    "/profile.jpg";

  const pathname = usePathname();

  return (
    <nav className="py-2.5 px-2 md:px-4 bg-[#06133f] fixed top-0 left-0 right-0 z-40 border-b border-white/10">
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={onMenuToggle}
            className={`${pathname.startsWith('/main') ? 'lg:hidden' : 'xl:hidden'} text-white p-2 hover:bg-gray-700 rounded-full transition-colors duration-200`}
          >
            <FaAlignRight size={24} />
          </button>
          <div className="flex-shrink-0">
            <Link href="/">
              <Image src="/logo.svg" alt="logo" width={40} height={40} />
            </Link>
          </div>
        </div>

        {/* Search Bar - Hidden on mobile, visible on tablet and up */}
        <div className="hidden md:absolute md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl">
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
          <div className="flex items-center gap-2 md:gap-4 text-white">
            <button 
              onClick={() => router.push("/main/create-post")} 
              className="hidden md:flex items-center gap-3 text-sm cursor-pointer"
            >
              <FiPlus size={24} /> Create Post
            </button>
            
            {/* Mobile Create Post Button */}
            <button 
              onClick={() => router.push("/main/create-post")} 
              className="md:hidden cursor-pointer p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
            >
              <FiPlus size={20} />
            </button>
            
            <button 
              onClick={() => setIsMessagePopupOpen(!isMessagePopupOpen)}
              className="cursor-pointer p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 relative"
            >
              <AiOutlineMessage size={20} className="md:w-6 md:h-6" />
              {/* Message notification badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button className="cursor-pointer p-2 hover:bg-gray-700 rounded-full transition-colors duration-200">
              <NotificationIcon />
            </button>
            {/* profile */}
            <button
              className="cursor-pointer"
              onClick={() => setIsProfileSidebarOpen(true)}
              aria-label="Open profile"
            >
              <div className="h-[30px] w-[30px] rounded-full overflow-hidden border border-white/30 bg-gray-700">
                <Image
                  src={avatarUrl || "/profile.jpg"}
                  alt={profile?.username ? `${profile.username} avatar` : "profile"}
                  width={30}
                  height={30}
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
          </div>
        ) : (
          <div className="flex items-center bg-[#2F6544] rounded-full flex-shrink-0">
            <button
              onClick={() => {
                setActiveButton("login");
                router.push("/auth/login");
              }}
              className={`px-3 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300 cursor-pointer text-sm md:text-base ${
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
              className={`px-3 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300 cursor-pointer text-sm md:text-base ${
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
      {isProfileSidebarOpen && (
        <ProfileSidebar
          onClose={handleCloseSidebar}
          profile={profile || null}
          isLoadingProfile={isProfileLoading}
          isError={isProfileError}
        />
      )}
      
      {/* Message Popup */}
      <MessagePopup 
        isOpen={isMessagePopupOpen} 
        onClose={() => setIsMessagePopupOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
