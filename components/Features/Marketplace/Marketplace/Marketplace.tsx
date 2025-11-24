import React from 'react';
import ProductCard from '../../../Cards/ProductCard';

const Marketplace = () => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 md:px-4'>
            {Array.from({ length: 50 }).map((_, index) => (
                <ProductCard key={index} />
            ))}
        </div>
    );
};

export default Marketplace;