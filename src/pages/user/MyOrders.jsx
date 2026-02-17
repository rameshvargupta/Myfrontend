import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const navigate = useNavigate();
    const openCancelModal = (orderId) => {
        setSelectedOrderId(orderId);
        setShowCancelModal(true);
    };

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
    const handleCancelOrder = async () => {
        try {
            setCancelLoading(true);

            const token = localStorage.getItem("token");

            const res = await fetch(
                `http://localhost:5000/api/v1/orders/cancel/${selectedOrderId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await res.json();

            if (data.success) {
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === selectedOrderId
                            ? { ...order, orderStatus: "Cancelled" }
                            : order
                    )
                );

                setShowCancelModal(false);
                toast.success("Order Cancelled")

            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCancelLoading(false);
        }
    };
console.log(orders);


    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Track & manage your purchases
                        </p>
                    </div>

                    {/* GRID LAYOUT */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col"
                            >

                                {/* TOP */}
                                <div className="p-5 border-b">

                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>

                                        <span
                                            className={`px-3 py-1 text-xs rounded-full font-semibold ${order.orderStatus === "Pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : order.orderStatus === "Delivered"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.orderStatus === "Cancelled"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {order.orderStatus}
                                        </span>
                                    </div>

                                </div>

                                {/* PRODUCT PREVIEW (Only First Product Show) */}
                           <div
  className="p-5 flex gap-4 cursor-pointer hover:bg-gray-50 transition rounded-xl"
  onClick={() => navigate(`/product/${order.orderItems[0]?.slug}`)}
>

  <img
    src={order.orderItems[0]?.image || "/placeholder.png"}
    alt={order.orderItems[0]?.productName}
    className="w-20 h-20 object-cover rounded-xl"
  />

  <div className="flex-1">
    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-indigo-600 transition">
      {order.orderItems[0]?.productName}
    </h3>

    <p className="text-xs text-gray-500 mt-1">
      {order.orderItems.length} item(s)
    </p>

    <p className="text-indigo-600 font-bold mt-2">
      ₹ {order.totalAmount}
    </p>
  </div>
</div>


                                {/* FOOTER */}
                                <div className="mt-auto p-5 border-t flex gap-3">

                                    <button
                                        onClick={() => navigate(`/ordersuccess/${order._id}`)}
                                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
                                    >
                                        View
                                    </button>

                                    <button
                                        onClick={() => openCancelModal(order._id)}
                                        disabled={order.orderStatus !== "Pending"}
                                        className={`flex-1 py-2 rounded-lg text-sm transition ${order.orderStatus === "Pending"
                                                ? "bg-red-500 text-white hover:bg-red-600"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                </div>
            </div>



            {showCancelModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform animate-scaleIn">

                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Cancel Order
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel this order?
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-4">

                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
                            >
                                Keep Order
                            </button>

                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelLoading}
                                className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-2"
                            >
                                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </>



    );
};

export default MyOrders;
