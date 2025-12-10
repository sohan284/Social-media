"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Category, Subcategory } from "@/store/categoryApi";
import { MarketplaceCategory, MarketplaceSubcategory } from "@/store/marketplaceApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; categoryName?: string }) => void;
  type: "category" | "subcategory";
  editingCategory?: Category | MarketplaceCategory | null;
  editingSubcategory?: { subcategory: Subcategory | MarketplaceSubcategory; categoryName: string } | null;
  categories: (Category | MarketplaceCategory)[];
  selectedCategoryForSubcategory?: string;
  onCategoryChange?: (categoryName: string) => void;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  editingCategory,
  editingSubcategory,
  categories,
  selectedCategoryForSubcategory = "",
  onCategoryChange,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(selectedCategoryForSubcategory);

  useEffect(() => {
    if (isOpen) {
      if (type === "category" && editingCategory) {
        setName(editingCategory.name);
      } else if (type === "subcategory" && editingSubcategory) {
        setName(editingSubcategory.subcategory.name);
        setSelectedCategory(editingSubcategory.categoryName);
      } else {
        setName("");
        setSelectedCategory(selectedCategoryForSubcategory);
      }
    }
  }, [
    isOpen,
    type,
    editingCategory,
    editingSubcategory,
    selectedCategoryForSubcategory,
  ]);

  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategory);
    }
  }, [selectedCategory, onCategoryChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    if (type === "subcategory" && !selectedCategory) {
      return;
    }
    onSubmit({
      name: name.trim(),
      categoryName: type === "subcategory" ? selectedCategory : undefined,
    });
  };

  const handleClose = () => {
    setName("");
    setSelectedCategory("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/80 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-white/20">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingCategory || editingSubcategory
              ? `Edit ${type === "category" ? "Category" : "Subcategory"}`
              : `Create ${type === "category" ? "Category" : "Subcategory"}`}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {type === "subcategory" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={!!editingSubcategory}
                required
              >
                <SelectTrigger className="w-full h-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#6B83FA] text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {categories.length === 0 ? (
                    <SelectItem value="" disabled>
                      No categories available
                    </SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name} className="cursor-pointer">
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === "category" ? "Category" : "Subcategory"} Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type === "category" ? "category" : "subcategory"} name`}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B83FA] text-gray-900 placeholder-gray-400"
              required
              autoFocus
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#6B83FA] hover:bg-[#5a70e8] text-white font-medium rounded-xl transition"
            >
              {editingCategory || editingSubcategory ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

