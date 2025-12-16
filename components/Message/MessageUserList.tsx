"use client";

import React, { useMemo } from "react";
import { IoPersonOutline } from "react-icons/io5";
import {
  useGetFollowingQuery,
  useGetFollowersQuery,
  type FollowItem,
} from "@/store/postApi";

interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline: boolean;
  timestamp?: string;
  roomId?: number | string;
}

interface MessageUserListProps {
  searchQuery: string;
  onUserSelect: (user: User) => void;
}

const MessageUserList = ({ searchQuery, onUserSelect }: MessageUserListProps) => {
  // Fetch who I follow and who follows me
  const { data: followingResponse, isLoading: isLoadingFollowing } = useGetFollowingQuery();
  const { data: followersResponse, isLoading: isLoadingFollowers } = useGetFollowersQuery();

  const following = useMemo(() => {
    if (!followingResponse) return [];
    return followingResponse.data ?? followingResponse.results?.data ?? [];
  }, [followingResponse]);

  const followers = useMemo(() => {
    if (!followersResponse) return [];
    return followersResponse.data ?? followersResponse.results?.data ?? [];
  }, [followersResponse]);

  // Merge following and followers into a unique user list
  const users = useMemo(() => {
    const userMap = new Map<string, { id: string; name: string }>();

    const addUserFromFollowItem = (item: FollowItem, type: "following" | "follower") => {
      const userIdRaw =
        type === "following" ? item.following : item.follower;
      const userName =
        type === "following" ? item.following_name : item.follower_name;

      if (!userIdRaw) return;
      const userId = String(userIdRaw);

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          name: userName || "Unknown User",
        });
      }
    };

    following.forEach((item) => addUserFromFollowItem(item, "following"));
    followers.forEach((item) => addUserFromFollowItem(item, "follower"));

    return Array.from(userMap.values());
  }, [following, followers]);

  const isLoading = isLoadingFollowing || isLoadingFollowers;

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((user) =>
      user.name.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center px-4">
          <p className="text-sm">
            {searchQuery
              ? "No users found. Try a different search."
              : "No users available from your followers/following yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto custom-scroll">
        {filteredUsers.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() =>
              onUserSelect({
                id: user.id,
                name: user.name,
                avatar: "/profile.jpg",
                username: user.id,
                isOnline: false,
              })
            }
            className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 cursor-pointer border-b border-gray-800 last:border-b-0 transition-colors text-left"
          >
            <div className="h-9 w-9 rounded-full overflow-hidden border border-white/20 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#6c3f79] via-[#995a98] to-[#6c3f79]">
              <IoPersonOutline className="text-white" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{user.id}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessageUserList;


