import React from 'react';
import ProductCard from '../../../Cards/ProductCard';

const Marketplace = () => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 xl:gap-20 px-4'>
            <ProductCard />
        </div>
    );
};

export default Marketplace;