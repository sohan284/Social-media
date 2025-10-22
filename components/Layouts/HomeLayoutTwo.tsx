"use client";
import { useState, useEffect } from "react";
import { FiX, FiMenu } from "react-icons/fi";
import SidebarNavLink from "../../components/Shared/SidebarNavLink/SidebarNavLink";
import bg from "../../public/main-bg.jpg";
import Navbar from "../Shared/Navbar/Navbar";

export default function HomeLayoutTwo({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        setIsOpen(true);
      }, 10);
    } else {
      document.body.style.overflow = "unset";
      setIsOpen(false);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const handleCloseSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsSidebarOpen(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bg.src})`,
        scrollbarGutter: "stable both-edges",
      }}
      className="bg-cover bg-center bg-no-repeat min-h-screen flex"
    >
      {isSidebarOpen && (
        <div
          className={`fixed top-0 left-0 h-full w-full bg-black/50 z-50 duration-300 transition-all lg:hidden ${isClosing ? "opacity-0" : "opacity-100"
            }`}
          onClick={handleCloseSidebar}
        >
          <aside
            style={{
              scrollbarGutter: "stable both-edges",
            }}
            className={`fixed top-0 left-0 hover:overflow-y-auto overflow-y-hidden custom-scroll  lg:w-[370px] h-full bg-slate-900 bg-cover bg-center bg-no-repeat shadow-md transition-transform duration-300 ease-in-out ${isOpen && !isClosing ? "translate-x-0" : "-translate-x-full"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Toggle */}
            <div className="flex justify-between items-center mb-4 lg:hidden px-6 pt-4">
              <h2 className="font-semibold text-lg text-white">Menu</h2>
              <button
                onClick={handleCloseSidebar}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <FiX size={24} className="text-white" />
              </button>
            </div>

            <nav className="space-y-3 text-gray-700 px-6">
              <SidebarNavLink />
            </nav>
          </aside>
        </div>
      )}

      <aside
        style={{
          scrollbarGutter: "stable both-edges",
        }}
        className={`bg-slate-900 fixed left-0 top-0 h-full bg-cover bg-center bg-no-repeat shadow-md z-30 lg:w-[370px] px-6 
          hover:overflow-y-auto overflow-y-hidden custom-scroll
          hidden lg:block
        `}
      >
        <nav className="space-y-3 text-gray-700 pt-4 mt-16">
          <SidebarNavLink />
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300
          lg:ml-[370px]
        `}
      >
        <div className=" mx-auto mt-16">
          <Navbar onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />
          {children}
        </div>
      </main>
    </div>
  );
}
