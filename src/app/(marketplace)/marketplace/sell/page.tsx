"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { FaUpload } from "react-icons/fa";
import { SellType } from "../../../../../types/types";

const inputClass =
  "w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-sm sm:text-base";

export default function SalePage() {
  const { register, handleSubmit, watch, reset, setValue } = useForm<
    SellType & { images: File[] }
  >({
    defaultValues: {
      images: [],
    },
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const onSubmit = (data: SellType & { images: File[] }) => {
    console.log(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      alert("Selected image is greater than 3MB");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const newPreviews = [...imagePreviews];
    newPreviews[index] = previewUrl;
    setImagePreviews(newPreviews);

    const currentImages = watch("images") || [];
    const newImages = [...currentImages];
    newImages[index] = file;
    setValue("images", newImages);
  };

  const watchFields = watch();
  const previewImage = imagePreviews[0] || null;

  return (
    <div className="text-white flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-6 ">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/3 backdrop-blur-[17px] rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Item For Sale
        </h2>
        
        <p className="text-sm mb-4 text-gray-300">Required</p>

        {/* Image Upload - Two photo buttons */}
        <div className="flex flex-wrap gap-4 mb-2">
          {[0].map((index) => (
            <div key={index}>
              {imagePreviews[index] ? (
                <div className="w-40 h-32 rounded-md overflow-hidden border border-white/20">
                  <Image
                    src={imagePreviews[index]}
                    alt={`preview-${index}`}
                    width={160}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-40 h-32 bg-black/30 border border-gray-400/40 rounded-md cursor-pointer hover:bg-black/40 transition">
                  <FaUpload className="text-2xl text-gray-300 mb-2" />
                  <span className="text-sm text-gray-300">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, index)}
                  />
                </label>
              )}
            </div>
          ))}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            {...register("condition")}
            placeholder="Condition"
            className={inputClass}
          />
          <input
            {...register("color")}
            placeholder="Color"
            className={inputClass}
          />
          <textarea
            {...register("description")}
            placeholder="Description"
            rows={4}
            className={inputClass}
          />
          <input
            {...register("location")}
            placeholder="Location"
            className={inputClass}
          />

          {/* Buttons */}
          <div className="flex justify-between mt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                setImagePreviews([]);
              }}
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

      {/* Right Side - Preview */}
      <div className="w-full lg:w-2/3 backdrop-blur-[17px] rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">Preview</h2>
        
        {/* Preview Image */}
        <div className="w-full h-[500px] mb-6 rounded-lg overflow-hidden bg-black/30 border border-white/20">
          {previewImage ? (
            <Image
              src={previewImage}
              alt="Item preview"
              width={600}
              height={600}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>No image uploaded</span>
            </div>
          )}
        </div>

        {/* Preview Details */}
        <div className="space-y-3">
          <div className="flex justify-between mx-20 items-start">
            <h3 className="text-xl font-semibold">
              {watchFields.title || "Item Title"}
            </h3>
            {watchFields.price && (
              <span className="text-xl font-semibold text-green-400">
                ${watchFields.price}
              </span>
            )}
          </div>
          
          {watchFields.condition && (
            <p className="text-sm text-gray-300">
              <span className="font-medium">Condition:</span> {watchFields.condition}
            </p>
          )}
          
          {watchFields.color && (
            <p className="text-sm text-gray-300">
              <span className="font-medium">Color:</span> {watchFields.color}
            </p>
          )}
          
          {watchFields.description && (
            <p className="text-sm text-gray-300">
              <span className="font-medium">Description:</span> {watchFields.description}
            </p>
          )}
          
          {watchFields.location && (
            <p className="text-sm text-gray-300">
              <span className="font-medium">Location:</span> {watchFields.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
