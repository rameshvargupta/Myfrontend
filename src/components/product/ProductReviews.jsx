import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
const ProductReviews = ({ productId }) => {

  const [reviews, setReviews] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState(0);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  const fetchReviews = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/v1/products/${productId}/reviews`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
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

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const total = reviews.length;
    const sum = reviews.reduce((a, r) => a + r.rating, 0);

    const distribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length
    }));

    return {
      total,
      avg: total ? (sum / total).toFixed(1) : 0,
      distribution
    };
  }, [reviews]);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    if (filter === 0) return reviews;
    return reviews.filter((r) => r.rating === filter);
  }, [reviews, filter]);

  /* ================= HELPERS ================= */
  const toggle = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const renderStars = (rating, size = 16) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={
            i <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  /* ================= UI ================= */
  return (
    <div className="bg-[#fafafa] py-5">

      <div className="max-w-7xl mx-auto px-0">

        <div className="grid lg:grid-cols-12 gap-6">

          {/* ================= LEFT PANEL ================= */}
          <div className="lg:col-span-4">

            <div className="sticky top-24 space-y-6">

              <div className="bg-white rounded-3xl p-8 shadow-lg border">

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Customer Reviews
                </h2>

                {/* AVG */}
                <div className="text-center mb-6">
                  <h3 className="text-5xl font-extrabold">
                    {stats.avg}
                  </h3>

                  <div className="flex justify-center mt-2">
                    {renderStars(Math.round(stats.avg), 20)}
                  </div>

                  <p className="text-gray-500 mt-2 text-sm">
                    {stats.total} reviews
                  </p>
                </div>

                {/* DISTRIBUTION */}
                <div className="space-y-2 mb-6">
                  {stats.distribution.map(d => (
                    <div key={d.star} className="flex items-center gap-2 text-sm">

                      <span className="w-6">{d.star}★</span>

                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{
                            width: `${stats.total ? (d.count / stats.total) * 100 : 0}%`
                          }}
                        />
                      </div>

                      <span className="w-6 text-right text-gray-500">
                        {d.count}
                      </span>

                    </div>
                  ))}
                </div>

                {/* FILTER */}
                <div className="flex flex-wrap gap-2">
                  {[5, 4, 3, 2, 1, 0].map(s => (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === s
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                      {s === 0 ? "All" : `${s}★`}
                    </button>
                  ))}
                </div>

              </div>

            </div>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="lg:col-span-8 space-y-6">

            {loading ? (
              <div className="text-center py-20">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                No reviews found
              </div>
            ) : (

              filtered.map((r) => {

                const words = r.comment.split(" ");
                const isLong = words.length > 35;
                const isExpanded = expanded[r._id];

                return (
                  <div
                    key={r._id}
                    className="bg-white rounded-3xl p-6 shadow-sm border hover:shadow-xl transition duration-300"
                  >

                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-4">

                      <div className="flex items-center gap-4">

                        {/* AVATAR */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                          {r.user?.firstName?.[0]}
                        </div>

                        <div>
                          <h4 className="font-semibold">
                            {r.user?.firstName} {r.user?.lastName}
                          </h4>

                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(r.rating)}

                            {r.status === "approved" && (
                              <span className="flex items-center gap-1 text-green-500 text-xs font-medium">
                                <CheckCircle2 size={14} />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>

                      </div>

                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>

                    </div>

                    {/* COMMENT */}
                    <p className="text-gray-700 leading-relaxed text-sm">

                      {isExpanded
                        ? r.comment
                        : words.slice(0, 35).join(" ")}

                      {isLong && (
                        <button
                          onClick={() => toggle(r._id)}
                          className="ml-2 text-indigo-600 font-medium text-sm"
                        >
                          {isExpanded ? (
                            <span className="flex items-center gap-1">
                              <ChevronUp size={14} /> Less
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ChevronDown size={14} /> Read more
                            </span>
                          )}
                        </button>
                      )}

                    </p>

                    {/* FOOTER */}
                    <div className="mt-5 flex items-center gap-6 text-sm">

                      <button className="flex items-center gap-2 text-gray-500 hover:text-black transition">
                        <ThumbsUp size={16} />
                        Helpful
                      </button>

                    </div>

                  </div>
                );
              })

            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;