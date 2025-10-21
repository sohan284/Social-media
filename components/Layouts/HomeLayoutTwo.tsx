"use client";
import { useState } from "react";
import { FiX } from "react-icons/fi";
import SidebarNavLink from "../../components/Shared/SidebarNavLink/SidebarNavLink";
import bg from "../../public/main-bg.jpg";
import Navbar from "../Shared/Navbar/Navbar";

export default function HomeLayoutTwo({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div
      style={{
        backgroundImage: `url(${bg.src})`,
        scrollbarGutter: "stable both-edges",
      }}
      className="bg-cover bg-center bg-no-repeat min-h-screen p-4 flex"
    >
      {/* Sidebar */}
      <aside
        style={{
          scrollbarGutter: "stable both-edges",
        }}
        className={`bg-slate-900 fixed left-0 top-0 h-full bg-cover bg-center bg-no-repeat shadow-md transform transition-transform duration-300 z-30 w-[370px] px-6 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          hover:overflow-y-auto overflow-y-hidden custom-scroll
          lg:translate-x-0
        `}
      >
        {/* Mobile Menu Toggle */}
        <div className="flex justify-between items-center mb-4 lg:hidden">
          <h2 className="font-semibold text-lg text-[#022735]">Menu</h2>
          <button onClick={() => setIsSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="space-y-3 text-gray-700 ">
          <SidebarNavLink />
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ml-[370px] p-6 overflow-y-auto transition-all duration-300
          ${!isSidebarOpen ? "ml-0" : ""}
          lg:ml-[370px]
        `}
      >
        <div className=" mx-auto mt-16">
          {/* <Navbar /> */}
          {children}
        </div>
      </main>
    </div>
  );
}
