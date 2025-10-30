"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { FaUpload } from "react-icons/fa";
import { SellType } from "../../../../../types/types";

const inputClass =
  "w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-sm sm:text-base";

export default function SalePage() {
  const { register, handleSubmit, watch, reset } = useForm<
    SellType & { image: File | null }
  >();
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const onSubmit = (data: SellType & { image: File | null }) => {
    console.log(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      alert("Selected image is greater than 3MB");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageSrc(previewUrl);
  };

  // Watch fields for live preview
  const watchFields = watch();

  return (
    <div className=" text-white flex flex-col md:flex-row items-start justify-center gap-8 p-2 md:p-6">
      {/* Left Side - Form */}
      <div className="w-full max-w-[1220px] mx-auto  backdrop-blur-[17px] rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Item For Sale
        </h2>
        <p className="text-sm mb-3 text-gray-300">Required</p>

        {/* Image Upload */}
        <div className="flex flex-wrap gap-4 mb-5">
          <label className="flex flex-col items-center justify-center w-40 h-32  border border-gray-400/40 rounded-md cursor-pointer hover:bg-black/40 transition">
            <FaUpload className="text-2xl text-gray-300 mb-2" />
            <span className="text-sm text-gray-300">Add Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
          {imageSrc && (
            <div className="w-40 h-32 rounded-md overflow-hidden">
              <Image
                src={imageSrc}
                alt="preview"
                width={160}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <input
            {...register("title")}
            placeholder="Title"
            className={inputClass}
          />
          <input
            {...register("price")}
            placeholder="Price"
            type="number"
            className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          />
          <input
            {...register("categories")}
            placeholder="Categories"
            className={inputClass}
          />
          <input
            {...register("productUrl")}
            placeholder="Product URL"
            type="url"
            className={inputClass}
          />

          {/* Buttons */}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => reset()}
              className="w-32 bg-gray-400/60 hover:bg-gray-500 text-black py-2 rounded-full font-semibold duration-300 transition-all cursor-pointer"
            >
              Draft
            </button>
            <button
              type="submit"
              className="w-32 bg-[#007406] hover:bg-green-700 py-2 rounded-full font-semibold duration-300 transition-all cursor-pointer"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
