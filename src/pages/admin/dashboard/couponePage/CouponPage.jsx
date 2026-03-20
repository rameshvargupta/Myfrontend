import React, { useEffect, useState } from "react";
import { CouponApi } from "./CouponApi";
import { toast } from "sonner";
import DeleteModal from "@/pages/DeleteModal";
import FooterNavbar from "@/components/user/FooterNavbar";
import Navbar from "@/components/Navbar";
import { MoreVertical, TicketPercent, CheckCircle2, Clock, Ban } from "lucide-react";
const CouponPage = () => {

    const [coupons, setCoupons] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const [editId, setEditId] = useState(null);

    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderValue: "",
        maxDiscount: "",
        expiryDate: "",
        usageLimit: ""
    });
    const [viewMode, setViewMode] = useState("table");
    const [sortField, setSortField] = useState("expiryDate");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 6;

    const isExpiringSoon = (date) => {
        const today = new Date();
        const expiry = new Date(date);
        const diff = (expiry - today) / (1000 * 60 * 60 * 24);
        return diff <= 3 && diff > 0;
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    // FETCH
    const fetchCoupons = async () => {

        setLoading(true);

        const data = await CouponApi.getAllCoupons();

        if (data.success) {
            setCoupons(data.coupons);
        } else {
            toast.error(data.message);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const toggleCouponStatus = async (id) => {

        const res = await CouponApi.toggleCoupon(id);

        if (res.success) {
            toast.success("Coupon status updated");
            fetchCoupons();
        } else {
            toast.error(res.message);
        }

    };

    useEffect(() => {

        const closeMenu = () => setOpenMenu(null);

        document.addEventListener("click", closeMenu);

        return () => document.removeEventListener("click", closeMenu);

    }, []);

    // INPUT
    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    // CREATE OR UPDATE
    const handleSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);
        let res;

        if (editId) {
            res = await CouponApi.updateCoupon(editId, formData);
        } else {
            res = await CouponApi.createCoupon(formData);
        }

        if (res.success) {

            toast.success(editId ? "Coupon Updated" : "Coupon Created");

            setFormData({
                code: "",
                discountType: "percentage",
                discountValue: "",
                minOrderValue: "",
                maxDiscount: "",
                expiryDate: "",
                usageLimit: ""
            });

            setEditId(null);

            fetchCoupons();

        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    // EDIT
    const handleEdit = (coupon) => {

        setEditId(coupon._id);

        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue,
            maxDiscount: coupon.maxDiscount,
            expiryDate: coupon.expiryDate.slice(0, 10),
            usageLimit: coupon.usageLimit
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // OPEN DELETE MODAL
    const openDeleteModal = (id) => {

        setSelectedCoupon(id);
        setDeleteModal(true);

    };

    // CONFIRM DELETE
    const confirmDelete = async () => {

        const toastId = toast.loading("Deleting coupon...");

        const res = await CouponApi.deleteCoupon(selectedCoupon);

        if (res.success) {

            toast.success("Coupon deleted", { id: toastId });

            fetchCoupons();

        } else {

            toast.error(res.message, { id: toastId });

        }

        setDeleteModal(false);
    };

    const expiredCoupons = coupons.filter(
        (c) => new Date(c.expiryDate) < new Date()
    ).length;

    const activeCoupons = coupons.filter(
        (c) => c.isActive && new Date(c.expiryDate) >= new Date()
    ).length;

    const blockedCoupons = coupons.filter(
        (c) => !c.isActive && new Date(c.expiryDate) >= new Date()
    ).length;

    const isExpired = (date) => {
        return new Date(date) < new Date();
    };

    // FILTER
    const filteredCoupons = coupons.filter((coupon) => {

        const matchSearch = coupon.code
            .toLowerCase()
            .includes(search.toLowerCase());

        if (statusFilter === "active") {
            return (
                matchSearch &&
                coupon.isActive &&
                !isExpired(coupon.expiryDate)
            );
        }

        if (statusFilter === "blocked") {
            return matchSearch && !coupon.isActive;
        }

        if (statusFilter === "expired") {
            return matchSearch && isExpired(coupon.expiryDate);
        }

        return matchSearch;
    });

    // FILTER
    const sortedCoupons = [...filteredCoupons].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === "expiryDate") {
            valA = new Date(valA);
            valB = new Date(valB);
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const startIndex = (currentPage - 1) * rowsPerPage;

    const paginatedCoupons = sortedCoupons.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    const totalPages = Math.ceil(sortedCoupons.length / rowsPerPage);

    // STATS


    return (
        <>
            <Navbar />
            <div className="p-10 bg-gray-50 min-h-screen mb-15">

                {/* HEADER */}


                <div className="mb-10">

                    {/* HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                                Coupon Management
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Manage and track all discount coupons
                            </p>
                        </div>

                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* TOTAL COUPONS */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between hover:shadow-md transition">

                            <div>
                                <p className="text-sm text-gray-500">Total Coupons</p>
                                <h2 className="text-3xl font-semibold text-gray-900 mt-1">
                                    {coupons.length}
                                </h2>
                            </div>

                            <div className="p-3 bg-gray-100 rounded-lg">
                                <TicketPercent size={26} className="text-gray-700" />
                            </div>

                        </div>

                        {/* ACTIVE */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between hover:shadow-md transition">

                            <div>
                                <p className="text-sm text-gray-500">Active Coupons</p>
                                <h2 className="text-3xl font-semibold text-green-600 mt-1">
                                    {activeCoupons}
                                </h2>
                            </div>

                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle2 size={26} className="text-green-600" />
                            </div>

                        </div>

                        {/* Blocked */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between hover:shadow-md transition">
                            <div>
                                <p className="text-sm text-gray-500">Blocked Coupons</p>
                                <h2 className="text-3xl font-semibold text-orange-600 mt-1">
                                    {blockedCoupons}
                                </h2>
                            </div>

                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Ban size={26} className="text-orange-600" />
                            </div>

                        </div>

                        {/* EXPIRED */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between hover:shadow-md transition">

                            <div>
                                <p className="text-sm text-gray-500">Expired Coupons</p>
                                <h2 className="text-3xl font-semibold text-red-600 mt-1">
                                    {expiredCoupons}
                                </h2>
                            </div>

                            <div className="p-3 bg-red-100 rounded-lg">
                                <Clock size={26} className="text-red-600" />
                            </div>

                        </div>

                    </div>

                </div>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 mb-8"
                >

                    {/* FORM GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                        {/* COUPON CODE */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">
                                Coupon Code
                            </label>
                            <input
                                name="code"
                                value={formData.code}
                                placeholder="SAVE20"
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none"
                            />
                        </div>

                        {/* DISCOUNT TYPE */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">
                                Discount Type
                            </label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="flat">Flat</option>
                            </select>
                        </div>

                        {/* DISCOUNT VALUE */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">
                                Discount Value
                            </label>
                            <input
                                name="discountValue"
                                value={formData.discountValue}
                                placeholder="20"
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>

                        {/* MIN ORDER */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">
                                Min Order Value
                            </label>
                            <input
                                name="minOrderValue"
                                value={formData.minOrderValue}
                                placeholder="1000"
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>

                        {/* MAX DISCOUNT */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">
                                Max Discount
                            </label>
                            <input
                                name="maxDiscount"
                                value={formData.maxDiscount}
                                placeholder="300"
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>

                        {/* USAGE LIMIT */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">
                                Usage Limit
                            </label>
                            <input
                                name="usageLimit"
                                value={formData.usageLimit}
                                placeholder="100"
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>

                        {/* EXPIRY DATE */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">
                                Expiry Date
                            </label>
                            <input
                                name="expiryDate"
                                type="date"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>

                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-wrap gap-3 mt-6">

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-60"
                        >

                            {loading && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}

                            {loading
                                ? (editId ? "Updating..." : "Creating...")
                                : (editId ? "Update Coupon" : "Create Coupon")
                            }

                        </button>

                        {editId && (
                            <button
                                type="button"
                                onClick={() => setEditId(null)}
                                className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">

                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">

                        {/* SEARCH */}
                        <div className="flex-1">
                            <input
                                placeholder="Search coupon code..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 items-center">

                            {/* FILTER */}
                            <div className="w-40">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                                >
                                    <option value="all">All Coupons</option>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>

                            {/* VIEW TOGGLE */}
                            <button
                                onClick={() =>
                                    setViewMode(viewMode === "table" ? "card" : "table")
                                }
                                className="border px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium"
                            >
                                {viewMode === "table" ? "📱 Card View" : "🧾 Table View"}
                            </button>

                        </div>

                    </div>

                </div>

                {/* TABLE */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-visible">

                    {/* MOBILE / CARD VIEW */}
                    {viewMode === "card" && (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {paginatedCoupons.map((coupon) => (

                                <div
                                    key={coupon._id}
                                    className={`relative border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition
                                  ${isExpired(coupon.expiryDate) ? "border-red-200 bg-red-50" : ""}`}
                                >

                                    {/* HEADER */}
                                    <div className="flex justify-between items-start">

                                        <div>
                                            <h3 className="font-semibold text-blue-700 text-lg">
                                                {coupon.code}
                                            </h3>

                                            <p className="text-xs text-gray-500">
                                                {coupon.discountType === "percentage"
                                                    ? `${coupon.discountValue}% Discount`
                                                    : `₹${coupon.discountValue} Discount`}
                                            </p>
                                        </div>

                                        {/* STATUS */}
                                        <span
                                            className={`text-xs px-3 py-1 mx-6 rounded-full
                                            ${isExpired(coupon.expiryDate)
                                                    ? "bg-red-100 text-red-600"
                                                    : coupon.isActive
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-gray-200 text-gray-600"
                                                }`}
                                        >
                                            {isExpired(coupon.expiryDate)
                                                ? "Expired"
                                                : coupon.isActive
                                                    ? "Active"
                                                    : "Blocked"}
                                        </span>

                                    </div>

                                    {/* DETAILS */}
                                    <div className="mt-3 text-sm text-gray-700 space-y-1">

                                        <p>
                                            <span className="text-gray-500">Min Order:</span>{" "}
                                            ₹{coupon.minOrderValue}
                                        </p>

                                        <p>
                                            <span className="text-gray-500">Expiry:</span>{" "}
                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </p>

                                    </div>

                                    {/* EXPIRING WARNING */}
                                    {isExpiringSoon(coupon.expiryDate) && (
                                        <p className="text-xs text-orange-500 mt-1">
                                            ⚠ Expiring soon
                                        </p>
                                    )}

                                    {/* USAGE PROGRESS */}
                                    <div className="mt-3">

                                        <div className="flex justify-between text-xs mb-1">
                                            <span>Usage</span>
                                            <span>
                                                {coupon.usedCount}/{coupon.usageLimit}
                                            </span>
                                        </div>

                                        <div className="w-full bg-gray-200 rounded-full h-2">

                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${(coupon.usedCount / coupon.usageLimit) * 100}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                    {/* ACTION MENU */}
                                    <div className="absolute top-3 right-1">

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenu(openMenu === coupon._id ? null : coupon._id);
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {openMenu === coupon._id && (

                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                                            >

                                                <button
                                                    disabled={isExpired(coupon.expiryDate)}
                                                    onClick={() => {
                                                        handleEdit(coupon);
                                                        setOpenMenu(null);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    disabled={isExpired(coupon.expiryDate)}
                                                    onClick={() => {
                                                        toggleCouponStatus(coupon._id);
                                                        setOpenMenu(null);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    {coupon.isActive ? "Block" : "Unblock"}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        openDeleteModal(coupon._id);
                                                        setOpenMenu(null);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>
                    )}

                    {/* DESKTOP TABLE */}
                    {viewMode === "table" && (
                        <div className="overflow-x-auto overflow-y-visible">

                            <table className="min-w-full text-sm">

                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">

                                    <tr>

                                        <th
                                            onClick={() => handleSort("code")}
                                            className="px-6 py-3 cursor-pointer"
                                        >
                                            Coupon Code 🔽
                                        </th>

                                        <th className="px-6 py-3">Discount</th>

                                        <th className="px-6 py-3">Min Order</th>

                                        <th className="px-6 py-3">Usage</th>

                                        <th
                                            onClick={() => handleSort("expiryDate")}
                                            className="px-6 py-3 cursor-pointer"
                                        >
                                            Expiry 🔽
                                        </th>

                                        <th className="px-6 py-3">Status</th>

                                        <th className="px-6 py-3 text-right">Actions</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {paginatedCoupons.map((coupon) => (

                                        <tr
                                            key={coupon._id}
                                            className={`border-t hover:bg-gray-50 ${isExpired(coupon.expiryDate)
                                                ? "bg-red-50"
                                                : ""
                                                }`}
                                        >

                                            <td className="px-6 py-4 font-medium text-blue-700">
                                                {coupon.code}
                                            </td>

                                            <td className="px-6 py-4">
                                                {coupon.discountType === "percentage"
                                                    ? `${coupon.discountValue}%`
                                                    : `₹${coupon.discountValue}`}
                                            </td>

                                            <td className="px-6 py-4">
                                                ₹{coupon.minOrderValue}
                                            </td>

                                            {/* USAGE PROGRESS */}
                                            <td className="px-6 py-4 w-48">

                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>
                                                        {coupon.usedCount}/{coupon.usageLimit}
                                                    </span>
                                                </div>

                                                <div className="w-full bg-gray-200 rounded-full h-2">

                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${(coupon.usedCount /
                                                                coupon.usageLimit) *
                                                                100
                                                                }%`,
                                                        }}
                                                    />

                                                </div>

                                            </td>

                                            <td className="px-6 py-4">

                                                {new Date(
                                                    coupon.expiryDate
                                                ).toLocaleDateString()}

                                                {isExpiringSoon(coupon.expiryDate) && (
                                                    <span className="block text-xs text-orange-500">
                                                        ⚠ Expiring soon
                                                    </span>
                                                )}

                                            </td>

                                            <td className="px-6 py-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs
                                                 ${isExpired(coupon.expiryDate)
                                                            ? "bg-red-100 text-red-600"
                                                            : coupon.isActive
                                                                ? "bg-green-100 text-green-600"
                                                                : "bg-gray-200 text-gray-600"
                                                        }`}
                                                >
                                                    {isExpired(coupon.expiryDate)
                                                        ? "Expired"
                                                        : coupon.isActive
                                                            ? "Active"
                                                            : "Blocked"}
                                                </span>

                                            </td>

                                            <td className="px-6 py-4 text-right relative">

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenu(openMenu === coupon._id ? null : coupon._id);
                                                    }}
                                                    className="p-2 hover:bg-gray-100 rounded"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {openMenu === coupon._id && (

                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute right-0 top-full mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-[999]"
                                                    >

                                                        <button
                                                            onClick={() => {
                                                                handleEdit(coupon);
                                                                setOpenMenu(null);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                toggleCouponStatus(coupon._id);
                                                                setOpenMenu(null);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                        >
                                                            {coupon.isActive ? "Block" : "Unblock"}
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                openDeleteModal(coupon._id);
                                                                setOpenMenu(null);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                )}

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}
                    {/* PAGINATION */}

                    <div className="flex justify-between items-center p-4 border-t">

                        <p className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </p>

                        <div className="flex gap-2">

                            <button
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((p) => p - 1)
                                }
                                className="px-3 py-1 border rounded"
                            >
                                Prev
                            </button>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((p) => p + 1)
                                }
                                className="px-3 py-1 border rounded"
                            >
                                Next
                            </button>

                        </div>

                    </div>

                </div>


                <DeleteModal
                    isOpen={deleteModal}
                    onClose={() => setDeleteModal(false)}
                    onConfirm={confirmDelete}
                />

            </div>

            <FooterNavbar />
        </>
    );
};

export default CouponPage;