import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priceSort, setPriceSort] = useState(""); // 'asc' or 'desc'
  const [dateSort, setDateSort] = useState(""); // 'new' or 'old'
  const [categories, setCategories] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  /* ---------- FETCH PRODUCTS ---------- */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/admin/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Fetch failed");

      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- FETCH CATEGORIES ---------- */
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/categories");
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ---------- SEARCH & FILTER LOGIC ---------- */
  useEffect(() => {
    let temp = [...products];

    // SEARCH
    if (searchTerm) {
      temp = temp.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // CATEGORY
    if (categoryFilter) {
      temp = temp.filter((p) => p.category?._id === categoryFilter);
    }

    // STATUS
    if (statusFilter) {
      temp = temp.filter((p) =>
        statusFilter === "active" ? p.isActive : !p.isActive
      );
    }

    // PRICE SORT
    if (priceSort === "asc") temp.sort((a, b) => a.finalPrice - b.finalPrice);
    if (priceSort === "desc") temp.sort((a, b) => b.finalPrice - a.finalPrice);

    // DATE SORT
    if (dateSort === "new") temp.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (dateSort === "old") temp.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    setFilteredProducts(temp);
    setCurrentPage(1); // reset page on filter change
  }, [searchTerm, categoryFilter, statusFilter, priceSort, dateSort, products]);

  /* ---------- TOGGLE ACTIVE ---------- */
  const toggleStatus = async (id) => {
    const res = await fetch(`http://localhost:5000/api/v1/admin/product/status/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const data = await res.json();
    if (!data.success) return toast.error("Status update failed");

    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isActive: data.isActive } : p))
    );

    toast.success(data.isActive ? "Product Activated" : "Product Blocked");
  };

  /* ---------- DELETE ---------- */
  const deleteHandler = async (id) => {
    if (!confirm("Permanent delete? This cannot be undone")) return;

    const res = await fetch(`http://localhost:5000/api/v1/admin/product/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const data = await res.json();
    if (!data.success) return toast.error(data.message);

    toast.success("Product deleted");
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  /* ---------- PAGINATION LOGIC ---------- */
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading)
    return (
      <>
        <Navbar />
        <p className="p-8 text-center text-gray-500">Loading products...</p>
      </>
    );

  /* ---------- SUMMARY COUNT ---------- */
  const activeCount = products.filter((p) => p.isActive).length;
  const blockedCount = products.filter((p) => !p.isActive).length;

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Product List</h1>
            <p className="text-sm text-gray-500">Manage all products, status & details</p>
          </div>
          <Link
            to="/admin/add-product"
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-lg font-medium shadow"
          >
            + Add Product
          </Link>
        </div>

        {/* SUMMARY BOXES */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-green-100 border border-green-400 rounded-xl p-6 text-center shadow">
            <h2 className="text-2xl font-bold text-green-700">{activeCount}</h2>
            <p className="text-green-800 font-medium">Active Products</p>
          </div>
          <div className="flex-1 bg-red-100 border border-red-400 rounded-xl p-6 text-center shadow">
            <h2 className="text-2xl font-bold text-red-700">{blockedCount}</h2>
            <p className="text-red-800 font-medium">Blocked Products</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-2 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="">Price Sort</option>
            <option value="asc">Low → High</option>
            <option value="desc">High → Low</option>
          </select>

          <select
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="">Date Sort</option>
            <option value="new">New → Old</option>
            <option value="old">Old → New</option>
          </select>
        </div>

        {/* PRODUCT LIST */}
        <div className="grid gap-6 
  grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
">
          {currentProducts.map((p) => (
            <div
              key={p._id}
              className={`relative bg-white rounded-2xl border shadow-sm 
        hover:shadow-lg transition-all duration-300 hover:-translate-y-1
        ${p.isActive ? "border-gray-200" : "border-red-400 bg-red-50/40"}
      `}
            >
              {/* IMAGE */}
              <div className="relative h-48 w-full">
                <img
                  src={p.images?.[0]?.url}
                  alt={p.name}
                  className="w-full h-full object-cover rounded-t-2xl"
                />

                {/* STATUS BADGE */}
                <span
                  className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full
            ${p.isActive
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white"}
          `}
                >
                  {p.isActive ? "Active" : "Blocked"}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-4 space-y-3">

                {/* TITLE */}
                <div>
                  <h2 className={`font-semibold text-sm line-clamp-1
            ${p.isActive ? "text-gray-800" : "text-red-700"}
          `}>
                    {p.name}
                  </h2>

                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {p.description}
                  </p>
                </div>

                {/* PRICE */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-base">
                      ₹{p.finalPrice}
                    </p>
                    <p className="text-xs text-gray-400 line-through">
                      ₹{p.price}
                    </p>
                  </div>

                  <span className={`text-xs font-semibold px-2 py-1 rounded-full
            ${p.stock > 10
                      ? "bg-green-100 text-green-700"
                      : p.stock > 0
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"}
          `}>
                    {p.stock} left
                  </span>
                </div>

                {/* CATEGORY + DATE */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{p.category?.name || "-"}</span>
                  <span>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 pt-2">

                  <button
                    onClick={() => toggleStatus(p._id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition
              ${p.isActive
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"}
            `}
                  >
                    {p.isActive ? "Block" : "Activate"}
                  </button>

                  <Link
                    to={`/admin/product/edit/${p._id}`}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium text-center transition
              ${p.isActive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 pointer-events-none"}
            `}
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteHandler(p._id)}
                    className="px-3 py-2 rounded-lg text-xs bg-red-600 hover:bg-red-700 text-white"
                  >
                    ✕
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>


        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded-lg border ${currentPage === idx + 1 ? "bg-pink-600 text-white border-pink-600" : "bg-white border-gray-300"}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-12">No products found</p>
        )}

      </div>
    </>
  );
};

export default ProductList;
