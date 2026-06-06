import React, { useEffect, useState, useMemo } from "react";
import { CouponApi } from "./CouponApi";
import { toast } from "sonner";
import DeleteModal from "@/pages/DeleteModal";
import FooterNavbar from "@/components/user/FooterNavbar";
import Navbar from "@/components/Navbar";
import {
    TicketPercent, CheckCircle2, Clock, Ban,
    Plus, Search, LayoutGrid, Table, RefreshCw, Edit,
    Unlock, Trash2, X, Zap, Calendar, DollarSign,
    Tag, ShoppingBag, Infinity, Percent
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const CouponPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState("card");
    const [sortField, setSortField] = useState("expiryDate");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 6;

    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderValue: "",
        maxDiscount: "",
        expiryDate: "",
        usageLimit: ""
    });

    const isExpiringSoon = (date) => {
        const today = new Date();
        const expiry = new Date(date);
        const diff = (expiry - today) / (1000 * 60 * 60 * 24);
        return diff <= 3 && diff > 0;
    };

    const isExpired = (date) => {
        return new Date(date) < new Date();
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
            setShowForm(false);
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
        setShowForm(true);
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

    // STATS
    const expiredCoupons = coupons.filter(
        (c) => new Date(c.expiryDate) < new Date()
    ).length;

    const activeCoupons = coupons.filter(
        (c) => c.isActive && new Date(c.expiryDate) >= new Date()
    ).length;

    const blockedCoupons = coupons.filter(
        (c) => !c.isActive && new Date(c.expiryDate) >= new Date()
    ).length;

    // FILTER
    const filteredCoupons = useMemo(() => {
        return coupons.filter((coupon) => {
            const matchSearch = coupon.code.toLowerCase().includes(search.toLowerCase());

            if (statusFilter === "active") {
                return matchSearch && coupon.isActive && !isExpired(coupon.expiryDate);
            }
            if (statusFilter === "blocked") {
                return matchSearch && !coupon.isActive;
            }
            if (statusFilter === "expired") {
                return matchSearch && isExpired(coupon.expiryDate);
            }
            return matchSearch;
        });
    }, [coupons, search, statusFilter]);

    // SORT
    const sortedCoupons = useMemo(() => {
        return [...filteredCoupons].sort((a, b) => {
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
    }, [filteredCoupons, sortField, sortOrder]);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedCoupons = sortedCoupons.slice(startIndex, startIndex + rowsPerPage);
    const totalPages = Math.ceil(sortedCoupons.length / rowsPerPage);

    // Get status color and text
    const getStatusInfo = (coupon) => {
        if (isExpired(coupon.expiryDate)) {
            return { text: "Expired", color: "bg-red-100 text-red-600", icon: Clock };
        }
        if (coupon.isActive) {
            return { text: "Active", color: "bg-green-100 text-green-600", icon: CheckCircle2 };
        }
        return { text: "Blocked", color: "bg-gray-100 text-gray-600", icon: Ban };
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-2 px-2 lg:px-8 mb-10">

                {/* HEADER */}
                <div className="max-w-7xl mx-auto mb-18 mt-0">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                                    <TicketPercent className="text-white" size={24} />
                                </div>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Coupon Management
                                </span>
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{coupons.length} Total Coupons</p>
                        </div>

                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                                <Plus size={18} />
                                {showForm ? "Close Form" : "Add Coupon"}
                            </button>

                            <div className="flex bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
                                <button
                                    onClick={() => setViewMode("card")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-indigo-100 text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-indigo-100 text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                                >
                                    <Table size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* STATS CARDS - Enhanced */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Coupons</p>
                                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{coupons.length}</h2>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-xl group-hover:scale-110 transition-transform">
                                    <TicketPercent size={22} className="text-gray-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600">Active Coupons</p>
                                    <h2 className="text-2xl font-bold text-green-600 mt-1">{activeCoupons}</h2>
                                </div>
                                <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
                                    <CheckCircle2 size={22} className="text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600">Blocked Coupons</p>
                                    <h2 className="text-2xl font-bold text-orange-600 mt-1">{blockedCoupons}</h2>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                                    <Ban size={22} className="text-orange-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600">Expired Coupons</p>
                                    <h2 className="text-2xl font-bold text-red-600 mt-1">{expiredCoupons}</h2>
                                </div>
                                <div className="p-3 bg-red-100 rounded-xl group-hover:scale-110 transition-transform">
                                    <Clock size={22} className="text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FORM SECTION - 2 COLUMN LAYOUT */}
                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border-0 mb-6 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Zap className="text-white" size={20} />
                                        <h2 className="font-semibold text-white text-lg">
                                            {editId ? "Edit Coupon" : "Create New Coupon"}
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="p-1.5 hover:bg-white/20 rounded-lg transition text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* 2 Column Grid Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-5">
                                        {/* Coupon Code */}
                                        <div className="group">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                                <Tag size={16} className="text-indigo-500" />
                                                Coupon Code
                                            </label>
                                            <input
                                                name="code"
                                                value={formData.code}
                                                placeholder="e.g., SAVE20, WELCOME10"
                                                onChange={handleChange}
                                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                required
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Unique code customers will enter</p>
                                        </div>

                                        {/* Discount Type & Value - Side by side */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                                    <Percent size={16} className="text-indigo-500" />
                                                    Discount Type
                                                </label>
                                                <select
                                                    name="discountType"
                                                    value={formData.discountType}
                                                    onChange={handleChange}
                                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                >
                                                    <option value="percentage">Percentage (%)</option>
                                                    <option value="flat">Flat (₹)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                                    <DollarSign size={16} className="text-indigo-500" />
                                                    Discount Value
                                                </label>
                                                <input
                                                    name="discountValue"
                                                    value={formData.discountValue}
                                                    placeholder={formData.discountType === "percentage" ? "e.g., 20" : "e.g., 100"}
                                                    onChange={handleChange}
                                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Min Order & Max Discount */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                                    <ShoppingBag size={16} className="text-indigo-500" />
                                                    Min Order Value
                                                </label>
                                                <input
                                                    name="minOrderValue"
                                                    value={formData.minOrderValue}
                                                    placeholder="e.g., 500"
                                                    onChange={handleChange}
                                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                                    <Infinity size={16} className="text-indigo-500" />
                                                    Max Discount (Optional)
                                                </label>
                                                <input
                                                    name="maxDiscount"
                                                    value={formData.maxDiscount}
                                                    placeholder="e.g., 500"
                                                    onChange={handleChange}
                                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-5">
                                        {/* Usage Limit */}
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                                <Zap size={16} className="text-indigo-500" />
                                                Usage Limit
                                            </label>
                                            <input
                                                name="usageLimit"
                                                value={formData.usageLimit}
                                                placeholder="e.g., 100"
                                                onChange={handleChange}
                                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                required
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Maximum number of times this coupon can be used</p>
                                        </div>

                                        {/* Expiry Date */}
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                                <Calendar size={16} className="text-indigo-500" />
                                                Expiry Date
                                            </label>
                                            <input
                                                name="expiryDate"
                                                type="date"
                                                value={formData.expiryDate}
                                                onChange={handleChange}
                                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                required
                                            />
                                        </div>

                                        {/* Preview Card */}
                                        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                            <p className="text-xs text-indigo-600 font-semibold mb-2">PREVIEW</p>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold">Code:</span> {formData.code || "COUPON_CODE"}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold">Discount:</span> {formData.discountValue || "0"} {formData.discountType === "percentage" ? "% OFF" : "₹ OFF"}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold">Min Order:</span> ₹{formData.minOrderValue || "0"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-8 pt-6 border-t">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {loading && <RefreshCw className="animate-spin" size={18} />}
                                        {loading ? (editId ? "Updating..." : "Creating...") : (editId ? "Update Coupon" : "Create Coupon")}
                                    </button>

                                    {editId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditId(null);
                                                setFormData({
                                                    code: "",
                                                    discountType: "percentage",
                                                    discountValue: "",
                                                    minOrderValue: "",
                                                    maxDiscount: "",
                                                    expiryDate: "",
                                                    usageLimit: ""
                                                });
                                            }}
                                            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}

                    {/* SEARCH + FILTERS - Enhanced */}
                    <div className="bg-white rounded-2xl shadow-sm border-0 p-5 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    placeholder="Search coupon code..."
                                    className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="all">All Coupons</option>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="flex flex-col items-center gap-3">
                                <RefreshCw className="animate-spin text-indigo-600" size={40} />
                                <p className="text-gray-500">Loading coupons...</p>
                            </div>
                        </div>
                    ) : viewMode === "card" ? (
                        /* CARD VIEW - MODERN ENHANCED */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedCoupons.map((coupon) => {
                                const statusInfo = getStatusInfo(coupon);
                                const StatusIcon = statusInfo.icon;
                                const expired = isExpired(coupon.expiryDate);
                                const expiringSoon = isExpiringSoon(coupon.expiryDate);
                                const usagePercentage = (coupon.usedCount / coupon.usageLimit) * 100;

                                return (
                                    <div key={coupon._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                                        {/* Colorful top bar */}
                                        <div className={`h-1 ${expired ? "bg-red-500" : coupon.isActive ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-gray-400"}`}></div>

                                        <div className="p-5">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Tag size={14} className="text-indigo-500" />
                                                        <h3 className="font-mono font-bold text-indigo-600 text-lg">
                                                            {coupon.code}
                                                        </h3>
                                                    </div>
                                                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                                                        {coupon.discountType === "percentage" ? (
                                                            <Percent size={12} className="text-indigo-500" />
                                                        ) : (
                                                            <DollarSign size={12} className="text-indigo-500" />
                                                        )}
                                                        <p className="text-xs font-semibold text-gray-700">
                                                            {coupon.discountType === "percentage"
                                                                ? `${coupon.discountValue}% OFF`
                                                                : `₹${coupon.discountValue} OFF`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 ${statusInfo.color}`}>
                                                    <StatusIcon size={12} />
                                                    {statusInfo.text}
                                                </span>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500">Min Order</p>
                                                    <p className="font-semibold text-gray-800">₹{coupon.minOrderValue}</p>
                                                </div>
                                                {coupon.maxDiscount && (
                                                    <div className="bg-gray-50 rounded-lg p-2">
                                                        <p className="text-xs text-gray-500">Max Discount</p>
                                                        <p className="font-semibold text-gray-800">₹{coupon.maxDiscount}</p>
                                                    </div>
                                                )}
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500">Expiry</p>
                                                    <p className={`font-semibold text-sm ${expired ? "text-red-500" : expiringSoon ? "text-orange-500" : "text-gray-800"}`}>
                                                        {new Date(coupon.expiryDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500">Usage Limit</p>
                                                    <p className="font-semibold text-gray-800">{coupon.usageLimit}</p>
                                                </div>
                                            </div>

                                            {/* Usage Progress */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="text-gray-500">Usage Progress</span>
                                                    <span className="font-semibold text-indigo-600">{coupon.usedCount}/{coupon.usageLimit}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${usagePercentage}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {expiringSoon && !expired && (
                                                <div className="mb-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                                                    <p className="text-xs text-orange-600 flex items-center gap-1">
                                                        <Clock size={12} /> ⚠️ Expiring within 3 days
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2 border-t">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    disabled={expired}
                                                    className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium ${expired ? "opacity-50 cursor-not-allowed bg-gray-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => toggleCouponStatus(coupon._id)}
                                                    disabled={expired}
                                                    className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium ${expired ? "opacity-50 cursor-not-allowed bg-gray-100" : coupon.isActive ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                                                >
                                                    {coupon.isActive ? <Ban size={16} /> : <Unlock size={16} />}
                                                    {coupon.isActive ? "Block" : "Unblock"}
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(coupon._id)}
                                                    className="px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* TABLE VIEW - ENHANCED */
                        <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                                        <tr>
                                            <th onClick={() => handleSort("code")} className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition">
                                                Code {sortField === "code" && (sortOrder === "asc" ? "↑" : "↓")}
                                            </th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Discount</th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Min Order</th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Max Discount</th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Usage</th>
                                            <th onClick={() => handleSort("expiryDate")} className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition">
                                                Expiry {sortField === "expiryDate" && (sortOrder === "asc" ? "↑" : "↓")}
                                            </th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                                            <th className="p-4 text-center font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedCoupons.map((coupon) => {
                                            const statusInfo = getStatusInfo(coupon);
                                            const expired = isExpired(coupon.expiryDate);
                                            const expiringSoon = isExpiringSoon(coupon.expiryDate);
                                            const usagePercentage = (coupon.usedCount / coupon.usageLimit) * 100;

                                            return (
                                                <tr key={coupon._id} className={`border-b hover:bg-gray-50 transition ${expired ? "bg-red-50/30" : ""}`}>
                                                    <td className="p-4 font-mono font-bold text-indigo-600">{coupon.code}</td>
                                                    <td className="p-4">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                                                            {coupon.discountType === "percentage" ? <Percent size={12} /> : <DollarSign size={12} />}
                                                            {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-medium">₹{coupon.minOrderValue}</td>
                                                    <td className="p-4">{coupon.maxDiscount ? `₹${coupon.maxDiscount}` : "-"}</td>
                                                    <td className="p-4">
                                                        <div className="w-36">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-gray-600">{coupon.usedCount}/{coupon.usageLimit}</span>
                                                                <span className="text-indigo-600 font-semibold">{Math.round(usagePercentage)}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                                                                    style={{ width: `${usagePercentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div>
                                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                                            {expiringSoon && !expired && (
                                                                <span className="block text-xs text-orange-500 mt-1">⚠️ Expiring soon</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold ${statusInfo.color}`}>
                                                            <statusInfo.icon size={12} />
                                                            {statusInfo.text}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2 justify-center">
                                                            <button
                                                                onClick={() => handleEdit(coupon)}
                                                                disabled={expired}
                                                                className={`p-2 rounded-lg transition-all ${expired ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-50 text-indigo-600"}`}
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleCouponStatus(coupon._id)}
                                                                disabled={expired}
                                                                className={`p-2 rounded-lg transition-all ${expired ? "opacity-50 cursor-not-allowed" : coupon.isActive ? "hover:bg-orange-50 text-orange-600" : "hover:bg-green-50 text-green-600"}`}
                                                                title={coupon.isActive ? "Block" : "Unblock"}
                                                            >
                                                                {coupon.isActive ? <Ban size={18} /> : <Unlock size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(coupon._id)}
                                                                className="p-2 rounded-lg transition-all hover:bg-red-50 text-red-500"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* PAGINATION - Enhanced */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 bg-white rounded-2xl shadow-sm border-0 p-4">
                            <p className="text-sm text-gray-500">
                                Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, sortedCoupons.length)} of {sortedCoupons.length} coupons
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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