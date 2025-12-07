"use client";
import Image from "next/image";
import { useState } from "react";
import {
  ChevronDown,
  Home,
  Users,
  FileText,
  LogOut,
  BarChart2,
  ChevronRight,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState("Home");

  const menu = [
    { name: "Home", icon: Home },
    { name: "All Posts", icon: FileText },
    { name: "Rejected Posts", icon: FileText },
    { name: "User Management", icon: Users },
    { name: "Statistics", icon: BarChart2 },
  ];

  return (
    <div         style={{ backgroundImage: "url('/admin-bg.jpg')" }} className="flex h-screen bg-cover bg-center text-white p-4 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white text-gray-900 rounded-xl p-6 shadow-xl flex flex-col h-full">
        
        {/* LOGO */}
        <div className="flex items-center justify-center mb-6">
          <Image src="/admin-logo.png" alt="Logo" width={40} height={40} />
        </div>

        {/* MENU */}
        <nav className="space-y-6 flex-1 overflow-y-auto pr-1">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setActive(item.name)}
                className={`flex items-center w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition
                ${
                  active === item.name
                    ? "bg-[#2A2A46] text-white"
                    : "bg-white border border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.name}

                <span className="ml-auto">
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </span>
              </button>
            );
          })}
        </nav>

        {/* LOGOUT → STAYS AT BOTTOM */}
        <button className="flex items-center text-sm text-gray-700 hover:text-black transition mt-4">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </button>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 relative rounded-xl ml-4 h-full flex flex-col">

        {/* FIXED TOP BAR */}
        <div className="sticky top-0 left-0 z-20 flex items-center justify-end
                        px-10 py-6 rounded-xl">
          <button className="bg-[#6B83FA] px-8 py-4 rounded-[20px] flex items-center text-xl">
            <span>Hi Mr.man</span>
            <ChevronDown className="w-6 h-6 ml-2" />
          </button>
        </div>

        {/* SCROLLABLE INNER CONTENT */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          {children}
        </div>
      </main>

    </div>
  );
}
