"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGlobe, FaEyeSlash, FaLock } from "react-icons/fa";

type FormValues = {
  name: string;
  description: string;
  banner?: FileList;
  icon?: FileList;
  visibility: "public" | "restricted" | "private";
};

const CreateCommunityForm = () => {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: { visibility: "public" },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    alert("Community Created!");
  };

  const name = watch("name") || "Community Name";
  const description = watch("description") || "Your community description";

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
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
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

              <div className="space-y-5">
                <div>
                  <label className="block mb-1 font-medium">Banner</label>
                  <input
                    type="file"
                    accept="image/*"
                    {...register("banner")}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Icon</label>
                  <input
                    type="file"
                    accept="image/*"
                    {...register("icon")}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-md"
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-md"
                >
                  Create
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Preview */}
        {/* <div className="hidden md:flex flex-col justify-center w-72 h-fit bg-white/10 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-300 mt-1">{description}</p>
          <div className="flex justify-center gap-2 mt-4 text-xs text-gray-400">
            <span>1 member</span>•<span>1 online</span>
          </div>
        </div> */}
      </form>
    </div>
  );
};

export default CreateCommunityForm;
