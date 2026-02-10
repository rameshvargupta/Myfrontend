import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { toast } from "sonner";
import { Star } from "lucide-react";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(
    (state) => state.cart?.cartItems || []
  );

  const discountPercent =
    product.discountPrice > 0
      ? Math.round(
        ((product.price - product.finalPrice) / product.price) * 100
      )
      : 0;

  return (
    <div className="group bg-white rounded-2xl border shadow-sm hover:shadow-xl transition overflow-hidden flex flex-col">

      {/* IMAGE SECTION */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="w-full h-44 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* DISCOUNT BADGE */}
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
      </div>

      {/* CONTENT */}
      <div className="p-3 flex flex-col gap-1 flex-1">

        {/* NAME */}
        <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
          {product.name}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-xs text-gray-500 line-clamp-2">
          {product.description}
        </p>

        {/* RATING AND VIEWs */}
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

        {/* ACTION */}
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
