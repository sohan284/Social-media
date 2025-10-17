"use client";
import React, { useEffect, useState } from "react";
import bg from "../../../public/main-bg.jpg";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import Link from "next/link";

// Types for form data
type SignUpForm = {
  email: string;
  username: string;
  password: string;
  verificationCode: string;
  keepMeLoggedIn: boolean;
  rememberMe: boolean;
  interests: string[];
};

const interestCategories = [
  {
    id: "technology",
    name: "Technology",
    options: [
      "Programming", "AI & Machine Learning", "Web Development", "Mobile Apps", "Data Science",
      "Cybersecurity", "Cloud Computing", "DevOps", "Blockchain", "IoT"
    ]
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    options: [
      "Fitness", "Travel", "Food & Cooking", "Fashion", "Photography",
      "Music", "Art & Design", "Reading", "Gaming", "Movies"
    ]
  },
  {
    id: "business",
    name: "Business",
    options: [
      "Entrepreneurship", "Marketing", "Finance", "Sales", "Leadership",
      "Startups", "E-commerce", "Consulting", "Real Estate", "Investing"
    ]
  }
];

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userEmail, setUserEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SignUpForm>();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const onSubmit = (data: SignUpForm) => {
    console.log("Signup data:", data);
    reset();
  };

  const handleSocialLogin = (provider: "google" | "apple") => {
    console.log(`Social login with ${provider}`);
  };

  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    setResendTimer(30);
    setCurrentStep(2);
  };

  const handleVerificationSubmit = () => {
      setCurrentStep(3);
  };

  const handleResendCode = () => {
    setResendTimer(30);
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleFinalSubmit = () => {
    const formData = {
      ...watch(),
      email: userEmail,
      interests: selectedInterests,
    };
    onSubmit(formData);
  };

  const renderStep1 = () => (
    <div className="max-w-[348px] text-center text-white">
      <h2 className="text-[2rem] font-semibold mb-2">Sign Up</h2>
      <p className="text-sm mb-6">
        By continuing, you agree to our{" "}
        <span className="text-blue-300">User Agreement</span> and
        acknowledge that you understand the{" "}
        <span className="text-blue-300">Privacy Policy</span>.
      </p>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-black py-3 rounded-full font-medium hover:bg-gray-200 transition"
        >
          <FcGoogle className="text-xl" /> Continue With Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin("apple")}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-black py-3 rounded-full font-medium hover:bg-gray-200 transition"
        >
          <FaApple className="text-xl" /> Continue With Apple
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="px-2 text-gray-200 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const email = formData.get("email") as string;
          if (email) handleEmailSubmit(email);
        }}>
          <input
            name="email"
            type="email"
            placeholder="Email or User Name"
            required
            className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold transition"
          >
            Continue
          </button>
        </form>

        <div className="text-center mt-4">
          <Link href="/auth/login" className="text-[#299616] hover:underline text-sm">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-[348px] text-center text-white">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentStep(1)}
          className="text-white hover:text-gray-300"
        >
          <IoArrowBack className="text-xl" />
        </button>
        <button className="text-white hover:text-gray-300 text-sm">
          Skip
        </button>
      </div>

      <h2 className="text-[2rem] font-semibold mb-2">Verify your email</h2>
      <p className="text-sm mb-2">
        enter the 6-digit code we sent to
      </p>
      <p className="text-sm mb-6 text-blue-300">
        {userEmail}
      </p>

      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const code = formData.get("verificationCode") as string;
        if (code) handleVerificationSubmit();
      }}>
        <input
          name="verificationCode"
          type="text"
          placeholder="Verification code"
          maxLength={6}
          required
          className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-3 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-lg tracking-widest"
        />
        
        <div className="mt-4 text-sm">
          <p className="text-white mb-1">Didn&apos;t get an email?</p>
          {resendTimer > 0 ? (
            <p className="text-white">Resend in {resendTimer}</p>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              className="text-blue-300 hover:underline"
            >
              Resend code
            </button>
          )}
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold transition"
        >
          Continue
        </button>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-[348px] text-center text-white">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentStep(2)}
          className="text-white hover:text-gray-300"
        >
          <IoArrowBack className="text-xl" />
        </button>
      </div>

      <h2 className="text-[2rem] font-semibold mb-2">Create your username and password</h2>
      <p className="text-sm mb-6">
        By continuing, you agree to our{" "}
        <span className="text-blue-300">User Agreement</span> and
        acknowledge that you understand the{" "}
        <span className="text-blue-300">Privacy Policy</span>.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "Username must be at least 3 characters" }
            })}
            type="text"
            placeholder={userEmail}
            className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.username && (
            <p className="text-red-400 text-xs mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" }
            })}
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
              defaultChecked
              className="accent-green-500"
            />
            <span className="text-[#299616]">Keep me Log in</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("rememberMe")}
              defaultChecked
              className="accent-green-500"
            />
            <span className="text-[#299616]">Remember me</span>
          </label>
        </div>

        <button
          type="submit"
          onClick={() => setCurrentStep(4)}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-[600px]  text-center text-white">
      <h2 className="text-[2rem] font-semibold mb-2">Interests</h2>
      <p className="text-sm mb-8">
        Pick things you&apos;d like to see in your home feed
      </p>

      <div className="space-y-8">
        {interestCategories.map((category) => (
          <div key={category.id}>
            <h3 className="text-lg font-medium mb-4 text-left">{category.name}</h3>
            <div className="flex flex-wrap gap-3">
              {category.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleInterestToggle(option)}
                  className={`px-4 py-2 rounded-full text-sm border transition ${
                    selectedInterests.includes(option)
                      ? "border-teal-400 bg-teal-400/20 text-teal-400"
                      : "border-gray-300 text-white hover:border-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleFinalSubmit}
        disabled={selectedInterests.length === 0}
        className={`w-full mt-8 py-3 rounded-full font-semibold transition ${
          selectedInterests.length > 0
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
      >
        {selectedInterests.length > 0 
          ? `Select ${selectedInterests.length} item${selectedInterests.length > 1 ? 's' : ''} to continue`
          : "Select 1 item to continue"
        }
      </button>
    </div>
  );

  return (
    <div
      style={{
        backgroundImage: `url(${bg.src})`,
      }}
      className={`min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 ${currentStep === 4 ? 'py-10' : ''}`}
    >
      <div className="bg-[#06133FBF] max-w-[1220px] min-h-[80.18vh] mx-auto backdrop-blur-[17.5px] rounded-3xl p-8 sm:p-10 w-full flex items-center justify-center">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default SignUp;