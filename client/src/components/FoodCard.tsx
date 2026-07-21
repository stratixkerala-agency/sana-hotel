import { Link } from "react-router-dom";
import { ShoppingCart, Star, Clock, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import type { FoodItem } from "../types";
import LazyImage from "./LazyImage";

export default function FoodCard({ item }: { item: FoodItem }) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.isAvailable || item.stockQuantity <= 0) return;
    addItem({
      foodItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.thumbnail || item.image,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <Link to={`/menu/${item.slug}`} className="card-hover group block">
      <div className="relative aspect-square overflow-hidden bg-warm-100">
        <LazyImage
          src={item.thumbnail || item.image || ""}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!item.isAvailable || item.stockQuantity <= 0 ? (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-red-500 px-4 py-1.5 rounded-full">
              Unavailable
            </span>
          </div>
        ) : null}
        <div className="absolute bottom-3 right-3">
          <button
            onClick={handleAdd}
            disabled={!item.isAvailable || item.stockQuantity <= 0}
            className="w-9 h-9 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 transition-all active:scale-90 disabled:opacity-40"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mb-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary-600 text-base">
            Rs. {item.price.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            {item.avgRating != null && item.reviewCount != null && item.reviewCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {item.avgRating.toFixed(1)}
              </span>
            )}
            {item.preparationTime && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {item.preparationTime}min
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
