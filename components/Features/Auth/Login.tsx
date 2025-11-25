"use client";
import React, { useState } from "react";
import bg from "../../../public/main-bg.jpg";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import Link from "next/link";
import { useLoginMutation } from "@/store/authApi";
import { useRouter } from "next/navigation";
import { getRoleFromToken } from "@/lib/auth";

type LoginForm = {
  email: string;
  password: string;
  keepMeLoggedIn: boolean;
  rememberMe: boolean;
};

type ResetStep1Form = {
  email: string;
};

type ResetStep2Form = {
  newPassword: string;
  confirmPassword: string;
};

const Login = () => {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<'login' | 'reset-step1' | 'reset-step2'>('login');
  const [resetEmail, setResetEmail] = useState("");
  const [login, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();

  const loginForm = useForm<LoginForm>();
  const resetStep1Form = useForm<ResetStep1Form>();
  const resetStep2Form = useForm<ResetStep2Form>();

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      const response = await login({
        email_or_username: data.email,
        password: data.password,
      }).unwrap();

      const accessToken =
        response.tokens?.access ||
        (typeof response.token === "string" ? response.token : undefined);
      const refreshToken = response.tokens?.refresh;

      if (accessToken) {
        localStorage.setItem("token", accessToken);
      }

      if (typeof refreshToken === "string") {
        localStorage.setItem("refresh_token", refreshToken);
      }

      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      const role =
        getRoleFromToken(accessToken || null) || response.user?.role || "user";
      localStorage.setItem("role", role);

      const redirectTarget = role === "admin" ? "/dashboard" : "/";
      router.push(redirectTarget);
    } catch (error) {
      console.error("Login failed:", error);
      // Error handling UI is shown below the form
    }
  };

  const onResetStep1Submit = (data: ResetStep1Form) => {
    console.log("Reset request for:", data.email);
    setResetEmail(data.email);
    setCurrentMode('reset-step2');
    resetStep1Form.reset();
  };

  const onResetStep2Submit = (data: ResetStep2Form) => {
    if (data.newPassword !== data.confirmPassword) {
      resetStep2Form.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }
    console.log("Password reset for:", resetEmail, "New password:", data.newPassword);
    resetStep2Form.reset();
    setCurrentMode('login');
  };

  const goBack = () => {
    if (currentMode === 'reset-step2') {
      setCurrentMode('reset-step1');
      resetStep2Form.reset();
    } else if (currentMode === 'reset-step1') {
      setCurrentMode('login');
      resetStep1Form.reset();
    }
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
          {/* Back Button - only show when not in login mode */}
          {currentMode !== 'login' && (
            <div className="flex justify-start mb-6">
              <button
                onClick={goBack}
                className="text-white hover:text-gray-300 transition"
              >
                <IoArrowBack className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Login Mode */}
          {currentMode === 'login' && (
            <>
              <h2 className="text-[2rem] font-semibold mb-2">Log in</h2>
              <p className="text-sm mb-6">
                By continuing, you agree to our{" "}
                <span className="text-blue-300">User Agreement</span> and
                acknowledge that you understand the{" "}
                <span className="text-blue-300">Privacy Policy</span>.
              </p>

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <input
                    {...loginForm.register("email", {
                      required: "Email or Username is required",
                    })}
                    type="text"
                    placeholder="Email or User Name"
                    className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    {...loginForm.register("password", { required: "Password is required" })}
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-400 text-xs mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...loginForm.register("keepMeLoggedIn")}
                      className="accent-green-500"
                    />
                    <span className="text-[#299616]">Keep me Log in</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...loginForm.register("rememberMe")}
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
                  <button
                    type="button"
                    onClick={() => setCurrentMode('reset-step1')}
                    className="text-red-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                  <Link href="/auth/sign-up" className="text-[#299616] hover:underline">
                    Sign Up
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoggingIn ? "Logging in..." : "Log in"}
                </button>
                {loginError && (
                  <p className="text-red-400 text-xs mt-2 text-center">
                    Invalid email/username or password. Please try again.
                  </p>
                )}
              </form>
            </>
          )}

          {/* Password Reset Step 1 */}
          {currentMode === 'reset-step1' && (
            <>
              <h2 className="text-[2rem] font-semibold mb-2">Reset your Password</h2>
              <p className="text-sm mb-6">
                Enter your email address or user name and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={resetStep1Form.handleSubmit(onResetStep1Submit)} className="space-y-4">
                <div>
                  <input
                    {...resetStep1Form.register("email", {
                      required: "Email or Username is required",
                    })}
                    type="text"
                    placeholder="Email or user name"
                    className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {resetStep1Form.formState.errors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {resetStep1Form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold transition"
                >
                  Continue
                </button>
              </form>

              <div className="flex justify-end text-xs sm:text-sm mt-6">
                <Link href="#" className="text-white hover:underline">
                  Need Help?
                </Link>
              </div>
            </>
          )}

          {/* Password Reset Step 2 */}
          {currentMode === 'reset-step2' && (
            <>
              <h2 className="text-[2rem] font-semibold mb-2">Reset your Password</h2>

              <form onSubmit={resetStep2Form.handleSubmit(onResetStep2Submit)} className="space-y-4">
                <div>
                  <input
                    {...resetStep2Form.register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    type="password"
                    placeholder="New Password"
                    className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {resetStep2Form.formState.errors.newPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      {resetStep2Form.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    {...resetStep2Form.register("confirmPassword", {
                      required: "Please confirm your password",
                    })}
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {resetStep2Form.formState.errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      {resetStep2Form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <p className="text-sm text-gray-300 mb-4">
                  Resetting your password will log you out on all devices
                </p>

                <button
                  type="submit"
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold transition"
                >
                  Continue
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
