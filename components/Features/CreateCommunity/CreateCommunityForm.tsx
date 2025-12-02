"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaGlobe, FaEyeSlash, FaLock } from "react-icons/fa";
import { useCreateCommunityMutation } from "@/store/communityApi";
import { toast } from "sonner";

type FormValues = {
  name: string;
  description: string;
  banner?: FileList;
  icon?: FileList;
  visibility: "public" | "restricted" | "private";
};

const CreateCommunityForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState({ banner: false, icon: false });
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: { visibility: "public" },
  });
  const [createCommunity, { isLoading: isCreating }] = useCreateCommunityMutation();

  const onSubmit = async (data: FormValues) => {
    try {
      const bannerFile = data.banner && data.banner.length > 0 ? data.banner[0] : undefined;
      const iconFile = data.icon && data.icon.length > 0 ? data.icon[0] : undefined;

      await createCommunity({
        name: data.name,
        description: data.description,
        visibility: data.visibility,
        banner: bannerFile,
        icon: iconFile,
        // Initial post data for this community
        title: data.name,
        content: data.description,
        post_type: "text",
        tags: [],
      }).unwrap();

      toast.success("Community created successfully!", {
        description: `Your community "${data.name}" has been created.`,
      });

      // Navigate to home or community page
      router.push("/main");
    } catch (error: unknown) {
      console.error('Error creating community:', error);
      const errorMessage = 
        (error && typeof error === 'object' && 'data' in error && 
         error.data && typeof error.data === 'object' && 
         ('message' in error.data || 'detail' in error.data))
          ? (error.data as { message?: string; detail?: string }).message || 
            (error.data as { message?: string; detail?: string }).detail
          : "Failed to create community. Please try again.";
      
      toast.error("Error creating community", {
        description: errorMessage || "Failed to create community. Please try again.",
      });
    }
  };

  const name = watch("name") || "Community Name";
  const description = watch("description") || "Your community description";

  const handleFileChange = (file: File | null, type: 'banner' | 'icon') => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'banner') {
          setBannerPreview(result);
        } else {
          setIconPreview(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (type === 'banner') {
        setBannerPreview(null);
      } else {
        setIconPreview(null);
      }
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent, type: 'banner' | 'icon') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'banner' | 'icon') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0], type);
    }
  };

  return (
    <div className="flex items-center justify-center  bg-cover bg-center text-white p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-4xl bg-[#06133FBF] backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex flex-col md:flex-row p-6 md:p-10 gap-8"
      >
        {/* Left Section */}
        <div className="flex-1 space-y-6">
          {step === 1 && (
            <>
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Tell us about your community
                </h2>
                <p className="text-sm text-gray-300">
                  A name and description help people understand what your
                  community is all about
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Community Name
                  </label>
                  <input
                    {...register("name", { required: true })}
                    className="w-full p-2.5 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    {...register("description", { required: true })}
                    className="w-full p-2.5 rounded-lg bg-white/10 border border-white/20 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-full"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Style your Community
                </h2>
                <p className="text-sm text-gray-300">
                  Adding visual flair will catch new members’ attention and help
                  establish your community’s culture.
                </p>
              </div>

              <div className="space-y-6">
                {/* Banner Upload */}
                <div>
                  <label className="block mb-3 font-medium">Banner</label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                      dragActive.banner
                        ? 'border-purple-400 bg-purple-500/20 scale-105'
                        : 'border-white/30 hover:border-purple-400 hover:bg-white/5'
                    }`}
                    onDragEnter={(e) => handleDrag(e, 'banner')}
                    onDragLeave={(e) => handleDrag(e, 'banner')}
                    onDragOver={(e) => handleDrag(e, 'banner')}
                    onDrop={(e) => handleDrop(e, 'banner')}
                    onClick={() => document.getElementById('banner-upload')?.click()}
                  >
                    <input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      {...register("banner")}
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'banner')}
                      className="hidden"
                    />
                    
                    {bannerPreview ? (
                      <div className="relative w-full h-40">
                        <Image
                          src={bannerPreview}
                          alt="Banner preview"
                          fill
                          className="object-cover rounded-lg border border-white/20"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-sm text-white">Click to change</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-white">Upload Banner</p>
                          <p className="text-sm text-gray-300">Drag & drop or click to browse</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Icon Upload */}
                <div>
                  <label className="block mb-3 font-medium">Icon</label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
                      dragActive.icon
                        ? 'border-purple-400 bg-purple-500/20 scale-105'
                        : 'border-white/30 hover:border-purple-400 hover:bg-white/5'
                    }`}
                    onDragEnter={(e) => handleDrag(e, 'icon')}
                    onDragLeave={(e) => handleDrag(e, 'icon')}
                    onDragOver={(e) => handleDrag(e, 'icon')}
                    onDrop={(e) => handleDrop(e, 'icon')}
                    onClick={() => document.getElementById('icon-upload')?.click()}
                  >
                    <input
                      id="icon-upload"
                      type="file"
                      accept="image/*"
                      {...register("icon")}
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'icon')}
                      className="hidden"
                    />
                    
                    {iconPreview ? (
                      <div className="relative w-20 h-20 mx-auto">
                        <Image
                          src={iconPreview}
                          alt="Icon preview"
                          fill
                          className="object-cover rounded-full border-2 border-white/20"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-xs text-white">Change</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Upload Icon</p>
                          <p className="text-xs text-gray-300">Drag & drop or click to browse</p>
                          <p className="text-xs text-gray-400 mt-1">Square image recommended</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-full"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2 bg-[#104F01] hover:bg-[#104F01]/90 rounded-full"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  What kind of community is this?
                </h2>
                <p className="text-sm text-gray-300">
                  Decide who can view and contribute in your communities.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 cursor-pointer">
                  <input
                    type="radio"
                    value="public"
                    {...register("visibility")}
                    className="accent-purple-500"
                  />
                  <FaGlobe className="text-lg" />
                  <div>
                    <p className="font-medium">Public</p>
                    <p className="text-sm text-gray-300">
                      Anyone can view, post, and comment.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 cursor-pointer">
                  <input
                    type="radio"
                    value="restricted"
                    {...register("visibility")}
                    className="accent-purple-500"
                  />
                  <FaEyeSlash className="text-lg" />
                  <div>
                    <p className="font-medium">Restricted</p>
                    <p className="text-sm text-gray-300">
                      Anyone can view, but only approved users can contribute.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 cursor-pointer">
                  <input
                    type="radio"
                    value="private"
                    {...register("visibility")}
                    className="accent-purple-500"
                  />
                  <FaLock className="text-lg" />
                  <div>
                    <p className="font-medium">Private</p>
                    <p className="text-sm text-gray-300">
                      Only approved users can view and contribute.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Preview */}
        <div className="hidden md:flex flex-col justify-center w-72 h-fit bg-white/10 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
          {bannerPreview && (
            <div className="mb-4 relative w-full h-24">
              <Image
                src={bannerPreview}
                alt="Community banner"
                fill
                className="object-cover rounded-lg"
                unoptimized
              />
            </div>
          )}
          <div className="flex items-center justify-center mb-3">
            {iconPreview ? (
              <div className="relative w-12 h-12">
                <Image
                  src={iconPreview}
                  alt="Community icon"
                  fill
                  className="object-cover rounded-full border-2 border-white/20"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-300 mt-1">{description}</p>
          <div className="flex justify-center gap-2 mt-4 text-xs text-gray-400">
            <span>1 member</span>•<span>1 online</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCommunityForm;
