"use client";
import React from 'react';
import { useForm } from "react-hook-form";
import { FaPhone, FaEnvelope, FaTwitter, FaFacebook, FaInstagram, FaTelegramPlane } from "react-icons/fa";

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactUs() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit = (data: Inputs) => console.log(data)

  return (
    <div className="max-w-[1220px] mx-auto px-4 py-8 text-white">
      <div className="bg-[#06133FBF] backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6 md:p-10">
        {/* Header Section */}
        <div className='text-center mb-12'>
          <h4 className="text-2xl font-semibold text-purple-400">Contact US</h4>
          <h1 className="text-4xl font-bold my-4 text-white">Get in Touch</h1>
          <h5 className="text-gray-300 max-w-2xl mx-auto">
            Have a question in mind or any Feedback? Feel free to contact us using the form below or through our contact details.
          </h5>
        </div>
        {/* Form Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Send a Message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
            {/* First Row - First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">First Name</label>
                <input
                  {...register("firstName", { required: true })}
                  className="w-full p-3 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all placeholder-gray-500"
                  placeholder="Enter your first name"
                />
                {errors.firstName && <span className="text-red-400 text-sm mt-1">This field is required</span>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Last Name</label>
                <input
                  {...register("lastName", { required: true })}
                  className="w-full p-3 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all placeholder-gray-500"
                  placeholder="Enter your last name"
                />
                {errors.lastName && <span className="text-red-400 text-sm mt-1">This field is required</span>}
              </div>
            </div>

            {/* Second Row - Email and Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  {...register("email", {
                    required: true,
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
                  })}
                  className="w-full p-3 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all placeholder-gray-500"
                  placeholder="Enter your email"
                />
                {errors.email && <span className="text-red-400 text-sm mt-1">Please enter a valid email</span>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Subject</label>
                <input
                  {...register("subject", { required: true })}
                  className="w-full p-3 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all placeholder-gray-500"
                  placeholder="Enter subject"
                />
                {errors.subject && <span className="text-red-400 text-sm mt-1">This field is required</span>}
              </div>
            </div>

            {/* Third Row - Message */}
            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-gray-300">How can we help you today?</label>
              <textarea
                {...register("message", { required: true })}
                className="w-full p-4 rounded-3xl bg-white/5 border border-white/10 min-h-[220px] focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all placeholder-gray-500"
                placeholder="Enter your message"
              />
              {errors.message && <span className="text-red-400 text-sm mt-1">This field is required</span>}
            </div>

            {/* Submit Button - Centered */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-full text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* Contact Links Section - Moved to bottom */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Contact Links</h2>
          <div className="max-w-4xl mx-auto ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-white/10 rounded-2xl p-6">
              {/* Phone */}
              <div className="flex gap-4 p-6">
                <div>
                  <FaPhone className="text-xl" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Phone</h3>
                  <p className="text-sm text-gray-300">+1 234 567 890</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 p-6">
                <div>
                  <FaEnvelope className="text-xl" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Email</h3>
                  <p className="text-sm text-gray-300">contact@example.com</p>
                </div>
              </div>

              {/* Social */}
              <div className="flex gap-4 p-6">
                <div>
                  <FaTelegramPlane className="text-xl" />
                </div>
                <div>
                  <h3 className='font-medium mb-1'>Socials</h3>
                  <div className="flex gap-4">
                    <FaTwitter className="text-2xl hover:text-purple-400 cursor-pointer transition-colors" />
                    <FaFacebook className="text-2xl hover:text-purple-400 cursor-pointer transition-colors" />
                    <FaInstagram className="text-2xl hover:text-purple-400 cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
