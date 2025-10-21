import React from "react";
import HomeLayoutTwo from "../../../../components/Layouts/HomeLayoutTwo";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div >
      <HomeLayoutTwo>
        {children}
      </HomeLayoutTwo>
    </div>
  );
}
