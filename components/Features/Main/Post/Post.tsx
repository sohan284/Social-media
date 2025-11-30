"use client";

import Image from "next/image";
import React, { useMemo, useState, useEffect } from "react";
import { FaRegComment } from "react-icons/fa";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { VscThumbsup } from "react-icons/vsc";
import { AiFillLike } from "react-icons/ai";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { BiSend } from "react-icons/bi";
import type { PostItem, CommentItem } from "@/store/postApi";
import { useLikePostMutation, useGetCommentsQuery, useCreateCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from "@/store/postApi";
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
  profile?: Profile;
}

const Post = ({ post, profile }: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: number | string; username: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<number | string>>(new Set());
  const [editingComment, setEditingComment] = useState<number | string | null>(null);
  const [editText, setEditText] = useState("");
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(10);
  
  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const { data: commentsData, isLoading: isLoadingComments } = useGetCommentsQuery(post?.id, {
    skip: !showComments || !post?.id,
  });
  const [createComment, { isLoading: isCreatingComment }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdatingComment }] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

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

  const comments = useMemo(() => {
    const data = commentsData?.data || commentsData?.results || commentsData?.comments || [];
    // Organize comments into parent-child structure
    const commentMap = new Map<number | string, CommentItem & { replies: CommentItem[] }>();
    const topLevelComments: (CommentItem & { replies: CommentItem[] })[] = [];

    // First pass: create map of all comments
    data.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree structure
    data.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent) {
        const parentComment = commentMap.get(comment.parent);
        if (parentComment) {
          parentComment.replies.push(commentWithReplies);
        }
      } else {
        topLevelComments.push(commentWithReplies);
      }
    });

    // Sort replies within each comment by created_at (newest first)
    topLevelComments.forEach((comment) => {
      comment.replies.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Newest first
      });
    });

    // Reverse to show newest comments first
    return topLevelComments.reverse();
  }, [commentsData]);

  // Reset visible comments count when comments change or when opening comments section
  useEffect(() => {
    if (showComments) {
      setVisibleCommentsCount(10);
    }
  }, [showComments, comments.length]);

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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post?.id || isCreatingComment) return;
    
    try {
      await createComment({
        post: post.id,
        content: commentText,
      }).unwrap();
      setCommentText("");
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !post?.id || !replyingTo || isCreatingComment) return;
    
    try {
      await createComment({
        post: post.id,
        content: replyText,
        parent: replyingTo.id,
      }).unwrap();
      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to create reply:", error);
    }
  };

  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? "just now" : `${minutes}m ago`;
    }
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const toggleReplies = (commentId: number | string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleEditComment = (commentId: number | string, currentContent: string) => {
    setEditingComment(commentId);
    setEditText(currentContent);
  };

  const handleUpdateComment = async (e: React.FormEvent, commentId: number | string) => {
    e.preventDefault();
    if (!editText.trim() || !post?.id || isUpdatingComment) return;
    
    try {
      await updateComment({
        commentId,
        content: editText,
        postId: post.id,
      }).unwrap();
      setEditingComment(null);
      setEditText("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: number | string) => {
    if (!post?.id) return;
    
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment({
          commentId,
          postId: post.id,
        }).unwrap();
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }
  };

  const renderComment = (comment: CommentItem & { replies: CommentItem[] }, depth = 0) => {
    const commentAuthor = comment.author || comment.user;
    const authorName = commentAuthor?.username || comment.username || comment.user_name || "Anonymous";
    const authorAvatar = commentAuthor?.avatar || comment.avatar;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);
    const isCurrentUserComment = profile?.username === authorName;
    const isEditing = editingComment === comment.id;

    return (
      <div key={comment.id} className="relative">
        {/* Vertical line for nested comments */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-700" />
        )}
        
        <div className={`${depth > 0 ? "ml-10" : ""} pb-4`}>
          <div className="flex gap-2">
            {authorAvatar ? (
              <Image
                src={`${getApiBaseUrl()}${authorAvatar}`}
                alt={authorName}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{authorName}</span>
                <span className="text-xs text-white/50">• {formatCommentTime(comment.created_at)}</span>
              </div>
              
              {isEditing ? (
                <form onSubmit={(e) => handleUpdateComment(e, comment.id)} className="space-y-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isUpdatingComment || !editText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs px-3 py-1.5 rounded-md transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingComment(null);
                        setEditText("");
                      }}
                      className="text-white/60 hover:text-white text-xs px-3 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-sm text-white/90 mb-2 break-words">{comment.content}</p>
                  
                  <div className="flex items-center gap-4">
                    
                    <button
                      onClick={() => setReplyingTo({ id: comment.id, username: authorName })}
                      className="text-xs text-white/60 hover:text-white transition-colors"
                    >
                      Reply
                    </button>
                    {isCurrentUserComment && (
                      <>
                        <button
                          onClick={() => handleEditComment(comment.id, comment.content)}
                          className="text-xs text-white/60 hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reply Input */}
          {replyingTo?.id === comment.id && (
            <div className="mt-3 ml-10 flex gap-2">
              <div className="flex-1 flex gap-2 items-start">
                {profile?.avatar ? (
                  <Image
                    src={`${profile.avatar}`}
                    alt={profile.username}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {profile?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="flex-1">
                  <form onSubmit={handleReplySubmit} className="space-y-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${replyingTo.username}...`}
                      className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isCreatingComment || !replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs px-3 py-1.5 rounded-md transition-colors"
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="text-white/60 hover:text-white text-xs px-3 py-1.5"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Replies - Collapsible */}
          {hasReplies && (
            <div className="mt-3">
              <button
                onClick={() => toggleReplies(comment.id)}
                className="ml-10 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-xs text-white/80 rounded-full transition-colors"
              >
                {isExpanded 
                  ? `Hide ${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`
                  : `View ${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`
                }
              </button>
              
              {isExpanded && (
                <div className="mt-3">
                  {comment.replies.map((reply) => renderComment({ ...reply, replies: reply.replies || [] }, depth + 1))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
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

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex gap-3">
              {profile?.avatar ? (
                <Image
                  src={`${profile.avatar}`}
                  alt={profile.username}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {profile?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-slate-700/50 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isCreatingComment || !commentText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors"
                >
                  <BiSend size={18} />
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="text-white/60 text-center py-4">Loading comments...</div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.slice(0, visibleCommentsCount).map((comment) => (
                <div key={comment.id}>
                  {renderComment(comment)}
                </div>
              ))}
              {/* Show "Show more" button only after the last visible comment, aligned left like replies button */}
              {visibleCommentsCount < comments.length && (
                <div className="mt-3">
                  <button
                    onClick={() => setVisibleCommentsCount((prev) => Math.min(prev + 10, comments.length))}
                    className="ml-10 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-xs text-white/80 rounded-full transition-colors"
                  >
                    Show more comments
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-white/60 text-center py-8">No comments yet. Be the first to comment!</div>
          )}
        </div>
      )}

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