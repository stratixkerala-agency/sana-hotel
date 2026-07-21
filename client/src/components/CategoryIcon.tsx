const CATEGORY_IMAGES: Record<string, string> = {
  breads: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&q=80",
  chicken: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=200&h=200&fit=crop&q=80",
  beef: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop&q=80",
  biriyani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop&q=80",
  manthi: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop&q=80",
  grill: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop&q=80",
  chinese: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop&q=80",
  soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop&q=80",
  "veg-curry": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200&h=200&fit=crop&q=80",
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=200&h=200&fit=crop&q=80";

export default function CategoryIcon({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const imgSize = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  const radius = size === "sm" ? "rounded-xl" : "rounded-2xl";

  return (
    <div className={`${imgSize} ${radius} overflow-hidden bg-warm-100 flex-shrink-0`}>
      <img
        src={CATEGORY_IMAGES[slug] || FALLBACK_IMG}
        alt={slug}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
