"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRoleFromToken, UserRole } from "@/lib/auth";

type ProtectedLayoutProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackRedirect?: string;
};

export default function ProtectedLayout({
  children,
  allowedRoles,
  fallbackRedirect,
}: ProtectedLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.replace("/auth/login");
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }

    const roleFromToken = getRoleFromToken(token);
    const role: UserRole = roleFromToken || "user";
    const hasRoleAccess =
      !allowedRoles ||
      allowedRoles.length === 0 ||
      allowedRoles.includes(role);

    if (!hasRoleAccess) {
      const redirectTarget =
        fallbackRedirect || (role === "admin" ? "/dashboard" : "/");
      router.replace(redirectTarget);
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }

    setIsAuthorized(true);
    setIsChecking(false);
  }, [allowedRoles, fallbackRedirect, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

