"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import { FaRegComment } from "react-icons/fa";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { VscThumbsup } from "react-icons/vsc";
import type { PostItem } from "@/store/postApi";

interface PostProps {
  post: PostItem;
}

const fallbackAvatar = "/profile.jpg";
const fallbackMedia = "/post.jpg";

const Post = ({ post }: PostProps) => {
  const [showComments, setShowComments] = useState(false);

  const createdAt = useMemo(() => {
    if (!post?.created_at) return "just now";
    const date = new Date(post?.created_at);
    if (Number.isNaN(date.getTime())) return post?.created_at;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [post?.created_at]);

  const primaryMedia = post?.media_file?.[0] || fallbackMedia;

  return (
    <div className="border border-slate-600 md:p-6 p-4 w-full rounded">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-[7px]">
          {/* <Image
            src={post?.author?.avatar || "/profile.jpg"}
            alt={post?.display_name || "Author Avatar"}
            width={22}
            height={22}
            className="h-[30px] w-[30px] md:h-[32px] md:w-[32px] rounded-full object-cover"
          /> */}
          <div className="flex flex-col sm:flex-row items-center md:gap-3.5 text-sm text-white">
            <p>{post?.user_name || post?.username || "Author Name"}</p>
            <p className="text-white/70 text-xs sm:text-sm">{createdAt}</p>
          </div>
        </div>
        <button className="text-sm text-white cursor-pointer">Follow</button>
      </div>

      <div>
        <p className="text-base text-white mb-5 whitespace-pre-line">
          {post?.content || "No description provided."}
        </p>
        {primaryMedia && (
          <div className="rounded-lg overflow-hidden">
            {/* <Image
              src={primaryMedia}
              alt={post?.title || "post media"}
              width={800}
              height={500}
              className="w-full h-full object-cover"
            /> */}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4">
        <button className="text-sm text-white cursor-pointer flex items-center gap-2 px-2.5 py-[5px] bg-slate-700 rounded-full">
          <VscThumbsup size={18} /> 0
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-sm text-white cursor-pointer flex items-center gap-2 px-2.5 py-[5px] bg-slate-700 rounded-full"
        >
          <FaRegComment size={18} /> 0
        </button>
        <button className="text-sm text-white cursor-pointer flex items-center gap-2 px-2.5 py-[5px] bg-slate-700 rounded-full">
          <FaRegShareFromSquare size={18} /> Share
        </button>
      </div>
      {/* {showComments && <CommentSection />} */}
    </div>
  );
};

export default Post;
