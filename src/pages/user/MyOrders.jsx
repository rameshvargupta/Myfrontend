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
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

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
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const openCancelModal = (orderId) => {
        setSelectedOrderId(orderId);
        setShowCancelModal(true);
    };
    const openReviewModal = (product) => {
        setSelectedProduct(product);
        setShowReviewModal(true);
    };
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

                toast.success("Order Cancelled Successfully");
                setShowCancelModal(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setCancelLoading(false);
        }
    };

    const handleProductClick = (item) => {
        if (!item?.slug) {
            toast.error("This product is no longer available");
            return;
        }
        navigate(`/product/${item.slug}`);
    };

    const handleSubmitReview = async () => {
        if (!comment.trim()) {
            return toast.error("Comment required");
        }

        try {
            const token = localStorage.getItem("token");

            const productId =
                selectedProduct?.productId?._id ||
                selectedProduct?.productId;

            if (!productId) {
                return toast.error("Invalid product");
            }

            let url = "";
            let method = "POST";

            // ✅ If review already exists → UPDATE
            if (selectedProduct?.userReview?._id) {
                url = `http://localhost:5000/api/v1/reviews/${selectedProduct.userReview._id}`;
                method = "PUT";
            } else {
                // ✅ If no review → CREATE
                url = `http://localhost:5000/api/v1/products/${productId}/reviews`;
                method = "POST";
            }

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    rating: Number(rating),
                    comment,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                return toast.error(data.message);
            }

            toast.success(
                selectedProduct?.userReview
                    ? "Review updated successfully"
                    : "Review added successfully"
            );

            // ✅ Update local UI instantly (without reload)
            setOrders((prevOrders) =>
                prevOrders.map((order) => ({
                    ...order,
                    orderItems: order.orderItems.map((item) => {
                        if (
                            item.productId === productId ||
                            item.productId?._id === productId
                        ) {
                            return {
                                ...item,
                                isReviewed: true,
                                userReview: {
                                    ...(item.userReview || {}),
                                    rating: Number(rating),
                                    comment,
                                },
                            };
                        }
                        return item;
                    }),
                }))
            );

            setComment("");
            setRating(5);
            setShowReviewModal(false);

        } catch (error) {
            console.error("Review Error:", error);
            toast.error("Failed to submit review");
        }
    };

    const handleDeleteReview = async (reviewId, productId) => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `http://localhost:5000/api/v1/reviews/${reviewId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (!data.success) {
                return toast.error(data.message);
            }

            toast.success("Review deleted");

            // ✅ Update UI instantly
            setOrders((prevOrders) =>
                prevOrders.map((order) => ({
                    ...order,
                    orderItems: order.orderItems.map((item) => {
                        if (
                            item.productId === productId ||
                            item.productId?._id === productId
                        ) {
                            return {
                                ...item,
                                isReviewed: false,
                                userReview: null,
                            };
                        }
                        return item;
                    }),
                }))
            );

        } catch (error) {
            toast.error("Failed to delete review");
        }
    };



    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(
        (o) => o.orderStatus === "Delivered"
    ).length;
    const pendingOrders = orders.filter(
        (o) => o.orderStatus === "Pending"
    ).length;

    if (loading)
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-gray-500 text-lg animate-pulse">
                        Loading your orders...
                    </p>
                </div>
            </>
        );




    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Track, manage & review your purchases
                        </p>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                        <StatCard title="Total Orders" value={totalOrders} />
                        <StatCard title="Delivered" value={deliveredOrders} />
                        <StatCard title="Pending" value={pendingOrders} />
                    </div>

                    {/* EMPTY STATE */}
                    {!orders.length && (
                        <div className="bg-white rounded-3xl shadow-md p-10 text-center">
                            <h2 className="text-xl font-semibold text-gray-700">
                                You haven’t placed any orders yet.
                            </h2>
                            <button
                                onClick={() => navigate("/")}
                                className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                            >
                                Start Shopping
                            </button>
                        </div>
                    )}

                    {/* ORDER GRID */}
                    {orders.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {orders.map((order) => {
                                const firstItem = order.orderItems[0];

                                return (

                                    <div
                                        key={order._id}
                                        className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border overflow-hidden flex flex-col"
                                    >
                                        {/* HEADER */}
                                        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Order ID: {order._id.slice(-6)}
                                                </p>
                                            </div>

                                            <StatusBadge status={order.orderStatus} />
                                        </div>

                                        {/* PRODUCT SECTION */}
                                        <div
                                            className="p-6 flex gap-4 cursor-pointer hover:bg-gray-50 transition"
                                            onClick={() => handleProductClick(firstItem)}
                                        >
                                            <img
                                                src={firstItem?.image || "/placeholder.png"}
                                                alt={firstItem?.productName}
                                                className="w-24 h-24 object-cover rounded-2xl border"
                                            />

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-indigo-600 transition">
                                                    {firstItem?.productName || "Product Removed"}
                                                </h3>

                                                <p className="text-xs text-gray-500 mt-1">
                                                    {order.orderItems.length} item(s)
                                                </p>

                                                <p className="text-indigo-600 font-bold text-lg mt-2">
                                                    ₹ {order.totalAmount}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ACTION BAR */}
                                        <div className="px-6 py-4 border-t flex gap-3">

                                            <button
                                                onClick={() =>
                                                    setExpandedOrder(
                                                        expandedOrder === order._id ? null : order._id
                                                    )
                                                }
                                                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                                            >
                                                {expandedOrder === order._id ? "Hide Details" : "View Details"}
                                            </button>


                                            <button
                                                onClick={() => openCancelModal(order._id)}
                                                disabled={order.orderStatus !== "Pending"}
                                                className={`flex-1 py-2 rounded-xl text-sm transition ${order.orderStatus === "Pending"
                                                    ? "bg-red-500 text-white hover:bg-red-600"
                                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    }`}
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        {/* EXPANDABLE SECTION */}
                                        {expandedOrder === order._id && (
                                            <div className="px-6 pb-6 border-t bg-gray-50 animate-fadeIn">

                                                {/* ORDER INFO */}
                                                <div className="mb-6">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                                        Order Information
                                                    </h4>

                                                    <div className="space-y-1 text-xs text-gray-600">
                                                        <p>Payment Method: {order.paymentMethod}</p>
                                                        <p>Payment Status: {order.paymentStatus}</p>
                                                        <p>Shipping City: {order.addresses?.city}</p>
                                                    </div>
                                                </div>

                                                {/* REVIEW SECTION */}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                                        Your Review
                                                    </h4>

                                                    {firstItem.userReview ? (
                                                        <div className="bg-gray-50 p-4 rounded-2xl border text-sm">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div>
                                                                    <p className="font-semibold text-yellow-600">
                                                                        ⭐ {firstItem.userReview.rating} / 5
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {new Date(
                                                                            firstItem.userReview.createdAt
                                                                        ).toLocaleDateString()}{" "}
                                                                        •{" "}
                                                                        {new Date(
                                                                            firstItem.userReview.createdAt
                                                                        ).toLocaleTimeString()}
                                                                    </p>
                                                                </div>

                                                                <div className="flex gap-3">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedProduct(firstItem);
                                                                            setRating(firstItem.userReview.rating);
                                                                            setComment(firstItem.userReview.comment);
                                                                            setShowReviewModal(true);
                                                                        }}
                                                                        className="text-xs text-indigo-600 hover:underline"
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            handleDeleteReview(
                                                                                firstItem.userReview._id,
                                                                                firstItem.productId
                                                                            )
                                                                        }
                                                                        className="text-xs text-red-500 hover:underline"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <p className="text-gray-600">
                                                                {firstItem.userReview.comment}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        // <button
                                                        //     onClick={() => openReviewModal(firstItem)}
                                                        //     disabled={order.orderStatus !== "Delivered"}
                                                        //     className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition"
                                                        // >
                                                        //     Add Your Review
                                                        // </button>

                                                        <button
                                                            onClick={() => openReviewModal(firstItem)}
                                                            disabled={order.orderStatus !== "Delivered"}
                                                            className={`flex-1 py-2 rounded-xl text-sm transition ${order.orderStatus !== "Delivered"
                                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed p-3"
                                                                : "bg-yellow-500 text-white hover:bg-yellow-600 p-3"
                                                                }`}
                                                        >
                                                            Add Your Review
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                );
                            })}
                        </div>
                    )
                    }



                </div>
            </div>

            {/* CANCEL MODAL */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Cancel Order
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel this order?
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
                                className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating and Review Model */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Write a Review</h2>

                        <label className="block text-sm mb-2">Rating</label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            className="w-full border rounded-lg p-2 mb-4"
                        >
                            {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>{r} Star</option>
                            ))}
                        </select>

                        <label className="block text-sm mb-2">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full border rounded-lg p-2 mb-4"
                            rows="3"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSubmitReview}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

/* ---------------- COMPONENTS ---------------- */

const StatCard = ({ title, value }) => (
    <div className="bg-white rounded-2xl shadow-md p-6 text-center border">
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
    </div>
);

const StatusBadge = ({ status }) => {
    const base = "px-3 py-1 text-xs rounded-full font-semibold";

    if (status === "Pending")
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;

    if (status === "Delivered")
        return <span className={`${base} bg-green-100 text-green-700`}>Delivered</span>;

    if (status === "Cancelled")
        return <span className={`${base} bg-red-100 text-red-700`}>Cancelled</span>;

    return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
};

export default MyOrders;
