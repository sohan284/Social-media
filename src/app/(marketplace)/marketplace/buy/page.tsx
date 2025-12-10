"use client";

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../../../../components/Cards/ProductCard';
import { useGetMarketplaceItemsQuery, useGetMarketplaceCategoriesQuery } from '@/store/marketplaceApi';

const BuyPage = () => {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');

    // Fetch all items and categories
    const { data: itemsResponse, isLoading, isError } = useGetMarketplaceItemsQuery();
    const { data: categoriesResponse } = useGetMarketplaceCategoriesQuery();

    // Get all categories to map names
    const categories = useMemo(() => {
        const data = categoriesResponse?.data || categoriesResponse?.results?.data || [];
        return Array.isArray(data) ? data : [];
    }, [categoriesResponse]);

    // Find category and subcategory names from the params
    const selectedCategoryName = useMemo(() => {
        if (!categoryParam) return null;
        const camelCaseCategory = categoryParam;
        // Find matching category by converting names to camelCase
        return categories.find((cat) => {
            const camelCase = cat.name
                .replace(/[^a-zA-Z0-9\s]/g, "")
                .split(/\s+/)
                .map((word, index) => {
                    if (index === 0) return word.toLowerCase();
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join("");
            return camelCase === camelCaseCategory;
        })?.name || null;
    }, [categoryParam, categories]);

    const selectedSubcategoryName = useMemo(() => {
        if (!subcategoryParam || !selectedCategoryName) return null;
        const category = categories.find((cat) => cat.name === selectedCategoryName);
        if (!category) return null;
        
        const camelCaseSubcategory = subcategoryParam;
        return category.subcategories.find((sub) => {
            const camelCase = sub.name
                .replace(/[^a-zA-Z0-9\s]/g, "")
                .split(/\s+/)
                .map((word, index) => {
                    if (index === 0) return word.toLowerCase();
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join("");
            return camelCase === camelCaseSubcategory;
        })?.name || null;
    }, [subcategoryParam, selectedCategoryName, categories]);

    // Get all items from response
    const allItems = useMemo(() => {
        if (!itemsResponse) return [];
        return (
            itemsResponse.data ??
            itemsResponse.results?.data ??
            itemsResponse.items ??
            []
        );
    }, [itemsResponse]);

    // Filter items by category and subcategory
    const items = useMemo(() => {
        if (!allItems.length) return [];
        
        let filtered = allItems;

        // Filter by category if selected
        if (selectedCategoryName) {
            filtered = filtered.filter((item) => {
                // Check both category and category_name fields (case-insensitive)
                const itemCategory = (item.category_name || item.category || '').toLowerCase().trim();
                const selectedCategory = selectedCategoryName.toLowerCase().trim();
                return itemCategory === selectedCategory;
            });
        }

        // Filter by subcategory if selected
        if (selectedSubcategoryName) {
            filtered = filtered.filter((item) => {
                // Check sub_category_name, subcategory_name, and subcategory fields (case-insensitive)
                const itemSubcategory = (
                    item.sub_category_name || 
                    item.subcategory_name || 
                    item.subcategory || 
                    ''
                ).toLowerCase().trim();
                const selectedSubcategory = selectedSubcategoryName.toLowerCase().trim();
                return itemSubcategory === selectedSubcategory;
            });
        }

        return filtered;
    }, [allItems, selectedCategoryName, selectedSubcategoryName]);

    if (isLoading) {
        return (
            <div>
                {(selectedCategoryName || selectedSubcategoryName) && (
                    <div className='mb-4 px-2 md:px-4 text-sm text-gray-300'>
                        {selectedCategoryName && <span>Category: <span className='font-semibold text-white'>{selectedCategoryName}</span></span>}
                        {selectedSubcategoryName && <span className='ml-4'>Subcategory: <span className='font-semibold text-white'>{selectedSubcategoryName}</span></span>}
                    </div>
                )}
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
            </div>
        );
    }

    if (isError) {
        return (
            <div>
                {(selectedCategoryName || selectedSubcategoryName) && (
                    <div className='mb-4 px-2 md:px-4 text-sm text-gray-300'>
                        {selectedCategoryName && <span>Category: <span className='font-semibold text-white'>{selectedCategoryName}</span></span>}
                        {selectedSubcategoryName && <span className='ml-4'>Subcategory: <span className='font-semibold text-white'>{selectedSubcategoryName}</span></span>}
                    </div>
                )}
                <div className="px-2 md:px-4 py-8 text-center">
                    <p className="text-red-400 text-sm">
                        Failed to load products. Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    if (!items.length) {
        return (
            <div>
                {(selectedCategoryName || selectedSubcategoryName) && (
                    <div className='mb-4 px-2 md:px-4 text-sm text-gray-300'>
                        {selectedCategoryName && <span>Category: <span className='font-semibold text-white'>{selectedCategoryName}</span></span>}
                        {selectedSubcategoryName && <span className='ml-4'>Subcategory: <span className='font-semibold text-white'>{selectedSubcategoryName}</span></span>}
                    </div>
                )}
                <div className="px-2 md:px-4 py-8 text-center">
                    <p className="text-white/60 text-sm">
                        {selectedCategoryName || selectedSubcategoryName
                            ? "No products found for the selected filters."
                            : "No products available at the moment."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {(selectedCategoryName || selectedSubcategoryName) && (
                <div className='mb-4 px-2 md:px-4 text-sm text-gray-300'>
                    {selectedCategoryName && <span>Category: <span className='font-semibold text-white'>{selectedCategoryName}</span></span>}
                    {selectedSubcategoryName && <span className='ml-4'>Subcategory: <span className='font-semibold text-white'>{selectedSubcategoryName}</span></span>}
                </div>
            )}
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
        </div>
    );
};

export default BuyPage;