import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FooterNavbar from "@/components/user/FooterNavbar";
import {
    ShoppingBag,
    Search,
    Filter,
    Calendar,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    ChevronRight,
    TrendingDown,
    Eye,
    Download,
    AlertCircle
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                    `${API_URL}/api/v1/orders/my-orders`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                if (data.success) setOrders(data.orders);
            } catch (err) {
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    /* ================= FILTER ================= */
    const filteredOrders = orders.filter((order) => {
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

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.orderStatus === "Delivered").length;
    const cancelledOrders = orders.filter(
        o => o.orderStatus === "Cancelled" || o.paymentStatus === "Failed"
    ).length;
    const pendingOrders = orders.filter(o => o.orderStatus === "Pending").length;

    const getStatusIcon = (status) => {
        switch (status) {
            case "Delivered": return <CheckCircle size={14} />;
            case "Pending": return <Clock size={14} />;
            case "Cancelled": return <XCircle size={14} />;
            default: return <Package size={14} />;
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading your orders...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 pb-24">
                <div className="max-w-7xl mx-auto pt-6">

                    {/* HEADER WITH GREETING */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    My Orders
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Track and manage all your purchases
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-white px-4 py-2 rounded-full shadow-sm">
                                    <span className="text-sm text-gray-600">
                                        Total Spent: ₹{orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            title="Total Orders"
                            value={totalOrders}
                            icon={ShoppingBag}
                            color="indigo"
                            trend="+12%"
                        />
                        <StatCard
                            title="Delivered"
                            value={deliveredOrders}
                            icon={CheckCircle}
                            color="green"
                        />
                        <StatCard
                            title="Pending"
                            value={pendingOrders}
                            icon={Clock}
                            color="yellow"
                        />
                        <StatCard
                            title="Cancelled"
                            value={cancelledOrders}
                            icon={XCircle}
                            color="red"
                        />
                    </div>

                    {/* SEARCH AND FILTER BAR */}
                    <div className="bg-white rounded-2xl shadow-sm border p-4 mb-8">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by order ID or product name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="px-4 py-2.5 border rounded-xl text-sm flex items-center gap-2 hover:bg-gray-50 transition"
                                >
                                    <Filter size={16} />
                                    Filter
                                </button>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="All">All Orders</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Failed">Payment Failed</option>
                                </select>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {(searchTerm || statusFilter !== "All") && (
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                                <span className="text-xs text-gray-500">Active filters:</span>
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                                        Search: {searchTerm}
                                        <button onClick={() => setSearchTerm("")} className="hover:text-indigo-900">×</button>
                                    </span>
                                )}
                                {statusFilter !== "All" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                                        Status: {statusFilter}
                                        <button onClick={() => setStatusFilter("All")} className="hover:text-indigo-900">×</button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* EMPTY STATE */}
                    {!orders.length && (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag size={40} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
                            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet</p>
                            <button
                                onClick={() => navigate("/")}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm"
                            >
                                Start Shopping
                            </button>
                        </div>
                    )}

                    {/* ORDERS GRID */}
                    {orders.length > 0 && (
                        <>
                            {filteredOrders.length === 0 && searchTerm && (
                                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                                    <AlertCircle size={40} className="text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">No orders match your search</p>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredOrders.map((order) => (
                                    <div key={order._id} className="group">
                                        {order.orderItems.map((item, index) => (
                                            <div
                                                key={`${order._id}-${index}`}
                                                onClick={() => navigate(`/myorders/${order._id}`)}
                                                className="bg-white rounded-2xl border hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group-hover:border-indigo-200"
                                            >
                                                {/* Order Header */}
                                                <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                            <p className="text-xs text-gray-400 font-mono mt-1">
                                                                Order #{order._id.slice(-8)}
                                                            </p>
                                                        </div>
                                                        <StatusBadge status={order.orderStatus} />
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div className="p-4">
                                                    <div className="flex gap-3">
                                                        <div className="relative">
                                                            <img
                                                                src={item?.image || "/api/placeholder/80/80"}
                                                                className="w-20 h-20 rounded-xl border object-cover bg-gray-50"
                                                                alt={item.productName}
                                                            />
                                                            {order.orderItems.length > 1 && (
                                                                <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                                    {order.orderItems.length}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
                                                                {item.productName}
                                                            </h3>

                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                                                <span className="text-xs text-gray-300">•</span>
                                                                <span className="text-xs font-medium text-indigo-600">
                                                                    ₹{item.price?.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Summary */}
                                                <div className="bg-gray-50 p-4 rounded-b-2xl">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Total Amount</span>
                                                            <span className="font-bold text-gray-900">
                                                                ₹{order.totalAmount?.toLocaleString()}
                                                            </span>
                                                        </div>

                                                        {order.totalSavings > 0 && (
                                                            <div className="flex justify-between text-xs text-green-600">
                                                                <span className="flex items-center gap-1">
                                                                    <TrendingDown size={12} />
                                                                    You saved
                                                                </span>
                                                                <span>₹{order.totalSavings?.toLocaleString()}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between items-center pt-2 border-t">
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                {getStatusIcon(order.orderStatus)}
                                                                <span>{order.orderStatus}</span>
                                                            </div>
                                                            <button className="text-indigo-600 text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all">
                                                                View Details
                                                                <ChevronRight size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <FooterNavbar />
        </>
    );
};

/* STAT CARD COMPONENT */
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600",
        green: "bg-green-50 text-green-600",
        yellow: "bg-yellow-50 text-yellow-600",
        red: "bg-red-50 text-red-600"
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                    {trend && (
                        <p className="text-xs text-green-600 mt-1">{trend}</p>
                    )}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

/* STATUS BADGE COMPONENT */
const StatusBadge = ({ status }) => {
    const statusConfig = {
        Pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
        Delivered: { color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
        Cancelled: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
        Shipped: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Truck },
        Processing: { color: "bg-purple-50 text-purple-700 border-purple-200", icon: Package }
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            <Icon size={12} />
            {status}
        </span>
    );
};

export default MyOrders;