import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Clock, Star, Minus, Plus, Heart } from "lucide-react";
import { food as foodApi } from "../../lib/api";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import type { FoodItem } from "../../types";
import LazyImage from "../../components/LazyImage";

export default function FoodDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    foodApi.get(slug).then(setItem).catch(() => setItem(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="skeleton h-80 w-full rounded-b-3xl" />
        <div className="px-5 pt-6 space-y-4">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5">
        <div className="text-5xl mb-4">😢</div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Item Not Found</h2>
        <p className="text-gray-400 mb-6 text-sm">This food item may no longer be available.</p>
        <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      foodItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.thumbnail || item.image,
    }, quantity);
    toast.success(`${quantity}x ${item.name} added to cart`);
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Image */}
      <div className="relative h-80 bg-warm-100">
        <LazyImage
          src={item.image || ""}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between">
          <Link to="/menu" className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        {item.isFeatured && (
          <div className="absolute bottom-4 left-5">
            <span className="badge bg-primary-500 text-white text-xs shadow-lg">
              ★ Featured
            </span>
          </div>
        )}
      </div>

      {/* Content Card */}
      <div className="bg-cream rounded-t-3xl -mt-6 relative px-5 pt-6 pb-36">
        {/* Title & Price */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">{item.name}</h1>
            {item.category && (
              <span className="text-xs text-primary-500 font-medium">{item.category.name}</span>
            )}
          </div>
          <div className="text-right">
            <div className="font-bold text-xl text-primary-600">Rs. {item.price.toLocaleString()}</div>
          </div>
        </div>

        {/* Rating & Time */}
        <div className="flex items-center gap-4 mb-4">
          {item.avgRating != null && item.reviewCount != null && item.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(item.avgRating!) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">({item.reviewCount})</span>
            </div>
          )}
          {item.preparationTime && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {item.preparationTime} min
            </div>
          )}
          <div className={`text-xs font-medium ${item.stockQuantity > 0 ? "text-green-600" : "text-red-500"}`}>
            {item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : "Out of stock"}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-5">{item.description}</p>
        )}

        {/* Ingredients */}
        {item.ingredients && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {item.ingredients.split(",").map((ing, i) => (
                <span key={i} className="bg-warm-100 text-warm-800 text-xs px-3 py-1.5 rounded-xl font-medium">
                  {ing.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {item.reviews && item.reviews.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Reviews</h3>
            <div className="space-y-3">
              {item.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-3 border border-orange-100/50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                      {review.customerName.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{review.customerName}</span>
                    <div className="flex ml-auto">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-xs text-gray-500 mt-1">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      {item.isAvailable && item.stockQuantity > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-orange-100 p-5 z-50">
          <div className="max-w-lg mx-auto flex items-center gap-4">
            <div className="flex items-center bg-warm-50 rounded-2xl border border-orange-100">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-warm-100 rounded-l-2xl transition-colors"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(item.stockQuantity, quantity + 1))}
                className="p-3 hover:bg-warm-100 rounded-r-2xl transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart · Rs. {(item.price * quantity).toLocaleString()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
