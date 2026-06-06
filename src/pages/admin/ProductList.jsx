import { deleteProductApi, fetchAdminProducts, fetchCategories, toggleProductApi } from "@/api/productApi";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import DeleteModal from "../DeleteModal";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Grid3x3,
  Table2,
  RefreshCw,
  TrendingUp,
  Calendar,
  Tag,
  Layers,
  X,
  SlidersHorizontal,
  Eye
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const productsPerPage = 9;

  // Modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  /* ---------- FETCH PRODUCTS ---------- */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminProducts();
      if (!data.success) throw new Error(data.message);
      setProducts(data.products);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const data = await fetchCategories();
      if (!data.success) throw new Error(data.message);
      setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    getCategories();
  }, []);

  /* ---------- FILTER & SORT LOGIC ---------- */
  const filteredAndSortedProducts = useMemo(() => {
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

    // SORT
    temp.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "finalPrice") {
        valA = a.finalPrice;
        valB = b.finalPrice;
      } else if (sortField === "createdAt") {
        valA = new Date(a.createdAt);
        valB = new Date(b.createdAt);
      } else if (sortField === "stock") {
        valA = a.stock;
        valB = b.stock;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return temp;
  }, [products, searchTerm, categoryFilter, statusFilter, sortField, sortOrder]);

  // Pagination
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

  /* ---------- PRODUCT ACTIONS ---------- */
  const toggleStatus = async (id, currentStatus) => {
    setActionLoading({ id, type: "toggle" });
    
    try {
      const data = await toggleProductApi(id);
      if (!data.success) {
        toast.error("Status update failed");
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isActive: data.isActive } : p))
      );

      toast.success(data.isActive ? "Product Activated ✅" : "Product Blocked 🔒");
    } catch (error) {
      toast.error("Status update failed");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const deleteHandler = async () => {
    if (!selectedProductId) return;
    
    setActionLoading({ id: selectedProductId, type: "delete" });
    
    try {
      const data = await deleteProductApi(selectedProductId);
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      setProducts((prev) => prev.filter((p) => p._id !== selectedProductId));
      toast.success("Product deleted successfully 🗑️");
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setActionLoading({ id: null, type: null });
      setIsDeleteOpen(false);
      setSelectedProductId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("");
    setSortField("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || categoryFilter || statusFilter;

  // STATS
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const blockedProducts = products.filter(p => !p.isActive).length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.finalPrice * p.stock), 0);

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: "Out of Stock", color: "bg-red-100 text-red-600", icon: AlertCircle };
    if (stock <= 10) return { text: "Low Stock", color: "bg-yellow-100 text-yellow-600", icon: AlertCircle };
    return { text: "In Stock", color: "bg-green-100 text-green-600", icon: CheckCircle };
  };

  if (loading && products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="animate-spin text-indigo-600" size={40} />
            <p className="text-gray-500">Loading products...</p>
          </div>
        </div>
        <FooterNavbar />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 lg:p-8 mb-15">

        {/* HEADER */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <Package className="text-white" size={24} />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Product Management
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage all products, inventory, and pricing
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={handleRefresh}
                className="bg-white border-2 border-gray-200 px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
                disabled={refreshing}
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>

              <Link
                to="/admin/add-product"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Plus size={18} />
                Add Product
              </Link>

              <div className="flex bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-indigo-100 text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-indigo-100 text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  <Table2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 mb-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <h2 className="text-xl font-bold text-gray-800">{totalProducts}</h2>
                  <p className="text-xs text-gray-400">Products</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Package size={18} className="text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-4 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600">Active</p>
                  <h2 className="text-xl font-bold text-green-600">{activeProducts}</h2>
                  <p className="text-xs text-green-400">Products</p>
                </div>
                <div className="p-2 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600">Blocked</p>
                  <h2 className="text-xl font-bold text-red-600">{blockedProducts}</h2>
                  <p className="text-xs text-red-400">Products</p>
                </div>
                <div className="p-2 bg-red-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Ban size={18} className="text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-4 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-600">Low Stock</p>
                  <h2 className="text-xl font-bold text-yellow-600">{lowStockProducts}</h2>
                  <p className="text-xs text-yellow-400">Products</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-xl group-hover:scale-110 transition-transform">
                  <AlertCircle size={18} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600">Out of Stock</p>
                  <h2 className="text-xl font-bold text-orange-600">{outOfStockProducts}</h2>
                  <p className="text-xs text-orange-400">Products</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                  <ShoppingBag size={18} className="text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600">Inventory Value</p>
                  <h2 className="text-xl font-bold text-purple-600">₹{totalValue.toLocaleString()}</h2>
                  <p className="text-xs text-purple-400">Total</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingUp size={18} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="bg-white rounded-2xl shadow-sm border-0 p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 justify-center ${
                  showFilters || hasActiveFilters
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <SlidersHorizontal size={16} />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 w-5 h-5 bg-white text-indigo-600 rounded-full text-xs flex items-center justify-center">
                    {String(hasActiveFilters).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ADVANCED FILTERS SECTION */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-sm border-0 p-5 mb-6 animate-in slide-in-from-top duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Filter size={16} />
                  Advanced Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear all
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div className="relative">
                  <Layers size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div className="relative">
                  <TrendingUp size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={`${sortField}_${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('_');
                      setSortField(field);
                      setSortOrder(order);
                    }}
                    className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="createdAt_desc">Newest First</option>
                    <option value="createdAt_asc">Oldest First</option>
                    <option value="finalPrice_asc">Price: Low to High</option>
                    <option value="finalPrice_desc">Price: High to Low</option>
                    <option value="stock_desc">Stock: High to Low</option>
                    <option value="stock_asc">Stock: Low to High</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS CONTENT */}
          {loading && products.length > 0 ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : viewMode === "card" ? (
            /* CARD VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                const StockIcon = stockStatus.icon;
                const discount = product.price > product.finalPrice 
                  ? ((product.price - product.finalPrice) / product.price * 100).toFixed(0)
                  : 0;
                const isActionLoading = actionLoading.id === product._id;

                return (
                  <div key={product._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                    {/* Status Bar */}
                    <div className={`h-1 ${product.isActive ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-red-500"}`}></div>

                    {/* Image Section */}
                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={product.images?.[0]?.url || "/api/placeholder/400/300"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Status Badge */}
                      <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-lg ${product.isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                        {product.isActive ? "Active" : "Blocked"}
                      </span>
                      {/* Discount Badge */}
                      {discount > 0 && product.isActive && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-500 text-white">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Title */}
                      <h3 className={`font-bold text-lg line-clamp-1 ${!product.isActive && "text-gray-400"}`}>
                        {product.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>

                      {/* Price Section */}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">₹{product.finalPrice}</span>
                        {product.price > product.finalPrice && (
                          <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                        )}
                      </div>

                      {/* Stock & Category */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-600">{product.category?.name || "Uncategorized"}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${stockStatus.color}`}>
                          <StockIcon size={12} />
                          {stockStatus.text} ({product.stock})
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        {/* View Button - New */}
                        <Link
                          to={`/admin/product/view/${product.slug}`}
                          className="px-3 py-2 rounded-xl text-sm font-medium transition-all bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                          title="View Product"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/admin/product/edit/${product._id}`}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${product.isActive ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                          onClick={(e) => !product.isActive && e.preventDefault()}
                        >
                          <Edit size={16} />
                          Edit
                        </Link>
                        <button
                          onClick={() => toggleStatus(product._id, product.isActive)}
                          disabled={isActionLoading}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            product.isActive 
                              ? "bg-orange-50 text-orange-600 hover:bg-orange-100" 
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          } ${isActionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isActionLoading ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            product.isActive ? <Ban size={16} /> : <CheckCircle size={16} />
                          )}
                          {product.isActive ? "Block" : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductId(product._id);
                            setIsDeleteOpen(true);
                          }}
                          disabled={actionLoading.id === product._id}
                          className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center disabled:opacity-50"
                        >
                          {actionLoading.id === product._id && actionLoading.type === "delete" ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-700">Product</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Category</th>
                      <th onClick={() => handleSort("finalPrice")} className="p-4 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition">
                        Price {sortField === "finalPrice" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th onClick={() => handleSort("stock")} className="p-4 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition">
                        Stock {sortField === "stock" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">Status</th>
                      <th onClick={() => handleSort("createdAt")} className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition">
                        Added {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      const StockIcon = stockStatus.icon;
                      const isActionLoading = actionLoading.id === product._id;

                      return (
                        <tr key={product._id} className={`hover:bg-gray-50 transition ${!product.isActive ? "bg-red-50/30" : ""}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.images?.[0]?.url || "/api/placeholder/60/60"}
                                alt={product.name}
                                className="w-12 h-12 rounded-xl object-cover border"
                              />
                              <div>
                                <p className={`font-semibold text-sm ${!product.isActive && "text-gray-400"}`}>
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              <Tag size={12} />
                              {product.category?.name || "-"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div>
                              <p className="font-semibold text-gray-900">₹{product.finalPrice}</p>
                              {product.price > product.finalPrice && (
                                <p className="text-xs text-gray-400 line-through">₹{product.price}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${stockStatus.color}`}>
                              <StockIcon size={12} />
                              {product.stock}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold ${product.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                              {product.isActive ? <CheckCircle size={12} /> : <Ban size={12} />}
                              {product.isActive ? "Active" : "Blocked"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar size={12} />
                              {new Date(product.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-center">
                              {/* View Button - New */}
                              <Link
                                to={`/admin/product/view/${product.slug}`}
                                className="p-2 rounded-lg transition-all hover:bg-blue-50 text-blue-600"
                                title="View Product"
                              >
                                <Eye size={18} />
                              </Link>
                              <Link
                                to={`/admin/product/edit/${product._id}`}
                                className={`p-2 rounded-lg transition-all ${product.isActive ? "hover:bg-indigo-50 text-indigo-600" : "text-gray-400 cursor-not-allowed"}`}
                                onClick={(e) => !product.isActive && e.preventDefault()}
                                title="Edit Product"
                              >
                                <Edit size={18} />
                              </Link>
                              <button
                                onClick={() => toggleStatus(product._id, product.isActive)}
                                disabled={isActionLoading}
                                className={`p-2 rounded-lg transition-all ${
                                  product.isActive 
                                    ? "hover:bg-orange-50 text-orange-600" 
                                    : "hover:bg-green-50 text-green-600"
                                } ${isActionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                title={product.isActive ? "Block Product" : "Activate Product"}
                              >
                                {isActionLoading ? (
                                  <RefreshCw size={18} className="animate-spin" />
                                ) : (
                                  product.isActive ? <Ban size={18} /> : <CheckCircle size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProductId(product._id);
                                  setIsDeleteOpen(true);
                                }}
                                disabled={actionLoading.id === product._id}
                                className="p-2 rounded-lg transition-all hover:bg-red-50 text-red-500 disabled:opacity-50"
                                title="Delete Product"
                              >
                                {actionLoading.id === product._id && actionLoading.type === "delete" ? (
                                  <RefreshCw size={18} className="animate-spin" />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredAndSortedProducts.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-14">
                          <div className="flex flex-col items-center gap-3">
                            <Package size={48} className="text-gray-300" />
                            <p className="text-gray-400">No products found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 bg-white rounded-2xl shadow-sm border-0 p-4">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + productsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProductId(null);
        }}
        onConfirm={deleteHandler}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />

      <FooterNavbar />
    </>
  );
};

export default ProductList;