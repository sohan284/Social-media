"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { categories } from "../Categories/categoriesData";

interface MarketplaceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MarketplaceSidebar({
  isOpen,
  onClose,
}: MarketplaceSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const pathname = usePathname();

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const isCategoryExpanded = (categoryName: string) => {
    return expandedCategories.has(categoryName);
  };

  const generateSubcategoryHref = (categoryName: string, subcategory: string) => {
    // Generate a URL-friendly path for the subcategory
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");
    const subcategorySlug = subcategory.toLowerCase().replace(/\s+/g, "-");
    return `/marketplace/category/${categorySlug}/${subcategorySlug}`;
  };

  return (
    <>
      <aside
        className={`fixed lg:static top-0 left-0 w-64 h-screen bg-[#06133f] transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h1 className="text-lg font-semibold">Virtual Store</h1>
          <button
            className="lg:hidden text-white"
            onClick={onClose}
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="p-4 flex flex-col h-[90vh]">
          <ul className="space-y-1 flex-1 overflow-y-auto pr-2">
            {categories.map((category) => {
              const isExpanded = isCategoryExpanded(category.name);
              return (
                <li key={category.name}>
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base transition-all duration-150 hover:bg-white/10 text-gray-100"
                  >
                    <span className="font-medium">{category.name}</span>
                    <span
                      className={`inline-block w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-300 transition-transform duration-300 ${
                        isExpanded ? "" : "-rotate-90"
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                      {category.items.map((item) => {
                        const href = generateSubcategoryHref(category.name, item);
                        const isActive = pathname === href;
                        return (
                          <li key={item}>
                            <Link
                              href={href}
                              onClick={onClose}
                              className={`block px-3 py-1.5 rounded-md text-sm transition-all duration-150 ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-white/10 text-gray-300"
                              }`}
                            >
                              {item}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-100 hover:text-white bg-white/10 rounded-lg p-2 px-4 mt-4"
          >
            <FaHome size={24} /> Home
          </Link>
        </nav>
      </aside>
    </>
  );
}

