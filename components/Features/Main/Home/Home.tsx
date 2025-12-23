"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Post from "../Post/Post";
import { useGetNewsFeedQuery, PostItem } from "@/store/postApi";
import { useGetCurrentUserProfileQuery } from "@/store/authApi";
import { FiEdit3, FiImage, FiLink } from "react-icons/fi";
import { useSearch } from "@/contexts/SearchContext";

// Fallback hook for when SearchContext is not available
const useSearchSafe = () => {
  try {
    return useSearch();
  } catch {
    return { searchQuery: "", setSearchQuery: () => {} };
  }
};

const Home = () => {
  const router = useRouter();
  const { data: postsResponse, isLoading, isError } = useGetNewsFeedQuery();
  const { data: profileResponse } = useGetCurrentUserProfileQuery();
  const profile = profileResponse?.data;
  const { searchQuery } = useSearchSafe();

  const allPosts = useMemo((): PostItem[] => {
    if (!postsResponse) return [];
    
    // Handle different response structures
    if (Array.isArray(postsResponse.data)) {
      return postsResponse.data;
    }
    if (Array.isArray(postsResponse.posts)) {
      return postsResponse.posts;
    }
    if (postsResponse.results) {
      if (Array.isArray(postsResponse.results)) {
        return postsResponse.results;
      }
      if (postsResponse.results.data && Array.isArray(postsResponse.results.data)) {
        return postsResponse.results.data;
      }
    }
    
    return [];
  }, [postsResponse]);

  // Filter posts based on search query
  const posts = useMemo((): PostItem[] => {
    if (!searchQuery.trim()) {
      return allPosts;
    }

    const query = searchQuery.toLowerCase().trim();
    return allPosts.filter((post: PostItem) => {
      const title = (post.title || "").toLowerCase();
      const content = (post.content || "").toLowerCase();
      return title.includes(query) || content.includes(query);
    });
  }, [allPosts, searchQuery]);

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

  const handleCreatePostClick = () => {
    router.push("/main/create-post");
  };

  return (
    <div className="px-2 md:px-4 xl:px-10">
      {/* <Story /> */}
      
      {/* Create Post Section */}
      <div className="my-2 top-14 z-10">
        <div 
          onClick={handleCreatePostClick}
          className="bg-[#06133FBF] backdrop-blur-[17.5px] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20">
              {profile?.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.display_name || "User"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                  {(profile?.display_name || profile?.username || "U")[0].toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Input Box */}
            <div className="flex-1">
              <div className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white/60 placeholder-white/40 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-400/20 transition-all duration-300">
                <span className="text-sm">What&apos;s on your mind?</span>
              </div>
            </div>
          </div>
          
          {/* Action Icons */}
          <div className="flex items-center  justify-between mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreatePostClick();
                }}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <FiImage size={20} />
                <span className="text-sm">Photo/Video</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreatePostClick();
                }}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <FiLink size={20} />
                <span className="text-sm">Link</span>
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCreatePostClick();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-medium"
            >
              <FiEdit3 size={18} />
              <span className="text-nowrap text-xs md:text-md">Create Post</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 min-h-[calc(100vh-110px)]">
        {renderPosts()}
      </div>
    </div>
  );
};

export default Home;
