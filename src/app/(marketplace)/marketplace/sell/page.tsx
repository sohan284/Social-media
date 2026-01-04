"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { FaUpload } from "react-icons/fa";
import { useGetMarketplaceCategoriesQuery, useCreateProductMutation, useGetMarketplaceItemsQuery, usePatchProductStatusMutation, MarketplaceItem } from "@/store/marketplaceApi";
import { useGetCurrentUserProfileQuery } from "@/store/authApi";
import { getUsernameFromToken, getStoredAccessToken } from "@/lib/auth";
import { toast } from "sonner";
import ProductCard from "../../../../../components/Cards/ProductCard";
import EditProductModal from "@/components/admin/EditProductModal";
import ProductDetailsModal from "@/components/admin/ProductDetailsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormData {
  name: string;
  price: string;
  condition: string;
  sub_category: number;
  description?: string;
  location?: string;
  link?: string;
  image: File | null;
}

const inputClass =
  "w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-sm sm:text-base";

const selectClass = `${inputClass} cursor-pointer`;

export default function SalePage() {
  const { register, handleSubmit, watch, reset, setValue } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      price: "",
      condition: "",
      sub_category: 0,
      description: "",
      location: "",
      link: "",
      image: null,
    },
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<MarketplaceItem & {
    status?: string;
    name?: string;
    user_name?: string;
    condition?: string;
    location?: string;
    description?: string;
  } | null>(null);
  const [productToView, setProductToView] = useState<MarketplaceItem & {
    status?: string;
    name?: string;
    user_name?: string;
    condition?: string;
    location?: string;
    description?: string;
    link?: string;
  } | null>(null);
  
  const { data: categoriesResponse } = useGetMarketplaceCategoriesQuery();
  const { data: itemsResponse, refetch: refetchItems } = useGetMarketplaceItemsQuery();
  const { data: userProfile } = useGetCurrentUserProfileQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [patchProductStatus] = usePatchProductStatusMutation();

  const categories = categoriesResponse?.data || categoriesResponse?.results?.data || [];
  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Get current user's username
  const currentUsername = useMemo(() => {
    const token = getStoredAccessToken();
    if (token) {
      return getUsernameFromToken(token) || userProfile?.data?.username || null;
    }
    return userProfile?.data?.username || null;
  }, [userProfile]);

  // Get all items and filter for user's draft items
  const draftItems = useMemo(() => {
    if (!itemsResponse || !currentUsername) return [];
    const allItems = (
      itemsResponse.data ??
      itemsResponse.results?.data ??
      itemsResponse.items ??
      []
    );
    // Filter for current user's draft items
    return allItems.filter((item) => {
      const status = (item as MarketplaceItem & { status?: string }).status;
      const sellerUsername = (item.user_name as string | undefined) || (item.seller?.username as string | undefined);
      return status === "draft" && sellerUsername === currentUsername;
    });
  }, [itemsResponse, currentUsername]);

  useEffect(() => {
    if (selectedSubcategoryId) {
      setValue("sub_category", selectedSubcategoryId);
    }
  }, [selectedSubcategoryId, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    if (!data.image) {
      toast.error("Please upload an image");
      return;
    }

    if (!selectedSubcategoryId) {
      toast.error("Please select a subcategory");
      return;
    }

    try {
      await createProduct({
        name: data.name,
        image: data.image,
        price: data.price,
        condition: data.condition,
        status: "published",
        sub_category: selectedSubcategoryId,
        description: data.description,
        location: data.location,
        link: data.link,
      }).unwrap();
      
      toast.success("Product created successfully!");
      reset();
      setImagePreviews([]);
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
      refetchItems();
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || "Failed to create product";
      toast.error(errorMessage);
    }
  };

  const handleDraft = async () => {
    const data = watch();
    if (!data.image) {
      toast.error("Please upload an image");
      return;
    }

    if (!selectedSubcategoryId) {
      toast.error("Please select a subcategory");
      return;
    }

    try {
      await createProduct({
        name: data.name,
        image: data.image,
        price: data.price,
        condition: data.condition,
        status: "draft",
        sub_category: selectedSubcategoryId,
        description: data.description,
        location: data.location,
        link: data.link,
      }).unwrap();
      
      toast.success("Draft saved successfully!");
      reset();
      setImagePreviews([]);
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
      refetchItems();
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || "Failed to save draft";
      toast.error(errorMessage);
    }
  };

  const handlePublishDraft = async (item: MarketplaceItem) => {
    try {
      await patchProductStatus({
        id: item.id,
        status: "published",
      }).unwrap();
      toast.success("Product published successfully!");
      refetchItems();
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { error?: string; message?: string } })?.data?.error ||
        (error as { data?: { error?: string; message?: string } })?.data?.message ||
        "Failed to publish product";
      toast.error("Failed to publish product", { description: errorMessage });
    }
  };

  const handleEditClick = (item: MarketplaceItem) => {
    setProductToEdit(item as MarketplaceItem & {
      status?: string;
      name?: string;
      user_name?: string;
      condition?: string;
      location?: string;
      description?: string;
    });
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (item: MarketplaceItem) => {
    setProductToView(item as MarketplaceItem & {
      status?: string;
      name?: string;
      user_name?: string;
      condition?: string;
      location?: string;
      description?: string;
      link?: string;
    });
    setIsDetailsModalOpen(true);
  };

  const handleProductUpdated = () => {
    refetchItems();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      toast.error("Selected image is greater than 3MB");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreviews([previewUrl]);
    setValue("image", file);
  };

  const handleCategoryChange = (value: string) => {
    const categoryId = parseInt(value);
    setSelectedCategoryId(categoryId || null);
    setSelectedSubcategoryId(null);
    setValue("sub_category", 0);
  };

  const handleSubcategoryChange = (value: string) => {
    const subcategoryId = parseInt(value);
    setSelectedSubcategoryId(subcategoryId || null);
  };

  const handleConditionChange = (value: string) => {
    setValue("condition", value);
  };

  const watchFields = watch();
  const previewImage = imagePreviews[0] || null;

  return (
    <div className="text-white flex flex-col gap-6">
      
      {/* Form Section */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-6">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/3 backdrop-blur-[17px] rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Item For Sale
        </h2>
        
        <p className="text-sm mb-4 text-gray-300">Required</p>

        {/* Image Upload */}
        <div className="flex flex-wrap gap-4 mb-2">
          {imagePreviews[0] ? (
            <div className="w-40 h-32 rounded-md overflow-hidden border border-white/20 relative">
              <Image
                src={imagePreviews[0]}
                alt="preview"
                width={160}
                height={128}
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreviews([]);
                  setValue("image", null);
                }}
                className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-40 h-32 bg-black/30 border border-gray-400/40 rounded-md cursor-pointer hover:bg-black/40 transition">
              <FaUpload className="text-2xl text-gray-300 mb-2" />
              <span className="text-sm text-gray-300">Add Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input
            {...register("name", { required: true })}
            placeholder="Product Name"
            className={inputClass}
          />
          <input
            {...register("price", { required: true })}
            placeholder="Price"
            type="number"
            step="0.01"
            className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          />
          
          {/* Category Dropdown */}
          <Select
            value={selectedCategoryId?.toString() || ""}
            onValueChange={handleCategoryChange}
            required
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20 text-white">
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id.toString()}
                  className="focus:bg-purple-500/20 focus:text-white cursor-pointer"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subcategory Dropdown */}
          <Select
            value={selectedSubcategoryId?.toString() || ""}
            onValueChange={handleSubcategoryChange}
            disabled={!selectedCategoryId || availableSubcategories.length === 0}
            required
          >
            <SelectTrigger className={selectClass} disabled={!selectedCategoryId || availableSubcategories.length === 0}>
              <SelectValue placeholder="Select Subcategory" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20 text-white">
              {availableSubcategories.map((subcategory) => (
                <SelectItem
                  key={subcategory.id}
                  value={subcategory.id.toString()}
                  className="focus:bg-purple-500/20 focus:text-white cursor-pointer"
                >
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Condition Dropdown */}
          <Select
            value={watchFields.condition || ""}
            onValueChange={handleConditionChange}
            required
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Select Condition" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20 text-white">
              <SelectItem value="new" className="focus:bg-purple-500/20 focus:text-white cursor-pointer">
                New
              </SelectItem>
              <SelectItem value="old" className="focus:bg-purple-500/20 focus:text-white cursor-pointer">
                Old (Used)
              </SelectItem>
            </SelectContent>
          </Select>
          <textarea
            {...register("description")}
            placeholder="Description"
            rows={4}
            className={inputClass}
          />
          <input
            {...register("location")}
            placeholder="Location"
            className={inputClass}
          />
          <input
            {...register("link")}
            type="url"
            placeholder="Product Link (URL to buy the product)"
            className={inputClass}
          />

          {/* Buttons */}
          <div className="flex justify-between mt-2">
            <button
              type="button"
              onClick={handleDraft}
              disabled={isCreating}
              className="w-32 bg-gray-400 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-black py-2 rounded-full font-semibold duration-300 transition-all cursor-pointer"
            >
              {isCreating ? "Saving..." : "Draft"}
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="w-32 bg-[#007406]  hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-full font-semibold duration-300 transition-all cursor-pointer"
            >
              {isCreating ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </div>

      {/* Right Side - Preview */}
      <div className="w-full lg:w-2/3 backdrop-blur-[17px] rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">Preview</h2>
        
        {/* Preview Image */}
        <div className="w-full h-[500px] mb-6 rounded-lg overflow-hidden bg-black/30 border border-white/20">
          {previewImage ? (
            <Image
              src={previewImage}
              alt="Item preview"
              width={600}
              height={600}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>No image uploaded</span>
            </div>
          )}
        </div>

        {/* Preview Details */}
        <div className="space-y-3">
          <div className="flex justify-between mx-20 items-start">
            <h3 className="text-xl font-semibold">
              {watchFields.name || "Product Name"}
            </h3>
            {watchFields.price && (
              <span className="text-xl font-semibold text-green-400">
                ${watchFields.price}
              </span>
            )}
          </div>
          
          {selectedCategoryId && (
            <p className="text-sm text-gray-300">
              <span className="font-medium">Category:</span> {selectedCategory?.name}
            </p>
          )}
          
          {selectedSubcategoryId && (
            <p className="text-sm text-gray-300">
              <span className="font-medium">Subcategory:</span> {availableSubcategories.find(s => s.id === selectedSubcategoryId)?.name}
            </p>
          )}
          
          {watchFields.condition && (
            <p className="text-sm text-gray-300">
              <span className="font-medium">Condition:</span> {watchFields.condition}
            </p>
          )}
          
          {watchFields.description && (
            <p className="text-sm text-gray-300">
              <span className="font-medium">Description:</span> {watchFields.description}
            </p>
          )}
          
          {watchFields.location && (
            <p className="text-sm text-gray-300">
              <span className="font-medium">Location:</span> {watchFields.location}
            </p>
          )}
        </div>
      </div>
      </div>
      {/* Draft Items Section */}
      {draftItems.length > 0 && (
        <div className="w-full backdrop-blur-[17px] rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">My Drafts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {draftItems.map((item) => (
              <div key={item.id} className="relative">
                <ProductCard
                  id={item.id}
                  title={(item.title || (item as { name?: string }).name) as string | undefined}
                  price={item.price}
                  image={item.image || item.images?.[0]}
                  description={item.description}
                  condition={item.condition}
                  location={item.location}
                  link={item.link}
                  seller={item.seller}
                  user_name={(item as { user_name?: string }).user_name}
                  isOwner={true}
                  onEdit={() => handleEditClick(item)}
                  onViewDetails={() => handleViewDetails(item)}
                />
                <button
                  onClick={() => handlePublishDraft(item)}
                  className="absolute cursor-pointer top-2 left-2 flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-all duration-300 z-10"
                >
                  Publish
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProductToEdit(null);
        }}
        product={productToEdit}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setProductToEdit(null);
          handleProductUpdated();
        }}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setProductToView(null);
        }}
        product={productToView}
      />
    </div>
  );
}
