"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { FaUpload } from "react-icons/fa";


type FormData = {
  title: string;
  price: number;
  categories: string;
  condition: string;
  color: string;
  description: string;
  location: string;
};


const inputClass = "w-full px-4 py-2 rounded-md border border-gray-400/40 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-purple-500 transition"

export default function SalePage() {
  const { register, handleSubmit, watch, reset } = useForm<FormData>();
  const [images, setImages] = useState<string[]>([]);

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages(previews);
  };

  // Watch fields for live preview
  const watchFields = watch();

  return (
    <div className=" text-white flex flex-col md:flex-row items-start justify-center gap-8 p-6">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 bg-[#06133FBF] backdrop-blur-[17px] rounded-2xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Item For Sale</h2>
        <p className="text-sm mb-3 text-gray-300">Required</p>

        {/* Image Upload */}
        <div className="flex flex-wrap gap-4 mb-5">
          <label className="flex flex-col items-center justify-center w-40 h-32 bg-gray-200/20 border border-gray-400/40 rounded-md cursor-pointer hover:bg-gray-200/30 transition">
            <FaUpload className="text-2xl text-gray-300 mb-2" />
            <span className="text-sm text-gray-300">Add Photos</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
          {images.map((src, idx) => (
            <div key={idx} className="w-40 h-32 rounded-md overflow-hidden">
              <Image
                src={src}
                alt={`preview-${idx}`}
                width={160}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
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
            className={inputClass}
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
            rows={3}
            className={inputClass + " resize-none"}
          />
          <input
            {...register("location")}
            placeholder="Location"
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

      {/* Right Side - Preview */}
      <div className="w-full md:w-1/2 bg-[#06133FBF] backdrop-blur-[17px] rounded-2xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Preview</h2>

        <div className="bg-white/10 rounded-lg overflow-hidden">
          {images.length > 0 ? (
            <Image
              src={images[0]}
              alt="preview"
              width={800}
              height={400}
              className="object-cover w-full h-64"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center text-gray-400">
              No Image Selected
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2 text-gray-200">
          <h3 className="text-lg font-semibold">
            {watchFields.title || "Item Name"}
          </h3>
          <p className="text-green-400 text-xl font-bold">
            {watchFields.price ? `$${watchFields.price}` : "$0"}
          </p>
          <p>
            <span className="font-semibold">Condition:</span>{" "}
            {watchFields.condition || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Color:</span>{" "}
            {watchFields.color || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Description:</span>{" "}
            {watchFields.description || "No description"}
          </p>
          <p>
            <span className="font-semibold">Location:</span>{" "}
            {watchFields.location || "Not specified"}
          </p>
        </div>
      </div>
    </div>
  );
}
