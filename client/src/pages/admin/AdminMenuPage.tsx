import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { food } from "../../lib/api";
import toast from "react-hot-toast";
import type { FoodItem } from "../../types";
import LazyImage from "../../components/LazyImage";

export default function AdminMenuPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchItems = () => {
    setLoading(true);
    food.adminList(searchTerm ? { search: searchTerm } : undefined)
      .then((res) => setItems(res.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleToggleAvailability = async (item: FoodItem) => {
    try {
      await food.update(item.id, { isAvailable: !item.isAvailable });
      toast.success(`${item.name} ${!item.isAvailable ? "enabled" : "disabled"}`);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleDelete = async (item: FoodItem) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await food.delete(item.id);
      toast.success("Item deleted");
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const filtered = items.filter((i) =>
    !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Menu Management</h1>
        <Link to="/admin/menu/new" className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search menu items..."
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-16 w-full" /></div>)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                <LazyImage src={item.thumbnail || item.image || ""} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  {!item.isAvailable && <span className="badge bg-red-100 text-red-700 text-xs">Unavailable</span>}
                  {item.stockQuantity <= 5 && item.isAvailable && <span className="badge bg-amber-100 text-amber-700 text-xs">Low Stock ({item.stockQuantity})</span>}
                </div>
                <div className="text-sm text-gray-500">
                  Rs. {item.price.toLocaleString()} · Stock: {item.stockQuantity} · {item.category?.name || "No category"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`p-2 rounded-lg transition-colors ${item.isAvailable ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}
                  title={item.isAvailable ? "Available" : "Unavailable"}
                >
                  {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <Link to={`/admin/menu/${item.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
