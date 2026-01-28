import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    IndianRupee,
    Package,
    Eye
} from "lucide-react";

const statusColor = (status) => {
    switch (status) {
        case "Delivered":
            return "bg-green-100 text-green-700";
        case "Cancelled":
            return "bg-red-100 text-red-700";
        case "Shipped":
            return "bg-blue-100 text-blue-700";
        default:
            return "bg-yellow-100 text-yellow-700";
    }
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                    "http://localhost:5000/api/v1/orders/my-orders",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                if (data.success) setOrders(data.orders);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading)
        return (
            <>
                <Navbar />
                <p className="text-center mt-32 text-gray-500">Loading your orders...</p>
            </>
        );

    if (!orders.length)
        return (
            <>
                <Navbar />
                <p className="text-center mt-32 text-gray-500">
                    You haven’t placed any orders yet.
                </p>
            </>
        );

    return (
        <>
            <Navbar />

            <div className="max-w-6xl mx-auto pt-32 pb-16 px-4">
                <h1 className="text-3xl font-bold mb-10">My Orders</h1>

                <div className="space-y-8">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6"
                        >
                            {/* ORDER HEADER */}
                            <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-6 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">ORDER ID</p>
                                    <p className="font-semibold text-gray-800">{order._id}</p>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar size={16} />
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            {/* ORDER ITEMS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                {order.orderItems.map((item) => (
                                    <div
                                        key={item._id}
                                        className="flex gap-4 border rounded-xl p-3 hover:shadow-md transition"
                                    >
                                        {/* IMAGE */}
                                        <img
                                            src={item.image || "/placeholder.png"}
                                            alt={item.name}
                                            className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                                            onClick={() => {
                                                if (!item.slug) {
                                                    alert("Product details not available");
                                                    return;
                                                }
                                                navigate(`/product/${item.slug}`);
                                            }}

                                        />

                                        {/* INFO */}
                                        <div className="flex flex-col justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800 line-clamp-2">
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1 font-semibold text-gray-700">
                                                <IndianRupee size={14} />
                                                {item.price}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ORDER FOOTER */}
                            <div className="flex flex-wrap justify-between items-center mt-8 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
                                        <IndianRupee size={18} />
                                        {order.totalAmount}
                                    </div>

                                    <span
                                        className={`px-4 py-1 text-sm rounded-full font-semibold ${statusColor(
                                            order.orderStatus
                                        )}`}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </div>

                                <button
                                    onClick={() => navigate(`/ordersuccess/${order._id}`)}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                                >
                                    <Eye size={18} />
                                    View Order Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default MyOrders;
