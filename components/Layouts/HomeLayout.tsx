"use client";
import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import Navbar from "../Shared/Navbar/Navbar";
import bg from "../../public/main-bg.jpg";
import SidebarNavLink from "../Shared/SidebarNavLink/SidebarNavLink";
import { usePathname } from "next/navigation";
import RightSidebar from "../Shared/SidebarNavLink/RightSidebar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pathname = usePathname();



  return (
    <div className="flex flex-col">
      <Navbar onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />

      <div className="flex flex-1">
        {/* LEFT SIDEBAR */}
        <aside
          style={{
            backgroundImage: `url(${bg.src})`,
            scrollbarGutter: "stable both-edges",
          }}
          className={`fixed left-0 h-[100vh] bg-cover bg-center bg-no-repeat shadow-md transform transition-transform duration-300 xl:translate-x-0 z-30 xl:w-[370px] p-10 
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            hover:overflow-y-auto overflow-y-hidden custom-scroll
          `}
        >
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="font-semibold text-lg text-[#022735]">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)}>
              <FiX size={24} />
            </button>
          </div>

          <nav className="space-y-3 text-gray-700 mt-16">
            <SidebarNavLink />
          </nav>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 xl:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main
          style={{
            backgroundImage: `url(${bg.src})`,
            scrollbarGutter: "stable both-edges",
          }}
          className="flex-1 h-[calc(100vh)] overflow-y-auto bg-cover bg-center bg-no-repeat relative"
        >
          <div className="bg-[#06133fec] ">
            <div className="max-w-3xl mx-auto pt-18 pb-4">
              {children}
            </div>
          </div>
        </main>

       

        {/* RIGHT SIDEBAR */}
        {pathname === "/create-post" ? null : (
          <aside
            style={{
              backgroundImage: `url(${bg.src})`,
              scrollbarGutter: "stable both-edges",
            }}
            className="bg-cover bg-center bg-no-repeat hidden xl:block fixed right-0 w-[370px] h-[calc(100vh)] p-10 shadow-md hover:overflow-y-auto overflow-y-hidden custom-scroll"
          >
            <div className="mt-16 ">
              <RightSidebar />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
