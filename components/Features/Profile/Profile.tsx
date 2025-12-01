"use client";

import React, { useMemo, useState } from "react";
import ProfileHeader from "./_components/ProfileHeader";
import AvatarModal from "./_components/AvatarModal";
import Post from "../Main/Post/Post";
import ProfileSidebar from "./_components/ProfileSidebar";
import { useGetMyPostsQuery } from "@/store/postApi";
import { useGetCurrentUserProfileQuery } from "@/store/authApi";
import CreatePost from "../CreatePost/CreatePost";

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "posts">("overview");
  const { data: postsResponse, isLoading, isError } = useGetMyPostsQuery();
  const { data: profileResponse } = useGetCurrentUserProfileQuery();
  const profile = profileResponse?.data;
  const posts = useMemo(() => {
    if (!postsResponse) return [];
    return (
      postsResponse.data ??
      postsResponse.results?.data ??
      postsResponse.posts ??
      []
    );
  }, [postsResponse]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
          <p className="text-gray-300 text-sm text-center">
            No posts available yet.
          </p>
      );
    }

    return (
      <div className="space-y-6">
        {posts.map((post) => (
          <Post key={post.id} post={post} profile={profile} />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="mx-auto flex gap-10 pt-6 lg:p-4">
        <div className="w-full bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-lg p-4 xl:p-10">
          <div className="border-b border-white/10 pb-4">
            <ProfileHeader onAvatarClick={openModal} />
            <div className="flex items-center gap-2 mt-4 overflow-x-hidden">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 rounded-lg cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-white text-black"
                    : "border border-white/10 text-white"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-6 py-3 rounded-lg cursor-pointer ${
                  activeTab === "posts"
                    ? "bg-white text-black"
                    : "border border-white/10 text-white"
                }`}
              >
                Posts
              </button>
            </div>
          </div>

          <div className=" space-y-6">
            {activeTab !== "overview" ? (
               <CreatePost isProfile={true}/>
            ) : (
          <div className="mt-6 space-y-6">
            {renderPosts()}
          </div>
            )}
          </div>
        </div>
        <div
          style={{ scrollbarGutter: "stable both-edges" }}
          className="h-[90vh] hidden lg:block rounded-lg w-[500px] sticky top-18 hover:overflow-y-auto overflow-y-hidden custom-scroll"
        >
          <ProfileSidebar />
        </div>
      </div>

      <AvatarModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default Profile;