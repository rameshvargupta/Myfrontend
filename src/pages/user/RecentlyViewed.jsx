import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye, Heart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const RecentlyViewed = () => {
  const [products, setProducts] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const token = useSelector((state) => state.user?.token);
  const carouselRef = useRef(null);

  /* ================= FETCH DATA ================= */
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
        console.log(
          "Recently viewed fetch error:",
          error.response?.data || error.message
        );
      }
    };

    fetchRecentlyViewed();
  }, [token]);

  /* ================= SCROLL BUTTON VISIBILITY ================= */
  const checkScrollButtons = () => {
    if (!carouselRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      checkScrollButtons();
      carousel.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);

      return () => {
        carousel.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [products]);

  /* ================= SCROLL FUNCTIONS ================= */
  const scroll = (direction) => {
    if (!carouselRef.current) return;

    const cardWidth = carouselRef.current.children[0]?.offsetWidth || 200;
    const gap = 12; // gap between cards
    const scrollAmount = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);

    carouselRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  if (!token || products.length === 0) return null;

  return (
    <div className="py-6 px-2 sm:px-3 md:px-4 lg:px-6 relative bg-gradient-to-b from-gray-50 to-white">
      {/* PREMIUM HEADER */}
      <div className="flex items-center justify-between mb-5 px-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-gray-700 to-gray-500 rounded-full"></div>
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-wide text-gray-800 uppercase">
            Recently Viewed
          </h2>
        </div>

        {/* Premium Navigation Buttons */}
        <div className="hidden sm:flex gap-1.5">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`
              p-1.5 rounded-lg transition-all duration-300
              ${canScrollLeft
                ? "bg-white text-gray-700 hover:bg-gray-900 hover:text-white shadow-md hover:shadow-lg"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"}
            `}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`
              p-1.5 rounded-lg transition-all duration-300
              ${canScrollRight
                ? "bg-white text-gray-700 hover:bg-gray-900 hover:text-white shadow-md hover:shadow-lg"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"}
            `}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* PREMIUM CAROUSEL CONTAINER */}
      <div className="relative">
        {/* Custom Navigation Arrows - Desktop Floating */}
        {canScrollLeft && (
          <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={() => scroll("left")}
              className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ml-[-16px] border border-gray-100 hover:scale-110"
            >
              <ChevronLeft className="text-gray-700" size={20} />
            </button>
          </div>
        )}

        {/* Carousel Items - Compact & Premium */}
        <div
          ref={carouselRef}
          className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 no-scrollbar"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        >
          {products.map((product) => (
            <div
              key={product._id}
              className={`
                w-[32%]           /* Mobile: shows 2 items */
                xs:w-[16%]        /* Small mobile: shows 3 items */
                sm:w-[16%]        /* Tablet: shows 4 items */
                md:w-[16%]        /* Desktop: shows 5 items */
                lg:w-[16%]        /* Large: shows 6 items */
                flex-shrink-0 snap-start
                transition-all duration-300
              `}
            >
              <Link to={`/product/${product.slug}`} className="block group">
                {/* PREMIUM MINIMAL CARD */}
                <div className="relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl group-hover:shadow-xl">

                  {/* IMAGE CONTAINER - Compact Size */}
                  <div className="relative w-full pt-[100%] overflow-hidden bg-gray-50">
                    <img
                      src={product.images?.[0]?.url || "/api/placeholder/300/300"}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Premium Discount Badge - Minimal */}
                    {product.discountPrice > 0 && (
                      <div className="absolute top-1.5 right-1.5">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md">
                          {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                        </div>
                      </div>
                    )}

                    {/* Quick Action Buttons - Appear on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                      <button className="bg-white rounded-full p-1.5 hover:scale-110 transition-transform">
                        <Eye size={14} className="text-gray-800" />
                      </button>
                      <button className="bg-white rounded-full p-1.5 hover:scale-110 transition-transform">
                        <Heart size={14} className="text-gray-800" />
                      </button>
                    </div>

                  </div>

                  {/* PRODUCT INFO - Compact & Clean */}
                  <div className="p-2 space-y-1">
                    {/* Product Name - Single line on mobile */}
                    <h3 className="text-[11px] xs:text-xs font-medium text-gray-700 line-clamp-2 leading-tight hover:text-gray-900 transition-colors min-h-[2rem]">
                      {product.name.length > 40 ? product.name.substring(0, 40) + "..." : product.name}
                    </h3>

                    {/* Price Section - Compact */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs xs:text-sm font-bold text-gray-900">
                        ₹{product.finalPrice?.toLocaleString()}
                      </span>

                      {product.discountPrice > 0 && (
                        <span className="text-[9px] xs:text-[10px] text-gray-400 line-through">
                          ₹{product.price?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Premium Rating Indicator */}
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <svg key={i} className="w-2.5 h-2.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                        <svg className="w-2.5 h-2.5 text-yellow-400 fill-current opacity-50" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      </div>
                      <span className="text-[9px] text-gray-500">(2.3k)</span>
                    </div>
                  </div>

                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Right Navigation Arrow - Floating */}
        {canScrollRight && (
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={() => scroll("right")}
              className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 mr-[-16px] border border-gray-100 hover:scale-110"
            >
              <ChevronRight className="text-gray-700" size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Premium Mobile Scroll Indicator */}
      <div className="sm:hidden flex justify-center items-center gap-2 mt-4">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
          <div className="w-3 h-1.5 rounded-full bg-gray-800"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        </div>
        <span className="text-[10px] text-gray-400 font-medium tracking-wide">SWIPE →</span>
      </div>
    </div>
  );
};

export default RecentlyViewed;