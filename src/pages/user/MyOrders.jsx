import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { Calendar, IndianRupee, Package } from "lucide-react";

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
        return <p className="text-center mt-20 text-gray-500">Loading orders...</p>;

    if (!orders.length)
        return (
            <p className="text-center mt-20 text-gray-500">
                You have not placed any orders yet.
            </p>
        );

    return (
        <>
            <Navbar />

            <div className="max-w-6xl mx-auto mt-28 px-4">
                <h1 className="text-3xl font-bold mb-8">My Orders</h1>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6"
                        >
                            {/* ORDER HEADER */}
                            <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-semibold text-gray-800">{order._id}</p>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar size={16} />
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            {/* PRODUCTS */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {order.orderItems.map((item) => (
                                    <div
                                        key={item._id}
                                        className="cursor-pointer border rounded-xl p-2 flex flex-col items-center hover:shadow-lg transition"
                                        onClick={() => navigate(`/product/${item.productId}`)}
                                    >
                                        <img
                                            src={item.image || "/placeholder.png"}
                                            alt={item.name}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <p className="text-sm font-medium mt-2 line-clamp-2 text-center">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                                        <div className="flex items-center gap-1 mt-1 text-gray-700">
                                            <IndianRupee size={12} />
                                            <span className="font-semibold">{item.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ORDER FOOTER */}
                            <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-gray-700">
                                        <IndianRupee size={16} />
                                        <span className="font-semibold">{order.totalAmount}</span>
                                    </div>

                                    <span
                                        className={`px-3 py-1 text-sm rounded-full font-medium ${order.orderStatus === "Delivered"
                                                ? "bg-green-100 text-green-700"
                                                : order.orderStatus === "Cancelled"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </div>

                                <button
                                    onClick={() => navigate(`/ordersuccess/${order._id}`)}
                                    className="flex items-center gap-2 text-green-600 font-semibold hover:underline"
                                >
                                    <Package size={18} /> Order Details
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
