import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchCategories, fetchUserProducts } from "@/api/productApi";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import FooterNavbar from "@/components/user/FooterNavbar";
import { 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Filter, 
  Grid3x3, 
  List,
  ArrowUpDown,
  DollarSign,
  Tags,
  RotateCcw
} from "lucide-react";

const ProductCategoryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const sidebarRef = useRef(null);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [sort, setSort] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const LIMIT = 12;

    /* ---------------- FETCH CATEGORIES ---------------- */
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetchCategories();
                if (res.success) {
                    setCategories(res.categories);
                    const current = res.categories.find((c) => c._id === id);
                    if (current) {
                        setCategoryName(current.name);
                    } else if (id) {
                        // If category not found in list, set a default name
                        setCategoryName("Category");
                    }
                }
            } catch {
                toast.error("Failed to load categories");
            }
        };
        loadCategories();
    }, [id]);

    /* ---------------- RESET PAGE ON FILTER CHANGE ---------------- */
    useEffect(() => {
        if (!isInitialLoad) {
            setPage(1);
        }
    }, [id, sort, minPrice, maxPrice]);

    /* ---------------- FETCH PRODUCTS ---------------- */
    useEffect(() => {
        if (id) {
            fetchProducts();
        }
    }, [id, page, sort, minPrice, maxPrice]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let query = `?category=${id}&page=${page}&limit=${LIMIT}`;

            if (sort) query += `&sort=${sort}`;
            if (minPrice) query += `&minPrice=${minPrice}`;
            if (maxPrice) query += `&maxPrice=${maxPrice}`;

            console.log("Fetching products with query:", query); // Debug log

            const res = await fetchUserProducts(query);

            if (res.success) {
                setProducts(res.products || []);
                setTotalPages(res.totalPages || 1);
            } else {
                setProducts([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Fetch products error:", error);
            toast.error("Failed to fetch products");
            setProducts([]);
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    };

    const handleClearFilters = () => {
        setSort("");
        setMinPrice("");
        setMaxPrice("");
        setPage(1);
        toast.success("All filters cleared");
    };

    const handleResetFilters = () => {
        setSort("");
        setMinPrice("");
        setMaxPrice("");
        setPage(1);
        setShowMobileFilter(false);
        toast.success("Filters reset successfully");
    };

    // Handle category change from sidebar
    const handleCategoryChange = (categoryId) => {
        // Clear all filters when changing category
        setSort("");
        setMinPrice("");
        setMaxPrice("");
        setPage(1);
        setShowMobileFilter(false);
        // Navigate to new category
        navigate(`/category/${categoryId}`);
    };

    const hasActiveFilters = sort || minPrice || maxPrice;

    // Close filter on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setShowMobileFilter(false);
            }
        };

        if (showMobileFilter) {
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "auto";
        };
    }, [showMobileFilter]);

    // Skeleton Loader
    const SkeletonCard = () => (
        <div className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-48 sm:h-52 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
    );

    // Mobile Filter Sidebar
    const MobileFilterSidebar = () => (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden">
            <div 
                ref={sidebarRef}
                className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto"
            >
                <div className="sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold text-lg">Filters</h3>
                        <button
                            onClick={() => setShowMobileFilter(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-6 pb-24">
                    {/* Categories */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Tags size={18} />
                            Categories
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => handleCategoryChange(cat._id)}
                                    className={`w-full text-left block px-3 py-2 rounded-lg text-sm transition ${
                                        id === cat._id
                                            ? "bg-indigo-50 text-indigo-600 font-semibold"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <DollarSign size={18} />
                            Price Range
                        </h4>
                        <div className="space-y-3">
                            <input
                                type="number"
                                placeholder="Min Price"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <input
                                type="number"
                                placeholder="Max Price"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <ArrowUpDown size={18} />
                            Sort By
                        </h4>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-indigo-500"
                        >
                            <option value="">Default</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t mt-4">
                        <button
                            onClick={handleResetFilters}
                            className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={14} />
                            Reset All
                        </button>
                        <button
                            onClick={() => setShowMobileFilter(false)}
                            className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 mb-20">
                    
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
                        <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
                        <span>/</span>
                        <Link to="/products" className="hover:text-indigo-600 transition">Products</Link>
                        <span>/</span>
                        <span className="text-gray-800 font-medium">{categoryName || "Category"}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        
                        {/* ================= DESKTOP SIDEBAR ================= */}
                        <div className="hidden lg:block w-72 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-20">
                                {/* Categories Section */}
                                <div className="p-5 border-b">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Tags size={18} className="text-indigo-600" />
                                        Categories
                                    </h3>
                                    <div className="space-y-1 max-h-80 overflow-y-auto">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat._id}
                                                to={`/category/${cat._id}`}
                                                onClick={() => {
                                                    // Clear filters when changing category
                                                    setSort("");
                                                    setMinPrice("");
                                                    setMaxPrice("");
                                                }}
                                                className={`block px-3 py-2 rounded-lg text-sm transition ${
                                                    id === cat._id
                                                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                                                        : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div className="p-5 border-b">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <DollarSign size={18} className="text-indigo-600" />
                                        Price Range
                                    </h3>
                                    <div className="space-y-3">
                                        <input
                                            type="number"
                                            placeholder="Min Price"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max Price"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Sort Options */}
                                <div className="p-5 border-b">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <ArrowUpDown size={18} className="text-indigo-600" />
                                        Sort By
                                    </h3>
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-indigo-500"
                                    >
                                        <option value="">Default</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="newest">Newest First</option>
                                        <option value="rating">Top Rated</option>
                                    </select>
                                </div>

                                {/* Clear Filters Button */}
                                {hasActiveFilters && (
                                    <div className="p-5">
                                        <button
                                            onClick={handleClearFilters}
                                            className="w-full py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw size={14} />
                                            Reset All Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ================= MAIN CONTENT ================= */}
                        <div className="flex-1">
                            
                            {/* Toolbar */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-800">{products.length}</span> products found
                                    </p>

                                    <div className="flex items-center gap-3">
                                        {/* View Toggle */}
                                        <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1">
                                            <button
                                                onClick={() => setViewMode("grid")}
                                                className={`p-1.5 rounded transition ${
                                                    viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-gray-400"
                                                }`}
                                            >
                                                <Grid3x3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setViewMode("list")}
                                                className={`p-1.5 rounded transition ${
                                                    viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "text-gray-400"
                                                }`}
                                            >
                                                <List size={18} />
                                            </button>
                                        </div>

                                        {/* Sort Dropdown (Desktop) */}
                                        <select
                                            value={sort}
                                            onChange={(e) => setSort(e.target.value)}
                                            className="hidden sm:block border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-indigo-500"
                                        >
                                            <option value="">Sort By</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                            <option value="newest">Newest First</option>
                                            <option value="rating">Top Rated</option>
                                        </select>

                                        {/* Mobile Filter Button */}
                                        <button
                                            onClick={() => setShowMobileFilter(true)}
                                            className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium"
                                        >
                                            <Filter size={16} />
                                            Filter
                                            {hasActiveFilters && (
                                                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Active Filters Tags */}
                                {hasActiveFilters && (
                                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                                        {minPrice && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                Min: ₹{parseInt(minPrice).toLocaleString()}
                                                <button onClick={() => setMinPrice("")} className="hover:text-red-500">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        )}
                                        {maxPrice && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                Max: ₹{parseInt(maxPrice).toLocaleString()}
                                                <button onClick={() => setMaxPrice("")} className="hover:text-red-500">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        )}
                                        {sort && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                {sort === "price_asc" ? "Price: Low to High" : 
                                                 sort === "price_desc" ? "Price: High to Low" :
                                                 sort === "newest" ? "Newest First" : "Top Rated"}
                                                <button onClick={() => setSort("")} className="hover:text-red-500">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        )}
                                        <button
                                            onClick={handleClearFilters}
                                            className="text-xs text-indigo-600 hover:underline"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Product Grid/List */}
                            {loading ? (
                                <div className={`grid ${
                                    viewMode === "grid" 
                                        ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" 
                                        : "grid-cols-1 gap-4"
                                }`}>
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <SkeletonCard key={i} />
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Filter size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        No products found
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        No products available in this category yet.
                                    </p>
                                    <Link
                                        to="/"
                                        className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className={`grid ${
                                    viewMode === "grid" 
                                        ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" 
                                        : "grid-cols-1 gap-4"
                                }`}>
                                    {products.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        Previous
                                    </button>
                                    
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (page <= 3) {
                                                pageNum = i + 1;
                                            } else if (page >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                                                        page === pageNum
                                                            ? "bg-indigo-600 text-white"
                                                            : "border border-gray-200 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Sidebar */}
            {showMobileFilter && <MobileFilterSidebar />}

            <FooterNavbar />
        </>
    );
};

export default ProductCategoryDetails;