import { useEffect, useState } from "react";
import { Star, Check, EyeOff, Trash2 } from "lucide-react";
import { reviews } from "../../lib/api";
import toast from "react-hot-toast";
import type { Review } from "../../types";

export default function AdminReviewsPage() {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  const fetchReviews = () => {
    setLoading(true);
    reviews.adminList(filter)
      .then(setReviewsList)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      await reviews.adminApprove(id);
      toast.success("Review approved");
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleHide = async (id: string) => {
    try {
      await reviews.adminHide(id);
      toast.success("Review hidden");
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await reviews.adminDelete(id);
      toast.success("Review deleted");
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Reviews</h1>

      <div className="flex gap-2 mb-6">
        {[
          { value: "", label: "All" },
          { value: "true", label: "Approved" },
          { value: "false", label: "Pending" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === opt.value ? "bg-primary-600 text-white" : "bg-white border text-gray-600"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-20 w-full" /></div>)}
        </div>
      ) : reviewsList.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No reviews found</div>
      ) : (
        <div className="space-y-3">
          {reviewsList.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <span className="font-medium text-sm">{review.customerName}</span>
                    {!review.isApproved && <span className="badge bg-amber-100 text-amber-700">Pending</span>}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {review.foodItem?.name} · {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {!review.isApproved ? (
                    <button onClick={() => handleApprove(review.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => handleHide(review.id)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Hide">
                      <EyeOff className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(review.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
