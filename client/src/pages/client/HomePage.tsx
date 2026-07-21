import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { food, categories } from "../../lib/api";
import FoodCard from "../../components/FoodCard";
import CategoryIcon from "../../components/CategoryIcon";
import type { FoodItem, Category } from "../../types";

export default function HomePage() {
  const [featured, setFeatured] = useState<FoodItem[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      food.list({ featured: "true" }),
      categories.list(),
    ]).then(([foodRes, catRes]) => {
      setFeatured(foodRes.items);
      setCats(catRes);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-gray-400 font-medium">Good evening</p>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Discover <span className="text-primary-500">Food</span>
            </h1>
          </div>
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-bold text-sm">SH</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5">
        <Link
          to="/menu"
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-orange-100/50 shadow-sm"
        >
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400 text-sm">Search food items...</span>
        </Link>
      </div>

      {/* Categories */}
      {cats.length > 0 && (
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Categories</h2>
            <Link to="/menu" className="text-xs text-primary-500 font-medium flex items-center gap-0.5">
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
            {cats.map((cat) => (
              <Link
                key={cat.id}
                to={`/menu?category=${cat.slug}`}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <CategoryIcon slug={cat.slug} />
                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Section */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Popular Now</h2>
          <Link to="/menu" className="text-xs text-primary-500 font-medium flex items-center gap-0.5">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton aspect-square" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {featured.slice(0, 6).map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Promo Banner */}
      <div className="px-5">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <p className="text-primary-100 text-sm font-medium mb-1">Special Offer</p>
            <h3 className="font-display text-xl font-bold mb-2">Free Delivery</h3>
            <p className="text-primary-100 text-sm mb-4">On all room service orders</p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold py-2.5 px-5 rounded-xl text-sm hover:bg-primary-50 transition-colors"
            >
              Order Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="px-5 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "utensils", title: "Fresh Food", desc: "Made to order" },
            { icon: "bolt", title: "Fast Delivery", desc: "To your room" },
            { icon: "cash", title: "Cash on Delivery", desc: "Pay later" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 text-center border border-orange-100/50">
              <div className="w-8 h-8 mx-auto mb-1.5 bg-primary-100 rounded-xl flex items-center justify-center">
                {item.icon === "utensils" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 text-primary-500">
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                  </svg>
                )}
                {item.icon === "bolt" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 text-primary-500">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                )}
                {item.icon === "cash" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 text-primary-500">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-900">{item.title}</p>
              <p className="text-[10px] text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
