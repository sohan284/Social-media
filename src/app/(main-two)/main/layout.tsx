import React from "react";
import HomeLayoutTwo from "../../../../components/Layouts/HomeLayoutTwo";
import ProtectedLayout from "../../../../components/Layouts/ProtectedLayout";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <HomeLayoutTwo>{children}</HomeLayoutTwo>
    </ProtectedLayout>
  );
}
