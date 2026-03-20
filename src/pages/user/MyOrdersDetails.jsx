import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import RecentlyViewed from "./RecentlyViewed";

/* ================= STAR COMPONENT ================= */
const StarRating = ({ rating, setRating, editable = false }) => {
  return (
    <div className="flex gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => editable && setRating(star)}
          className={`cursor-pointer transition ${star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const MyOrdersDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const menuRef = useRef();
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  /* ================= FETCH ORDER ================= */
  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/v1/reviews/${orderId}/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.success) {
        setOrder(data.order); // ✅ IMPORTANT
      } else {
        toast.error("Failed to load order");
      }
    } catch (err) {
      toast.error("Error loading order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  /* ================= SUBMIT REVIEW ================= */
  const handleSubmitReview = async (item) => {
    if (!comment.trim()) return toast.error("Comment required");

    try {
      setReviewLoading(true);

      const token = localStorage.getItem("token");

      const productId =
        item?.productId?._id || item?.productId;

      let url = "";
      let method = "POST";

      if (item?.userReview?._id) {
        url = `http://localhost:5000/api/v1/reviews/${item.userReview._id}`;
        method = "PUT";
      } else {
        url = `http://localhost:5000/api/v1/products/${productId}/reviews`;
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

      if (!data.success) return toast.error(data.message);

      toast.success("Review saved");

      await fetchOrder();

      setComment("");
      setRating(5);
      setEditingItem(null);

    } catch {
      toast.error("Review failed");
    } finally {
      setReviewLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/v1/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!data.success) return toast.error(data.message);

      toast.success("Deleted");

      await fetchOrder();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading...</div>;

  if (!order)
    return <div className="p-10 text-center">Order not found</div>;

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 space-y-8 mb-20">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p>{order._id}</p>
        </div>

        {/* PRODUCTS */}
        <div className="grid lg:grid-cols-2 gap-8">
          {order.orderItems.map((item) => (
            <div
              key={item._id}
              className="group bg-white/80 backdrop-blur-lg border border-gray-200 rounded-3xl p-6 shadow-md  transition-all duration-300 relative"
            >
              {/* PRODUCT INFO */}
              <div className="flex gap-5">
                <div
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/product/${item.slug}`)}
                >
                  <img
                    src={item.image}
                    className="w-24 h-24 rounded-2xl object-cover border hover:scale-105 transition duration-300"
                  />

                  {/* glow effect */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5 group-hover:ring-indigo-400 transition"></div>
                </div>

                <div className="flex-1 space-y-1">
                  <h2
                    onClick={() => navigate(`/product/${item.slug}`)}
                    className="font-semibold text-lg text-gray-800 line-clamp-2 cursor-pointer hover:text-indigo-600"
                  >
                    {item.productName}
                  </h2>

                  <p className="text-xl font-bold text-indigo-600">
                    ₹ {item.price}
                  </p>

                  <p className="text-xs text-gray-400">
                    Delivered on {Date}
                  </p>
                </div>
              </div>

              {/* REVIEW SECTION */}
              <div className="mt-5 pt-4 border-t border-gray-200 flex justify-between gap-4">
                <div className="flex-1">
                  {/* SHOW REVIEW */}
                  {item?.userReview && editingItem?._id !== item._id && (
                    <div className="space-y-2">
                      <StarRating rating={item.userReview.rating} />

                      {/* DATE */}
                      <p className="text-xs text-gray-400">
                        Reviewed on {formatDate(item.userReview.createdAt)}
                      </p>

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {item.userReview.comment}
                      </p>

                      {/* STATUS BADGE */}
                      <div>
                        {item.userReview.status === "pending" && (
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600">
                            Pending Approval
                          </span>
                        )}

                        {item.userReview.status === "approved" && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                            Approved
                          </span>
                        )}

                        {item.userReview.status === "rejected" && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ADD / EDIT REVIEW */}
                  {(!item?.userReview || editingItem?._id === item._id) && (
                    <div className="space-y-3">
                      <StarRating
                        rating={rating}
                        setRating={setRating}
                        editable
                      />

                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none p-3 rounded-xl text-sm"
                        placeholder="Write your review..."
                      />

                      <div className="flex gap-3">
                        {/* SUBMIT */}
                        <button
                          onClick={() => handleSubmitReview(item)}
                          disabled={reviewLoading}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-xl text-sm font-medium shadow hover:scale-105 transition"
                        >
                          {reviewLoading
                            ? "Saving..."
                            : item.userReview
                              ? "Update Review"
                              : "Submit Review"}
                        </button>

                        {/* ✅ CANCEL BUTTON */}
                        {item.userReview && (
                          <button
                            onClick={() => {
                              setEditingItem(null);     // edit बंद
                              setComment("");           // reset
                              setRating(5);             // reset
                            }}
                            className="px-5 py-2 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-100 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* MENU */}
                {item.userReview && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() =>
                        setMenuOpenId(
                          menuOpenId === item._id ? null : item._id
                        )
                      }
                      className="text-2xl px-2 hover:text-indigo-600"
                    >
                      ⋮
                    </button>

                    {menuOpenId === item._id && (
                      <div className="absolute right-0 top-8 bg-white border rounded-xl shadow-lg w-32 z-10 overflow-hidden">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setRating(item.userReview.rating);
                            setComment(item.userReview.comment);
                            setMenuOpenId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => {
                            handleDeleteReview(item.userReview._id);
                            setMenuOpenId(null); // ✅ MENU CLOSE
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-500"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ADDRESS CARD */}
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-6 rounded-3xl shadow-md  transition-all duration-300">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📍 Delivery Address
            </h2>

            <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-600">
              {order.paymentMethod}
            </span>
          </div>

          {/* USER INFO */}
          <div className="space-y-3">

            {/* NAME + PHONE */}
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 text-base">
                {order.addresses?.fullName}
              </h3>

              <span className="text-sm text-gray-500">
                📞 {order.addresses?.phone}
              </span>
            </div>

            {/* ADDRESS */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {order.addresses?.address}
            </p>

            {/* CITY STATE PIN */}
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded-md">
                {order.addresses?.city}
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded-md">
                {order.addresses?.state}
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded-md">
                {order.addresses?.pincode}
              </span>
            </div>

          </div>

          {/* FOOTER STATUS */}
          <div className="flex justify-between items-center mt-5 pt-4 border-t">

            {/* ORDER STATUS */}
            <span className={`px-3 py-1 text-xs rounded-full font-medium
      ${order.orderStatus === "Delivered" && "bg-green-100 text-green-600"}
      ${order.orderStatus === "Pending" && "bg-yellow-100 text-yellow-600"}
      ${order.orderStatus === "Cancelled" && "bg-red-100 text-red-600"}
    `}>
              {order.orderStatus}
            </span>

            {/* PAYMENT STATUS */}
            <span className={`px-3 py-1 text-xs rounded-full font-medium
      ${order.paymentStatus === "Paid" && "bg-green-100 text-green-600"}
      ${order.paymentStatus === "Pending" && "bg-orange-100 text-orange-600"}
    `}>
              {order.paymentStatus}
            </span>

          </div>

        </div>

        <RecentlyViewed />
      </div>

      <FooterNavbar />
    </>
  );
};

export default MyOrdersDetails;