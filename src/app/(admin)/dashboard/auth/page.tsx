"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/authApi";
import { storeAuthTokens, getRoleFromToken } from "@/lib/auth";
import { store } from "@/store/store";
import { baseApi } from "@/store/baseApi";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [login] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        setError("Please enter both username and password");
        setIsLoading(false);
        return;
      }

      const response = await login({
        email_or_username: username.trim(),
        password: password,
      }).unwrap();

      console.log("Login response:", response);

      // Check if response has success flag
      if ((response as { success?: boolean }).success === false) {
        const errorMsg = (response as { error?: string; message?: string }).error || 
                         (response as { error?: string; message?: string }).message || 
                         "Login failed";
        setError(errorMsg);
        setIsLoading(false);
        toast.error("Login failed", { description: errorMsg });
        return;
      }

      const accessToken =
        response.tokens?.access ||
        (typeof response.token === "string" ? response.token : undefined);
      const refreshToken = response.tokens?.refresh;

      if (!accessToken) {
        console.error("No access token in response:", response);
        setError("Login failed: No access token received");
        setIsLoading(false);
        return;
      }

      // Get role from token or response
      const role =
        getRoleFromToken(accessToken) || response.user?.role || "user";

      // Check if user is admin
      if (role !== "admin") {
        setError("Access denied. Admin credentials required.");
        setIsLoading(false);
        return;
      }

      // Clear RTK Query cache before storing new tokens
      store.dispatch(baseApi.util.resetApiState());

      // Store tokens
      storeAuthTokens({
        accessToken,
        refreshToken: typeof refreshToken === "string" ? refreshToken : undefined,
        persist: true, // Admin sessions should persist
      });

      // Store user data
      if (typeof window !== "undefined" && response.user) {
        window.localStorage.setItem("user", JSON.stringify(response.user));
        window.localStorage.setItem("role", role);
      }

      toast.success("Admin login successful");
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Admin login failed:", err);
      console.error("Error type:", typeof err);
      console.error("Error stringified:", JSON.stringify(err, null, 2));
      
      // Handle different error formats from RTK Query
      let errorMessage = "Invalid admin credentials";
      
      if (err && typeof err === 'object') {
        // RTK Query error format: { data: {...}, status: number }
        const rtkError = err as { 
          data?: { 
            error?: string; 
            message?: string;
            details?: unknown;
            success?: boolean;
          };
          status?: number;
          error?: string;
          originalStatus?: number;
        };
        
        // Check data.error (most common - backend returns this)
        if (rtkError.data?.error) {
          errorMessage = rtkError.data.error;
        }
        // Check data.message
        else if (rtkError.data?.message) {
          errorMessage = rtkError.data.message;
        }
        // Check top-level error
        else if (rtkError.error && typeof rtkError.error === 'string') {
          errorMessage = rtkError.error;
        }
        // Check for validation errors in details
        else if (rtkError.data?.details && typeof rtkError.data.details === 'object') {
          const details = rtkError.data.details as Record<string, unknown>;
          const firstKey = Object.keys(details)[0];
          const firstError = details[firstKey];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = String(firstError[0]);
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          } else if (Array.isArray(firstError)) {
            errorMessage = String(firstError[0]);
          }
        }
        // Handle HTTP status codes
        else if (rtkError.status === 401 || rtkError.originalStatus === 401) {
          errorMessage = "Invalid username or password";
        } else if (rtkError.status === 403 || rtkError.originalStatus === 403) {
          errorMessage = "Access denied. Please verify your account.";
        } else if (rtkError.status === 400 || rtkError.originalStatus === 400) {
          errorMessage = "Invalid request. Please check your input.";
        } else if (rtkError.status === 500 || rtkError.originalStatus === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (String(rtkError.status) === 'FETCH_ERROR' || String(rtkError.status) === 'PARSING_ERROR') {
          errorMessage = "Network error. Please check your connection.";
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      toast.error("Login failed", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1F2149] text-white px-4">
        {/* TITLE */}
        <h1 className="text-center text-2xl mb-8">
          Admin Login
        </h1>

      <div className="bg-[#1F2149] border-[2px] border-[#919191] rounded-2xl py-8 px-4 sm:px-10 max-w-2xl w-full text-white shadow-xl">

        {/* SUB TEXT */}
        <p className="text-center text-gray-300 mb-10">
          Please fill in your unique admin login details below
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col ">

          {/* Username */}
          <div>
            <label className="block mb-2 text-sm">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-transparent border border-gray-400 text-white outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-transparent border border-gray-400 text-white outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="text-right mt-1">
              <a href="#" className="text-red-400 text-xs hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <p className="text-red-400 text-center text-sm">{error}</p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="max-w-[280px] w-full self-center bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white py-3 rounded-full font-medium transition-all"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
