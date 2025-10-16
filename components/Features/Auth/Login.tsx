"use client";
import React from "react";
import Image from "next/image";
import bg from "../../../public/main-bg.jpg";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Link from "next/link";

type LoginForm = {
  email: string;
  password: string;
  keepMeLoggedIn: boolean;
  rememberMe: boolean;
};

const Login = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = (data: LoginForm) => {
    console.log(data);
    reset();
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bg.src})`,
      }}
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 "
    >
      <div className="bg-[#06133FBF] max-w-[1220px] min-h-[80.18vh] mx-auto backdrop-blur-[17.5px] rounded-3xl p-8 sm:p-10 w-full flex items-center justify-center">
        <div className=" max-w-[348px]  text-center text-white">
          <h2 className="text-[2rem] font-semibold mb-2">Log in</h2>
          <p className="text-sm mb-6">
            By continuing, you agree to our{" "}
            <span className="text-blue-300">User Agreement</span> and
            acknowledge that you understand the{" "}
            <span className="text-blue-300">Privacy Policy</span>.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("email", {
                  required: "Email or Username is required",
                })}
                type="text"
                placeholder="Email or User Name"
                className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                placeholder="Password"
                className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("keepMeLoggedIn")}
                  className="accent-green-500"
                />
                <span className="text-[#299616]">Keep me Log in</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="accent-green-500"
                />
                <span className="text-[#299616]">Remember me</span>
              </label>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="px-2 text-gray-200 text-sm">Or</span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-black py-3 rounded-full font-medium hover:bg-gray-200 transition"
            >
              <FcGoogle className="text-xl" /> Continue With Google
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-black py-3 rounded-full font-medium hover:bg-gray-200 transition"
            >
              <FaApple className="text-xl" /> Continue With Apple
            </button>

            <div className="flex justify-between text-xs sm:text-sm mt-3">
              <Link href="forgot-password" className="text-red-400 hover:underline">
                Forgot Password?
              </Link>
              <Link href="/auth/sign-up" className="text-[#299616] hover:underline">
                Sign Up
              </Link>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold transition"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
