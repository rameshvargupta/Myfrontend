// import { useEffect, useState } from "react";
// import Navbar from "@/components/Navbar";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import FooterNavbar from "@/components/user/FooterNavbar";

// const MyOrders = () => {
//     const [reviewLoading, setReviewLoading] = useState(false);
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedOrderId, setSelectedOrderId] = useState(null);
//     const [cancelLoading, setCancelLoading] = useState(false);
//     const [showCancelModal, setShowCancelModal] = useState(false);
//     const [showReviewModal, setShowReviewModal] = useState(false);
//     const [rating, setRating] = useState(5);
//     const [comment, setComment] = useState("");
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [expandedOrder, setExpandedOrder] = useState(null);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [statusFilter, setStatusFilter] = useState("All");
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchOrders = async () => {
//             try {
//                 const token = localStorage.getItem("token");
//                 const res = await fetch(
//                     "http://localhost:5000/api/v1/orders/my-orders",
//                     { headers: { Authorization: `Bearer ${token}` } }
//                 );
//                 const data = await res.json();
//                 if (data.success) setOrders(data.orders);
//             } catch (err) {
//                 console.error(err);
//                 toast.error("Failed to load orders");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchOrders();
//     }, []);

//     const openCancelModal = (orderId) => {
//         setSelectedOrderId(orderId);
//         setShowCancelModal(true);
//     };
//     const openReviewModal = (product) => {
//         setSelectedProduct(product);
//         setShowReviewModal(true);
//     };

//     const handleCancelOrder = async () => {
//         try {
//             setCancelLoading(true);
//             const token = localStorage.getItem("token");

//             const res = await fetch(
//                 `http://localhost:5000/api/v1/orders/cancel/${selectedOrderId}`,
//                 {
//                     method: "PUT",
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );

//             const data = await res.json();

//             if (data.success) {
//                 setOrders((prev) =>
//                     prev.map((order) =>
//                         order._id === selectedOrderId
//                             ? { ...order, orderStatus: "Cancelled" }
//                             : order
//                     )
//                 );

//                 toast.success("Order Cancelled Successfully");
//                 setShowCancelModal(false);
//             } else {
//                 toast.error(data.message);
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error("Something went wrong");
//         } finally {
//             setCancelLoading(false);
//         }
//     };

//     const handleProductClick = (item) => {
//         if (!item?.slug) {
//             toast.error("This product is no longer available");
//             return;
//         }
//         navigate(`/product/${item.slug}`);
//     };

//     const handleSubmitReview = async () => {
//         if (!comment.trim()) {
//             return toast.error("Comment required");
//         }

//         try {
//             setReviewLoading(true); // ✅ START LOADER

//             const token = localStorage.getItem("token");

//             const productId =
//                 selectedProduct?.productId?._id ||
//                 selectedProduct?.productId;

//             if (!productId) {
//                 return toast.error("Invalid product ID");
//             }

//             let url = "";
//             let method = "POST";

//             if (selectedProduct?.userReview?._id) {
//                 url = `http://localhost:5000/api/v1/reviews/${selectedProduct.userReview._id}`;
//                 method = "PUT";
//             } else {
//                 url = `http://localhost:5000/api/v1/products/${productId}/reviews`;
//                 method = "POST";
//             }

