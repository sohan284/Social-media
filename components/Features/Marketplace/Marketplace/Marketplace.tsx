"use client";

import React, { useMemo, useState } from 'react';
import ProductCard from '../../../Cards/ProductCard';
import { useGetMarketplaceItemsQuery, useDeleteProductMutation, MarketplaceItem } from '@/store/marketplaceApi';
import { useGetCurrentUserProfileQuery } from '@/store/authApi';
import { getUsernameFromToken, getStoredAccessToken } from '@/lib/auth';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import EditProductModal from '@/components/admin/EditProductModal';
import ProductDetailsModal from '@/components/admin/ProductDetailsModal';

const Marketplace = () => {
    const { data: itemsResponse, isLoading, isError, refetch } = useGetMarketplaceItemsQuery();
    const { data: userProfile } = useGetCurrentUserProfileQuery();
    const [deleteProduct] = useDeleteProductMutation();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{
        id: number | string;
        name: string;
    } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<MarketplaceItem & {
        status?: string;
        name?: string;
        user_name?: string;
        location?: string;
        description?: string;
    } | null>(null);
    const [productToView, setProductToView] = useState<MarketplaceItem & {
        status?: string;
        name?: string;
        user_name?: string;
        location?: string;
        description?: string;
        link?: string;
    } | null>(null);

    // Get current user's username
    const currentUsername = useMemo(() => {
        const token = getStoredAccessToken();
        if (token) {
            return getUsernameFromToken(token) || userProfile?.data?.username || null;
        }
        return userProfile?.data?.username || null;
    }, [userProfile]);

    // Filter only published items for browse
    const items = useMemo(() => {
        if (!itemsResponse) return [];
        const allItems = (
            itemsResponse.data ??
            itemsResponse.results?.data ??
            itemsResponse.items ??
            []
        );
        // Only show published items in browse
        return allItems.filter((item) => {
            const status = (item as MarketplaceItem & { status?: string }).status;
            return status === "published";
        });
    }, [itemsResponse]);

    const handleEditClick = (item: MarketplaceItem) => {
        setProductToEdit(item as MarketplaceItem & {
            status?: string;
            name?: string;
            user_name?: string;
            location?: string;
            description?: string;
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (item: MarketplaceItem) => {
        const productName = (item.name || item.title || "Service") as string;
        setProductToDelete({ id: item.id, name: productName });
        setDeleteDialogOpen(true);
    };


    const handleViewDetails = (item: MarketplaceItem) => {
        setProductToView(item as MarketplaceItem & {
            status?: string;
            name?: string;
            user_name?: string;
            location?: string;
            description?: string;
            link?: string;
        });
        setIsDetailsModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        try {
            await deleteProduct(productToDelete.id).unwrap();
            toast.success("Service deleted successfully!");
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
            {isLoading ? (
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
            ) : isError ? (
                <div className="px-2 md:px-4 py-8 text-center">
                    <p className="text-red-400 text-sm">
                        Failed to load services. Please try again later.
                    </p>
                </div>
            ) : !items.length ? (
                <div className="px-2 md:px-4 py-8 text-center">
                    <p className="text-white/60 text-sm">
                        No published services available at the moment.
                    </p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-2 md:px-4'>
                    {items.map((item) => {
                        const isOwner = isProductOwner(item);
                        return (
                            <ProductCard
                                key={item.id}
                                id={item.id}
                                title={(item.title || (item as { name?: string }).name) as string | undefined}
                                image={item.image || item.images?.[0]}
                                description={item.description}
                                location={item.location}
                                link={item.link}
                                seller={item.seller}
                                user_name={(item as { user_name?: string }).user_name}
                                isOwner={isOwner}
                                onEdit={isOwner ? () => handleEditClick(item) : undefined}
                                onDelete={isOwner ? () => handleDeleteClick(item) : undefined}
                                onViewDetails={() => handleViewDetails(item)}
                            />
                        );
                    })}
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Service?"
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