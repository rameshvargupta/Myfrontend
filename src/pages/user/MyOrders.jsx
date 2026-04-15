import { useEffect, useState, useCallback, useMemo } from "react";
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

// Status Badge Component - Defined outside
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

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const navigate = useNavigate();

    // Fetch orders with AbortController for cleanup
    useEffect(() => {
        const abortController = new AbortController();

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("Please login to view orders");
                    navigate("/login");
                    return;
                }

                const res = await fetch(
                    `${API_URL}/api/v1/orders/my-orders`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        signal: abortController.signal
                    }
                );

                const data = await res.json();
                if (data.success) {
                    setOrders(data.orders);
                } else {
                    toast.error(data.message || "Failed to load orders");
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    toast.error("Failed to load orders");
                    console.error("Fetch error:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        return () => abortController.abort();
    }, [navigate]);

    // Handle order click
    const handleOrderClick = useCallback((orderId, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        setSelectedOrderId(orderId);
        navigate(`/myorders/${orderId}`, {
            replace: false,
            state: { fromOrders: true }
        });

        setTimeout(() => setSelectedOrderId(null), 100);
    }, [navigate]);

    // Memoized filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (statusFilter !== "All") {
                if (statusFilter === "Failed") {
                    if (order.paymentStatus !== "Failed") return false;
                } else {
                    if (order.orderStatus !== statusFilter) return false;
                }
            }

            const search = searchTerm.toLowerCase().trim();
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
    }, [orders, statusFilter, searchTerm]);

    // Statistics
    const stats = useMemo(() => ({
        total: orders.length,
        delivered: orders.filter(o => o.orderStatus === "Delivered").length,
        pending: orders.filter(o => o.orderStatus === "Pending").length,
        cancelled: orders.filter(o => o.orderStatus === "Cancelled" || o.paymentStatus === "Failed").length
    }), [orders]);

    // Loading component
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading your orders...</p>
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
                            onClick={() => navigate("/")} // 👈 go back
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                        >
                            <ArrowLeft size={22} className="text-gray-700" />
                        </button>

                        {/* TEXT */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Track and manage your purchases
                            </p>
                        </div>

                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <ShoppingBag size={18} className="text-indigo-600 mb-1" />
                            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <CheckCircle size={18} className="text-green-600 mb-1" />
                            <p className="text-xl font-bold text-gray-800">{stats.delivered}</p>
                            <p className="text-xs text-gray-500">Delivered</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <Clock size={18} className="text-yellow-600 mb-1" />
                            <p className="text-xl font-bold text-gray-800">{stats.pending}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <XCircle size={18} className="text-red-600 mb-1" />
                            <p className="text-xl font-bold text-gray-800">{stats.cancelled}</p>
                            <p className="text-xs text-gray-500">Cancelled</p>
                        </div>
                    </div>

                    {/* FILTER AND SEARCH */}
                    <div className="flex gap-2 mb-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white"
                        >
                            <option value="All">All Orders</option>
                            <option value="Pending">Pending</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Failed">Payment Failed</option>
                        </select>

                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                        </div>
                    </div>

                    {/* EMPTY STATE */}
                    {!orders.length && (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">No Orders Yet</h3>
                            <p className="text-gray-500 text-sm mb-4">Start shopping to see your orders</p>
                            <button
                                onClick={() => navigate("/")}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                            >
                                Start Shopping
                            </button>
                        </div>
                    )}

                    {/* ORDERS LIST - Each product separate */}
                    {orders.length > 0 && filteredOrders.length > 0 && (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => (
                                <div key={order._id} className="bg-white rounded-xl shadow-sm border border-black-200 overflow-hidden">
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
                                                    #{order._id.slice(-8)}
                                                </p>
                                            </div>
                                            <StatusBadge status={order.orderStatus} />
                                        </div>
                                    </div>

                                    {/* Products List - Each product shown separately */}
                                    <div className="divide-y divide-gray-100">
                                        {order.orderItems.map((item, idx) => (
                                            <div
                                                key={`${order._id}-${idx}`}
                                                onClick={(e) => handleOrderClick(order._id, e)}
                                                className="p-4 hover:bg-gray-50 transition cursor-pointer"
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleOrderClick(order._id, e);
                                                }}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Product Image */}
                                                    <img
                                                        src={item?.image || "https://via.placeholder.com/60"}
                                                        className="w-16 h-16 rounded-lg object-cover bg-gray-100 border border-gray-200"
                                                        alt={item.productName}
                                                        loading="lazy"
                                                    />

                                                    {/* Product Details */}
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
                                                                    {item.productName}
                                                                </h3>
                                                                <p className="text-xs text-gray-500">
                                                                    Qty: {item.quantity}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
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
                                                className="text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition"
                                            >
                                                {selectedOrderId === order._id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    'View Details →'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* NO RESULTS STATE */}
                    {orders.length > 0 && filteredOrders.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <Package size={48} className="text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">No matching orders</h3>
                            <p className="text-gray-500 text-sm">Try changing your search or filter</p>
                        </div>
                    )}
                </div>
            </div>

            <FooterNavbar />
        </>
    );
};

export default MyOrders;