
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import RecentlyViewed from "./RecentlyViewed";
import PremiumPriceSummary from "@/components/product/PremiumPriceSummary";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

/* ================= STAR ================= */
const StarRating = ({ rating, setRating, editable = false }) => {
  return (
    <div className="flex gap-1 text-xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => editable && setRating(star)}
          className={`cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

/* ================= SKELETON ================= */
const Skeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded" />
      <div className="h-40 bg-gray-200 rounded" />
      <div className="h-40 bg-gray-200 rounded" />
    </div>
  );
};

/* ================= MAIN ================= */
const MyOrdersDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const menuRef = useRef();

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/v1/orders/${orderId}`, // ✅ FIXED
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      console.log("ORDER FULL DATA:", data.order); // 🔥 DEBUG

      if (data.success) {
        setOrder(data.order);
      } else {
        toast.error("Failed to load order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCancelOrder = async () => {

    setCancelling(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to cancel order");
        setCancelling(false);
        return;
      }

      // ✅ FIXED: Use orderId instead of id
      const res = await fetch(
        `${API_URL}/api/v1/orders/cancel/${orderId}`, // ✅ Changed from id to orderId
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: "Customer requested cancellation" }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel order");
      }

      if (data.success) {
        toast.success("Order Cancelled Successfully");
        // Refresh order details
        await fetchOrder();
        // Optional: Redirect to orders page after 2 seconds
        setTimeout(() => {
          navigate("/myorders");
        }, 2000);
      } else {
        toast.error(data.message || "Cannot cancel order");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error(error.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  /* ================= ADD REVIEW ================= */
  const handleSubmitReview = async (item) => {
    if (!comment.trim()) return toast.error("Write something");

    try {
      setReviewLoading(true);

      const token = localStorage.getItem("token");
      const productId = item.productId?._id || item.productId;

      const res = await fetch(
        `${API_URL}/api/v1/products/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            comment,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) return toast.error(data.message);

      toast.success("Review added");

      // reset
      setEditingItem(null);
      setRating(5);
      setComment("");

      fetchOrder();
    } catch (err) {
      toast.error("Failed to add review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleUpdateReview = async (reviewId) => {
    try {
      setReviewLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/v1/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (!data.success) return toast.error(data.message);

      toast.success("Review updated");
      setEditingItem(null);
      fetchOrder();
    } catch {
      toast.error("Update failed");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/v1/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.success) return toast.error(data.message);

      toast.success("Review deleted");
      fetchOrder();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/v1/orders/invoice/${order._id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        return toast.error("Failed to download invoice");
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      console.log("ORDER ITEMS:", order.orderItems);
    } catch (error) {
      toast.error("Download failed");
    }
  };

  /* ================= TRACK SAFE ================= */
  const steps = [
    "Pending",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const getStepIndex = () => {
    if (!order?.orderStatus) return 0;

    return steps.findIndex((s) =>
      order.orderStatus.toLowerCase().includes(s.toLowerCase())
    );
  };

  const StarRating = ({ rating, setRating, editable = false }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex items-center gap-2">

        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hover || rating);

          return (
            <span
              key={star}
              onClick={() => editable && setRating(star)}
              onMouseEnter={() => editable && setHover(star)}
              onMouseLeave={() => editable && setHover(0)}
              className={`
              text-3xl sm:text-4xl cursor-pointer transition-all duration-200
              ${isActive ? "text-yellow-400 scale-110" : "text-gray-300"}
              hover:scale-125
            `}
            >
              ★
            </span>
          );
        })}

        {/* Rating Text */}
        {editable && (
          <span className="ml-2 text-sm text-gray-500">
            {hover || rating} / 5
          </span>
        )}
      </div>
    );
  };

  const currentStep = getStepIndex();

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-6 max-w-6xl mx-auto">
          <Skeleton />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center text-red-500">
        Order not found
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 space-y-6 mb-20">

        {/* HEADER */}

        <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-start">

          {/* 🔥 LEFT SECTION (Arrow + Title) */}
          <div className="flex items-start gap-4">
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition 
      ${cancelling
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
                }`}
            >
              {cancelling ? (
                <>
                  {/* Spinner */}
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Cancelling...
                </>
              ) : (
                "Cancel Order"
              )}
            </button>

            {/* Title */}
            <div>
              <h1 className="text-xl font-bold">Order Details</h1>
              <p className="text-gray-500 text-sm">{order?._id}</p>
            </div>

          </div>

          {/* 🔥 RIGHT SECTION */}
          <div className="flex gap-3">

            {/* ✅ Cancel Button */}
            {["Pending", "Processing", "Shipped"].includes(order?.orderStatus) && (
              <button
                onClick={() => setShowCancelModal(true)} // 👈 modal open
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Cancel Order
              </button>
            )}

            {/* ✅ Download Invoice */}
            {order?.orderStatus === "Delivered" && (
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-2.5 rounded-xl shadow hover:scale-105 transition"
              >
                📄 Download Invoice
              </button>
            )}

          </div>
        </div>

        {/* ================= TRACKING ================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow space-y-6">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-base sm:text-lg">
              Track My Order
            </h2>

            <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-600">
              {order?.orderStatus || "N/A"}
            </span>
          </div>

          {/* DESKTOP TIMELINE */}
          <div className="hidden sm:flex items-center justify-between relative">

            {/* FULL LINE */}
            <div className="absolute top-6 left-0 w-full h-[3px] bg-gray-200" />

            {/* ACTIVE LINE */}
            <div
              className="absolute top-6 left-0 h-[3px] bg-green-500 transition-all duration-500"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />

            {steps.map((step, i) => {
              const isCompleted = i <= currentStep;

              const getDate = () => {
                if (step === "Pending") return order?.createdAt;
                if (step === "Delivered") return order?.deliveredAt;
                return order?.updatedAt;
              };

              return (
                <div key={i} className="flex flex-col items-center flex-1 z-10">

                  {/* ICON */}
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-lg shadow-md
              ${isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {step === "Pending" && "🧾"}
                    {step === "Processing" && "⚙️"}
                    {step === "Shipped" && "📦"}
                    {step === "Out" && "🚚"}
                    {step === "Delivered" && "✅"}
                  </div>

                  {/* TEXT */}
                  <p className="text-xs mt-2 font-medium">{step}</p>

                  {/* DATE */}
                  <p className="text-[11px] text-gray-400">
                    {getDate()
                      ? new Date(getDate()).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                      : "--"}
                  </p>

                  {/* TIME */}
                  <p className="text-[10px] text-gray-400">
                    {getDate()
                      ? new Date(getDate()).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : ""}
                  </p>
                </div>
              );
            })}
          </div>

          {/* MOBILE TIMELINE (VERTICAL) */}
          <div className="sm:hidden space-y-4 relative">

            {/* VERTICAL LINE */}
            <div className="absolute left-4 top-0 w-[3px] h-full bg-gray-200" />

            {steps.map((step, i) => {
              const isCompleted = i <= currentStep;

              const getDate = () => {
                if (step === "Pending") return order?.createdAt;
                if (step === "Delivered") return order?.deliveredAt;
                return order?.updatedAt;
              };

              return (
                <div key={i} className="flex items-start gap-4 relative">

                  {/* DOT */}
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm z-10
              ${isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {step === "Pending" && "🧾"}
                    {step === "Processing" && "⚙️"}
                    {step === "Shipped" && "📦"}
                    {step === "Out" && "🚚"}
                    {step === "Delivered" && "✅"}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step}</p>

                    <p className="text-xs text-gray-400">
                      {getDate()
                        ? new Date(getDate()).toLocaleString("en-IN")
                        : "Not updated"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER INFO */}
          <div className="flex justify-between text-xs sm:text-sm text-gray-500 border-t pt-4">

            <div>
              <p className="font-medium text-gray-700">Order Placed</p>
              <p>
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleString("en-IN")
                  : "N/A"}
              </p>
            </div>

            <div className="text-right">
              <p className="font-medium text-gray-700">Delivered</p>
              <p>
                {order?.deliveredAt
                  ? new Date(order.deliveredAt).toLocaleString("en-IN")
                  : "Not yet"}
              </p>
            </div>

          </div>
        </div>

        {/* ================= PRODUCTS ================= */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
          {order?.orderItems?.map((item) => (
            <div
              key={item._id}
              className="group bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300"
            >

              <div className="flex gap-4">

                {/* IMAGE */}
                <div
                  className="w-24 h-24 rounded-xl overflow-hidden cursor-pointer border"
                  onClick={() => navigate(`/product/${item.slug}`)}
                >
                  <img
                    src={item.image}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                {/* DETAILS */}
                <div className="flex-1 space-y-1">

                  <h2
                    className="font-medium text-gray-800 line-clamp-2 cursor-pointer hover:text-indigo-600"
                    onClick={() => navigate(`/product/${item.slug}`)}
                  >
                    {item.productName}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>

                  <p className="text-lg font-bold text-indigo-600">
                    ₹ {order.totalAmount}
                  </p>

                  {/* STATUS */}
                  <span className="inline-block text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 mt-1">
                    {order?.orderStatus}
                  </span>


                </div>
              </div>

              {/* ================= REVIEW SECTION ================= */}
              <div className="mt-4 pt-4 border-t">

                {/* ✅ EDIT MODE FIRST CHECK */}
                {editingItem?._id === item._id ? (

                  <div className="bg-gray-50 border rounded-xl p-4 space-y-3">

                    <p className="text-sm font-medium text-gray-700">
                      {item.userReview ? "Edit Review" : "Write Review"}
                    </p>

                    <StarRating
                      rating={rating}
                      setRating={setRating}
                      editable
                    />

                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none p-3 rounded-xl text-sm resize-none"
                      rows={3}
                    />

                    <div className="flex gap-3">

                      <button
                        onClick={() =>
                          item.userReview
                            ? handleUpdateReview(item.userReview._id)
                            : handleSubmitReview(item)
                        }
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 border rounded-xl text-sm"
                      >
                        {reviewLoading ? "Saving..." : "Save"}
                      </button>

                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setComment("");
                          setRating(5);
                        }}
                        className="px-4 py-2 border rounded-xl text-sm"
                      >
                        Cancel
                      </button>

                    </div>
                  </div>

                ) : item.userReview ? (

                  /* ✅ SHOW USER REVIEW */
                  <div className="bg-gradient-to-br from-gray-50 to-white border rounded-xl p-4 space-y-3">

                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-700">
                        Your Review
                      </p>

                      <span
                        className={`text-xs px-2 py-1 rounded-full
          ${item.userReview.status === "approved"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                          }`}
                      >
                        {item.userReview.status}
                      </span>
                    </div>

                    {/* ⭐ rating */}
                    <div className="flex text-yellow-400 text-lg">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s}>
                          {s <= item.userReview.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-600">
                      {item.userReview.comment}
                    </p>

                    <div className="flex gap-3 pt-2">

                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setRating(item.userReview.rating);
                          setComment(item.userReview.comment);
                        }}
                        className="text-sm px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-600"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => handleDeleteReview(item.userReview._id)}
                        className="text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-600"
                      >
                        🗑 Delete
                      </button>

                    </div>
                  </div>

                ) : (

                  /* ✅ NO REVIEW */
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-indigo-600 text-sm font-medium hover:underline"
                  >
                    Write Review
                  </button>

                )}
              </div>

            </div>
          ))}
        </div>



        <PremiumPriceSummary
          mrp={order?.mrp}
          selling={order?.sellingPrice}
          productDiscount={order?.productDiscount}
          couponDiscount={order?.couponDiscount}
          couponCode={order?.couponCode}
          shipping={order?.shipping}
          platformFee={order?.platformFee}
          totalAmount={order?.totalAmount}
        />

        {/* ================= DELIVERY ADDRESS (PREMIUM) ================= */}
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              📍 Delivery Address
            </h2>

            <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-600">
              {order?.paymentMethod || "N/A"}
            </span>
          </div>

          {/* USER NAME + PHONE */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">

            <p className="font-medium text-gray-900 text-sm sm:text-base">
              {order?.addresses?.fullName || "No Name"}
            </p>

            <p className="text-sm text-gray-500 flex items-center gap-1">
              📞
              <span className="hover:text-indigo-600 cursor-pointer">
                {order?.addresses?.phone || "N/A"}
              </span>
            </p>
          </div>

          {/* ADDRESS BOX */}
          <div className="bg-white border rounded-xl p-2 space-y-2">

            <p className="text-gray-700 text-sm leading-relaxed">
              {order?.addresses?.address || "No address available"}
            </p>

            <div className="flex flex-wrap gap-2 text-xs text-gray-500">

              <span className="bg-gray-100 px-2 py-1 rounded-md">
                {order?.addresses?.city || "City"}
              </span>

              <span className="bg-gray-100 px-2 py-1 rounded-md">
                {order?.addresses?.state || "State"}
              </span>

              <span className="bg-gray-100 px-2 py-1 rounded-md font-medium text-gray-700">
                {order?.addresses?.pincode || "000000"}
              </span>

            </div>
          </div>


        </div>


        <div className="bg-white border rounded-xl pl-4 space-y-2">
          <RecentlyViewed />
        </div>

      </div>

      <FooterNavbar />
    </>
  );
};

export default MyOrdersDetails;
