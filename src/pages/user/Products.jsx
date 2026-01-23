

import { useEffect, useState } from "react";
import { fetchUserProducts } from "@/api/productApi";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState(""); // "price_asc" or "price_desc"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const dispatch = useDispatch();
  const LIMIT = 12; // products per page

  useEffect(() => {
    // Fetch categories for filter
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/categories");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Fetch categories error:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sort, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=${LIMIT}`;
      if (selectedCategory) query += `&category=${selectedCategory}`;
      if (sort) query += `&sort=${sort}`;

      const data = await fetchUserProducts(query);
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="p-6 text-center text-xl">Loading products...</p>;

  if (products.length === 0)
    return (
      <p className="p-6 text-center text-xl text-gray-500">
        No products available
      </p>
    );

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">All Products</h1>

        {/* FILTER + SORT */}
        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={selectedCategory}
            onChange={(e) => {
              setPage(1);
              setSelectedCategory(e.target.value);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="price_asc">Price Low → High</option>
            <option value="price_desc">Price High → Low</option>
          </select>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="border rounded-lg shadow hover:shadow-lg transition overflow-hidden bg-white"
            >
              <div className="relative">
                <Link to={`/product/${p.slug}`}>
                  <img
                    src={p.images?.[0]?.url}
                    alt={p.name}
                    className="w-full h-56 object-cover"
                  />
                </Link>
                {p.discountPrice > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    {Math.round(((p.price - p.discountPrice) / p.price) * 100)}%
                    OFF
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col gap-2">
                <h2 className="text-lg font-semibold line-clamp-1">{p.name}</h2>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {p.description}
                </p>

                <div className="flex justify-between items-center mt-2">
                  <div>
                    <span className="text-lg font-bold">₹{p.finalPrice}</span>{" "}
                    {p.discountPrice > 0 && (
                      <span className="text-gray-400 line-through ml-1">
                        ₹{p.price}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${p.stock > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {p.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">
                    Category: {p.category?.name || "N/A"}
                  </span>
                  <span className="text-sm text-yellow-500 font-semibold">
                    ★ {p.rating?.toFixed(1) || 0}
                  </span>
                </div>

                <button
                  disabled={p.stock === 0}
                  className={`mt-3 w-full py-2 rounded font-semibold transition ${p.stock > 0
                    ? "bg-pink-500 text-white hover:bg-pink-600"
                    : "bg-gray-300 text-gray-700 cursor-not-allowed"
                    }`}
                  onClick={() => {
                    if (p.stock === 0) return;
                    dispatch(addToCart({
                      productId: p._id,
                      name: p.name,
                      price: p.finalPrice,
                      image: p.images?.[0]?.url,
                      quantity: 1,
                    }));
                    toast.success(`${p.name} added to cart ✅`);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default Products;
