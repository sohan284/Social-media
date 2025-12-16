"use client";

import React, { useMemo, useState } from 'react';
import ProductCard from '../../../Cards/ProductCard';
import { useGetMarketplaceItemsQuery, useDeleteProductMutation, MarketplaceItem } from '@/store/marketplaceApi';
import { useGetCurrentUserProfileQuery } from '@/store/authApi';
import { getUsernameFromToken, getStoredAccessToken } from '@/lib/auth';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import EditProductModal from '@/components/admin/EditProductModal';
import { useRouter } from 'next/navigation';

const Marketplace = () => {
    const { data: itemsResponse, isLoading, isError, refetch } = useGetMarketplaceItemsQuery();
    const { data: userProfile } = useGetCurrentUserProfileQuery();
    const [deleteProduct] = useDeleteProductMutation();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const router = useRouter();
    const [productToDelete, setProductToDelete] = useState<{
        id: number | string;
        name: string;
    } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<MarketplaceItem & {
        status?: string;
        name?: string;
        user_name?: string;
        condition?: string;
        location?: string;
        description?: string;
    } | null>(null);

    // Get current user's username
    const currentUsername = useMemo(() => {
        const token = getStoredAccessToken();
        if (token) {
            return getUsernameFromToken(token) || userProfile?.data?.username || null;
        }
        return userProfile?.data?.username || null;
    }, [userProfile]);

    const items = useMemo(() => {
        if (!itemsResponse) return [];
        return (
            itemsResponse.data ??
            itemsResponse.results?.data ??
            itemsResponse.items ??
            []
        );
    }, [itemsResponse]);

    if (isLoading) {
        return (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 md:px-4'>
                {Array.from({ length: 12 }).map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse rounded-2xl bg-white/5 border border-white/10 aspect-square"
                    >
                        <div className="w-full h-full bg-white/10 rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="px-2 md:px-4 py-8 text-center">
                <p className="text-red-400 text-sm">
                    Failed to load products. Please try again later.
                </p>
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="px-2 md:px-4 py-8 text-center">
                <p className="text-white/60 text-sm">
                    No products available at the moment.
                </p>
            </div>
        );
    }

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

    const handleDeleteClick = (item: MarketplaceItem) => {
        const productName = (item.name || item.title || "Product") as string;
        setProductToDelete({ id: item.id, name: productName });
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        try {
            await deleteProduct(productToDelete.id).unwrap();
            toast.success("Product deleted successfully!");
            setDeleteDialogOpen(false);
            setProductToDelete(null);
            refetch();
        } catch (error: unknown) {
            const errorMessage =
                (error as { data?: { error?: string; message?: string } })?.data?.error ||
                (error as { data?: { error?: string; message?: string } })?.data?.message ||
                "Failed to delete";
            toast.error("Failed to delete", { description: errorMessage });
        }
    };

    const handleProductUpdated = () => {
        refetch();
    };

    // Check if current user owns the product
    const isProductOwner = (item: MarketplaceItem) => {
        if (!currentUsername) return false;
        const sellerUsername = (item.user_name as string | undefined) || (item.seller?.username as string | undefined);
        return sellerUsername === currentUsername;
    };

    return (
        <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 md:px-4'>
                {items.map((item) => {
                    const isOwner = isProductOwner(item);
                    return (
                        <ProductCard
                            key={item.id}
                            id={item.id}
                            title={(item.title || (item as { name?: string }).name) as string | undefined}
                            price={item.price}
                            image={item.image || item.images?.[0]}
                            description={item.description}
                            condition={item.condition}
                            location={item.location}
                            seller={item.seller}
                            user_name={(item as { user_name?: string }).user_name}
                            isOwner={isOwner}
                            onEdit={isOwner ? () => handleEditClick(item) : undefined}
                            onDelete={isOwner ? () => handleDeleteClick(item) : undefined}
                            onCardClick={() => {router.push(`/marketplace/product/${item.id}`)}}
                        />
                    );
                })}
            </div>

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

            {/* Delete Confirmation Dialog */}
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
};

export default Marketplace;