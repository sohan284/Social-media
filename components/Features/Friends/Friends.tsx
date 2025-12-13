"use client";

import React, { useState, useMemo } from "react";
import { useGetFollowingQuery, useGetFollowersQuery, useFollowUserMutation, useUnfollowUserMutation, FollowItem } from "@/store/postApi";
import { useGetCurrentUserProfileQuery } from "@/store/authApi";
import { IoPersonOutline } from "react-icons/io5";
import { toast } from "sonner";

const Friends = () => {
  const [activeTab, setActiveTab] = useState<"following" | "followers">("following");
  // Always fetch both lists to check follow status
  const { data: followingResponse, isLoading: isLoadingFollowing } = useGetFollowingQuery();
  const { data: followersResponse, isLoading: isLoadingFollowers } = useGetFollowersQuery();
  const { data: profileResponse } = useGetCurrentUserProfileQuery();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const currentUser = profileResponse?.data;

  const following = useMemo(() => {
    if (!followingResponse) return [];
    return followingResponse.data ?? followingResponse.results?.data ?? [];
  }, [followingResponse]);

  const followers = useMemo(() => {
    if (!followersResponse) return [];
    return followersResponse.data ?? followersResponse.results?.data ?? [];
  }, [followersResponse]);

  const handleFollow = async (userId: number | string) => {
    try {
      await followUser({ userId }).unwrap();
      toast.success("Followed successfully");
    } catch (error) {
      console.error("Failed to follow user:", error);
      toast.error("Failed to follow user");
    }
  };

  const handleUnfollow = async (followId: number | string) => {
    try {
      await unfollowUser({ followingId: followId }).unwrap();
      toast.success("Unfollowed successfully");
    } catch (error) {
      console.error("Failed to unfollow user:", error);
      toast.error("Failed to unfollow user");
    }
  };

  const renderUserList = (users: FollowItem[], isFollowingTab: boolean) => {
    const isLoading = isFollowingTab ? isLoadingFollowing : isLoadingFollowers;
    
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse flex items-center gap-4 p-4 border border-white/10 rounded-lg">
              <div className="h-12 w-12 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-white/10 mb-2" />
                <div className="h-3 w-24 rounded bg-white/10" />
              </div>
              <div className="h-8 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-white/60 text-sm">
            {isFollowingTab ? "You are not following anyone yet." : "No one is following you yet."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {users.map((item) => {
          const userId = isFollowingTab ? item.following : item.follower;
          const userName = isFollowingTab ? item.following_name : item.follower_name;

          // Check if current user is following this user (for followers tab)
          // In following tab, they're already following, so always true
          // In followers tab, check if this user exists in the following list
          const isFollowing = isFollowingTab 
            ? true 
            : following.some((f) => String(f.following) === String(userId));

          // Find the follow relationship ID for unfollowing
          const followRelation = isFollowingTab 
            ? item 
            : following.find((f) => String(f.following) === String(userId));

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-[#06133FBF] backdrop-blur-[17.5px] border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300"
            >
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
                <div className="h-full w-full bg-gradient-to-br from-[#6c3f79] via-[#995a98] to-[#6c3f79] flex items-center justify-center">
                  <IoPersonOutline className="text-white" size={24} />
                </div>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{userName || "Unknown User"}</p>
              </div>

              {/* Follow/Unfollow Button */}
              {userId && String(userId) !== String(currentUser?.id) && (
                <button
                  onClick={() => {
                    if (isFollowing) {
                      // Unfollow: use the follow relation ID
                      if (followRelation?.id) {
                        handleUnfollow(followRelation.id);
                      }
                    } else {
                      // Follow: use the user ID
                      handleFollow(userId);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isFollowing
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="px-2 md:px-4 xl:px-10">
      <div className="mt-6 bg-[#06133FBF] backdrop-blur-[17.5px] border border-white/10 rounded-2xl p-4 xl:p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Friends</h1>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("following")}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all duration-300 ${
              activeTab === "following"
                ? "bg-white text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            Following ({following.length})
          </button>
          <button
            onClick={() => setActiveTab("followers")}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all duration-300 ${
              activeTab === "followers"
                ? "bg-white text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            Followers ({followers.length})
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === "following" && renderUserList(following, true)}
          {activeTab === "followers" && renderUserList(followers, false)}
        </div>
      </div>
    </div>
  );
};

export default Friends;

