"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import { FaRegComment } from "react-icons/fa";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { VscThumbsup } from "react-icons/vsc";
import { AiFillLike } from "react-icons/ai";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import type { PostItem } from "@/store/postApi";
import { useLikePostMutation } from "@/store/postApi";
import { getApiBaseUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
 interface Profile {
  id: string | number;
  username: string;
  email: string;
  display_name: string;
  avatar: string;
  cover_photo: string;
 }
interface PostProps {
  post: PostItem;
  profile?: Profile ;
}

const Post = ({ post, profile }: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [likeId, setLikeId] = useState<number | string | undefined>(undefined);

  const isLiked = post?.is_liked || false;
  const likeCount = post?.likes_count as number || 0;

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

  const allMediaUrls = useMemo(() => {
    if (!post?.media_file || post.media_file.length === 0) return [];
    const apiBase = getApiBaseUrl();
    const baseUrl = apiBase.endsWith("/") ? apiBase : `${apiBase}/`;
    return post.media_file.map((mediaPath) => {
      const cleanPath = mediaPath.startsWith("/") ? mediaPath.slice(1) : mediaPath;
      return `${baseUrl}media/${cleanPath}`;
    });
  }, [post?.media_file]);

  const content = post?.content || "No description provided.";
  const words = content.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;
  const shouldTruncate = wordCount > 50;
  const truncatedContent = useMemo(() => {
    if (!shouldTruncate || isContentExpanded) return content;
    return words.slice(0, 50).join(" ") + "...";
  }, [content, shouldTruncate, isContentExpanded, words]);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allMediaUrls.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < allMediaUrls.length - 1 ? prev + 1 : 0));
  };

  const handleLikeClick = async () => {
    if (!post?.id || isLiking) return;
    try {
      if (isLiked) {
        await likePost({ postId: post.id, isLiked: false }).unwrap();
      } else {
        await likePost({ postId: post.id, isLiked: true }).unwrap();
      }
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const renderImageGallery = () => {
    if (allMediaUrls.length === 0) return null;

    const imageCount = allMediaUrls.length;
    const displayImages = imageCount > 5 ? allMediaUrls.slice(0, 5) : allMediaUrls;
    const remainingCount = imageCount > 5 ? imageCount - 5 : 0;

    // 1 image: full width
    if (imageCount === 1) {
      return (
        <div className="rounded-lg overflow-hidden cursor-pointer" onClick={() => handleImageClick(0)}>
          <Image
            src={allMediaUrls[0]}
            alt={post?.title || "post media"}
              width={800}
              height={400}
            className="w-full h-[50vh] object-contain"
            unoptimized
          />
        </div>
      );
    }

    // 2 images: 2 column grid
    if (imageCount === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
          {displayImages.map((url, idx) => (
            <div key={idx} className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(idx)}>
              <Image
                src={url}
                alt={`${post?.title || "post"} ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      );
    }

    // 3 images: first full width, second row 2 columns
    if (imageCount === 3) {
      return (
        <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
          <div className="row-span-2 relative cursor-pointer" onClick={() => handleImageClick(0)}>
            <Image
              src={allMediaUrls[0]}
              alt={`${post?.title || "post"} 1`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(1)}>
            <Image
              src={allMediaUrls[1]}
              alt={`${post?.title || "post"} 2`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(2)}>
            <Image
              src={allMediaUrls[2]}
              alt={`${post?.title || "post"} 3`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      );
    }

    // 4 images: 2x2 grid
    if (imageCount === 4) {
      return (
        <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
          {displayImages.map((url, idx) => (
            <div key={idx} className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(idx)}>
              <Image
                src={url}
                alt={`${post?.title || "post"} ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      );
    }

    // 5 images: first row 2, second row 3
    if (imageCount === 5) {
      return (
        <div className="space-y-2 rounded-lg overflow-hidden">
          {/* First row: 2 images */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(0)}>
              <Image
                src={allMediaUrls[0]}
                alt={`${post?.title || "post"} 1`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(1)}>
              <Image
                src={allMediaUrls[1]}
                alt={`${post?.title || "post"} 2`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
          {/* Second row: 3 images */}
          <div className="grid grid-cols-3 gap-2">
            <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(2)}>
              <Image
                src={allMediaUrls[2]}
                alt={`${post?.title || "post"} 3`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(3)}>
              <Image
                src={allMediaUrls[3]}
                alt={`${post?.title || "post"} 4`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(4)}>
              <Image
                src={allMediaUrls[4]}
                alt={`${post?.title || "post"} 5`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      );
    }

    // More than 5 images: first row 2, second row 3 (last one with overlay)
    return (
      <div className="space-y-2 rounded-lg overflow-hidden">
        {/* First row: 2 images */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(0)}>
            <Image
              src={allMediaUrls[0]}
              alt={`${post?.title || "post"} 1`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(1)}>
            <Image
              src={allMediaUrls[1]}
              alt={`${post?.title || "post"} 2`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
        {/* Second row: 3 images (last one with overlay) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(2)}>
            <Image
              src={allMediaUrls[2]}
              alt={`${post?.title || "post"} 3`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(3)}>
            <Image
              src={allMediaUrls[3]}
              alt={`${post?.title || "post"} 4`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="relative aspect-square cursor-pointer" onClick={() => handleImageClick(4)}>
            <Image
              src={allMediaUrls[4]}
              alt={`${post?.title || "post"} 5`}
              fill
              className="object-cover opacity-30"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-center text-white">
                <div className="text-2xl font-bold">+{remainingCount}</div>
                <div className="text-sm">more</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="border border-slate-600 md:p-6 p-4 w-full rounded">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-[7px]">
          {post?.avatar || profile?.avatar ? (
            <Image
              src={`${getApiBaseUrl()}${post?.avatar as string || "/profile.jpg"}`}
              alt={post?.author?.name || post?.user_name || "Author Avatar"}
              width={22}
              height={22}
              className="h-[30px] w-[30px] md:h-[32px] md:w-[32px] rounded-full object-cover"
            />
          ) : (
            <div className="h-[30px] w-[30px] md:h-[32px] md:w-[32px] rounded-full bg-slate-300 flex items-center justify-center text-slate-700 text-sm font-medium">
              {(post?.user_name || post?.username || "A").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center md:gap-3.5 text-sm text-white">
            <p>{post?.user_name || post?.username || "Author Name"}</p>
            <p className="text-white/70 text-xs sm:text-sm">{createdAt}</p>
          </div>
        </div>
        <button className="text-sm text-white cursor-pointer">Follow</button>
      </div>

      <div>
        <div className="mb-5">
          <p dangerouslySetInnerHTML={{ __html: truncatedContent }} className="text-base text-white whitespace-pre-line">
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              className="text-base text-white font-bold mt-2 hover:underline cursor-pointer"
            >
              {isContentExpanded ? "See less" : "See more"}
            </button>
          )}
        </div>
        {allMediaUrls.length > 0 && (
          <div className="mb-5">
            {renderImageGallery()}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4">
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className={`text-sm text-white cursor-pointer flex items-center gap-2 px-2.5 py-[5px] rounded-full transition-colors ${
            isLiked
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-slate-700 hover:bg-slate-600"
          } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLiked ? (
            <AiFillLike size={18} className="text-blue-200" />
          ) : (
            <VscThumbsup size={18} />
          )}{" "}
          {likeCount}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-sm text-white cursor-pointer flex items-center gap-2 px-2.5 py-[5px] bg-slate-700 rounded-full"
        >
          <FaRegComment size={18} /> {post?.comments_count as number || 0}
        </button>
        <button className="text-sm text-white cursor-pointer flex items-center gap-2 px-2.5 py-[5px] bg-slate-700 rounded-full">
          <FaRegShareFromSquare size={18} /> Share
        </button>
      </div>
      {/* {showComments && <CommentSection />} */}

      {/* Image Preview Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-6xl w-full p-0 bg-black/80 border-none">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 z-50 rounded-full hover:scale-105 duration-300 ease-in-out bg-black cursor-pointer p-2 text-white hover:bg-black/90 transition-colors"
            >
              <IoMdClose size={24} />
            </button>

            {/* Previous Button */}
            {allMediaUrls.length > 1 && (
              <button
                onClick={handlePreviousImage}
                className="absolute left-4 z-50 rounded-full bg-black/70 p-3 text-white hover:bg-black/90 transition-colors"
              >
                <IoChevronBack size={28} />
              </button>
            )}

            {/* Image */}
            {allMediaUrls[currentImageIndex] && (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={allMediaUrls[currentImageIndex]}
                  alt={`${post?.title || "post"} ${currentImageIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                  unoptimized
                />
              </div>
            )}

            {/* Next Button */}
            {allMediaUrls.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 z-50 rounded-full bg-black/70 p-3 text-white hover:bg-black/90 transition-colors"
              >
                <IoChevronForward size={28} />
              </button>
            )}

            {/* Image Counter */}
            {allMediaUrls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white text-sm">
                {currentImageIndex + 1} / {allMediaUrls.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Post;
