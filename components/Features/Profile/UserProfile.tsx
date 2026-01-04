"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import UserProfileHeader from "./_components/UserProfileHeader";
import Post from "../Main/Post/Post";
import UserProfileSidebar from "./_components/UserProfileSidebar";
import { useGetUserPostsQuery, useGetUserProfileQuery, useToggleFollowMutation, type PostItem } from "@/store/postApi";
import { useGetCurrentUserProfileQuery, useGetPublicUsersQuery } from "@/store/authApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMessage } from "@/contexts/MessageContext";
import { FiMenu, FiX } from "react-icons/fi";

const UserProfile = () => {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const { openMessagePopup } = useMessage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Get current user to check if viewing own profile
  const { data: currentUserProfile } = useGetCurrentUserProfileQuery();
  const currentUserId = currentUserProfile?.data?.id;
  
  // Get all users to find user by username (using public endpoint that allows authenticated users)
  const { data: usersResponse } = useGetPublicUsersQuery();
  
  // Resolve user ID from username or ID
  const userId = useMemo(() => {
    // If username is a number, treat it as ID
    if (!isNaN(Number(username))) {
      return username;
    }
    
    // Otherwise, find user by username
    const user = usersResponse?.data?.find((u: { username?: string; id?: string | number }) => 
      u.username === username
    );
    
    return user?.id || username; // Fallback to username if not found
  }, [username, usersResponse]);
  
  const { data: userProfileResponse, isLoading: isProfileLoading, refetch: refetchProfile } = useGetUserProfileQuery(userId, {
    skip: !userId || !username,
  });
  
  const { data: postsResponse, isLoading: isPostsLoading, isError: isPostsError } = useGetUserPostsQuery(userId, {
    skip: !userId || !username,
  });
  
  const [toggleFollow, { isLoading: isTogglingFollow }] = useToggleFollowMutation();
  
  const userProfile = userProfileResponse?.data;
  const isFollowing = userProfile?.is_following || false;
  const isOwnProfile = currentUserId && userId && String(currentUserId) === String(userId);
  
  const posts = useMemo((): PostItem[] => {
    if (!postsResponse) return [];
    
    if (Array.isArray(postsResponse)) {
      return postsResponse;
    }
    
    if (typeof postsResponse === 'object' && postsResponse !== null) {
      if (Array.isArray((postsResponse as { data?: PostItem[] }).data)) {
        return (postsResponse as { data: PostItem[] }).data;
      }
      if (Array.isArray((postsResponse as { results?: { data?: PostItem[] } }).results?.data)) {
        return (postsResponse as { results: { data: PostItem[] } }).results.data;
      }
      if (Array.isArray((postsResponse as { posts?: PostItem[] }).posts)) {
        return (postsResponse as { posts: PostItem[] }).posts;
      }
    }
    
    return [];
  }, [postsResponse]);

  const handleFollowToggle = async () => {
    if (!userId) return;
    
    try {
      await toggleFollow({ userId }).unwrap();
      refetchProfile();
      toast.success(isFollowing ? "Unfollowed successfully" : "Followed successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { error?: string; message?: string } })?.data?.error ||
        (error as { data?: { error?: string; message?: string } })?.data?.message ||
        "Failed to update follow status";
      toast.error(errorMessage);
    }
  };

  const handleSendMessage = () => {
    // Find user data from users list
    const user = usersResponse?.data?.find((u: { id?: string | number; username?: string }) => 
      String(u.id) === String(userId) || u.username === username
    );
    
    if (user) {
      // Open message popup with the selected user
      openMessagePopup({
        id: String(user.id),
        name: user.display_name || user.username || username,
        username: user.username || String(user.id),
        avatar: user.avatar || user.profile_image || "/profile.jpg",
        isOnline: Boolean(user.is_online),
        lastSeen: (user as { last_seen?: string }).last_seen,
      });
    } else {
      // Fallback: navigate to messages page if user not found in list
      router.push(`/main/messages?user=${userId}`);
    }
  };

  const renderPosts = () => {
    if (isPostsLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse border border-white/10 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div className="h-3 w-32 rounded bg-white/10" />
              </div>
              <div className="h-3 w-full rounded bg-white/10" />
              <div className="h-48 rounded bg-white/5" />
            </div>
          ))}
        </div>
      );
    }

    if (isPostsError) {
      return (
        <p className="text-red-400 text-sm">
          Failed to load posts. Please try again later.
        </p>
      );
    }

    if (!posts.length) {
      return (
          <p className="text-gray-300 text-sm text-center">
            No posts available yet.
          </p>
      );
    }

    return (
      <div className="space-y-6">
        {posts.map((post) => (
          <Post key={post.id} post={post} profile={currentUserProfile?.data} />
        ))}
      </div>
    );
  };

  if (isProfileLoading || !usersResponse) {
    return (
      <div className="mx-auto flex gap-10 pt-6 lg:p-4">
        {/* Main Content */}
        <div className="w-full bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-lg p-4 xl:p-10">
          {/* Header Skeleton */}
          <div className="border-b border-white/10 pb-4 mb-6">
            <div className="animate-pulse space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Avatar and Name Skeleton */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-48 bg-white/10 rounded" />
                    <div className="h-4 w-32 bg-white/10 rounded" />
                  </div>
                </div>
                {/* Buttons Skeleton */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-10 w-24 bg-white/10 rounded-lg" />
                  <div className="h-10 w-24 bg-white/10 rounded-lg" />
                  <div className="h-10 w-24 bg-white/10 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Posts Skeleton */}
          <div className="mt-6 space-y-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse border border-white/10 rounded-lg p-4 md:p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="h-3 w-24 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                </div>
                <div className="h-48 rounded bg-white/5" />
                <div className="flex items-center gap-4">
                  <div className="h-6 w-16 bg-white/10 rounded" />
                  <div className="h-6 w-16 bg-white/10 rounded" />
                  <div className="h-6 w-16 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sidebar Skeleton */}
        <div
          style={{ scrollbarGutter: "stable both-edges" }}
          className="h-[90vh] hidden lg:block rounded-lg w-[500px] sticky top-18"
        >
          <div className="space-y-4 animate-pulse">
            {/* Cover Photo Skeleton */}
            <div className="bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-2xl">
              <div className="h-32 bg-white/10 rounded-t-2xl" />
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-white/10 rounded" />
                  <div className="h-4 w-24 bg-white/10 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-white/10 rounded" />
                    <div className="h-4 w-8 bg-white/10 rounded" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-white/10 rounded" />
                    <div className="h-4 w-8 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
            {/* Actions Skeleton */}
            <div className="bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-2xl p-4 space-y-3">
              <div className="h-5 w-20 bg-white/10 rounded" />
              <div className="h-12 w-full bg-white/10 rounded-lg" />
              <div className="h-12 w-full bg-white/10 rounded-lg" />
              <div className="h-12 w-full bg-white/10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="mx-auto flex gap-10 pt-6 lg:p-4">
        <div className="w-full bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-lg p-4 xl:p-10">
          <p className="text-red-400 text-sm">User not found.</p>
        </div>
      </div>
    );
  }

  const handleCloseSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsSidebarOpen(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <>
      <div className="mx-auto flex gap-10 pt-6 lg:p-4">
        <div className="w-full bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-lg p-4 xl:p-10">
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between mb-4 lg:mb-0">
              <div className="flex-1">
                <UserProfileHeader 
                  userId={userId}
                  username={userProfile.username || username}
                  isFollowing={isFollowing}
                  isOwnProfile={isOwnProfile}
                  onFollowToggle={handleFollowToggle}
                  onSendMessage={handleSendMessage}
                  isTogglingFollow={isTogglingFollow}
                />
              </div>
              {/* Mobile Sidebar Toggle Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <FiMenu size={24} className="text-white" />
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {renderPosts()}
          </div>
        </div>
        
        {/* Desktop Sidebar */}
        <div
          style={{ scrollbarGutter: "stable both-edges" }}
          className="h-[90vh] hidden lg:block rounded-lg w-[500px] sticky top-18 hover:overflow-y-auto overflow-y-hidden custom-scroll"
        >
          <UserProfileSidebar 
            userId={userId}
            userProfile={userProfile}
            isOwnProfile={isOwnProfile}
            onFollowToggle={handleFollowToggle}
            onSendMessage={handleSendMessage}
            isFollowing={isFollowing}
            isTogglingFollow={isTogglingFollow}
          />
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <div
          className={`fixed top-0 right-0 h-full w-full bg-black/50 z-50 duration-300 transition-all lg:hidden ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleCloseSidebar}
        >
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#06133F]/95 backdrop-blur-[17.5px] shadow-2xl transition-transform duration-300 ease-in-out ${
              isClosing ? "translate-x-full" : "translate-x-0"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ scrollbarGutter: "stable both-edges" }}
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Profile Info</h2>
              <button
                onClick={handleCloseSidebar}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <FiX size={24} className="text-white" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="overflow-y-auto h-[calc(100vh-64px)] custom-scroll p-4">
              <UserProfileSidebar 
                userId={userId}
                userProfile={userProfile}
                isOwnProfile={isOwnProfile}
                onFollowToggle={handleFollowToggle}
                onSendMessage={handleSendMessage}
                isFollowing={isFollowing}
                isTogglingFollow={isTogglingFollow}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;

