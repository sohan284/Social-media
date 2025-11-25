"use client";

export type UserRole = "admin" | "user" | string;

const decodePayload = (token: string) => {
  const [, payload] = token.split(".");
  if (!payload) {
    throw new Error("Invalid token");
  }

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(normalizedPayload);
  const jsonPayload = decodeURIComponent(
    decoded
      .split("")
      .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  return JSON.parse(jsonPayload);
};

export const getRoleFromToken = (token?: string | null): UserRole | null => {
  if (!token) return null;

  try {
    const payload = decodePayload(token);
    return (
      payload?.role ||
      payload?.user_role ||
      payload?.user?.role ||
      payload?.data?.role ||
      null
    );
  } catch (error) {
    console.error("Failed to decode token role:", error);
    return null;
  }
};

