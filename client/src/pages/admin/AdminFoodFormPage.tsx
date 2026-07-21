import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { food, categories, uploads } from "../../lib/api";
import toast from "react-hot-toast";
import LazyImage from "../../components/LazyImage";

export default function AdminFoodFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cats, setCats] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
    thumbnail: "",
    ingredients: "",
    preparationTime: "",
    stockQuantity: "50",
    isAvailable: "true",
    isFeatured: "false",
  });

  useEffect(() => {
    categories.adminList().then(setCats);
    if (isEdit && id) {
      food.adminList().then((res) => {
        const item = res.items.find((i: any) => i.id === id);
        if (item) {
          setForm({
            name: item.name,
            description: item.description || "",
            price: String(item.price),
            categoryId: item.categoryId || "",
            image: item.image || "",
            thumbnail: item.thumbnail || "",
            ingredients: item.ingredients || "",
            preparationTime: item.preparationTime ? String(item.preparationTime) : "",
            stockQuantity: String(item.stockQuantity),
            isAvailable: String(item.isAvailable),
            isFeatured: String(item.isFeatured),
          });
        }
      });
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploads.image(file);
      setForm((p) => ({ ...p, image: result.url, thumbnail: result.thumbnail }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        categoryId: form.categoryId || null,
        image: form.image || null,
        thumbnail: form.thumbnail || null,
        ingredients: form.ingredients || null,
        preparationTime: form.preparationTime ? parseInt(form.preparationTime) : null,
        stockQuantity: parseInt(form.stockQuantity) || 0,
        isAvailable: form.isAvailable === "true",
        isFeatured: form.isFeatured === "true",
      };

      if (isEdit && id) {
        await food.update(id, data);
        toast.success("Item updated");
      } else {
        await food.create(data);
        toast.success("Item created");
      }
      navigate("/admin/menu");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate("/admin/menu")} className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Menu
      </button>

      <h1 className="font-display text-2xl font-bold mb-6">
        {isEdit ? "Edit Food Item" : "Add New Food Item"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Image</h2>
          {form.image ? (
            <div className="relative">
              <LazyImage src={form.image} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, image: "", thumbnail: "" }))}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">Click to upload image</span>
                </>
              )}
            </label>
          )}
        </div>

        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. Classic Burger" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="input min-h-[80px] resize-none" placeholder="Describe the dish..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
              <input name="ingredients" value={form.ingredients} onChange={handleChange} className="input" placeholder="e.g. Beef, Lettuce, Tomato, Cheese" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
                <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="input" placeholder="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time (min)</label>
                <input name="preparationTime" type="number" value={form.preparationTime} onChange={handleChange} className="input" placeholder="e.g. 15" />
              </div>
            </div>
          </div>
        </div>

        {/* Category & Stock */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Category & Stock</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} className="input">
                <option value="">No Category</option>
                {cats.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select name="isAvailable" value={form.isAvailable} onChange={handleChange} className="input">
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
              <select name="isFeatured" value={form.isFeatured} onChange={handleChange} className="input">
                <option value="false">No</option>
                <option value="true">Yes - Show on homepage</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Saving..." : isEdit ? "Update Item" : "Create Item"}
        </button>
      </form>
    </div>
  );
}
