"use client";
import React from "react";
import HomeLayout from "../../../../components/Layouts/HomeLayout";
import HomeLayoutTwo from "../../../../components/Layouts/HomeLayoutTwo";
import ProtectedLayout from "../../../../components/Layouts/ProtectedLayout";
import { usePathname } from "next/navigation";

export default function layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Use HomeLayoutTwo for profile and community details pages
  const useHomeLayoutTwo = 
    pathname === "/main/profile" || 
    (pathname?.startsWith("/main/communities/") && pathname !== "/main/communities");

  return (
    <ProtectedLayout>
      {useHomeLayoutTwo ? (
        <HomeLayoutTwo>{children}</HomeLayoutTwo>
      ) : (
        <HomeLayout>{children}</HomeLayout>
      )}
    </ProtectedLayout>
  );
}
