"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useGetProductsQuery, useDeleteProductMutation, MarketplaceItem } from "@/store/marketplaceApi";
import { getApiBaseUrl } from "@/lib/utils";
import { CustomTable, Column } from "@/components/admin/CustomTable";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProductDetailsModal from "@/components/admin/ProductDetailsModal";
import EditProductModal from "@/components/admin/EditProductModal";

export default function AllProductsTable() {
  const { data, isLoading, isError, refetch } = useGetProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: number | string;
    name: string;
  } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{
    status?: string;
    name?: string;
    user_name?: string;
    condition?: string;
    location?: string;
  } & MarketplaceItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<{
    status?: string;
    name?: string;
    user_name?: string;
    condition?: string;
    location?: string;
  } & MarketplaceItem | null>(null);

  // Extract products from different possible response structures
  const products = useMemo(() => {
    const allProducts = data?.data || data?.results?.data || data?.items || data?.products || [];
    return Array.isArray(allProducts) ? allProducts : [];
  }, [data]);

  // Filter only published products
  const publishedProducts = useMemo(() => {
    return products.filter((product: MarketplaceItem) => {
      const status = (product as { status?: string }).status;
      return status === "published";
    });
  }, [products]);

  const getImageUrl = (image: string | undefined) => {
    if (!image) return "/sheep.jpg";
    if (image.startsWith("http")) return image;
    const baseUrl = getApiBaseUrl();
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = image.startsWith("/") ? image.slice(1) : image;
    return `${cleanBase}/${cleanPath}`;
  };

  const formatPrice = (price: number | string | undefined) => {
    if (!price) return "N/A";
    if (typeof price === "number") return `$${price.toFixed(2)}`;
    return price;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
    } catch {
      return "N/A";
    }
  };

  // Define table columns - matching actual API response structure
  type ProductRow = MarketplaceItem & {
    status?: string;
    name?: string;
    user_name?: string;
    condition?: string;
    location?: string;
  };

  const columns: Column<ProductRow>[] = [
    {
      header: "SL",
      accessor: (row, index) => <span>{index + 1}.</span>,
    },
    {
      header: "Image",
      accessor: (row) => (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
          <Image
            src={getImageUrl(row.image || row.images?.[0])}
            alt={(row.name || row.title || "Product") as string}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ),
    },
    {
      header: "Product Name",
      accessor: (row) => {
        const productName = (row.name || row.title || "N/A") as string;
        return (
          <div className="max-w-xs truncate" title={productName}>
            {productName}
          </div>
        );
      },
    },
    {
      header: "Price",
      accessor: (row) => {
        const price = row.price;
        if (typeof price === "string" && price.includes(".")) {
          return <span>${parseFloat(price).toFixed(2)}</span>;
        }
        return <span>{formatPrice(price)}</span>;
      },
    },
    {
      header: "Category",
      accessor: (row) => (
        <span>
          {row.category_name || row.subcategory_name || row.sub_category_name || "N/A"}
        </span>
      ),
    },
    {
      header: "Condition",
      accessor: (row) => (
        <span className="capitalize">{row.condition || "N/A"}</span>
      ),
    },
    {
      header: "Location",
      accessor: (row) => (
        <span className="max-w-xs truncate" title={row.location}>
          {row.location || "N/A"}
        </span>
      ),
    },
    {
      header: "Seller",
      accessor: (row) => {
        const sellerName = (row.user_name || row.seller?.username || row.seller?.display_name || "N/A") as string;
        return <span>{sellerName}</span>;
      },
    },
    {
      header: "Date",
      accessor: (row) => <span>{formatDate(row.created_at)}</span>,
    },
    {
      header: "Status",
      accessor: (row) => {
        const status = (row.status || "N/A") as string;
        return (
          <div className="flex items-center justify-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === "published"
                  ? "bg-green-500/20 text-green-300"
                  : "bg-gray-500/20 text-gray-300"
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
      className: "text-center",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setProductToEdit(row);
              setIsEditModalOpen(true);
            }}
            className="p-2 cursor-pointer text-blue-400 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title="Edit product"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M21.7 7.3l-5-5c-.4-.4-1-.4-1.4 0l-12 12c-.1.1-.2.3-.2.4l-1 6c-.1.5.4 1 .9.9l6-1c.1 0 .3-.1.4-.2l12-12c.4-.4.4-1 0-1.4zM7.6 19.2l-3.5.6.6-3.5L14 6l2.9 2.9-9.3 9.3z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const productName = (row.name || row.title || "Product") as string;
              handleDeleteClick(row.id, productName);
            }}
            className="p-2 cursor-pointer text-red-500 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title="Delete product"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        </div>
      ),
      className: "text-center",
    },
  ];

  const handleDeleteClick = (id: number | string, name: string) => {
    setProductToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id).unwrap();
      toast.success("Product deleted successfully!");
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { error?: string; message?: string } })?.data?.error ||
        (error as { data?: { error?: string; message?: string } })?.data?.message ||
        "Failed to delete";
      toast.error("Failed to delete", { description: errorMessage });
    }
  };

  const handleRowClick = (product: ProductRow) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleProductUpdated = () => {
    // Refetch products after update
    refetch();
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 border bg-black/30 backdrop-blur-sm rounded-xl border-white/20">
        <h2 className="text-2xl font-semibold text-center mb-8">All Products</h2>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-20 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-6 border bg-black/30 backdrop-blur-sm rounded-xl border-white/20">
        <h2 className="text-2xl font-semibold text-center mb-8">All Products</h2>
        <div className="text-center py-12">
          <p className="text-red-400 text-lg mb-2">Failed to load products</p>
          <p className="text-white/60 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full p-6 border bg-black/30 backdrop-blur-sm rounded-xl border-white/20">
        <h2 className="text-2xl font-semibold text-center mb-8">All Products</h2>

        <div className="mt-8">
          <CustomTable
            columns={columns}
            data={publishedProducts}
            emptyMessage="No published products found."
            onRowClick={handleRowClick}
          />
        </div>
      </div>

      {/* PRODUCT DETAILS MODAL */}
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      {/* EDIT PRODUCT MODAL */}
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

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product?"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
      />
    </>
  );
}

