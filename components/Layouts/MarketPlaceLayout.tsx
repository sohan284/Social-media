"use client";

import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import bg from "../../public/main-bg.jpg";
import Link from "next/link";
import { usePathname } from "next/navigation";

const topNavLinks = [
    {
        label: "Browse",
        href: "/marketplace",
    },
    {
        label: "Categories",
        href: "/marketplace/categories",
    },
    {
        label: "Sell",
        href: "/marketplace/sell",
    },
    {
        label: "Buy",
        href: "/marketplace/buy",
    },
    {
        label: "Profile",
        href: "/marketplace/profile",
    }
]

const sidebarLinks = [
    {
        label: "Books",
        href: "/marketplace/item-condition",
    },
    {
        label: "Electronics",
        href: "/marketplace/item-type",
    },
    {
        label: "Accessories",
        href: "/marketplace/item-location",
    },
    {
        label: "Home & Garden",
        href: "/marketplace/item-price",
    },
    {
        label: "Clothing",
        href: "/marketplace/item-description",
    },
]

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
            className="bg-cover bg-center bg-no-repeat h-screen flex text-white overflow-hidden xl:p-4"
        >
            <div
                className={`fixed md:static top-0 left-0 h-full w-64 bg-[#06133f]  transform transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-xl font-semibold">Virtual Store</h1>
                    <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
                        <FiX size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-4 text-sm">
                    <div>
                        <ul className="space-y-2 flex flex-col gap-2">
                            {sidebarLinks.map((item) => (
                                <Link href={item.href || ""} key={item.label} className={` text-xl font-medium hover:text-blue-500 transition cursor-pointer ${isActive(item.href || "") ? "text-blue-500" : "text-gray-100"}`}>
                                    {item.label}
                                </Link>
                            ))}
                        </ul>
                    </div>
                </nav>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className="flex-1 flex flex-col">
                <header className="flex flex-col gap-3 p-3 md:p-4 border-b border-white/10 bg-[#06133f] ">
                    <div className="flex items-center justify-between gap-4">
                        <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(true)}>
                            <FiMenu size={24} />
                        </button>
                        <div className="flex w-full">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="lg:w-96 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm focus:outline-none"
                            />
                        </div>
                        <h2 className="text-lg font-semibold md:hidden">Marketplace</h2>

                        {/* desktop nav buttons */}
                        <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-full p-2">
                            {topNavLinks.map((btn, i) => (
                                <Link href={btn.href || ""} key={i}>
                                    <button
                                        className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${isActive(btn.href || "")
                                            ? "bg-[#06133f] text-white font-semibold"
                                            : "hover:bg-white/10"
                                            }`}
                                    >
                                        {btn.label}
                                    </button>
                                </Link>
                            ))}
                        </div>

                    </div>

                    {/* mobile nav buttons */}
                    <div className="flex md:hidden overflow-x-auto gap-2 scrollbar-hide bg-white/10 rounded-full p-2">
                        {topNavLinks.map((btn, i) => (
                            <Link href={btn.href || ""} key={i}>
                                <button
                                    key={i}
                                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors duration-200 ${isActive(btn.href || "")
                                        ? "bg-[#06133f] text-white font-semibold"
                                        : "bg-white/10 hover:bg-white/20"
                                        }`}
                                >
                                    {btn.label}
                                </button>
                            </Link>

                        ))}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#06133FBF] backdrop-blur-[17.5px] custom-scroll-marketplace">{children}</main>
            </div>
        </div>
    );
}
