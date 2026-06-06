import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchUserProducts } from "@/api/productApi";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { Heart, ArrowLeft } from "lucide-react";
import {
  loadWishlist,
  addWishlistItem,
  removeWishlistItem,
  addWishlistLocal,
  removeWishlistLocal
} from "@/redux/wishlistSlice";
import FooterNavbar from "@/components/user/FooterNavbar";

const API_URL = import.meta.env.VITE_API_URL;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [rating, setRating] = useState("");
  const [inStock, setInStock] = useState(false);
  const [highlightedProductId, setHighlightedProductId] = useState(null);
  const [selectedProductData, setSelectedProductData] = useState(null);
  const [pendingWishlistActions, setPendingWishlistActions] = useState({});

  const location = useLocation();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const { token } = useSelector((state) => state.user);
  const { items: wishlistItems, loading: wishlistLoading } = useSelector(
    (state) => state.wishlist
  );

  const dispatch = useDispatch();
  const LIMIT = 20;

  // Get selected product from navigation state
  const selectedProductFromState = location.state?.selectedProductId;
  const selectedProductFull = location.state?.selectedProduct;
  const searchKeyword = location.state?.searchKeyword;
  const categoryFromState = location.state?.categoryId;

  const wishlistIds = useMemo(() => {
    return new Set(
      wishlistItems.map((item) =>
        (item.product?._id || item._id)?.toString()
      )
    );
  }, [wishlistItems]);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/categories`);
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sort, page, priceRange, rating, inStock]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=${LIMIT}`;

      if (selectedCategory) query += `&category=${selectedCategory}`;
      if (sort) query += `&sort=${sort}`;
      if (priceRange[0] > 0) query += `&minPrice=${priceRange[0]}`;
      if (priceRange[1] < 100000) query += `&maxPrice=${priceRange[1]}`;
      if (rating) query += `&rating=${rating}`;
      if (inStock) query += `&inStock=true`;

      if (searchKeyword && !selectedCategory) {
        query += `&keyword=${encodeURIComponent(searchKeyword)}`;
      }

      const data = await fetchUserProducts(query);

      if (data.success) {
        let allProducts = data.products;

        // If there's a selected product, move it to the TOP
        if (selectedProductFromState && allProducts.length > 0) {
          const foundProductIndex = allProducts.findIndex(p => p._id === selectedProductFromState);

          if (foundProductIndex !== -1) {
            // Remove the product from its current position
            const [clickedProduct] = allProducts.splice(foundProductIndex, 1);
            // Add it to the TOP of the array
            allProducts = [clickedProduct, ...allProducts];
            setSelectedProductData(clickedProduct);
            setHighlightedProductId(selectedProductFromState);
          } else {
            // If product not found in API response, fetch it separately
            try {
              const singleProductRes = await fetch(`${API_URL}/api/v1/products/${selectedProductFromState}`);
              const singleProductData = await singleProductRes.json();
              if (singleProductData.success && singleProductData.product) {
                allProducts = [singleProductData.product, ...allProducts];
                setSelectedProductData(singleProductData.product);
                setHighlightedProductId(selectedProductFromState);
              }
            } catch (err) {
              console.error("Error fetching single product:", err);
            }
          }
        }

        setProducts(allProducts);
        setTotalPages(data.totalPages || 1);

        // Remove highlight after 5 seconds
        if (selectedProductFromState) {
          setTimeout(() => {
            setHighlightedProductId(null);
          }, 5000);
        }
      }
    } catch {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD WISHLIST ================= */
  useEffect(() => {
    if (token) {
      dispatch(loadWishlist());
    }
  }, [token, dispatch]);

  const handleBackToSearch = () => {
    navigate("/searchBox");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-gray-500">Loading products...</p>
        </div>
        <FooterNavbar />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 mt-3 mb-18">


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
          {products.map((p, index) => {
            const isInWishlist = wishlistIds.has(p._id?.toString());
            const isHighlighted = highlightedProductId === p._id;
            const isFirstProduct = index === 0 && selectedProductData?._id === p._id;
            const isWishlistLoading = pendingWishlistActions[p._id];

            return (
              <div
                key={p._id}
                id={`product-${p._id}`}
                className={`
                  bg-white
                  rounded-2xl
                  overflow-hidden
                  shadow-[0_6px_20px_rgba(0,0,0,0.08)]
                  hover:shadow-[0_16px_40px_rgba(79,70,229,0.25)]
                  transition-all
                  group
                  ${isFirstProduct
                    ? 'border-2 border-blue-300 bg-gradient-to-br from-white to-blue-50'
                    : ''
                  }
                `}
              >
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

                    {isHighlighted && !isFirstProduct && (
                      <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        Highlighted
                      </span>
                    )}

                    <div
                      className="absolute top-3 right-3 z-10"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!token) {
                          toast.error("Please login first");
                          return;
                        }

                        // Set loading state for this product
                        setPendingWishlistActions(prev => ({ ...prev, [p._id]: true }));

                        const wasInWishlist = isInWishlist;

                        if (wasInWishlist) {
                          // Optimistic remove
                          dispatch(removeWishlistLocal(p._id));
                          toast.success("Removed from wishlist");

                          try {
                            await dispatch(removeWishlistItem(p._id)).unwrap();
                          } catch (err) {
                            // Rollback on error
                            dispatch(addWishlistLocal(p));
                            toast.error("Failed to remove from wishlist");
                          }
                        } else {
                          // Optimistic add
                          dispatch(addWishlistLocal(p));
                          toast.success("Added to wishlist ❤️");

                          try {
                            await dispatch(addWishlistItem(p._id)).unwrap();
                          } catch (err) {
                            // Rollback on error
                            dispatch(removeWishlistLocal(p._id));
                            toast.error("Failed to add to wishlist");
                          }
                        }

                        // Remove loading state
                        setPendingWishlistActions(prev => ({ ...prev, [p._id]: false }));
                      }}
                    >
                      <div
                        className={`
                          relative flex items-center justify-center
                          w-9 h-9 rounded-full
                          backdrop-blur-md
                          transition-all duration-150
                          ${isInWishlist
                            ? "bg-pink-50 shadow-md scale-110"
                            : "bg-white/80 hover:bg-pink-50"
                          }
                        `}
                      >
                        {isWishlistLoading ? (
                          <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Heart
                            size={20}
                            className={`
                              transition-all duration-150
                              ${isInWishlist
                                ? "fill-pink-600 text-pink-600"
                                : "text-gray-600 group-hover:text-pink-500"
                              }
                            `}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* CONTENT */}
                <div className="p-3 sm:p-4 flex flex-col gap-1">
                  <h2 className="font-semibold text-sm sm:text-base line-clamp-1">
                    {p.name}
                  </h2>

                  <p className="text-gray-600 text-xs line-clamp-2">
                    {p.description?.length > 50
                      ? p.description.slice(0, 40) + "..."
                      : p.description}
                  </p>

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

                  <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                    <span>{p.category?.name}</span>
                    <span className="text-yellow-500 font-semibold">
                      ★ {p.rating?.toFixed(1) || 0}
                    </span>
                  </div>

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
                          slug: p.slug,
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
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <FooterNavbar />
    </>
  );
};

export default Products;