import { useState, useRef, useEffect } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export default function LazyImage({ src, alt, className = "", fallback, ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          observer.unobserve(img);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, []);

  const placeholderColor = "bg-gray-200";

  if (error) {
    return (
      <div className={`${placeholderColor} flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className={`${placeholderColor} absolute inset-0 animate-pulse`} />}
      <img
        ref={imgRef}
        data-src={src}
        alt={alt}
        className={`${className} ${loaded ? "" : "opacity-0"} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        {...props}
      />
    </>
  );
}
