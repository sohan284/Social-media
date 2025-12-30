import React from "react";
import Image from "next/image";
import { Edit, Trash2, Eye } from "lucide-react";
import { getApiBaseUrl } from "@/lib/utils";

interface ProductCardProps {
    image?: string;
    title?: string;
    price?: number | string;
    description?: string;
    id?: number | string;
    condition?: string;
    location?: string;
    link?: string;
    seller?: {
        username?: string;
        display_name?: string;
    };
    user_name?: string;
    isOwner?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onCardClick?: () => void;
    onViewDetails?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
    image, 
    title = "Product Title", 
    price, 
    description,
    condition,
    location,
    link,
    seller,
    user_name,
    isOwner = false,
    onEdit,
    onDelete,
    onCardClick,
    onViewDetails
}) => {
    const imageUrl = image 
        ? (image.startsWith('http') ? image : `${getApiBaseUrl()}${image.startsWith('/') ? image.slice(1) : image}`)
        : "/sheep.jpg";
    
    const formattedPrice = price 
        ? typeof price === 'number' 
            ? `$${price.toFixed(2)}` 
            : price
        : "Price not available";

    const handleCardClick = () => {
        // If link exists and user is not owner, redirect to link
        if (link && !isOwner) {
            window.open(link, '_blank', 'noopener,noreferrer');
        } else if (onCardClick) {
            // Otherwise use the provided onCardClick handler
            onCardClick();
        }
    };

    return (
        <div onClick={handleCardClick} className="group relative flex flex-col overflow-hidden cursor-pointer rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* View Details Button - Show for everyone */}
                    {onViewDetails && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails();
                            }}
                            className="p-2 bg-green-500/80 hover:bg-green-500 rounded-lg transition text-white"
                            title="View details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}
                    
                    {/* Edit/Delete Buttons - Only show if user is owner */}
                    {isOwner && (
                        <>
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                    className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition text-white"
                                    title="Edit product"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition text-white"
                                    title="Delete product"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white line-clamp-2 min-h-[3.5rem]">{title}</h3>
                
                

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

                {/* Buy Button - Show if link exists and user is not the owner */}
                {link && !isOwner && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(link, '_blank', 'noopener,noreferrer');
                        }}
                        className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Buy Now
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
