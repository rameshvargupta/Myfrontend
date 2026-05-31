import {
    useEffect,
    useState,
    useCallback,
    useMemo,
    useDeferredValue
} from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FooterNavbar from "@/components/user/FooterNavbar";
import {
    ShoppingBag,
    Search,
    Package,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Loader2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
// Status Badge Component
const StatusBadge = ({ status }) => {
    const styles = {
        Pending: "bg-yellow-100 text-yellow-700",
        Delivered: "bg-green-100 text-green-700",
        Cancelled: "bg-red-100 text-red-700",
        Shipped: "bg-blue-100 text-blue-700",
        Processing: "bg-purple-100 text-purple-700"
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Pending}`}>
            {status}
        </span>
    );
};
const OrderSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        {/* Header Skeleton */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    <div className="h-2 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
            </div>
        </div>

        {/* Product Items Skeleton */}
        <div className="divide-y divide-gray-100">
            {[1, 2].map((i) => (
                <div key={i} className="p-4">
                    <div className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Footer Skeleton */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    <div className="h-5 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const StatsSkeleton = () => (
    <div className="grid grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-5 w-5 bg-gray-200 rounded mb-1"></div>
                <div className="h-6 w-8 bg-gray-200 rounded mt-1"></div>
                <div className="h-3 w-12 bg-gray-200 rounded mt-1"></div>
            </div>
        ))}
    </div>
);

const FilterSkeleton = () => (
    <div className="flex gap-2 mb-4 animate-pulse">
        <div className="h-9 w-28 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
    </div>
);

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const [totalOrders, setTotalOrders] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        delivered: 0,
        pending: 0,
        cancelled: 0,
    });
    const navigate = useNavigate();
    const deferredSearch = useDeferredValue(searchTerm);

    // Optimized fetch with better performance
    const fetchOrders = useCallback(
        async (pageNumber = 1, append = false) => {
            try {
                if (pageNumber === 1) {
                    setLoading(true);
                } else {
                    setLoadingMore(true);
                }

                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("Please login to view orders");
                    navigate("/login");
                    return;
                }

                const res = await fetch(
                    `${API_URL}/api/v1/orders/my-orders?page=${pageNumber}&limit=10`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();

                if (data.success) {
                    if (append) {
                        setOrders((prev) => [...prev, ...data.orders]);
                    } else {
                        setOrders(data.orders || []);
                    }

                    setTotalOrders(data.totalOrders || 0);
                    setStats(data.stats || {
                        total: 0,
                        delivered: 0,
                        pending: 0,
                        cancelled: 0,
                    });
                    setHasMore(data.hasMore);
                } else {
                    toast.error(data.message || "Failed to load orders");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [navigate]
    );

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    const fallbackImage =
        "https://via.placeholder.com/60x60?text=No+Image";
    // Handle order click with better performance

    const handleOrderClick = useCallback((orderId) => {
        navigate(`/myorders/${orderId}`, {
            state: { fromOrders: true }
        });
    }, [navigate]);

    const handleLoadMore = () => {
        const nextPage = page + 1;

        setPage(nextPage);

        fetchOrders(nextPage, true);
    };
    // Memoized filtered orders for better performance
    const filteredOrders = useMemo(() => {
        if (!orders.length) return [];

        return orders.filter((order) => {
            // Status filter
            if (statusFilter !== "All") {
                if (statusFilter === "Failed") {
                    if (order.paymentStatus !== "Failed") return false;
                } else {
                    if (order.orderStatus !== statusFilter) return false;
                }
            }

            // Search filter
            const search = deferredSearch.toLowerCase().trim();
            if (!search) return true;

            return (
                order._id?.toLowerCase().includes(search) ||
                order.orderItems?.some((item) =>
                    (item.productName || "")
                        .toLowerCase()
                        .includes(search)
                )
            );
        });
    }, [orders, statusFilter, deferredSearch]);


    // Show skeleton while loading (no circular loader)
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 px-4 pb-24">
                    <div className="max-w-7xl mx-auto pt-2">
                        {/* Header Skeleton */}
                        <div className="mb-6 flex items-center gap-4">
                            <div className="p-2 rounded-full bg-gray-200 h-9 w-9 animate-pulse"></div>
                            <div>
                                <div className="h-7 w-32 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-48 bg-gray-200 rounded mt-1 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Stats Skeleton */}
                        <StatsSkeleton />

                        {/* Filter Skeleton */}
                        <FilterSkeleton />

                        {/* Orders Skeleton */}
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <OrderSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
                <FooterNavbar />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50 px-4 pb-24">
                <div className="max-w-7xl mx-auto pt-2">

                    {/* HEADER */}
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => navigate("/")}
                            className="p-2 rounded-full hover:bg-gray-100 transition active:scale-95"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={22} className="text-gray-700" />
                        </button>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Track and manage your purchases
                            </p>
                        </div>
                    </div>

                    {/* STATS CARDS - Optimized with better styling */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <ShoppingBag size={18} className="text-indigo-600 mb-1" />
                            <p className="text-xl font-bold text-gray-800">{totalOrders}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <CheckCircle size={18} className="text-green-600 mb-1" />
                            <p className="text-xl font-bold text-gray-800">{stats.delivered}</p>
                            <p className="text-xs text-gray-500">Delivered</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <Clock size={18} className="text-yellow-600 mb-1" />
                            <p className="text-xl font-bold text-gray-800">{stats.pending}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <XCircle size={18} className="text-red-600 mb-1" />
                            <p className="text-xl font-bold text-gray-800">{stats.cancelled}</p>
                            <p className="text-xs text-gray-500">Cancelled</p>
                        </div>
                    </div>

                    {/* Filter Chips */}
                   <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory mb-3">
                        {[
                            "All",
                            "Pending",
                            "Shipped",
                            "Delivered",
                            "Cancelled",
                            "Failed",
                        ].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition ${statusFilter === status
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white border border-gray-200 text-gray-700"
                                    }`}
                            >
                                {status === "Failed" ? "Payment Failed" : status}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative mb-4">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search by order ID or product name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                    </div>

                    {/* EMPTY STATE */}
                    {!orders.length && (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">No Orders Yet</h3>
                            <p className="text-gray-500 text-sm mb-4">Start shopping to see your orders</p>
                            <button
                                onClick={() => navigate("/")}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                            >
                                Start Shopping
                            </button>
                        </div>
                    )}

                    {/* ORDERS LIST - Optimized rendering */}
                    {orders.length > 0 && filteredOrders.length > 0 && (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Order Header */}
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                            <StatusBadge status={order.orderStatus} />
                                        </div>
                                    </div>

                                    {/* Products List - Virtualized rendering */}
                                    <div className="divide-y divide-gray-100">
                                        {order.orderItems.slice(0, 3).map((item, idx) => (
                                            <div
                                                key={`${order._id}-${idx}`}
                                                onClick={(e) => handleOrderClick(order._id, e)}
                                                className="p-4 hover:bg-gray-50 transition cursor-pointer"
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        handleOrderClick(order._id, e);
                                                    }
                                                }}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Product Image with lazy loading */}
                                                    <img
                                                        src={item?.image || fallbackImage}
                                                        alt={item.productName}
                                                        loading="lazy"
                                                        className="w-16 h-16 rounded-lg object-cover bg-gray-100 border border-gray-200"
                                                        onError={(e) => {
                                                            e.currentTarget.src = fallbackImage;
                                                        }}
                                                    />

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2 break-words">
                                                                    {item.productName}
                                                                </h3>
                                                                <p className="text-xs text-gray-500">
                                                                    Qty: {item.quantity}
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="font-semibold text-gray-800 text-sm">
                                                                    ₹{(item.price * item.quantity).toLocaleString()}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    ₹{item.price?.toLocaleString()} each
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Show "more items" indicator */}
                                        {order.orderItems.length > 3 && (
                                            <div className="px-4 py-2 text-center bg-gray-50/30">
                                                <p className="text-xs text-gray-500">
                                                    +{order.orderItems.length - 3} more item{order.orderItems.length - 3 > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Footer */}
                                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-gray-500">Total Amount</p>
                                                <p className="font-bold text-gray-800">
                                                    ₹{order.totalAmount?.toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOrderClick(order._id, e);
                                                }}
                                                className="text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition active:scale-95"
                                            >
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    )}

                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loadingMore ? "Loading..." : "Show More Orders"}
                            </button>
                        </div>
                    )}
                    {/* NO RESULTS STATE */}
                    {orders.length > 0 && filteredOrders.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <Package size={48} className="text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">No matching orders</h3>
                            <p className="text-gray-500 text-sm">Try changing your search or filter</p>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("All");
                                }}
                                className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-700"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <FooterNavbar />
        </>
    );
};

export default MyOrders;