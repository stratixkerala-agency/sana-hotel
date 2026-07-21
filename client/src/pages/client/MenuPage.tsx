import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, X, ArrowLeft } from "lucide-react";
import { food, categories } from "../../lib/api";
import FoodCard from "../../components/FoodCard";
import CategoryIcon from "../../components/CategoryIcon";
import type { FoodItem, Category } from "../../types";

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    categories.list().then(setCats);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (activeCategory) params.category = activeCategory;
    if (searchParams.get("search")) params.search = searchParams.get("search");

    food.list(params).then((res) => setItems(res.items)).finally(() => setLoading(false));
  }, [activeCategory, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === activeCategory) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-500 to-primary-400 px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="font-display text-xl font-bold text-white">Menu</h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food items..."
            className="w-full pl-12 pr-10 py-3.5 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                const p = new URLSearchParams(searchParams);
                p.delete("search");
                setSearchParams(p);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>

      <div className="px-5 -mt-2">
        {/* Category Chips */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 pt-4">
          <button
            onClick={() => handleCategoryClick("")}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              !activeCategory
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                : "bg-white text-gray-600 border border-orange-100"
            }`}
          >
            All
          </button>
          {cats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`flex-shrink-0 flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-2xl text-sm font-medium transition-all ${
                activeCategory === cat.slug
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : "bg-white text-gray-600 border border-orange-100"
              }`}
            >
              <CategoryIcon slug={cat.slug} size="sm" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton aspect-square" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900">No items found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pt-2 pb-6">
            {items.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
