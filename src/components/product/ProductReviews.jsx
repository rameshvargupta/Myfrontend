import { useEffect, useState } from "react";
import { toast } from "sonner";
import FooterNavbar from "../user/FooterNavbar";
import { MoreVertical } from "lucide-react";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedComments, setExpandedComments] = useState({});

  const reviewsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin";

  /* ================= FETCH ================= */
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/v1/products/${productId}/reviews`
      );
      const data = await res.json();
      if (data.success) setReviews(data.reviews);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const paginatedReviews = showAll
    ? reviews.slice(
      (currentPage - 1) * reviewsPerPage,
      currentPage * reviewsPerPage
    )
    : reviews.slice(0, 5);

  /* ================= EDIT ================= */
  const handleEdit = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const updateReview = async (reviewId) => {
    if (!editComment.trim()) return toast.error("Comment required");

    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/reviews/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: editRating,
            comment: editComment,
          }),
        }
      );

      const data = await res.json();
      if (!data.success) return toast.error(data.message);

      toast.success("Review updated");
      setEditingReviewId(null);
      fetchReviews();
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= DELETE ================= */
  const deleteReview = async (reviewId) => {
    if (!confirm("Delete this review?")) return;

    try {
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
      if (!data.success) return toast.error(data.message);

      toast.success("Review deleted");
      fetchReviews();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleExpand = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">
          Customer Reviews ({reviews.length})
        </h2>

        {loading && <p>Loading...</p>}
        {!loading && reviews.length === 0 && (
          <p className="text-gray-500">No reviews yet</p>
        )}

        <div className="space-y-6">
          {paginatedReviews.map((r) => {
            const isOwner = user?._id === r.user?._id;
            const initials =
              r.user?.firstName?.[0]?.toUpperCase() +
              r.user?.lastName?.[0]?.toUpperCase();

            const words = r.comment.split(" ");
            const isLong = words.length > 25;

            const displayText =
              !expandedComments[r._id] && isLong
                ? words.slice(0, 25).join(" ") + "..."
                : r.comment;

            return (
              <div
                key={r._id}
                className="bg-white border rounded-lg p-5 shadow-sm"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {r.user.firstName} {r.user.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Stars */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={
                            i <= r.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {/* 3 Dot Menu */}
                    {(isOwner || isAdmin) && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === r._id ? null : r._id
                            )
                          }
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenuId === r._id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                            {isOwner && (
                              <button
                                onClick={() => {
                                  handleEdit(r);
                                  setOpenMenuId(null);
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                              >
                                Edit
                              </button>
                            )}

                            <button
                              onClick={() => {
                                deleteReview(r._id);
                                setOpenMenuId(null);
                              }}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* BODY */}
                {editingReviewId === r._id ? (
                  <div className="mt-4 space-y-3">
                    <select
                      value={editRating}
                      onChange={(e) =>
                        setEditRating(Number(e.target.value))
                      }
                      className="border rounded px-2 py-1 w-full"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} Stars
                        </option>
                      ))}
                    </select>

                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => updateReview(r._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="border px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-gray-600">
                    {displayText}
                    {isLong && (
                      <button
                        onClick={() => toggleExpand(r._id)}
                        className="ml-2 text-blue-600 text-sm"
                      >
                        {expandedComments[r._id]
                          ? "Show Less"
                          : "Read More"}
                      </button>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* More Reviews */}
        {!showAll && reviews.length > 5 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-2 bg-black text-white rounded-lg"
            >
              More Reviews
            </button>
          </div>
        )}

        {/* Pagination */}
        {showAll && totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded border ${currentPage === i + 1
                    ? "bg-black text-white"
                    : ""
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <FooterNavbar />
    </>
  );
};

export default ProductReviews;