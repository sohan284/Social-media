"use client";
import React, { useState } from "react";
import {FiMenu, FiPlus, FiX } from "react-icons/fi";
import Navbar from "../Shared/Navbar/Navbar";
import bg from "../../public/main-bg.jpg";
import Link from "next/link";
import { GoHome } from "react-icons/go";
import FriendsIcon from "../Icons/FriendsIcon";
import { IoTrendingUp } from "react-icons/io5";
import StoreIcon from "../Icons/StoreIcon";
import HexagonIcon from "../Icons/HexagonIcon";

const menuItems = [
  {
    icon: <GoHome size={24} />,
    label: "Home",
    href: "/",
  },
  {
    icon: <FriendsIcon />,
    label: "Friends",
    href: "/",
  },
  {
    icon: <IoTrendingUp size={24} />,
    label: "Popular",
    href: "/",
  },
  {
    icon: <StoreIcon />,
    label: "Virtual Store",
    href: "/",
  },

];


export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className=" flex flex-col ">
      {/* Top Navbar (Fixed) */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex flex-1">
        <aside
          style={{ backgroundImage: `url(${bg.src})` }}
          className={`fixed hover:overflow-y-auto custom-scroll left-0 h-[100vh] bg-cover bg-center bg-no-repeat shadow-md transform transition-transform duration-300 lg:translate-x-0 z-30 w-[370px] p-10  ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="font-semibold text-lg text-[#022735]">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)}>
              <FiX size={24} />
            </button>
          </div>

          <nav className="space-y-3 text-gray-700 mt-16">
            <div className="bg-[#06133FBF] backdrop-blur-[1px] py-6 px-2 rounded-2xl">
              {menuItems.map((item) => (
                <Link href={item.href} className="text-xs text-white flex items-center gap-5 hover:bg-[#06133FBF] p-2.5 px-6 rounded-xl duration-300 ease-in-out">
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
            <div className="bg-[#06133FBF] backdrop-blur-[1px] py-1.5 px-2.5 rounded-2xl">
              <h3 className="text-base text-[#BCB3B3] px-8 mb-7">Communities</h3>
              <button className="w-full text-xs text-white flex items-center gap-5 hover:bg-[#06133FBF] p-2.5 px-6 rounded-xl duration-300 ease-in-out cursor-pointer">
                <FiPlus size={24} /> Create Communities
              </button>
              <button className="w-full text-xs text-white flex items-center gap-5 hover:bg-[#06133FBF] p-2.5 px-6 rounded-xl duration-300 ease-in-out cursor-pointer">
                <HexagonIcon /> Manage Communities
              </button>
            </div>
          </nav>
        </aside>

        {/* Overlay for Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Center Content (Scrollable) */}
        <main className="flex-1 h-[calc(100vh)] px-2 lg:px-6 py-4 lg:ml-64 xl:mr-72 overflow-y-auto bg-gradient-to-tl from-[#956194] via-[#b8586e] to-[#956194]">
          <div className="max-w-2xl mx-auto mt-16">{children}</div>
        </main>

        {/* Right Sidebar (Fixed) */}
        <aside
          style={{ backgroundImage: `url(${bg.src})` }}
          className="bg-cover bg-center bg-no-repeat hidden xl:block fixed right-0 w-[370px] h-[calc(100vh)] p-4  shadow-md overflow-y-auto"
        >
          <h3 className="font-semibold text-[#022735] mb-3">Trending Today</h3>
          <ul className="space-y-3 text-sm text-gray-700">ggwp will here</ul>
        </aside>
      </div>
    </div>
  );
}
