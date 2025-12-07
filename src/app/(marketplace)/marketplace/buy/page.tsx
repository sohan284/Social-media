"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../../../../components/Cards/ProductCard';

const BuyPage = () => {
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');

    // You can use these params to fetch data from your API
    // Example: const { data } = useGetProductsQuery({ category, subcategory });

    return (
        <div>
            {(category || subcategory) && (
                <div className='mb-4 px-2 md:px-4 text-sm text-gray-300'>
                    {category && <span>Category: <span className='font-semibold text-white'>{category}</span></span>}
                    {subcategory && <span className='ml-4'>Subcategory: <span className='font-semibold text-white'>{subcategory}</span></span>}
                </div>
            )}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 md:px-4'>
                {Array.from({ length: 30 }).map((_, index) => (
                    <ProductCard key={index} />
                ))}
            </div>
        </div>
    );
};

export default BuyPage;