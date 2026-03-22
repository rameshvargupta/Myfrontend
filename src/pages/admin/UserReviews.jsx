import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  Star, CheckCircle2, XCircle, Trash2,
  RefreshCw, Clock, ShieldCheck, LayoutGrid, Table, Search
} from "lucide-react";
import FooterNavbar from "@/components/user/FooterNavbar";
import Navbar from "@/components/Navbar";

const API = "http://localhost:5000/api/v1/reviews";

export const UserReviews = () => {

  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [view, setView] = useState("card");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  const headers = useMemo(() => {
    const token = localStorage.getItem("token");
    return { Authorization: token ? `Bearer ${token}` : "" };
  }, []);

  /* ================= FETCH ================= */
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const url =
        tab === "pending"
          ? `${API}/admin/reviews/pending`
          : `${API}/admin/reviews`;

      const res = await axios.get(url, { headers });
      setReviews(res.data?.reviews || []);
    } catch (err) {
      toast.error("Failed to fetch reviews");
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [tab]);

  /* ================= SEARCH FILTER ================= */
  const filteredReviews = useMemo(() => {
    return reviews.filter(r =>
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      `${r.user?.firstName || ""} ${r.user?.lastName || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [reviews, search]);

  /* ================= STATS ================= */
  const total = reviews.length;
  const approved = reviews.filter(r => r.status === "approved").length;
  const rejected = reviews.filter(r => r.status === "rejected").length;
  console.log(filteredReviews);

  /* ================= ACTION ================= */
  const handleAction = async (id, type) => {
    setActionLoading({ id, type });

    try {
      const endpoint = type === "approve" ? "approve" : "reject";

      await axios.patch(`${API}/admin/reviews/${id}/${endpoint}`, {}, { headers });

      setReviews(prev =>
        prev.map(r =>
          r._id === id
            ? { ...r, status: type === "approve" ? "approved" : "rejected" }
            : r
        )
      );

      toast.success(`Review ${type}d`);
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  /* ================= BULK ================= */
  const handleBulk = async (type) => {
    const pending = reviews.filter(r => r.status === "pending");

    for (let r of pending) {
      await handleAction(r._id, type);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    setActionLoading({ id, type: "delete" });

    try {
      await axios.delete(`${API}/admin/reviews/${id}`, { headers });

      setReviews(prev => prev.filter(r => r._id !== id));

      toast.success("Review deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8 mb-15">
        <Toaster position="top-center" />

        {/* ================= HEADER ================= */}
        <div className="max-w-7xl mx-auto mb-6">

          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" />
                Review Management
              </h1>
              <p className="text-sm text-gray-500">{total} Reviews</p>
            </div>

            {/* VIEW + TAB */}
            <div className="flex gap-2 items-center">

              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setTab("all")}
                  className={`px-3 py-1 rounded-lg text-sm ${tab === "all" ? "bg-white shadow" : ""}`}
                >
                  All
                </button>
                <button
                  onClick={() => setTab("pending")}
                  className={`px-3 py-1 rounded-lg text-sm ${tab === "pending" ? "bg-white shadow text-orange-600" : ""}`}
                >
                  Pending
                </button>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setView("card")}
                  className={`p-2 rounded ${view === "card" ? "bg-white shadow" : ""}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setView("table")}
                  className={`p-2 rounded ${view === "table" ? "bg-white shadow" : ""}`}
                >
                  <Table size={16} />
                </button>
              </div>

            </div>
          </div>

          {/* ================= STATS ================= */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-xl shadow border">
              <p className="text-sm text-gray-500">Total</p>
              <h2 className="text-xl font-bold">{total}</h2>
            </div>

            <div className="bg-green-50 p-4 rounded-xl shadow border">
              <p className="text-sm text-green-600">Approved</p>
              <h2 className="text-xl font-bold text-green-600">{approved}</h2>
            </div>

            <div className="bg-red-50 p-4 rounded-xl shadow border">
              <p className="text-sm text-red-600">Rejected</p>
              <h2 className="text-xl font-bold text-red-600">{rejected}</h2>
            </div>
          </div>

          {/* ================= SEARCH + BULK ================= */}
          <div className="flex flex-wrap gap-3 justify-between items-center bg-white p-4 rounded-xl shadow border">

            <div className="flex items-center gap-2 border px-3 py-2 rounded-lg w-full md:w-80">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search reviews..."
                className="outline-none w-full text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleBulk("approve")}
                className="bg-green-600 text-white px-3 py-2 rounded text-xs"
              >
                Approve All
              </button>

              <button
                onClick={() => handleBulk("reject")}
                className="border border-red-500 text-red-500 px-3 py-2 rounded text-xs"
              >
                Reject All
              </button>
            </div>

          </div>
        </div>

        {/* ================= BODY ================= */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <RefreshCw className="animate-spin" size={30} />
          </div>
        ) :
          view === "card" ? (

            /* ================= CARD VIEW ================= */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filteredReviews.map((r) => (

                <div key={r._id} className="bg-white p-5 rounded-2xl shadow border flex flex-col">

                  {/* ================= PRODUCT SECTION ================= */}
                  <div className="flex gap-3 mb-3 items-center">

                    <img
                      src={r.product?.images?.[0]?.url || "/no-image.png"}
                      alt={r.product?.name || "product"}
                      onClick={() => navigate(`/product/${r.product.slug}`)}
                      className="w-14 h-14 rounded-lg object-cover border cursor-pointer hover:scale-105 transition"
                    />

                    <div className="flex-1">
                      <h3
                        onClick={() => navigate(`/product/${r.product.slug}`)}
                        className="text-sm font-semibold cursor-pointer hover:text-indigo-600 line-clamp-1"
                      >
                        {r.product?.name || "Product Deleted"}
                      </h3>

                      <p className="text-xs text-gray-400">Product Review</p>
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium
                ${r.status === "approved" ? "bg-green-100 text-green-600" : ""}
                ${r.status === "pending" ? "bg-orange-100 text-orange-600" : ""}
                ${r.status === "rejected" ? "bg-red-100 text-red-600" : ""}
              `}
                    >
                      {r.status}
                    </span>

                  </div>

                  {/* ================= USER ================= */}
                  <h4
                    onClick={() => r.user?._id && navigate(`/admin/users/${r.user._id}`)}
                    className="font-semibold cursor-pointer hover:text-indigo-600"
                  >
                    {r.user?.firstName || "Unknown"} {r.user?.lastName || ""}
                  </h4>

                  {/* DATE */}
                  <p className="text-xs text-gray-400 mb-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>

                  {/* RATING */}
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14}
                        className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                    ))}
                  </div>

                  {/* COMMENT */}
                  <p className="text-sm mb-4 line-clamp-3">
                    "{r.comment}"
                  </p>

                  {/* ACTION */}
                  <div className="flex gap-2 mt-auto">

                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(r._id, "approve")}
                          className="flex-1 bg-green-600 text-white text-xs py-2 rounded flex items-center justify-center gap-1"
                        >
                          {actionLoading.id === r._id && actionLoading.type === "approve"
                            ? <RefreshCw className="animate-spin" size={14} />
                            : "Approve"}
                        </button>

                        <button
                          onClick={() => handleAction(r._id, "reject")}
                          className="flex-1 border border-red-500 text-red-500 text-xs py-2 rounded flex items-center justify-center gap-1"
                        >
                          {actionLoading.id === r._id && actionLoading.type === "reject"
                            ? <RefreshCw className="animate-spin" size={14} />
                            : "Reject"}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(r._id)}
                      className="bg-gray-100 px-3 rounded flex items-center justify-center"
                    >
                      {actionLoading.id === r._id && actionLoading.type === "delete"
                        ? <RefreshCw className="animate-spin" size={14} />
                        : <Trash2 size={14} />}
                    </button>

                  </div>
                </div>

              ))}
            </div>

          ) : (

            /* ================= TABLE VIEW ================= */
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow border overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-left">Product Name</th>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Rating</th>
                    <th className="p-3 text-left">Review</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReviews.map((r) => (

                    <tr key={r._id} className="border-t hover:bg-gray-50">

                      {/* PRODUCT */}
                      <td className="p-3 flex items-center gap-2">
                        <img
                          src={r.product?.images?.[0]?.url || "/no-image.png"}
                          alt={r.product?.name || "product"}
                          onClick={() => navigate(`/product/${r.product.slug}`)}
                          className="w-14 h-14 rounded-lg object-cover border cursor-pointer hover:scale-105 transition"
                        />
                      </td>

                      <td>
                        <h3
                          onClick={() => navigate(`/product/${r.product.slug}`)}
                          className="text-sm font-semibold cursor-pointer hover:text-indigo-600 line-clamp-1"
                        >
                          {r.product?.name || "Product Deleted"}
                        </h3>
                      </td>

                      {/* USER */}
                      <td className="p-3 cursor-pointer hover:text-indigo-600">
                        <span
                          onClick={() => r.user?._id && navigate(`/admin/users/${r.user._id}`)}
                        >
                          {r.user?.firstName || "Unknown"} {r.user?.lastName || ""}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="p-3 text-gray-500">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>

                      {/* RATING */}
                      <td className="p-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14}
                              className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                          ))}
                        </div>
                      </td>

                      {/* COMMENT */}
                      <td className="p-3 max-w-xs truncate">
                        {r.comment}
                      </td>

                      {/* STATUS */}
                      <td className="p-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium
                    ${r.status === "approved" ? "bg-green-100 text-green-600" : ""}
                    ${r.status === "pending" ? "bg-orange-100 text-orange-600" : ""}
                    ${r.status === "rejected" ? "bg-red-100 text-red-600" : ""}
                  `}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="p-3 text-center align-middle">
                        <div className="flex justify-center items-center">
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium 
      bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200"
                          >
                            {actionLoading.id === r._id && actionLoading.type === "delete" ? (
                              <>
                                <RefreshCw className="animate-spin" size={14} />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                    </tr>

                  ))}
                </tbody>

              </table>
            </div>

          )
        }
      </div>

      <FooterNavbar />
    </>
  );
};