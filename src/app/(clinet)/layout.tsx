import React from "react";
import HomeLayout from "../../../components/Layouts/HomeLayout";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <HomeLayout>
      {children}
    </HomeLayout>
  );
}
