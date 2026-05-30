import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCategories, fetchUserProducts } from "@/api/productApi";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import FooterNavbar from "@/components/user/FooterNavbar";

const ProductCategoryDetails = () => {
    const { id } = useParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [sort, setSort] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const LIMIT = 12;

    /* ---------------- FETCH CATEGORIES ---------------- */
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetchCategories();
                if (res.success) {
                    setCategories(res.categories);

                    const current = res.categories.find((c) => c._id === id);
                    if (current) setCategoryName(current.name);
                }
            } catch {
                toast.error("Failed to load categories");
            }
        };

        loadCategories();
    }, [id]);

    /* ---------------- RESET PAGE ON FILTER CHANGE ---------------- */
    useEffect(() => {
        setPage(1);
    }, [id, sort, minPrice, maxPrice]);

    /* ---------------- FETCH PRODUCTS ---------------- */
    useEffect(() => {
        if (id) fetchProducts();
    }, [id, page, sort, minPrice, maxPrice]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let query = `?category=${id}&page=${page}&limit=${LIMIT}`;

            if (sort) query += `&sort=${sort}`;
            if (minPrice) query += `&minPrice=${minPrice}`;
            if (maxPrice) query += `&maxPrice=${maxPrice}`;

            const res = await fetchUserProducts(query);

            if (res.success) {
                setProducts(res.products);
                setTotalPages(res.totalPages);
            } else {
                setProducts([]);
            }
        } catch {
            toast.error("Failed to fetch products");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- SKELETON ---------------- */
    const SkeletonCard = () => (
        <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
    );

    return (
        <>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 mb-20">

                {/* -------- Breadcrumb -------- */}
                <div className="text-sm mb-4 text-gray-500">
                    <Link to="/">Home</Link> /{" "}
                    <span className="font-medium text-black">{categoryName}</span>
                </div>

                <h2 className="text-2xl font-bold mb-6">
                    {categoryName} Products
                </h2>

                <div className="flex gap-8">

                    {/* ================= SIDEBAR ================= */}
                    <div className="w-64 hidden lg:block space-y-6">

                        {/* Category Filter */}
                        <div>
                            <h3 className="font-semibold mb-2">Categories</h3>
                            <div className="space-y-2">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat._id}
                                        to={`/category/${cat._id}`}
                                        className={`block text-sm ${id === cat._id
                                                ? "font-bold text-black"
                                                : "text-gray-600"
                                            }`}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div>
                            <h3 className="font-semibold mb-2">Price Range</h3>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full border rounded p-2 mb-2"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>
                    </div>

                    {/* ================= MAIN CONTENT ================= */}
                    <div className="flex-1">

                        {/* Sort Dropdown */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">
                                {products.length} Products Found
                            </p>

                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="border rounded p-2 text-sm"
                            >
                                <option value="">Sort By</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {loading
                                ? Array.from({ length: 8 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))
                                : products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                        </div>

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="flex justify-center gap-4 mt-10">
                                <button
                                    onClick={() => setPage((p) => p - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    Prev
                                </button>

                                <span className="font-medium">
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <FooterNavbar/>
        </>
    );
};

export default ProductCategoryDetails;