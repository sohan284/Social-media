"use client";

import React, { useMemo } from 'react';
import ProductCard from '../../../Cards/ProductCard';
import { useGetMarketplaceItemsQuery } from '@/store/marketplaceApi';

const Marketplace = () => {
    const { data: itemsResponse, isLoading, isError } = useGetMarketplaceItemsQuery();

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

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 md:px-4'>
            {items.map((item) => (
                <ProductCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    image={item.image || item.images?.[0]}
                    description={item.description}
                    condition={item.condition}
                    location={item.location}
                    seller={item.seller}
                />
            ))}
        </div>
    );
};

export default Marketplace;