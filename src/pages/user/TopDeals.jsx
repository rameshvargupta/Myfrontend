import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";

import { fetchUserProducts } from "@/api/productApi";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";

import {
  loadWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "@/redux/wishlistSlice";

// Skeleton Card Component
const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
    {/* Image Skeleton */}
    <div className="relative">
      <div className="w-full h-40 sm:h-48 bg-gray-200"></div>
      
      {/* Discount Badge Skeleton */}
      <div className="absolute top-2 left-2">
        <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* Heart Button Skeleton */}
      <div className="absolute top-2 right-2">
        <div className="bg-gray-200 rounded-full p-2 w-8 h-8"></div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="p-3 space-y-2">
      {/* Title Skeleton */}
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      
      {/* Description Skeleton */}
      <div className="space-y-1">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
      
      {/* Price Skeleton */}
      <div className="flex items-center gap-2 mt-2">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      
      {/* Rating & Stock Skeleton */}
      <div className="flex justify-between items-center mt-2">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      
      {/* Button Skeleton */}
      <div className="h-10 bg-gray-200 rounded-full mt-3 w-full"></div>
    </div>
  </div>
);

// Header Skeleton
const HeaderSkeleton = () => (
  <div className="mb-5 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-40"></div>
    <div className="h-4 bg-gray-200 rounded w-64 mt-2"></div>
  </div>
);

const TopDeals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.user);

  const cartItems = useSelector(
    (state) => state.cart?.cartItems || []
  );

  const { items: wishlistItems } = useSelector(
    (state) => state.wishlist
  );

  const wishlistIds = useMemo(() => {
    return new Set(
      wishlistItems.map(
        (item) => (item.product?._id || item._id)?.toString()
      )
    );
  }, [wishlistItems]);

  useEffect(() => {
    fetchTopDeals();
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(loadWishlist());
    }
  }, [dispatch, token]);

  const fetchTopDeals = async () => {
    try {
      setLoading(true);

      const data = await fetchUserProducts(
        "?page=1&limit=100&sort=-createdAt"
      );

      if (data.success) {
        const sortedDeals = [...data.products]
          .filter(
            (product) =>
              product.discountPrice &&
              product.discountPrice > 0
          )
          .sort((a, b) => {
            const discountA =
              ((a.price - a.discountPrice) /
                a.price) *
              100;

            const discountB =
              ((b.price - b.discountPrice) /
                b.price) *
              100;

            return discountB - discountA;
          });

        setProducts(sortedDeals);
      }
    } catch (error) {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  // Show skeleton loading (no circular loader)
  if (loading) {
    return (
      <>
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 py-5 mb-16">
          <HeaderSkeleton />
          
          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-4
              md:gap-6
            "
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
        
        <FooterNavbar />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-0  mb-18">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">
            🔥 Top Deals
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Best discounted products available now
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="font-semibold text-lg">
              No Deals Available
            </h2>

            <p className="text-gray-500 mt-2">
              Please check again later.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-4
              md:gap-6
            "
          >
            {products.map((p) => {
              const isInWishlist =
                wishlistIds.has(
                  p._id?.toString()
                );

              const discountPercent = Math.round(
                ((p.price - p.discountPrice) /
                  p.price) *
                  100
              );

              return (
                <div
                  key={p._id}
                  className="
                    bg-white
                    rounded-2xl
                    overflow-hidden
                    shadow-md
                    hover:shadow-xl
                    transition-all
                    group
                    transform
                    hover:-translate-y-1
                    duration-200
                  "
                >
                  <Link to={`/product/${p.slug}`}>
                    <div className="relative overflow-hidden">
                      <img
                        src={p.images?.[0]?.url || "/placeholder-image.jpg"}
                        alt={p.name}
                        className="
                          w-full
                          h-40
                          sm:h-48
                          object-cover
                          group-hover:scale-105
                          transition-transform
                          duration-300
                        "
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />

                      <span
                        className="
                          absolute
                          top-2
                          left-2
                          bg-gradient-to-r
                          from-red-500
                          to-red-600
                          text-white
                          text-xs
                          px-2
                          py-1
                          rounded-full
                          font-bold
                          shadow-md
                        "
                      >
                        {discountPercent}% OFF
                      </span>

                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (!token) {
                            toast.error(
                              "Please login first"
                            );
                            return;
                          }

                          try {
                            if (isInWishlist) {
                              await dispatch(
                                removeWishlistItem(
                                  p._id
                                )
                              );

                              toast.success(
                                "Removed from wishlist"
                              );
                            } else {
                              await dispatch(
                                addWishlistItem(
                                  p._id
                                )
                              );

                              toast.success(
                                "Added to wishlist ❤️"
                              );
                            }

                            dispatch(
                              loadWishlist()
                            );
                          } catch {
                            toast.error(
                              "Something went wrong"
                            );
                          }
                        }}
                        className="
                          absolute
                          top-2
                          right-2
                          bg-white
                          rounded-full
                          p-2
                          hover:scale-110
                          transition-transform
                          shadow-md
                        "
                      >
                        <Heart
                          size={18}
                          className={
                            isInWishlist
                              ? "fill-red-500 text-red-500"
                              : "text-gray-500 hover:text-red-500 transition-colors"
                          }
                        />
                      </button>
                    </div>
                  </Link>

                  <div className="p-3">
                    <h2 className="font-semibold line-clamp-1 text-gray-800">
                      {p.name}
                    </h2>

                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {p.description || "No description available"}
                    </p>

                    <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                      <span className="font-bold text-lg text-indigo-600">
                        ₹{p.finalPrice?.toLocaleString()}
                      </span>

                      <span className="text-sm text-gray-400 line-through">
                        ₹{p.price?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-gray-600">
                          {p.rating || "4.5"}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.stock > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.stock > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>

                    <button
                      disabled={p.stock === 0}
                      onClick={() => {
                        const alreadyInCart =
                          cartItems.find(
                            (item) =>
                              item.productId ===
                              p._id
                          );

                        if (alreadyInCart) {
                          toast.info(
                            "Already in cart"
                          );
                          return;
                        }

                        dispatch(
                          addToCart({
                            productId: p._id,
                            name: p.name,
                            price: p.finalPrice,
                            image:
                              p.images?.[0]?.url,
                            quantity: 1,
                            slug: p.slug,
                          })
                        );

                        toast.success(
                          "Added to cart"
                        );
                      }}
                      className="
                        w-full
                        mt-3
                        py-2
                        rounded-full
                        text-white
                        font-semibold
                        bg-gradient-to-r
                        from-indigo-600
                        to-pink-500
                        hover:from-indigo-700
                        hover:to-pink-600
                        transition-all
                        duration-200
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        transform
                        hover:scale-105
                        active:scale-95
                      "
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FooterNavbar />
    </>
  );
};

export default TopDeals;