"use client";

import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FiImage,
  FiLink,
  FiType,
  FiSave,
  FiSend,
} from "react-icons/fi";
import { IoMdClose } from "react-icons/io";

interface FormData {
  title: string;
  content: string;
  tags: string[];
  postType: "text" | "image" | "link";
  linkUrl?: string;
  files?: FileList;
}

const CreatePost = () => {
  const [activeTab, setActiveTab] = useState<"text" | "image" | "link">("text");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setValue("files", files);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Form data:", data);
      alert(
        isDraft ? "Draft saved successfully!" : "Post published successfully!"
      );
      reset();
      setTags([]);
      setTagInput("");
    } catch (error) {
      console.error("Error submitting form:", error);
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
                <Controller
                  name="files"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => {
                        field.onChange(e.target.files);
                        handleFileUpload(e);
                      }}
                      className="hidden"
                    />
                  )}
                />
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
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave size={18} />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting || !titleValue?.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <FiSend size={18} />
                {isSubmitting ? "Publishing..." : "Publish Post"}
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
    </div>
  );
};

export default CreatePost;
