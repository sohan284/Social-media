import React from "react";
import Image from "next/image";
import { getApiBaseUrl } from "@/lib/utils";

interface ProductCardProps {
    image?: string;
    title?: string;
    price?: number | string;
    description?: string;
    id?: number | string;
    condition?: string;
    location?: string;
    seller?: {
        username?: string;
        display_name?: string;
    };
}

const ProductCard: React.FC<ProductCardProps> = ({ 
    image, 
    title = "Product Title", 
    price, 
    description,
    condition,
    location,
    seller
}) => {
    const imageUrl = image 
        ? (image.startsWith('http') ? image : `${getApiBaseUrl()}${image.startsWith('/') ? image.slice(1) : image}`)
        : "/sheep.jpg";
    
    const formattedPrice = price 
        ? typeof price === 'number' 
            ? `$${price.toFixed(2)}` 
            : price
        : "Price not available";

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            {/* Product Image */}
            <div className="relative w-full aspect-square overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white line-clamp-2 min-h-[3.5rem]">{title}</h3>
                
                {description && (
                    <p className="text-sm text-white/70 line-clamp-2">{description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-xl font-bold text-indigo-400">{formattedPrice}</span>
                    {condition && (
                        <span className="text-xs text-white/50 px-2 py-1 bg-white/10 rounded-full">
                            {condition}
                        </span>
                    )}
                </div>

                {(location || seller) && (
                    <div className="flex items-center gap-2 text-xs text-white/50 pt-1">
                        {location && <span>{location}</span>}
                        {seller?.display_name && (
                            <span className="ml-auto">by {seller.display_name}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
