"use client";

import React, { useMemo } from "react";
import Post from "../Post/Post";
import Story from "../Story/Story";
import { useGetNewsFeedQuery } from "@/store/postApi";
import { useGetCurrentUserProfileQuery } from "@/store/authApi";

const Home = () => {
  const { data: postsResponse, isLoading, isError } = useGetNewsFeedQuery();
  const { data: profileResponse } = useGetCurrentUserProfileQuery();
  const profile = profileResponse?.data;

  const posts = useMemo(() => {
    if (!postsResponse) return [];
    return (
      postsResponse.data ??
      postsResponse.results ??
      postsResponse.posts ??
      []
    );
  }, [postsResponse]);

  const renderPosts = () => {
    if (isLoading) {
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

    if (isError) {
      return (
        <p className="text-red-400 text-sm">
          Failed to load posts. Please try again later.
        </p>
      );
    }

    if (!posts.length) {
      return (
        <p className="text-gray-300 mt-[20vh] text-sm text-center min-h-[47.4vh]">
          No posts available yet.
        </p>
      );
    }

    return (
      <div className="space-y-6 min-h-[60.7vh]">
        {posts.map((post) => (
          <Post key={post.id} post={post} profile={profile} />
        ))}
      </div>
    );
  };

  return (
    <div className="px-2 md:px-4 xl:px-10">
      {/* <Story /> */}
      <div className="mt-6 min-h-[88.3vh]">
        {renderPosts()}
      </div>
    </div>
  );
};

export default Home;
