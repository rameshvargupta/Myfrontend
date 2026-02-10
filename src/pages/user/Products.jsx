import { useEffect, useState } from "react";
import { fetchUserProducts } from "@/api/productApi";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";

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
  const cartItems = useSelector(
    (state) => state.cart?.cartItems || []
  );


  const dispatch = useDispatch();
  const LIMIT = 12;

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/categories");
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
  }, [selectedCategory, sort, page]);

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

      const data = await fetchUserProducts(query);

      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <>
        <Navbar />
        <p className="p-10 text-center text-lg text-gray-500">
          Loading products...
        </p>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ================= HEADER ================= */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8  mt-20 bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
          Explore Products
        </h1>

        {/* ================= FILTER BAR ================= */}
        {/* DESKTOP FILTERS */}
        <div className="hidden md:block w-64 space-y-6 border-r pr-4">
          {/* CATEGORY */}
          <div>
            <h3 className="font-bold mb-2">Category</h3>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedCategory}
              onChange={(e) => {
                setPage(1);
                setSelectedCategory(e.target.value);
              }}
            >
              <option value="">All</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* PRICE */}
          <div>
            <h3 className="font-bold mb-2">Price</h3>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              className="w-full"
            />
            <p className="text-sm mt-1">Up to ₹{priceRange[1]}</p>
          </div>

          {/* RATING */}
          <div>
            <h3 className="font-bold mb-2">Rating</h3>
            {[4, 3, 2].map(r => (
              <button
                key={r}
                onClick={() => setRating(r)}
                className={`block w-full text-left px-3 py-1 rounded mb-1
          ${rating === r ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}
        `}
              >
                ⭐ {r} & above
              </button>
            ))}
          </div>

          {/* STOCK */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            In Stock Only
          </label>
        </div>


        {/* ================= PRODUCT GRID ================= */}
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

        {/* ================= PAGINATION ================= */}
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-full bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="font-medium">
            Page {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-full bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>



    </>
  );
};

export default Products;
