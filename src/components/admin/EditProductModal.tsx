"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { 
  MarketplaceItem, 
  useUpdateProductMutation,
  useGetMarketplaceCategoriesQuery,
  MarketplaceCategory 
} from "@/store/marketplaceApi";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/utils";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: (MarketplaceItem & {
    status?: string;
    name?: string;
    user_name?: string;
    condition?: string;
    location?: string;
    description?: string;
  }) | null;
  onSuccess?: () => void;
}

export default function EditProductModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: EditProductModalProps) {
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const { data: categoriesResponse } = useGetMarketplaceCategoriesQuery();
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("new");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [subCategory, setSubCategory] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get all subcategories from all categories - memoized to prevent unnecessary re-renders
  const allSubcategories = useMemo(() => {
    const categories = categoriesResponse?.data || categoriesResponse?.results?.data || [];
    return categories.flatMap((cat: MarketplaceCategory) => 
      cat.subcategories.map((sub) => ({
        ...sub,
        categoryId: cat.id,
        categoryName: cat.name,
      }))
    );
  }, [categoriesResponse]);

  // Initialize form with product data - only when modal opens or product changes
  useEffect(() => {
    if (product && isOpen) {
      setName((product.name || product.title || "") as string);
      setPrice(product.price?.toString() || "");
      setCondition(product.condition || "new");
      setStatus((product.status as "draft" | "published") || "published");
      setDescription((product.description as string) || "");
      setLocation((product.location as string) || "");
      setLink((product.link as string) || "");
      
      // Find subcategory ID from product data
      const subcategoryName = product.subcategory_name || product.sub_category_name;
      if (subcategoryName && allSubcategories.length > 0) {
        const foundSub = allSubcategories.find(
          (sub) => sub.name === subcategoryName
        );
        if (foundSub) {
          setSubCategory(foundSub.id);
        }
      }

      // Set image preview and store original image URL
      if (product.image) {
        const imageUrl = product.image.startsWith("http")
          ? product.image
          : `${getApiBaseUrl()}${product.image.startsWith("/") ? product.image.slice(1) : product.image}`;
        setImagePreview(imageUrl);
        setOriginalImageUrl(imageUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, isOpen, allSubcategories.length]); // Only re-initialize when product ID or modal state changes

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !product.id) {
      toast.error("Product ID is missing");
      return;
    }

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!price.trim()) {
      toast.error("Price is required");
      return;
    }

    if (!subCategory) {
      toast.error("Subcategory is required");
      return;
    }

    try {
      // If no new image is uploaded, fetch and convert the existing image to File
      let imageToSend: File;
      
      if (imageFile) {
        // Use the new uploaded image
        imageToSend = imageFile;
      } else if (originalImageUrl) {
        // Fetch the existing image and convert to File
        try {
          const response = await fetch(originalImageUrl);
          const blob = await response.blob();
          const fileName = originalImageUrl.split('/').pop() || `product-image-${product.id}.jpg`;
          imageToSend = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
        } catch {
          toast.error("Failed to load existing image. Please upload a new image.");
          return;
        }
      } else {
        toast.error("Product image is required");
        return;
      }

      const updateData: {
        id: number | string;
        name: string;
        price: string;
        condition: string;
        status: "draft" | "published";
        sub_category: number;
        description?: string;
        location?: string;
        link?: string;
        image: File;
      } = {
        id: product.id,
        name: name.trim(),
        price: price.trim(),
        condition,
        status,
        sub_category: subCategory,
        image: imageToSend,
      };

      if (description.trim()) {
        updateData.description = description.trim();
      }

      if (location.trim()) {
        updateData.location = location.trim();
      }

      if (link.trim()) {
        updateData.link = link.trim();
      }

      await updateProduct(updateData).unwrap();
      toast.success("Product updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { error?: string; message?: string } })?.data?.error ||
        (error as { data?: { error?: string; message?: string } })?.data?.message ||
        "Failed to update product";
      toast.error("Failed to update product", { description: errorMessage });
    }
  };

  const handleClose = () => {
    setName("");
    setPrice("");
    setCondition("new");
    setStatus("published");
    setDescription("");
    setLocation("");
    setLink("");
    setSubCategory(null);
    setImageFile(null);
    setImagePreview(null);
    setOriginalImageUrl(null);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#06133f] rounded-2xl shadow-2xl w-full max-w-5xl border border-white/10">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Edit Product</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Product Image - Full Width */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Product Image
              </label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm"
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                </button>
              </div>
            </div>

            {/* Two Column Grid for Main Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B83FA] text-white placeholder-white/40"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Price <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price (e.g., 1200.00)"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B83FA] text-white placeholder-white/40"
                  required
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B83FA] text-white"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B83FA] text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Subcategory <span className="text-red-400">*</span>
                </label>
                <select
                  value={subCategory || ""}
                  onChange={(e) => setSubCategory(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B83FA] text-white"
                  required
                >
                  <option value="">Select subcategory</option>
                  {allSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.categoryName} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B83FA] text-white placeholder-white/40"
                />
              </div>

              {/* Product Link */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Product Link
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com/product"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B83FA] text-white placeholder-white/40"
                />
              </div>
            </div>

            {/* Description - Full Width */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description
              </label>
              <textarea
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B83FA] text-white placeholder-white/40 resize-y min-h-[120px] leading-relaxed"
              />
            </div>

            {/* BUTTONS - Full Width */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#6B83FA] hover:bg-[#5a70e8] text-white font-medium rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

