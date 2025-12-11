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
import NotificationDropdown from "../../Message/NotificationDropdown";
import { IoPersonOutline } from "react-icons/io5";

interface NavbarProps {
  onMenuToggle?: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const [activeButton, setActiveButton] = useState("login");
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
    null;

  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/main/';

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

        {/* Search Bar - Only visible on home page, matches create post design */}
        {isHomePage && (
          <div className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl md:px-4">
            <div className="w-full bg-[#06133FBF] backdrop-blur-[17.5px] border border-white/10 rounded-2xl  p-1">
              <div className="relative flex items-center">
                <GoSearch className="absolute left-3 text-white/60" size={20} />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/20 rounded-xl text-white/60 placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        )}

        {user ? (
          <div className="relative flex items-center gap-2 md:gap-4 text-white">
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
              onClick={() => {
                setIsMessagePopupOpen(!isMessagePopupOpen);
                setIsNotificationOpen(false);
              }}
              className="cursor-pointer p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 relative"
            >
              <AiOutlineMessage size={20} className="md:w-6 md:h-6" />
              {/* Message notification badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsMessagePopupOpen(false);
                }}
                className="cursor-pointer p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 relative"
              >
                <NotificationIcon />
              </button>

              {/* Notification Dropdown */}
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
              />
            </div>
            {/* profile */}
            <button
              className="cursor-pointer"
              onClick={() => setIsProfileSidebarOpen(true)}
              aria-label="Open profile"
            >
              <div className="h-[30px] w-[30px] rounded-full overflow-hidden border border-white/30">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={profile?.username ? `${profile.username} avatar` : "profile"}
                    width={30}
                    height={30}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#6c3f79] via-[#995a98] to-[#6c3f79] flex items-center justify-center">
                    <IoPersonOutline className="text-white" size={16} />
                  </div>
                )}
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
