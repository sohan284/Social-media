import React from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";

interface ProductCardProps {
    image?: string;
    title?: string;
    price?: string;
    rating?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ image = "https://media.istockphoto.com/id/1414801672/photo/cardboard-box-with-cosmetics-product-in-front-od-open-door-buying-online-and-delivery.jpg?s=612x612&w=0&k=20&c=SA9VCzp-QtpzlliX8dM_uoH8K20U1gHqYfsWP08aLl0=", title = "Product Title", price = "$100", rating = 4.5 }) => {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/ backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ">
            {/* Product Image */}
            <div className="relative w-full  overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    width={500}
                    height={500}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Product Info */}
            <div className="p-4 flex justify-between items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-300 line-clamp-1">{title}</h3>

                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-indigo-600">{price}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
