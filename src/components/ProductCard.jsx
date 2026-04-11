import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import {
  addWishlistItem,
  removeWishlistItem,
  loadWishlist,
} from "@/redux/wishlistSlice";

import { toast } from "sonner";
import { Star, Loader2, Trash2, Heart } from "lucide-react";
import { useMemo } from "react";

const ProductCard = ({
  product,
  showRemove = false,
  onRemove,
  removing = false,
}) => {
  const dispatch = useDispatch();

  const cartItems = useSelector(
    (state) => state.cart?.cartItems || []
  );

  const { items: wishlistItems = [] } = useSelector(
    (state) => state.wishlist
  );

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

  // ================= TOGGLE WISHLIST =================
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isInWishlist) {
        await dispatch(removeWishlistItem(product._id));
        toast.success("Removed from wishlist ❤️");
      } else {
        await dispatch(addWishlistItem(product._id));
        toast.success("Added to wishlist ❤️");
      }

      dispatch(loadWishlist()); // sync
    } catch {
      toast.error("Wishlist action failed");
    }
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
          />
        </Link>

        {/* DISCOUNT */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {discountPercent}% OFF
          </span>
        )}

        {/* STOCK */}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </span>
        )}

        {/* ================= WISHLIST ICON (NEW) ================= */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-20 bg-white/90 hover:bg-pink-50 p-2 rounded-full shadow transition"
        >
          <Heart
            size={18}
            className={`transition
              ${isInWishlist
                ? "fill-pink-600 text-pink-600"
                : "text-gray-600"
              }`}
          />
        </button>

        {/* ================= REMOVE WISHLIST BUTTON ================= */}
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

        <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
          {product.name}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2">
          {product.description}
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
              ({product.numReviews} reviews)
            </span>
          </div>
        )}

        {/* PRICE */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.finalPrice}
          </span>

          {product.discountPrice > 0 && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.price}
            </span>
          )}
        </div>

        {/* ADD TO CART */}
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
              })
            );

            toast.success("Product added to cart");
          }}
          className={`mt-auto w-full py-2 rounded-xl text-sm font-semibold transition
            ${product.stock > 0
              ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white hover:opacity-90"
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