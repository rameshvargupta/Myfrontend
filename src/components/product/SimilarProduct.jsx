import { addToCart } from "@/redux/cartSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL;
const SimilarProducts = ({ productId, categoryId }) => {
  const [products, setProducts] = useState([]);
  const cartItems = useSelector(
    (state) => state.cart?.cartItems || []
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!productId || !categoryId) return;

    fetch(
      `${API_URL}/api/v1/products/similar/${productId}/${categoryId}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data.products);
        if (data.success) setProducts(data.products);
      });
  }, [productId, categoryId]);

  if (products.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">
        Similar Products
      </h2>

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
        {products.map((p) => (
          <div
            key={p._id}
            className="
                bg-white
                rounded-2xl
                overflow-hidden
                shadow-[0_6px_20px_rgba(0,0,0,0.08)]
                hover:shadow-[0_16px_40px_rgba(79,70,229,0.25)]
                transition-all
                group
              "
          >
            {/* IMAGE */}
            <Link to={`/product/${p.slug}`}>
              <div className="relative">
                <img
                  src={p.images?.[0]?.url}
                  alt={p.name}
                  className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {p.discountPrice > 0 && (
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {Math.round(
                      ((p.price - p.discountPrice) / p.price) * 100
                    )}
                    % OFF
                  </span>
                )}
              </div>
            </Link>

            {/* CONTENT */}
            <div className="p-3 sm:p-4 flex flex-col gap-1">
              <h2 className="font-semibold text-sm sm:text-base line-clamp-1">
                {p.name}
              </h2>

              <p className="text-xs text-gray-500">
                {p.description.length > 50
                  ? p.description.slice(0, 40) + "..."
                  : p.description}
              </p>


              {/* PRICE */}
              <div className="flex items-center justify-between mt-1">
                <div>
                  <span className="text-base sm:text-lg font-bold text-gray-900">
                    ₹{p.finalPrice}
                  </span>
                  {p.discountPrice > 0 && (
                    <span className="ml-1 text-xs text-gray-400 line-through">
                      ₹{p.price}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                      ${p.stock > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {p.stock > 0 ? "In Stock" : "Out"}
                </span>
              </div>

              {/* RATING + CATEGORY */}
              <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                <span>{p.category?.name}</span>
                <span className="text-yellow-500 font-semibold">
                  ★ {p.rating?.toFixed(1) || 0}
                </span>
              </div>

              {/* ADD TO CART */}
              <button
                disabled={p.stock === 0}
                onClick={() => {
                  if (p.stock === 0) return;

                  const alreadyInCart = cartItems.find(
                    (item) => item.productId === p._id
                  );

                  if (alreadyInCart) {
                    toast.info("Product already added to cart");
                    return;
                  }

                  dispatch(
                    addToCart({
                      productId: p._id,
                      name: p.name,
                      price: p.finalPrice,
                      image: p.images?.[0]?.url,
                      quantity: 1,
                    })
                  );

                  toast.success("Product added to cart");
                }}
                className={`
                    mt-3
                    w-full
                    py-2
                    text-sm
                    font-semibold
                    rounded-full
                    transition
                    ${p.stock > 0
                    ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white hover:opacity-90"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }
                  `}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
