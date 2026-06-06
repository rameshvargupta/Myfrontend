import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";
import {
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    MapPin,
    Package,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Grid,
    Table,
    ChevronRight,
    History,
    Eye,
    ShoppingBag,
    TrendingUp,
    RefreshCw,
    X,
    AlertCircle,
    Home,
    Map,
    Smartphone,
    UserCheck,
    UserX
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";

const API_URL = import.meta.env.VITE_API_URL;

const AdminUserDetails = () => {
    const { id } = useParams();
    const token = localStorage.getItem("token");

    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("All");
    const [orderStatusFilter, setOrderStatusFilter] = useState("All");
    const [orderView, setOrderView] = useState("table");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [addressView, setAddressView] = useState("grid");
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [userRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/api/v1/orders/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_URL}/api/v1/orders/admin/user/${id}/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            const userData = await userRes.json();
            const ordersData = await ordersRes.json();
            if (!userData.success) throw new Error(userData.message);
            setAllOrders(ordersData.orders || []);
            setUser(userData.user);
        } catch (err) {
            toast.error(err.message || "Failed to load user");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const matchesSearch = !searchTerm || order.orderItems.some(item =>
                item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesPayment = paymentFilter === "All" || order.paymentStatus === paymentFilter;
            const matchesOrderStatus = orderStatusFilter === "All" || order.orderStatus === orderStatusFilter;
            return matchesSearch && matchesPayment && matchesOrderStatus;
        });
    }, [allOrders, searchTerm, paymentFilter, orderStatusFilter]);

    const stats = useMemo(() => {
        const totalOrders = allOrders.length;
        const deliveredOrders = allOrders.filter(o => o.orderStatus === "Delivered").length;
        const cancelledOrders = allOrders.filter(o => o.orderStatus === "Cancelled").length;
        const pendingOrders = allOrders.filter(o => o.orderStatus === "Pending" || o.orderStatus === "Processing" || o.orderStatus === "Shipped").length;
        const totalPurchaseAmount = allOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const averageOrderValue = totalOrders > 0 ? totalPurchaseAmount / totalOrders : 0;
        return { totalOrders, deliveredOrders, cancelledOrders, pendingOrders, totalPurchaseAmount, averageOrderValue };
    }, [allOrders]);

    const chartData = [
        { name: "Total", value: stats.totalOrders, color: "#6366f1" },
        { name: "Delivered", value: stats.deliveredOrders, color: "#10b981" },
        { name: "Cancelled", value: stats.cancelledOrders, color: "#ef4444" },
        { name: "Pending", value: stats.pendingOrders, color: "#f59e0b" },
    ];

    const getPaymentColor = (status) => {
        switch (status?.toLowerCase()) {
            case "paid": return "bg-green-100 text-green-700";
            case "failed": return "bg-red-100 text-red-700";
            default: return "bg-yellow-100 text-yellow-700";
        }
    };

    const getOrderStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "delivered": return "bg-green-100 text-green-700";
            case "cancelled": return "bg-red-100 text-red-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "processing": return "bg-blue-100 text-blue-700";
            case "shipped": return "bg-purple-100 text-purple-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="animate-spin text-indigo-600" size={40} />
                        <p className="text-gray-500">Loading user details...</p>
                    </div>
                </div>
                <FooterNavbar />
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle size={64} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">User not found</p>
                    </div>
                </div>
                <FooterNavbar />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 lg:p-8 mb-5">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* HEADER */}
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                                    <User className="text-white" size={24} />
                                </div>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    User Details
                                </span>
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Complete user profile, order history and activity</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
                        >
                            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>

                    {/* USER PROFILE CARD */}
                    <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                                <User size={20} />
                                Profile Information
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Avatar */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative">
                                        {user.profilePic ? (
                                            <img src={user.profilePic} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg" />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white border-4 border-indigo-500 shadow-lg">
                                                {user.firstName?.[0]}{user.lastName?.[0]}
                                            </div>
                                        )}
                                        <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${user.isBlocked ? "bg-red-500" : "bg-green-500"}`}></div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                        {user.isBlocked ? "Blocked" : "Active"}
                                    </span>
                                </div>

                                {/* User Info Grid */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <ProfileItem icon={User} label="Full Name" value={`${user.firstName || ""} ${user.lastName || ""}`.trim()} />
                                    <ProfileItem icon={Mail} label="Email Address" value={user.email} />
                                    <ProfileItem icon={Smartphone} label="Phone Number" value={user.phoneNo || "Not provided"} />
                                    <ProfileItem icon={Shield} label="Role" value={user.role || "User"} />
                                    <ProfileItem icon={Calendar} label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
                                    <div onClick={() => setShowHistory(true)} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:bg-indigo-50 transition-all group">
                                        <div className="text-indigo-600"><History size={18} /></div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Last Login</p>
                                            <p className="font-medium text-sm">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never logged in"}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <ProfileItem icon={CheckCircle} label="Email Verified" value={user.isVerified ? "Verified" : "Not Verified"} badge={user.isVerified ? "success" : "warning"} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        <SummaryCard title="Total Orders" value={stats.totalOrders} icon={Package} gradient="from-indigo-500 to-indigo-600" />
                        <SummaryCard title="Delivered" value={stats.deliveredOrders} icon={CheckCircle} gradient="from-green-500 to-emerald-600" />
                        <SummaryCard title="Cancelled" value={stats.cancelledOrders} icon={XCircle} gradient="from-red-500 to-rose-600" />
                        <SummaryCard title="Pending" value={stats.pendingOrders} icon={Clock} gradient="from-yellow-500 to-orange-600" />
                        <SummaryCard title="Total Spent" value={`₹${stats.totalPurchaseAmount.toLocaleString()}`} icon={CreditCard} gradient="from-purple-500 to-pink-600" />
                        <SummaryCard title="Avg Order" value={`₹${stats.averageOrderValue.toFixed(0)}`} icon={TrendingUp} gradient="from-cyan-500 to-blue-600" />
                    </div>

                    {/* CHART */}
                    <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <BarChart size={18} className="text-indigo-500" />
                            Order Analytics
                        </h3>
                        <div className="w-full h-80">
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                                    <Legend />
                                    <Bar dataKey="value" name="Orders" radius={[8, 8, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Bar key={index} dataKey="value" fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ORDERS SECTION */}
                    <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-4">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                                    <ShoppingBag size={20} />
                                    Order History
                                    {filteredOrders.length > 0 && (
                                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                            {filteredOrders.length} orders
                                        </span>
                                    )}
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={() => setOrderView("table")} className={`p-2 rounded-lg transition-all ${orderView === "table" ? "bg-white text-indigo-600 shadow" : "bg-white/20 text-white hover:bg-white/30"}`}>
                                        <Table size={16} />
                                    </button>
                                    <button onClick={() => setOrderView("grid")} className={`p-2 rounded-lg transition-all ${orderView === "grid" ? "bg-white text-indigo-600 shadow" : "bg-white/20 text-white hover:bg-white/30"}`}>
                                        <Grid size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <div className="flex-1 min-w-[200px] relative">
                                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="All">All Payments</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Failed">Failed</option>
                                </select>
                                <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="All">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Orders Content with Scroll */}
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package size={48} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-400">No orders found</p>
                                </div>
                            ) : orderView === "table" ? (
                                // TABLE VIEW WITH SCROLL
                                <div className="overflow-x-auto max-h-[500px] overflow-y-auto border rounded-xl">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr className="text-left text-gray-600">
                                                <th className="p-3">Product</th>
                                                <th className="p-3">Category</th>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Amount</th>
                                                <th className="p-3">Payment</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredOrders.map(order => {
                                                const firstItem = order.orderItems[0];
                                                return (
                                                    <tr
                                                        key={order._id}
                                                        className="hover:bg-gray-50 transition cursor-pointer"
                                                        onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                                                    >
                                                        <td className="p-3 font-medium">
                                                            {firstItem?.productName}
                                                            {order.orderItems.length > 1 && (
                                                                <span className="text-xs text-gray-400 ml-1">
                                                                    +{order.orderItems.length - 1} more
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3">{firstItem?.categoryName || "-"}</td>
                                                        <td className="p-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td className="p-3 font-semibold">₹{order.totalAmount}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${getPaymentColor(order.paymentStatus)}`}>
                                                                {order.paymentStatus}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${getOrderStatusColor(order.orderStatus)}`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <Eye size={16} className="text-gray-400 hover:text-indigo-600" />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                // GRID VIEW WITH SCROLL
                                <div className="max-h-[500px] overflow-y-auto pr-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredOrders.map(order => {
                                            const firstItem = order.orderItems[0];
                                            return (
                                                <div
                                                    key={order._id}
                                                    onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                                                    className="border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer bg-gray-50 hover:bg-white"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="font-semibold text-sm line-clamp-2 flex-1">
                                                            {firstItem?.productName}
                                                        </p>
                                                        <span className={`px-2 py-1 rounded-full text-xs ml-2 ${getOrderStatusColor(order.orderStatus)}`}>
                                                            {order.orderStatus}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-2">{firstItem?.categoryName}</p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-indigo-600">₹{order.totalAmount}</span>
                                                        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {order.orderItems.length > 1 && (
                                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                                            <p className="text-xs text-gray-400">
                                                                📦 {order.orderItems.length} products total
                                                            </p>
                                                            {/* Show additional products preview */}
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                {order.orderItems.slice(1, 3).map((item, idx) => (
                                                                    <div key={idx} className="truncate">
                                                                        • {item.productName}
                                                                    </div>
                                                                ))}
                                                                {order.orderItems.length > 3 && (
                                                                    <div className="text-indigo-500">
                                                                        +{order.orderItems.length - 3} more items
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Scroll Indicator for many orders */}
                            {filteredOrders.length > 6 && (
                                <div className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                    <span>📜 Scroll for more orders ({filteredOrders.length} total)</span>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ADDRESSES SECTION */}
                    <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                                    <MapPin size={20} />
                                    Saved Addresses
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={() => setAddressView("table")} className={`p-2 rounded-lg transition-all ${addressView === "table" ? "bg-white text-green-600 shadow" : "bg-white/20 text-white hover:bg-white/30"}`}>
                                        <Table size={16} />
                                    </button>
                                    <button onClick={() => setAddressView("grid")} className={`p-2 rounded-lg transition-all ${addressView === "grid" ? "bg-white text-green-600 shadow" : "bg-white/20 text-white hover:bg-white/30"}`}>
                                        <Grid size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            {user.addresses?.length === 0 ? (
                                <div className="text-center py-12">
                                    <Home size={48} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-400">No saved addresses</p>
                                </div>
                            ) : addressView === "table" ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr className="text-left text-gray-600">
                                                <th className="p-3">Full Name</th>
                                                <th className="p-3">Phone</th>
                                                <th className="p-3">Address</th>
                                                <th className="p-3">City</th>
                                                <th className="p-3">Pincode</th>
                                                <th className="p-3">State</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {user.addresses?.map((addr, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium">{addr.fullName}</td>
                                                    <td className="p-3">{addr.phone}</td>
                                                    <td className="p-3">{addr.address}</td>
                                                    <td className="p-3">{addr.city}</td>
                                                    <td className="p-3">{addr.pincode}</td>
                                                    <td className="p-3">{addr.state}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user.addresses?.map((addr, i) => (
                                        <div key={i} className="border rounded-xl p-4 hover:shadow-md transition-all bg-gray-50 hover:bg-white">
                                            <div className="flex items-start gap-3">
                                                <MapPin size={18} className="text-green-500 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-semibold">{addr.fullName}</p>
                                                    <p className="text-sm text-gray-600">{addr.phone}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{addr.address}</p>
                                                    <p className="text-sm text-gray-600">{addr.city} - {addr.pincode}</p>
                                                    <p className="text-sm text-gray-600">{addr.state}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ORDER DETAILS MODAL */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowOrderModal(false)} />
                    <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Order Details</h2>
                                <p className="text-xs text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setShowOrderModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={i} className="flex gap-4 border rounded-xl p-4 hover:shadow-md transition">
                                        <img src={item.image} alt={item.productName} className="w-24 h-24 rounded-xl object-cover" />
                                        <div className="flex-1">
                                            <p className="font-semibold">{item.productName}</p>
                                            <p className="text-sm text-gray-500">Category: {item.categoryName}</p>
                                            <p className="text-sm">Price: ₹{item.price}</p>
                                            <p className="text-sm">Quantity: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-indigo-600">Subtotal: ₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-6 grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}</p>
                                    <p><strong>Order Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getOrderStatusColor(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span></p>
                                    <p><strong>Payment Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getPaymentColor(selectedOrder.paymentStatus)}`}>{selectedOrder.paymentStatus}</span></p>
                                    <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                                </div>
                                <div className="space-y-2">
                                    <p><strong>Customer:</strong> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                                    <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.addresses?.phone}</p>
                                    <p><strong>Address:</strong> {selectedOrder.addresses?.address}, {selectedOrder.addresses?.city}, {selectedOrder.addresses?.state} - {selectedOrder.addresses?.pincode}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LOGIN HISTORY MODAL */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold">Login Activity</h2>
                                <p className="text-xs text-gray-500">User session history</p>
                            </div>
                            <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {user.loginHistory?.length === 0 ? (
                                <div className="text-center py-10"><History size={48} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400">No login history found</p></div>
                            ) : (
                                user.loginHistory.slice().reverse().map((session, index) => (
                                    <div key={index} className="border rounded-xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-medium text-gray-700">Session #{user.loginHistory.length - index}</span>
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${session.logoutAt ? "bg-gray-200 text-gray-600" : "bg-green-100 text-green-600"}`}>
                                                {session.logoutAt ? "Ended" : "Active"}
                                            </span>
                                        </div>
                                        <div className="text-xs mb-1"><span className="text-gray-500">Login:</span> <span className="ml-1 font-medium">{new Date(session.loginAt).toLocaleString()}</span></div>
                                        <div className="text-xs"><span className="text-gray-500">Logout:</span> <span className="ml-1 font-medium">{session.logoutAt ? new Date(session.logoutAt).toLocaleString() : "Still Logged In"}</span></div>
                                        {(session.ipAddress || session.device) && (
                                            <div className="text-[11px] text-gray-400 mt-3 border-t pt-2">
                                                {session.ipAddress && <div>IP: {session.ipAddress}</div>}
                                                {session.device && <div>Device: {session.device}</div>}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminUserDetails;

/* ================= SUB COMPONENTS ================= */

const ProfileItem = ({ icon: Icon, label, value, badge }) => (
    <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3 hover:bg-indigo-50 transition-all">
        <div className="text-indigo-600"><Icon size={18} /></div>
        <div className="flex-1">
            <p className="text-xs text-gray-500">{label}</p>
            {badge ? (
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${badge === "success" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{value}</span>
            ) : (
                <p className="font-medium text-sm break-words">{value || "Not provided"}</p>
            )}
        </div>
    </div>
);

const SummaryCard = ({ title, value, icon: Icon, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs opacity-90">{title}</p>
                <p className="text-xl font-bold mt-1">{value}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg"><Icon size={18} /></div>
        </div>
    </div>
);