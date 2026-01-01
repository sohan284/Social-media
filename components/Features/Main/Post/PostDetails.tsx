"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetPostByIdQuery } from '@/store/postApi';
import Post from './Post';
import { useGetCurrentUserProfileQuery } from '@/store/authApi';
import { IoArrowBack } from 'react-icons/io5';

interface PostDetailsProps {
  postId: string | number;
}

const PostDetails: React.FC<PostDetailsProps> = ({ postId }) => {
  const router = useRouter();
  const { data: postResponse, isLoading, isError } = useGetPostByIdQuery(postId);
  const { data: profileResponse } = useGetCurrentUserProfileQuery();
  const profile = profileResponse?.data;

  const post = postResponse?.data;

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-red-400 text-lg mb-4">Post not found or failed to load.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
      >
        <IoArrowBack className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Post Details */}
      <div className="max-w-4xl mx-auto">
        <Post post={post} profile={profile} />
      </div>
    </div>
  );
};

export default PostDetails;

