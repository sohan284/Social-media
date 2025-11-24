import React from 'react';

const categories = [
    {
        name: 'Home & Garden',
        items: ['Furniture', 'Appliances', 'Home Decor', 'Home Improvement']
    },
    {
        name: 'Electronics',
        items: ['Smartphones', 'Laptops', 'Tablets', 'Smart Home']
    },
    {
        name: 'Clothing',
        items: ['Men\'s Clothing', 'Women\'s Clothing', 'Children\'s Clothing']
    },
    {
        name: 'Books',
        items: ['Fiction', 'Non-Fiction', 'Children\'s Books']
    },
    {
        name: 'Accessories',
        items: ['Jewelry', 'Watches', 'Bags']
    },
    {
        name: 'Sports & Outdoors',
        items: ['Sports Equipment', 'Outdoor Gear', 'Fitness Equipment']
    },
    {
        name: 'Health & Beauty',
        items: ['Health & Beauty', 'Skin Care', 'Hair Care', 'Body Care']
    },
    {
        name: 'Toys & Games',
        items: ['Toys', 'Games', 'Puzzles']
    },
    {
        name: 'Automotive',
        items: ['Cars', 'Motorcycles', 'Parts & Accessories']
    }
]

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