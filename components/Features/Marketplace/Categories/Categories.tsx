import React from 'react';
import { categories } from './categoriesData';

const Categories = () => {
    return (
        <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10 xl:gap-20 px-4'>
            {categories.map((category) => (
                <div key={category.name}>
                    <h1 className='xl:text-2xl md:text-xl text-lg font-bold mb-4'>{category.name}</h1>
                    <ul className='flex flex-col gap-2'>
                        {category.items.map((item) => (
                            <li key={item} className='font-medium text-sm md:text-base'>{item}</li>
                        ))}
                    </ul>
                </div>
            ))}

        </div>
    );
};

export default Categories;