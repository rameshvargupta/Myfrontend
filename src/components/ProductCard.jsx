import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import {
  addWishlistItem,
  removeWishlistItem,
  addWishlistLocal,
  removeWishlistLocal,
  loadWishlist,
} from "@/redux/wishlistSlice";

import { toast } from "sonner";
import { Star, Loader2, Trash2, Heart } from "lucide-react";
import { useMemo, useState } from "react";

const ProductCard = ({
  product,
  showRemove = false,
  onRemove,
  removing = false,
}) => {
  const dispatch = useDispatch();
  const [pendingWishlist, setPendingWishlist] = useState(false);

  const cartItems = useSelector(
    (state) => state.cart?.cartItems || []
  );

  const { items: wishlistItems = [] } = useSelector(
    (state) => state.wishlist
  );

  const { token } = useSelector((state) => state.user);

  // ================= WISHLIST CHECK =================
  const isInWishlist = useMemo(() => {
    return wishlistItems.some(
      (item) =>
        (item.product?._id || item._id)?.toString() === product._id
    );
  }, [wishlistItems, product._id]);

  const discountPercent =
    product.discountPrice > 0
      ? Math.round(
        ((product.price - product.finalPrice) / product.price) * 100
      )
      : 0;

  // ================= TOGGLE WISHLIST - INSTANT WITH LOCAL UPDATE =================
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please login first");
      return;
    }

    // Set loading state for this specific product
    setPendingWishlist(true);
    
    const wasInWishlist = isInWishlist;

    if (wasInWishlist) {
      // ✅ INSTANT REMOVE - UI updates immediately
      dispatch(removeWishlistLocal(product._id));
      toast.success("Removed from wishlist");

      try {
        // Background API call
        await dispatch(removeWishlistItem(product._id)).unwrap();
      } catch (err) {
        // ❌ Rollback if API fails
        dispatch(addWishlistLocal(product));
        toast.error("Failed to remove from wishlist");
      }
    } else {
      // ✅ INSTANT ADD - UI updates immediately
      dispatch(addWishlistLocal(product));
      toast.success("Added to wishlist ❤️");

      try {
        // Background API call
        await dispatch(addWishlistItem(product._id)).unwrap();
      } catch (err) {
        // ❌ Rollback if API fails
        dispatch(removeWishlistLocal(product._id));
        toast.error("Failed to add to wishlist");
      }
    }

    // Remove loading state
    setPendingWishlist(false);
  };

  return (
    <div className="group bg-white rounded-2xl border shadow-sm hover:shadow-xl transition overflow-hidden flex flex-col relative">

      {/* ================= IMAGE ================= */}
      <div className="relative overflow-hidden">

        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="w-full h-44 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* DISCOUNT BADGE */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            {discountPercent}% OFF
          </span>
        )}

        {/* STOCK BADGE */}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
            Out of Stock
          </span>
        )}

        {/* ================= WISHLIST BUTTON - INSTANT TOGGLE ================= */}
        <button
          onClick={handleWishlistToggle}
          disabled={pendingWishlist}
          className="absolute top-2 right-2 z-20 bg-white/90 hover:bg-pink-50 p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
        >
          {pendingWishlist ? (
            <Loader2 size={18} className="animate-spin text-pink-500" />
          ) : (
            <Heart
              size={18}
              className={`transition-all duration-150
                ${isInWishlist
                  ? "fill-pink-600 text-pink-600 scale-110"
                  : "text-gray-600 hover:text-pink-500"
                }`}
            />
          )}
        </button>

        {/* ================= REMOVE FROM WISHLIST BUTTON (for wishlist page) ================= */}
        {showRemove && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove?.();
            }}
            className="absolute top-2 left-2 z-20 bg-white/90 hover:bg-red-50 p-2 rounded-full shadow transition"
          >
            {removing ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-500" />
            )}
          </button>
        )}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-3 flex flex-col gap-1 flex-1">

        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-1 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-gray-500 line-clamp-2">
          {product.description?.substring(0, 80) || "No description available"}
        </p>

        {/* RATING */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs mt-1">
            <div className="flex items-center text-yellow-500">
              <Star size={14} fill="currentColor" />
              <span className="ml-1 font-medium">
                {product.rating.toFixed(1)}
              </span>
            </div>

            <span className="text-gray-400">
              ({product.numReviews || 0} reviews)
            </span>
          </div>
        )}

        {/* PRICE */}
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.finalPrice?.toLocaleString()}
          </span>

          {product.discountPrice > 0 && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.price?.toLocaleString()}
            </span>
          )}
        </div>

        {/* ADD TO CART BUTTON */}
        <button
          disabled={product.stock === 0}
          onClick={() => {
            if (product.stock === 0) return;

            const alreadyInCart = cartItems.find(
              (item) => item.productId === product._id
            );

            if (alreadyInCart) {
              toast.info("Product already added to cart");
              return;
            }

            dispatch(
              addToCart({
                productId: product._id,
                name: product.name,
                price: product.finalPrice,
                image: product.images?.[0]?.url,
                quantity: 1,
                slug: product.slug,
              })
            );

            toast.success("Product added to cart");
          }}
          className={`mt-auto w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200
            ${product.stock > 0
              ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white hover:opacity-90 hover:scale-[1.02] active:scale-95"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
        >
          {product.stock > 0 ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;