//             const res = await fetch(url, {
//                 method,
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({
//                     rating: Number(rating),
//                     comment,
//                 }),
//             });

//             const data = await res.json();

//             if (!data.success) {
//                 return toast.error(data.message);
//             }

//             toast.success(
//                 selectedProduct?.userReview
//                     ? "Review updated successfully"
//                     : "Review added successfully"
//             );

//             // ✅ UI UPDATE (same as your logic)
//             setOrders((prevOrders) =>
//                 prevOrders.map((order) => ({
//                     ...order,
//                     orderItems: order.orderItems.map((item) => {
//                         if (
//                             item.productId === productId ||
//                             item.productId?._id === productId
//                         ) {
//                             return {
//                                 ...item,
//                                 isReviewed: true,
//                                 userReview: {
//                                     ...(item.userReview || {}),
//                                     rating: Number(rating),
//                                     comment,
//                                 },
//                             };
//                         }
//                         return item;
//                     }),
//                 }))
//             );

//             setComment("");
//             setRating(5);
//             setShowReviewModal(false);

//         } catch (error) {
//             console.error("Review Error:", error);
//             toast.error("Failed to submit review");
//         } finally {
//             setReviewLoading(false); // ✅ STOP LOADER
//         }
//     };

//     // const handleDeleteReview = async (reviewId, productId) => {
//     //     try {
//     //         const token = localStorage.getItem("token");

//     //         const res = await fetch(
//     //             `http://localhost:5000/api/v1/reviews/${reviewId}`,
//     //             {
//     //                 method: "DELETE",
//     //                 headers: {
//     //                     Authorization: `Bearer ${token}`,
//     //                 },
//     //             }
//     //         );

//     //         const data = await res.json();

//     //         if (!data.success) {
//     //             return toast.error(data.message);
//     //         }

//     //         toast.success("Review deleted");

//     //         // ✅ Update UI instantly
//     //         setOrders((prevOrders) =>
//     //             prevOrders.map((order) => ({
//     //                 ...order,
//     //                 orderItems: order.orderItems.map((item) => {
//     //                     if (
//     //                         item.productId === productId ||
//     //                         item.productId?._id === productId
//     //                     ) {
//     //                         return {
//     //                             ...item,
//     //                             isReviewed: false,
//     //                             userReview: null,
//     //                         };
//     //                     }
//     //                     return item;
//     //                 }),
//     //             }))
//     //         );

//     //     } catch (error) {
//     //         toast.error("Failed to delete review");
//     //     }
//     // };

//     const filteredOrders = orders.filter((order) => {
//         // 🔹 Status Filter
//         if (statusFilter !== "All") {
//             if (statusFilter === "Failed") {
//                 if (order.paymentStatus !== "Failed") return false;
//             } else {
//                 if (order.orderStatus !== statusFilter) return false;
//             }
//         }

//         // 🔹 Search Logic
//         const lowerSearch = searchTerm.toLowerCase().trim();
//         if (!lowerSearch) return true;

//         const matchOrderId = order._id
//             ?.toLowerCase()
//             .includes(lowerSearch);

//         const matchProduct = order.orderItems?.some((item) => {
//             const productName =
//                 item.productName ||
//                 item.productId?.name ||
//                 "";

//             return productName
//                 .toLowerCase()
//                 .includes(lowerSearch);
//         });

//         return matchOrderId || matchProduct;
//     });

//     const totalOrders = orders.length;
//     const deliveredOrders = orders.filter(
//         (o) => o.orderStatus === "Delivered"
//     ).length;

//     const cancelledOrders = orders.filter(
//         (o) =>
//             o.orderStatus === "Cancelled" ||
//             o.paymentStatus === "Failed"
//     ).length;

//     if (loading)
//         return (
//             <>
//                 <Navbar />
//                 <div className="min-h-screen flex items-center justify-center">
//                     <p className="text-gray-500 text-lg animate-pulse">
//                         Loading your orders...
//                     </p>
//                 </div>
//             </>
//         );




//     return (
//         <>
//             <Navbar />

//             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100  px-4 mb-20">
//                 <div className="max-w-7xl mx-auto">

//                     {/* HEADER */}
//                     <div className="mb-10">
//                         <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
//                         <p className="text-gray-500 mt-1 text-sm">
//                             Track, manage & review your purchases
//                         </p>
//                     </div>

//                     {/* STATS */}
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
//                         <StatCard title="Total Orders" value={totalOrders} />
//                         <StatCard title="Delivered" value={deliveredOrders} />
//                         <StatCard title="Canceled" value={cancelledOrders} />
//                     </div>

//                     {/* SEARCH & FILTER - Always Single Line */}
//                     <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 border">
//                         <div className="flex items-center gap-3 flex-nowrap">

//                             {/* Search */}
//                             <input
//                                 type="text"
//                                 placeholder="Search by Order ID or Product..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="flex-1 min-w-0 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
//                             />

//                             {/* Status Filter */}
//                             <select
//                                 value={statusFilter}
//                                 onChange={(e) => setStatusFilter(e.target.value)}
//                                 className="w-40 shrink-0 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
//                             >
//                                 <option value="All">All</option>
//                                 <option value="Pending">Pending</option>
//                                 <option value="Delivered">Delivered</option>
//                                 <option value="Cancelled">Cancelled</option>
//                                 <option value="Failed">Failed</option>
//                             </select>

//                         </div>
//                     </div>

//                     {/* EMPTY STATE */}
//                     {!orders.length && (
//                         <div className="bg-white rounded-3xl shadow-md p-10 text-center">
//                             <h2 className="text-xl font-semibold text-gray-700">
//                                 You haven’t placed any orders yet.
//                             </h2>
//                             <button
//                                 onClick={() => navigate("/")}
//                                 className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
//                             >
//                                 Start Shopping
//                             </button>
//                         </div>
//                     )}

//                     {/* ORDER GRID */}
//                     {orders.length > 0 && (
//                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
//                             {filteredOrders.map((order) =>
//                                 order.orderItems.map((item, index) => (
//                                     <div
//                                         key={`${order._id}-${index}`}
//                                         className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border p-4 flex flex-col justify-between"
//                                     >
//                                         {/* Top Header */}
//                                         <div className="flex justify-between items-start mb-3">
//                                             <div>
//                                                 <p className="text-[11px] text-gray-400">
//                                                     {new Date(order.createdAt).toLocaleDateString()}
//                                                 </p>
//                                                 <p className="text-[11px] text-gray-500">
//                                                     Order ID: {order._id.slice(-6)}
//                                                 </p>
//                                             </div>

//                                             <StatusBadge status={order.orderStatus} />
//                                         </div>

//                                         {/* Product Row */}
//                                         <div
//                                             className="flex gap-3 cursor-pointer"
//                                             onClick={() => handleProductClick(item)}
//                                         >
//                                             <img
//                                                 src={item?.image || "/placeholder.png"}
//                                                 alt={item?.productName}
//                                                 className="w-16 h-16 object-cover rounded-lg border"
//                                             />

//                                             <div className="flex-1">
//                                                 <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-indigo-600 transition">
//                                                     {item?.productName || "Product Removed"}
//                                                 </h3>

//                                                 <p className="text-[12px] text-gray-500 mt-1">
//                                                     Qty: {item.quantity}
//                                                 </p>

//                                                 <p className="text-sm font-bold text-indigo-600 mt-1">
//                                                     ₹ {item.price}
//                                                 </p>
//                                             </div>
//                                         </div>

//                                         {/* Bottom Section */}
//                                         <div className="mt-4 pt-3 border-t flex flex-col gap-2">

//                                             {/* Total */}
//                                             <div className="flex justify-between text-xs text-gray-500">
//                                                 <span>Total Items: {order.orderItems.length}</span>
//                                                 <span className="font-semibold text-gray-800">
//                                                     ₹ {order.totalAmount}
//                                                 </span>
//                                             </div>

//                                             {/* Buttons */}
//                                             <div className="flex gap-2">
//                                                 <button
//                                                     onClick={() =>
//                                                         setExpandedOrder(
//                                                             expandedOrder === `${order._id}-${index}`
//                                                                 ? null
//                                                                 : `${order._id}-${index}`
//                                                         )
//                                                     }
//                                                     className="flex-1 bg-indigo-600 text-white py-1.5 rounded-lg text-xs hover:bg-indigo-700 transition"
//                                                 >
//                                                     Details
//                                                 </button>

//                                                 <button
//                                                     onClick={() => openCancelModal(order._id)}
//                                                     disabled={order.orderStatus !== "Pending"}
//                                                     className={`flex-1 py-1.5 rounded-lg text-xs transition ${order.orderStatus === "Pending"
//                                                         ? "bg-red-500 text-white hover:bg-red-600"
//                                                         : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                                                         }`}
//                                                 >
//                                                     Cancel
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         {/* Expandable Details */}
//                                         {expandedOrder === `${order._id}-${index}` && (
//                                             <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs space-y-2 border">

//                                                 <div>
//                                                     <p>Payment: {order.paymentMethod}</p>
//                                                     <p>Status: {order.paymentStatus}</p>
//                                                     <p>City: {order.addresses?.city}</p>
//                                                 </div>

//                                                 <div className="border-t pt-2">
//                                                     {item.userReview ? (
//                                                         <div>
//                                                             <p className="text-yellow-600 font-semibold">
//                                                                 ⭐ {item.userReview.rating} / 5
//                                                             </p>
//                                                             <p className="text-gray-600 mt-1">
//                                                                 {item.userReview.comment}
//                                                             </p>
//                                                         </div>
//                                                     ) : (
//                                                         <button
//                                                             onClick={() => openReviewModal(item)}
//                                                             disabled={order.orderStatus !== "Delivered"}
//                                                             className={`mt-1 w-full py-1.5 rounded-lg text-xs ${order.orderStatus !== "Delivered"
//                                                                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                                                                 : "bg-yellow-500 text-white hover:bg-yellow-600"
//                                                                 }`}
//                                                         >
//                                                             Add Review
//                                                         </button>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     )
//                     }

//                 </div>
//             </div>

//             {/* CANCEL MODAL */}
//             {showCancelModal && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
//                     <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
//                         <h2 className="text-2xl font-bold text-gray-800 mb-4">
//                             Cancel Order
//                         </h2>

//                         <p className="text-gray-600 mb-6">
//                             Are you sure you want to cancel this order?
//                         </p>

//                         <div className="flex justify-end gap-4">
//                             <button
//                                 onClick={() => setShowCancelModal(false)}
//                                 className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
//                             >
//                                 Keep Order
//                             </button>

//                             <button
//                                 onClick={handleCancelOrder}
//                                 disabled={cancelLoading}
//                                 className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
//                             >
//                                 {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Rating and Review Model */}
//             {showReviewModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-2xl w-full max-w-md">
//                         <h2 className="text-xl font-bold mb-4">Write a Review</h2>

//                         <label className="block text-sm mb-2">Rating</label>
//                         <select
//                             value={rating}
//                             onChange={(e) => setRating(e.target.value)}
//                             className="w-full border rounded-lg p-2 mb-4"
//                         >
//                             {[5, 4, 3, 2, 1].map((r) => (
//                                 <option key={r} value={r}>{r} Star</option>
//                             ))}
//                         </select>

//                         <label className="block text-sm mb-2">Comment</label>
//                         <textarea
//                             value={comment}
//                             onChange={(e) => setComment(e.target.value)}
//                             className="w-full border rounded-lg p-2 mb-4"
//                             rows="3"
//                         />

//                         <div className="flex justify-end gap-3">
//                             <button
//                                 onClick={() => setShowReviewModal(false)}
//                                 className="px-4 py-2 bg-gray-200 rounded-lg"
//                             >
//                                 Cancel
//                             </button>

//                             <button
//                                 onClick={handleSubmitReview}
//                                 disabled={reviewLoading}
//                                 className={`px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 transition
//                                     ${reviewLoading
//                                         ? "bg-gray-400 cursor-not-allowed"
//                                         : "bg-indigo-600 hover:bg-indigo-700"
//                                     }`}
//                             >
//                                 {reviewLoading ? (
//                                     <>
//                                         <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
//                                         Submitting...
//                                     </>
//                                 ) : (
//                                     "Submit Review"
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//             <FooterNavbar />
//         </>
//     );
// };

// /* ---------------- COMPONENTS ---------------- */

// const StatCard = ({ title, value }) => (
//     <div className="bg-white rounded-2xl shadow-md p-6 text-center border">
//         <p className="text-sm text-gray-500">{title}</p>
//         <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
//     </div>
// );

// const StatusBadge = ({ status }) => {
//     const base = "px-3 py-1 text-xs rounded-full font-semibold";

//     if (status === "Pending")
//         return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;

//     if (status === "Delivered")
//         return <span className={`${base} bg-green-100 text-green-700`}>Delivered</span>;

//     if (status === "Cancelled")
//         return <span className={`${base} bg-red-100 text-red-700`}>Cancelled</span>;

//     return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
// };

// export default MyOrders;





import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FooterNavbar from "@/components/user/FooterNavbar";

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
                    "http://localhost:5000/api/v1/orders/my-orders",
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