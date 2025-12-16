"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Home,
  Users,
  FileText,
  LogOut,
  BarChart2,
  ChevronRight,
  Tag,
  ShoppingBag,
  Package,
} from "lucide-react";
import Link from "next/link";

const menu = [
  { name: "Home", icon: Home, path: '/dashboard' },
  { name: "All Posts", icon: FileText, path: '/dashboard/all-posts' },
  { name: "Rejected Posts", icon: FileText, path: '/dashboard/rejected-posts' },
  { name: "User Management", icon: Users, path: '/dashboard/user-management' },
  { name: "Interest Category", icon: Tag, path: '/dashboard/interest-categories' },
  { name: "Marketplace Category", icon: ShoppingBag, path: '/dashboard/marketplace-categories' },
  { name: "All Products", icon: Package, path: '/dashboard/all-products' },
  { name: "Statistics", icon: BarChart2, path: '/dashboard/statistics' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [active, setActive] = useState("Home");

  // Sync active state with current pathname
  useEffect(() => {
    const currentMenuItem = menu.find((item) => {
      // Handle exact match for home
      if (item.path === '/dashboard') {
        return pathname === '/dashboard' || pathname === '/dashboard/';
      }
      // Handle other paths
      return pathname?.startsWith(item.path);
    });
    
    if (currentMenuItem) {
      setActive(currentMenuItem.name);
    }
  }, [pathname]);

  return (
    <div style={{ backgroundImage: "url('/admin-bg.jpg')" }} className="flex h-screen bg-cover bg-center text-white p-4 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white text-gray-900 rounded-xl p-6 shadow-xl flex flex-col h-full">
        
        {/* LOGO */}
        <div className="flex items-center justify-center mb-6">
          <Image src="/admin-logo.png" alt="Logo" width={40} height={40} />
        </div>

        {/* MENU */}
        <nav className="space-y-6 flex-1 overflow-y-auto pr-1">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.path} className="block">
                <button
                  key={item.name}
                  onClick={() => setActive(item.name)}
                  className={`flex items-center w-full px-4 py-3 rounded-xl cursor-pointer text-left text-sm font-medium transition
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
              </Link>
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
