"use client";

import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import bg from "../../public/main-bg.jpg";
import Link from "next/link";
import { usePathname } from "next/navigation";

const topNavLinks = [
  { label: "Browse", href: "/marketplace" },
  { label: "Categories", href: "/marketplace/categories" },
  { label: "Sell", href: "/marketplace/sell" },
  { label: "Buy", href: "/marketplace/buy" },
  { label: "Profile", href: "/marketplace/profile" },
];

const sidebarLinks = [
  { label: "Books", href: "/marketplace/item-condition" },
  { label: "Electronics", href: "/marketplace/item-type" },
  { label: "Accessories", href: "/marketplace/item-location" },
  { label: "Home & Garden", href: "/marketplace/item-price" },
  { label: "Clothing", href: "/marketplace/item-description" },
];

export default function MarketPlaceLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <div
      style={{
        backgroundImage: `url(${bg.src})`,
        scrollbarGutter: "stable both-edges",
      }}
      className="bg-cover bg-center bg-no-repeat h-screen  flex flex-col md:flex-row text-white"
    >
      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0  w-64 h-screen bg-[#06133f] transform transition-transform duration-300 ease-in-out z-40
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h1 className="text-lg font-semibold mb-5">Virtual Store</h1>
          <button
            className="lg:hidden text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-3">
          <ul className="space-y-2">
            {sidebarLinks.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className={`block px-3 py-2 rounded-md text-base transition-all duration-150 ${
                  isActive(item.href)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-white/10 text-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </ul>
        </nav>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex flex-col gap-3 p-3 md:p-4 border-b border-white/10 bg-[#06133f]/90 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between gap-3">
            <button
              className="lg:hidden text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FiMenu size={24} />
            </button>

            <input
              type="text"
              placeholder="Search..."
              className="w-full lg:w-96 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm focus:outline-none placeholder:text-gray-300"
            />

            <h2 className="text-lg font-semibold lg:hidden">Marketplace</h2>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-2 bg-white/10 rounded-full p-1.5">
              {topNavLinks.map((btn) => (
                <Link href={btn.href} key={btn.label}>
                  <button
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      isActive(btn.href)
                        ? "bg-blue-600 text-white font-medium"
                        : "hover:bg-white/10"
                    }`}
                  >
                    {btn.label}
                  </button>
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile and tablet nav */}
          <nav className="flex lg:hidden overflow-x-auto gap-2 scrollbar-hide bg-white/10 rounded-full p-2">
            {topNavLinks.map((btn) => (
              <Link href={btn.href} key={btn.label}>
                <button
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                    isActive(btn.href)
                      ? "bg-blue-600 text-white font-medium"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {btn.label}
                </button>
              </Link>
            ))}
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-2 md:p-8 bg-[#06133fbf] backdrop-blur-md md:rounded-none custom-scroll-marketplace">
          {children}
        </main>
      </div>
    </div>
  );
}
