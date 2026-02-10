import { useEffect, useState } from "react";
import { toast } from "sonner";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("reviews");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // edit states
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin";

  // fetch reviews
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
    if (activeTab === "reviews" && productId) fetchReviews();
  }, [activeTab, productId]);

  // add review
  const submitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Comment required");

    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/products/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      const data = await res.json();
      if (!data.success) return toast.error(data.message);

      toast.success("Review added");
      setComment("");
      setRating(5);
      setActiveTab("reviews");
      fetchReviews();
    } catch {
      toast.error("Failed to submit review");
    }
  };

  // edit
  const handleEdit = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const updateReview = async (reviewId) => {
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

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2 rounded border ${activeTab === "reviews"
            ? "bg-pink-500 text-white"
            : "hover:bg-gray-100"
            }`}
        >
          Reviews
        </button>

        {user && (
          <button
            onClick={() => setActiveTab("add")}
            className={`px-4 py-2 rounded border ${activeTab === "add"
              ? "bg-pink-500 text-white"
              : "hover:bg-gray-100"
              }`}
          >
            Add Review
          </button>
        )}
      </div>

      {/* add review */}
      {activeTab === "add" && (
        <form
          onSubmit={submitReview}
          className="border rounded-lg p-5 space-y-4 mb-8"
        >
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} Stars
              </option>
            ))}
          </select>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            rows={4}
            placeholder="Write your experience..."
          />

          <button className="bg-pink-500 text-white px-4 py-2 rounded">
            Submit
          </button>
        </form>
      )}

      {/* reviews list */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          {loading && <p>Loading...</p>}
          {!loading && reviews.length === 0 && (
            <p className="text-gray-500">No reviews yet</p>
          )}

          {reviews.map((r) => {
            const isOwner = user?._id === r.user?._id;
            const initials =
              r.user?.firstName?.[0]?.toUpperCase() +
              r.user?.lastName?.[0]?.toUpperCase();

            return (
              <div
                key={r._id}
                className="bg-white border rounded-lg p-5 shadow-sm"
              >
                {/* header */}
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

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span
                        key={i}
                        className={i <= r.rating ? "text-yellow-400" : "text-gray-300"}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                </div>

                {/* body */}
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
                  <>
                    <p className="mt-4 text-gray-600">{r.comment}</p>

                    {/* action buttons */}
                    {(isOwner || isAdmin) && (
                      <div className="flex gap-4 mt-3 text-sm">

                        {/* Edit only owner */}
                        {isOwner && (
                          <button
                            onClick={() => handleEdit(r)}
                            className="text-blue-600"
                          >
                            Edit
                          </button>
                        )}

                        {/* Delete owner OR admin */}
                        <button
                          onClick={() => deleteReview(r._id)}
                          className="text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
