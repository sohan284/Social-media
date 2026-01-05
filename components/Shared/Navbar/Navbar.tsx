"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
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
import { useGetNotificationsQuery } from "@/store/notificationApi";
import { useGetConversationsListQuery, useGetChatRoomsQuery } from "@/store/chatApi";
import { useSearch } from "@/contexts/SearchContext";
import { useMessage } from "@/contexts/MessageContext";
import { getStoredAccessToken } from "@/lib/auth";

// Fallback hook for when SearchContext is not available
const useSearchSafe = () => {
  try {
    return useSearch();
  } catch {
    // Return default values if context is not available
    return { searchQuery: "", setSearchQuery: () => {} };
  }
};

interface NavbarProps {
  onMenuToggle?: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearchSafe();
  const { isOpen: isMessagePopupOpen, openMessagePopup, closeMessagePopup } = useMessage();

  const router = useRouter();
  const token = getStoredAccessToken();
  const isAuthenticated = !!token;
  
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetCurrentUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: notificationsData } = useGetNotificationsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: conversationsData } = useGetConversationsListQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: roomsData } = useGetChatRoomsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const profile = profileData?.data;

  // Calculate unread notification count
  const unreadNotificationCount = useMemo(() => {
    if (!notificationsData) return 0;
    const notifications =
      notificationsData.data ??
      notificationsData.notifications ??
      notificationsData.results?.data ??
      [];
    return notifications.filter((n) => !n.is_read).length;
  }, [notificationsData]);

  // Calculate unread message count (direct messages + rooms)
  const unreadMessageCount = useMemo(() => {
    let totalUnread = 0;
    
    // Count unread from direct message conversations
    if (conversationsData) {
      const conversations = 
        conversationsData.data ??
        conversationsData.results?.data ??
        conversationsData.conversations ??
        [];
      totalUnread += conversations.reduce((sum: number, conv: { unread_count?: number }) => {
        return sum + (conv.unread_count || 0);
      }, 0);
    }
    
    // Count unread from rooms
    if (roomsData) {
      const rooms = 
        roomsData.data ??
        roomsData.results ??
        roomsData.rooms ??
        [];
      totalUnread += rooms.reduce((sum: number, room: { unread_count?: number }) => {
        return sum + (room.unread_count || 0);
      }, 0);
    }
    
    return totalUnread;
  }, [conversationsData, roomsData]);

  const handleCloseSidebar = () => {
    setIsProfileSidebarOpen(false);
  };

  const avatarUrl =
    (profile?.profile_image as string) ||
    (profile?.avatar as string) ||
    null;

  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/main/' || pathname === '/explore';

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
              <Image src="/logo.png" alt="logo" width={180} height={100} />
            </Link>
          </div>
        </div>

        {/* Search Bar - Only visible on home page for authenticated users, matches create post design */}
        {isHomePage && isAuthenticated && (
          <div className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2 w-[35vw]  md:max-w-xl md:px-4">
            <div className="w-full bg-[#06133FBF] backdrop-blur-[17.5px] border border-white/10 rounded-2xl  p-1">
              <div className="relative flex items-center">
                <GoSearch className="absolute left-3 text-white/60" size={20} />
                <input
                  type="text"
                  placeholder="Search posts by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        )}

        {isAuthenticated ? (
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
                if (isMessagePopupOpen) {
                  closeMessagePopup();
                } else {
                  openMessagePopup();
                }
                setIsNotificationOpen(false);
              }}
              className="cursor-pointer p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 relative"
            >
              <AiOutlineMessage size={20} className="md:w-6 md:h-6" />
              {/* Message notification badge */}
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff4500] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-medium">
                  {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  closeMessagePopup();
                }}
                className="cursor-pointer p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 relative"
              >
                <NotificationIcon />
                {/* Notification badge */}
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
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
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <button
              onClick={() => router.push("/auth/login")}
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer text-sm md:text-base font-medium"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/auth/sign-up")}
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 cursor-pointer text-sm md:text-base font-semibold shadow-lg shadow-purple-500/20"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {/* Profile Sidebar - Only show for authenticated users */}
      {isAuthenticated && isProfileSidebarOpen && (
        <ProfileSidebar
          onClose={handleCloseSidebar}
          profile={profile || null}
          isLoadingProfile={isProfileLoading}
          isError={isProfileError}
        />
      )}
      
      {/* Message Popup - Only show for authenticated users */}
      {isAuthenticated && (
        <MessagePopup 
          isOpen={isMessagePopupOpen} 
          onClose={closeMessagePopup} 
        />
      )}
    </nav>
  );
};

export default Navbar;
