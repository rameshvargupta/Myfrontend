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
    Table, ChevronRight, History
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
    const [addressView, setAddressView] = useState("table");

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
    /* ======================= STATS ======================= */
    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const firstItem = order.orderItems?.[0];

            const matchesSearch =
                !searchTerm ||
                order.orderItems.some(item =>
                    item.productName
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
                );

            const matchesPayment =
                paymentFilter === "All" ||
                order.paymentStatus === paymentFilter;

            const matchesOrderStatus =
                orderStatusFilter === "All" ||
                order.orderStatus === orderStatusFilter;

            return matchesSearch && matchesPayment && matchesOrderStatus;
        });
    }, [allOrders, searchTerm, paymentFilter, orderStatusFilter]);

    const stats = useMemo(() => {
        const totalOrders = allOrders.length;

        const deliveredOrders = allOrders.filter(
            o => o.orderStatus === "Delivered"
        ).length;

        const cancelledOrders = allOrders.filter(
            o => o.orderStatus === "Cancelled"
        ).length;

        const pendingOrders = allOrders.filter(
            o => o.orderStatus === "Pending" || o.orderStatus === "Shipping"
        ).length;

        const totalPurchaseAmount = allOrders.reduce(
            (acc, curr) => acc + curr.totalAmount,
            0
        );

        return {
            totalOrders,
            deliveredOrders,
            cancelledOrders,
            pendingOrders,
            totalPurchaseAmount,
        };
    }, [allOrders]);



    const chartData = [
        { name: "Total", value: stats.totalOrders },
        { name: "Delivered", value: stats.deliveredOrders },
        { name: "Cancelled", value: stats.cancelledOrders },
        { name: "Pending", value: stats.pendingOrders },
    ];



    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-lg text-gray-500">Loading user details...</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <div className="p-6 space-y-8 max-w-7xl mx-auto mb-20">

                {/* ================= USER PROFILE ================= */}

                <div className="bg-white shadow-xl rounded-2xl p-8 space-y-8">

                    <div className="flex flex-col lg:flex-row gap-8 items-center">

                        <div className="relative">
                            {user.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-indigo-500">
                                    {user.firstName[0]}{user.lastName[0]}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">

                            <ProfileItem icon={<Mail size={16} />} label="Email" value={user.email} />
                            <ProfileItem icon={<Phone size={16} />} label="Phone" value={user.phoneNo || "N/A"} />
                            <ProfileItem icon={<Shield size={16} />} label="Role" value={user.role} />
                            <ProfileItem
                                icon={<Calendar size={16} />}
                                label="Signup Date"
                                value={new Date(user.createdAt).toLocaleString()}
                            />

                            <div
                                onClick={() => setShowHistory(true)}
                                className="group cursor-pointer hover:bg-gray-50 active:scale-[0.98] rounded-lg transition-all duration-200 relative"
                            >
                                <ProfileItem
                                    icon={<Calendar size={16} />}
                                    label="Last Login"
                                    value={
                                        user.lastLogin
                                            ? new Date(user.lastLogin).toLocaleString()
                                            : "Never Logged In"
                                    }
                                />

                                {/* Right Side Icons */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">

                                    {/* Small blinking dot indicator */}
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>

                                    {/* History icon */}
                                    <History
                                        size={14}
                                        className="text-gray-400 group-hover:text-black transition"
                                    />

                                    {/* Arrow icon */}
                                    <ChevronRight
                                        size={16}
                                        className="text-gray-400 group-hover:translate-x-1 group-hover:text-black transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Sow all login and logout activity */}
                            {/* ================= LOGIN HISTORY MODAL (CENTER) ================= */}
                            {showHistory && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center">

                                    {/* Overlay */}
                                    <div
                                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                        onClick={() => setShowHistory(false)}
                                    />

                                    {/* Modal */}
                                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-fadeIn">

                                        {/* Header */}
                                        <div className="flex items-center justify-between px-6 py-4 border-b">
                                            <div>
                                                <h2 className="text-base font-semibold text-gray-800">
                                                    Login Activity
                                                </h2>
                                                <p className="text-xs text-gray-400">
                                                    User session history
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => setShowHistory(false)}
                                                className="text-gray-400 hover:text-black transition"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {/* Scrollable Body */}
                                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                                            {user.loginHistory?.length === 0 ? (
                                                <div className="text-center text-sm text-gray-500 py-10">
                                                    No login history found.
                                                </div>
                                            ) : (
                                                user.loginHistory
                                                    .slice()
                                                    .reverse()
                                                    .map((session, index) => (
                                                        <div
                                                            key={index}
                                                            className="border rounded-xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition"
                                                        >
                                                            {/* Top Row */}
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-xs font-medium text-gray-700">
                                                                    Session #{user.loginHistory.length - index}
                                                                </span>

                                                                <span
                                                                    className={`text-[10px] px-2 py-1 rounded-full font-medium ${session.logoutAt
                                                                        ? "bg-gray-200 text-gray-600"
                                                                        : "bg-green-100 text-green-600"
                                                                        }`}
                                                                >
                                                                    {session.logoutAt ? "Ended" : "Active"}
                                                                </span>
                                                            </div>

                                                            {/* Login */}
                                                            <div className="text-xs mb-1">
                                                                <span className="text-gray-500">Login:</span>
                                                                <span className="ml-1 font-medium text-gray-800">
                                                                    {new Date(session.loginAt).toLocaleString()}
                                                                </span>
                                                            </div>

                                                            {/* Logout */}
                                                            <div className="text-xs">
                                                                <span className="text-gray-500">Logout:</span>
                                                                <span className="ml-1 font-medium text-gray-800">
                                                                    {session.logoutAt
                                                                        ? new Date(session.logoutAt).toLocaleString()
                                                                        : "Still Logged In"}
                                                                </span>
                                                            </div>

                                                            {/* Extra Info */}
                                                            {(session.ipAddress || session.device) && (
                                                                <div className="text-[11px] text-gray-400 mt-3 border-t pt-2 space-y-1">
                                                                    {session.ipAddress && (
                                                                        <div>IP: {session.ipAddress}</div>
                                                                    )}
                                                                    {session.device && (
                                                                        <div>Device: {session.device}</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <BadgeItem
                                label="Account Status"
                                status={user.isBlocked ? "Blocked" : "Active"}
                            />

                            <BadgeItem
                                label="Email Verified"
                                status={user.isVerified ? "Verified" : "Not Verified"}
                            />

                        </div>
                    </div>

                    {/* ================= ORDER SUMMARY PANEL ================= */}

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                        <SummaryCard title="Total Orders" value={stats.totalOrders} icon={<Package />} />
                        <SummaryCard title="Delivered" value={stats.deliveredOrders} icon={<CheckCircle />} />
                        <SummaryCard title="Cancelled" value={stats.cancelledOrders} icon={<XCircle />} />
                        <SummaryCard title="Pending" value={stats.pendingOrders} icon={<Clock />} />
                        <SummaryCard
                            title="Total Spent"
                            value={`₹${stats.totalPurchaseAmount.toLocaleString()}`}
                            icon={<CreditCard />}
                        />

                    </div>

                    {/* ================= CHART ================= */}

                    <div className="bg-gray-50 rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4">Order Overview</h2>

                        <div className="w-full h-72">
                            <ResponsiveContainer>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* ================= ALL ORDERS SECTION ================= */}
                <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6">


                    {/* ================= FILTER BAR ================= */}

                    <div className="flex flex-wrap gap-4 items-center">

                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search product..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <span className="absolute left-2 top-2.5 text-gray-400 text-sm">
                                🔎
                            </span>
                        </div>

                        {/* Payment Status Filter */}
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">All Payment</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Failed">Failed</option>
                        </select>

                        {/* Order Status Filter */}
                        <select
                            value={orderStatusFilter}
                            onChange={(e) => setOrderStatusFilter(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Shipping">Shipping</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                    </div>


                    {/* ================= HEADER ================= */}
                    {filteredOrders.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            No orders found.
                        </div>
                    )}


                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-xl font-semibold tracking-tight">
                            All Orders
                        </h2>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setOrderView("table")}
                                className={`p-2 rounded-lg transition ${orderView === "table"
                                    ? "bg-indigo-600 text-white shadow"
                                    : "bg-gray-100 hover:bg-gray-200"
                                    }`}
                            >
                                <Table size={16} />
                            </button>

                            <button
                                onClick={() => setOrderView("grid")}
                                className={`p-2 rounded-lg transition ${orderView === "grid"
                                    ? "bg-indigo-600 text-white shadow"
                                    : "bg-gray-100 hover:bg-gray-200"
                                    }`}
                            >
                                <Grid size={16} />
                            </button>
                        </div>
                    </div>


                    {/* ================= SCROLLABLE CONTENT AREA ================= */}
                    <div className="max-h-[500px] overflow-y-auto pr-2">

                        {/* ================= TABLE VIEW ================= */}
                        {orderView === "table" ? (
                            <table className="min-w-full text-sm">
                                <thead className="sticky top-0 bg-gray-50 z-10">
                                    <tr className="text-gray-600 text-left">
                                        <th className="p-3">Product</th>
                                        <th className="p-3">Category</th>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredOrders.map(order => {
                                        const firstItem = order.orderItems[0];

                                        return (
                                            <tr
                                                key={order._id}
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowOrderModal(true);
                                                }}
                                                className="border-b hover:bg-gray-50 cursor-pointer transition"
                                            >
                                                <td className="p-3 font-medium">
                                                    {firstItem?.productName}
                                                    {order.orderItems.length > 1 && (
                                                        <span className="text-xs text-gray-400 ml-2">
                                                            +{order.orderItems.length - 1} more
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    {firstItem?.categoryName}
                                                </td>

                                                <td className="p-3">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>

                                                <td className="p-3 font-medium">
                                                    ₹{order.totalAmount}
                                                </td>

                                                <td className="p-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getOrderStatusColor(order.orderStatus)}`}>                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            /* ================= GRID VIEW (NO IMAGE) ================= */
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredOrders.map(order => {
                                    const firstItem = order.orderItems[0];

                                    return (
                                        <div
                                            key={order._id}
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowOrderModal(true);
                                            }}
                                            className="border rounded-xl p-4 hover:shadow-md transition cursor-pointer bg-gray-50 hover:bg-white"
                                        >
                                            <p className="font-semibold text-sm mb-1">
                                                {firstItem?.productName}
                                            </p>

                                            <p className="text-xs text-gray-500 mb-2">
                                                {firstItem?.categoryName}
                                            </p>

                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium">
                                                    ₹{order.totalAmount}
                                                </span>

                                                <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600">
                                                    {order.orderStatus}
                                                </span>
                                            </div>

                                            {order.orderItems.length > 1 && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {order.orderItems.length} products
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= ORDER DETAILS MODAL ================= */}
                {showOrderModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">

                            {/* Close Button */}
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
                            >
                                ✕
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold">Order Details</h2>
                                <p className="text-sm text-gray-500">
                                    {new Date(selectedOrder.createdAt).toLocaleString()}
                                </p>
                            </div>

                            {/* Product List */}
                            <div className="space-y-4">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-5 border rounded-xl p-4 hover:shadow-md transition"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.productName}
                                            className="w-28 h-28 object-cover rounded-lg border"
                                        />

                                        <div className="flex-1 space-y-1">
                                            <p className="font-semibold text-lg">
                                                {item.productName}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                Category: {item.categoryName}
                                            </p>

                                            <p className="text-sm">
                                                Price: ₹{item.price}
                                            </p>

                                            <p className="text-sm">
                                                Quantity: {item.quantity}
                                            </p>

                                            <p className="text-sm font-medium text-indigo-600">
                                                Subtotal: ₹{item.price * item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-8 border-t pt-6 grid md:grid-cols-2 gap-6 text-sm">

                                <div className="space-y-2">
                                    <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}</p>
                                    <p><strong>Order Status:</strong> {selectedOrder.orderStatus}</p>
                                    <p>
                                        <strong>Payment Status:</strong>
                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPaymentColor(selectedOrder.paymentStatus)}`}>
                                            {selectedOrder.paymentStatus}
                                        </span>
                                    </p>
                                    <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                                </div>

                                <div className="space-y-2">
                                    <p><strong>Customer:</strong> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                                    <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.addresses?.phone}</p>
                                    <p><strong>City:</strong> {selectedOrder.addresses?.city}</p>
                                </div>

                            </div>

                        </div>
                    </div>
                )}


                {/* ================= ADDRESS SECTION ================= */}
                <div className="bg-white shadow-lg rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Addresses</h2>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setAddressView("table")}
                                className={`p-2 rounded ${addressView === "table" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
                            >
                                <Table size={16} />
                            </button>

                            <button
                                onClick={() => setAddressView("grid")}
                                className={`p-2 rounded ${addressView === "grid" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
                            >
                                <Grid size={16} />
                            </button>
                        </div>
                    </div>

                    {addressView === "table" ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2">Full Name</th>
                                        <th className="p-2">Phone</th>
                                        <th className="p-2">Address</th>
                                        <th className="p-2">City</th>
                                        <th className="p-2">Pincode</th>
                                        <th className="p-2">State</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.addresses?.map((addr, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-2">{addr.fullName}</td>
                                            <td className="p-2">{addr.phone}</td>
                                            <td className="p-2">{addr.address}</td>
                                            <td className="p-2">{addr.city}</td>
                                            <td className="p-2">{addr.pincode}</td>
                                            <td className="p-2">{addr.state}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {user.addresses?.map((addr, i) => (
                                <div key={i} className="border rounded-xl p-4 shadow-sm">
                                    <p className="font-semibold">{addr.fullName}</p>
                                    <p className="text-sm text-gray-600">{addr.phone}</p>
                                    <p className="text-sm text-gray-600">{addr.address}</p>
                                    <p className="text-sm text-gray-600">
                                        {addr.city} - {addr.pincode}
                                    </p>
                                    <p className="text-sm text-gray-600">{addr.state}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <FooterNavbar />
        </>
    );
};

export default AdminUserDetails;

/* ================= SUB COMPONENTS ================= */

const ProfileItem = ({ icon, label, value }) => (
    <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
        <div className="text-indigo-600">{icon}</div>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium text-sm break-words">{value}</p>
        </div>
    </div>
);
const getPaymentColor = (status) => {
    switch (status) {
        case "Paid":
        case "Completed":
            return "bg-green-100 text-green-600";
        case "Pending":
            return "bg-yellow-100 text-yellow-600";
        case "Failed":
            return "bg-red-100 text-red-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
};
const getOrderStatusColor = (status) => {
    switch (status) {
        case "Delivered":
            return "bg-green-100 text-green-600";
        case "Cancelled":
            return "bg-red-100 text-red-600";
        case "Pending":
            return "bg-yellow-100 text-yellow-600";
        case "Shipping":
            return "bg-blue-100 text-blue-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
};
const SummaryCard = ({ title, value, icon }) => (
    <div className="bg-indigo-50 rounded-xl p-5 text-center shadow-md">
        <div className="flex justify-center mb-2 text-indigo-600">
            {icon}
        </div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-indigo-700">{value}</p>
    </div>
);

const BadgeItem = ({ label, status }) => {
    const color =
        status === "Active" || status === "Verified"
            ? "bg-green-500"
            : status === "Blocked"
                ? "bg-red-500"
                : "bg-yellow-500";

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <span className={`px-3 py-1 text-xs rounded-full text-white ${color}`}>
                {status}
            </span>
        </div>
    );
};

