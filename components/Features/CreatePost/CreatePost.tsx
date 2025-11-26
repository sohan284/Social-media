"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import {
  FiImage,
  FiLink,
  FiSave,
  FiSend,
  FiType,
} from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type CreatePostRequest,
  useCreatePostMutation,
} from "@/store/postApi";
import { toast } from "@/components/ui/sonner";

interface FormData {
  title: string;
  content: string;
  tags: string[];
  postType: "text" | "image" | "link";
  linkUrl?: string;
  files?: File[];
}

type MediaPreview = {
  id: string;
  file: File;
  url: string;
};

const CreatePost = () => {
  const [activeTab, setActiveTab] = useState<"text" | "image" | "link">("text");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<MediaPreview[]>([]);
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((media) => URL.revokeObjectURL(media.url));
    };
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      content: "",
      tags: [],
      postType: "text",
      linkUrl: "",
      files: [],
    },
  });

  const titleValue = watch("title");
  const contentValue = watch("content");

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag) && tags.length < 5) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        setValue("tags", updatedTags);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    setValue("tags", updatedTags);
  };

  const createPreviewEntry = (file: File): MediaPreview => ({
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${file.name}-${file.lastModified}-${Math.random()}`,
    file,
    url: URL.createObjectURL(file),
  });

  const updateFormFiles = (items: MediaPreview[]) => {
    previewsRef.current = items;
    setValue("files", items.length ? items.map((item) => item.file) : undefined);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newEntries = Array.from(files).map(createPreviewEntry);
      setMediaPreviews((prev) => {
        const updated = [...prev, ...newEntries];
        updateFormFiles(updated);
        return updated;
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMediaPreviews((prev) => {
      const target = prev.find((media) => media.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      const updated = prev.filter((media) => media.id !== id);
      updateFormFiles(updated);

      if (updated.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return updated;
    });
  };

  const derivePostType = (): CreatePostRequest["post_type"] => {
    if (activeTab === "image") return "media";
    if (activeTab === "link") return "link";
    return "text";
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createPost({
        title: data.title,
        content: data.content ?? "",
        link: data.linkUrl ?? "",
        tags: data.tags ?? [],
        media_files: data.files ?? [],
        post_type: derivePostType(),
      }).unwrap();

      toast.success(
        isDraft ? "Draft saved successfully!" : "Post published successfully!"
      );
      setIsMediaModalOpen(false);
      reset();
      setTags([]);
      setTagInput("");
      mediaPreviews.forEach((media) => URL.revokeObjectURL(media.url));
      setMediaPreviews([]);
      updateFormFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit post. Please try again.");
    }
  };

  const handleDraft = () => {
    setIsDraft(true);
    handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setIsDraft(false);
    handleSubmit(onSubmit)();
  };

  const tabs = [
    { id: "text", label: "Text", icon: FiType },
    { id: "image", label: "Image & Videos", icon: FiImage },
    { id: "link", label: "Link", icon: FiLink },
  ] as const;

  return (
    <div
      className=" bg-cover bg-center bg-no-repeat p-4"
    >
      <div className="bg-[#06133FBF] max-w-[1220px] backdrop-blur-[17.5px] mx-auto border border-white/10 rounded-2xl">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Post Type Tabs */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-between">
              <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setValue("postType", tab.id);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mb-6 md:mb-0 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Create New Post
                </h1>
                <p className="text-gray-300">
                  Share your thoughts with the community
                </p>
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-white font-medium">Title</label>
              <div className="relative">
                <input
                  {...register("title", {
                    required: "Title is required",
                    maxLength: {
                      value: 300,
                      message: "Title must be less than 300 characters",
                    },
                  })}
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                  placeholder="Enter your post title..."
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {titleValue?.length || 0}/300
                </div>
              </div>
              {errors.title && (
                <p className="text-red-400 text-sm">{errors.title.message}</p>
              )}
            </div>

            {/* Tags Section */}
            <div className="space-y-3">
              <label className="block text-white font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-400/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-400 transition-colors"
                    >
                      <IoMdClose size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Add tags (press Enter to add, max 5)"
                className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                disabled={tags.length >= 5}
              />
              {tags.length >= 5 && (
                <p className="text-yellow-400 text-sm">
                  Maximum 5 tags allowed
                </p>
              )}
            </div>

            {/* Content based on post type */}
            {activeTab === "text" && (
              <div className="space-y-2">
                <label className="block text-white font-medium">
                  Body Text (optional)
                </label>
                <textarea
                  {...register("content")}
                  rows={8}
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 resize-none"
                  placeholder="Write your post content here..."
                />
              </div>
            )}

            {activeTab === "image" && (
              <div className="space-y-4">
                <label className="block text-white font-medium">
                  Upload Images & Videos
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400/50 hover:bg-purple-500/5 transition-all duration-300"
                >
                  <FiImage size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-white mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-400 text-sm">
                    Images and videos up to 10MB each
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {mediaPreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {mediaPreviews.slice(0, 5).map((media, idx) => {
                      const isOverflowTile =
                        idx === 4 && mediaPreviews.length > 5;
                      return (
                        <button
                          type="button"
                          key={media.id}
                          onClick={() => setIsMediaModalOpen(true)}
                          className="relative w-full h-28 rounded-lg overflow-hidden border border-white/10 group"
                        >
                          <Image
                            src={media.url}
                            alt={`Preview ${idx + 1}`}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 50vw, 20vw"
                            className="object-cover"
                          />
                          {isOverflowTile && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-semibold">
                              +{mediaPreviews.length - 4} more
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "link" && (
              <div className="space-y-2">
                <label className="block text-white font-medium">Link URL</label>
                <input
                  {...register("linkUrl", {
                    required:
                      activeTab === "link" ? "Link URL is required" : false,
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Please enter a valid URL",
                    },
                  })}
                  type="url"
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                  placeholder="https://example.com"
                />
                {errors.linkUrl && (
                  <p className="text-red-400 text-sm">
                    {errors.linkUrl.message}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-">
              <button
                type="button"
                onClick={handleDraft}
                disabled={isSubmitting || isCreating}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave size={18} />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting || isCreating || !titleValue?.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <FiSend size={18} />
                {isSubmitting || isCreating
                  ? "Publishing..."
                  : "Publish Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Character Count for Content */}
        {activeTab === "text" && contentValue && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Content length: {contentValue.length} characters
            </p>
          </div>
        )}
      </div>
      <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Uploaded media ({mediaPreviews.length})
            </DialogTitle>
          </DialogHeader>
          {mediaPreviews.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No media selected yet. Upload images to preview them here.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {mediaPreviews.map((media) => (
                <div
                  key={media.id}
                  className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10"
                >
                  <Image
                    src={media.url}
                    alt="Uploaded media"
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(media.id)}
                    className="absolute top-2 right-2 rounded-full bg-black/70 p-2 text-white hover:bg-black/90"
                  >
                    <IoMdClose size={16} />
                    <span className="sr-only">Remove media</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePost;
