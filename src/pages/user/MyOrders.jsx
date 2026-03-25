
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FooterNavbar from "@/components/user/FooterNavbar";
const API_URL = import.meta.env.VITE_API_URL;
const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
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

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-gray-500 animate-pulse">Loading orders...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50 px-4 mb-20">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                        <p className="text-gray-500 text-sm">
                            Track your orders easily
                        </p>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <StatCard title="Total" value={totalOrders} />
                        <StatCard title="Delivered" value={deliveredOrders} />
                        <StatCard title="Cancelled" value={cancelledOrders} />
                    </div>

                    {/* SEARCH */}
                    <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-3">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border rounded-lg text-sm"
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* EMPTY */}
                    {!orders.length && (
                        <div className="bg-white p-10 text-center rounded-xl shadow">
                            <h2>No Orders Found</h2>
                        </div>
                    )}

                    {/* ORDERS */}
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredOrders.map((order) =>
                            order.orderItems.map((item, index) => (
                                <div
                                    key={`${order._id}-${index}`}
                                    onClick={() => navigate(`/myorders/${order._id}`)}
                                    className="bg-white rounded-2xl border p-4 cursor-pointer hover:shadow-lg transition"
                                >

                                    {/* TOP */}
                                    <div className="flex justify-between mb-2">
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                {new Date(order.createdAt).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                #{order._id.slice(-6)}
                                            </p>
                                        </div>

                                        <StatusBadge status={order.orderStatus} />
                                    </div>

                                    {/* PRODUCT */}
                                    <div className="flex gap-3">
                                        <img
                                            src={item?.image || "/placeholder.png"}
                                            className="w-16 h-16 rounded-lg border object-cover"
                                        />

                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold line-clamp-2">
                                                {item.productName}
                                            </h3>

                                            <p className="text-xs text-gray-500">
                                                Qty: {item.quantity}
                                            </p>

                                            <p className="text-sm font-bold text-indigo-600">
                                                ₹ {item.price}
                                            </p>
                                        </div>
                                    </div>

                                    {/* DETAILS */}
                                    <div className="mt-4 pt-3 border-t text-xs space-y-1">

                                        <div className="flex justify-between">
                                            <span>Total</span>
                                            <span>₹ {order.totalAmount}</span>
                                        </div>

                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>
                                                -₹ {order.discountAmount || 0}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Delivery</span>
                                            <span>
                                                {order.deliveredAt
                                                    ? new Date(order.deliveredAt).toLocaleDateString()
                                                    : "Not Delivered"}
                                            </span>
                                        </div>

                                    </div>

                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>

            <FooterNavbar />
        </>
    );
};

/* COMPONENTS */

const StatCard = ({ title, value }) => (
    <div className="bg-white p-4 rounded-xl shadow text-center">
        <p className="text-xs text-gray-500">{title}</p>
        <h2 className="text-xl font-bold">{value}</h2>
    </div>
);

const StatusBadge = ({ status }) => {
    const base = "px-2 py-1 text-xs rounded-full font-semibold";

    if (status === "Pending")
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;

    if (status === "Delivered")
        return <span className={`${base} bg-green-100 text-green-700`}>Delivered</span>;

    if (status === "Cancelled")
        return <span className={`${base} bg-red-100 text-red-700`}>Cancelled</span>;

    return <span className={`${base} bg-gray-100`}>{status}</span>;
};

export default MyOrders;