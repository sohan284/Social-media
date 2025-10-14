import React from "react";
import Navbar from "../../../components/Shared/Navbar/Navbar";
import Footer from "../../../components/Shared/Footer/Footer";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
