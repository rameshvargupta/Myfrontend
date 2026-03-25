import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
const RecentlyViewed = () => {
  const [products, setProducts] = useState([]);
  const token = useSelector((state) => state.user?.token);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        if (!token) return;

        const { data } = await axios.get(
          `${API_URL}/api/v1/user/recently-viewed`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) setProducts(data.products);
      } catch (error) {
        console.log("Recently viewed fetch error:", error.response?.data || error.message);
      }
    };

    fetchRecentlyViewed();
  }, [token]);

  if (!token || products.length === 0) return null;

  // Scroll handler for arrows
  const scroll = (direction) => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.clientWidth;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -width : width,
      behavior: "smooth",
    });
  };


  return (
    <div className="mt-10 px-4 relative">
      <h2 className="text-2xl font-bold mb-5">Recently Viewed</h2>

      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar pb-3"
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="min-w-[220px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col snap-start"
          >
            {/* Product Image */}
            <div className="relative w-full h-44 overflow-hidden rounded-t-2xl">
              <img
                src={product.images?.[0]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />

            </div>

            {/* Product Info */}
            <div className="p-3 flex flex-col flex-1 justify-between">
              <h3 className="text-sm font-semibold line-clamp-2"></h3>
              <div className="mt-2 flex items-center justify-between">
                <span>
                  {product.name}
                </span>
                
               <div className="mt-2 flex flex-col gap-1">
  <span className="text-lg font-bold text-gray-900">
    ₹{product.finalPrice.toLocaleString()}
  </span>

  {product.discountPrice > 0 && (
    <span className="text-xs text-gray-400 line-through">
      ₹{product.price.toLocaleString()}
    </span>
  )}
</div>


              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;