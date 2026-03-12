import React, { useEffect, useState } from "react";
import { CouponApi } from "./CouponApi";
import { toast } from "sonner";
import DeleteModal from "@/pages/DeleteModal";
import FooterNavbar from "@/components/user/FooterNavbar";
import Navbar from "@/components/Navbar";
import { MoreVertical } from "lucide-react";
const CouponPage = () => {

    const [coupons, setCoupons] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const [editId, setEditId] = useState(null);

    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderValue: "",
        maxDiscount: "",
        expiryDate: "",
        usageLimit: ""
    });

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

        window.addEventListener("click", closeMenu);

        return () => window.removeEventListener("click", closeMenu);

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

    // COPY
    const copyCoupon = (code) => {

        navigator.clipboard.writeText(code);

        toast.success("Coupon copied");

    };

    // FILTER
    const filteredCoupons = coupons.filter((c) =>
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    // STATS
    const activeCoupons = coupons.filter(c => c.isActive).length;

    const expiredCoupons = coupons.filter(
        c => new Date(c.expiryDate) < new Date()
    ).length;

    return (
        <>
            <Navbar />
            <div className="p-10 bg-gray-50 min-h-screen mb-15">

                {/* HEADER */}

                <div className="flex justify-between items-center mb-10">

                    <h1 className="text-3xl font-bold">
                        Coupon Management
                    </h1>

                </div>


                {/* STATS */}

                <div className="grid grid-cols-3 gap-6 mb-10">

                    <div className="bg-white p-6 rounded-xl shadow">
                        <p className="text-gray-500">Total Coupons</p>
                        <h2 className="text-3xl font-bold">{coupons.length}</h2>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow">
                        <p className="text-gray-500">Active Coupons</p>
                        <h2 className="text-3xl font-bold text-green-600">{activeCoupons}</h2>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow">
                        <p className="text-gray-500">Expired Coupons</p>
                        <h2 className="text-3xl font-bold text-red-500">{expiredCoupons}</h2>
                    </div>

                </div>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-4 gap-4 mb-5 bg-white p-8 rounded-xl shadow"
                >

                    <input
                        name="code"
                        value={formData.code}
                        placeholder="Coupon Code"
                        onChange={handleChange}
                        className="border p-3 rounded"
                    />

                    <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleChange}
                        className="border p-3 rounded"
                    >
                        <option value="percentage">Percentage</option>
                        <option value="flat">Flat</option>
                    </select>

                    <input
                        name="discountValue"
                        value={formData.discountValue}
                        placeholder="Discount"
                        onChange={handleChange}
                        className="border p-3 rounded"
                    />

                    <input
                        name="minOrderValue"
                        value={formData.minOrderValue}
                        placeholder="Min Order"
                        onChange={handleChange}
                        className="border p-3 rounded"
                    />

                    <input
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        placeholder="Max Discount"
                        onChange={handleChange}
                        className="border p-3 rounded"
                    />

                    <input
                        name="usageLimit"
                        value={formData.usageLimit}
                        placeholder="Usage Limit"
                        onChange={handleChange}
                        className="border p-3 rounded"
                    />

                    <input
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className="border p-3 rounded"
                    />

                    <div className="flex gap-3">

                        <button className="bg-black text-white px-6 rounded">
                            {editId ? "Update" : "Create"}
                        </button>

                        {editId && (
                            <button
                                type="button"
                                onClick={() => setEditId(null)}
                                className="bg-gray-300 px-6 rounded"
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>

                <div>
                    <input
                        placeholder="Search coupon..."
                        className="border p-3 rounded-lg w-64 mb-5"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* TABLE */}

                <div className="bg-white rounded-xl shadow overflow-visible">
                    <table className="w-full">

                        <thead className="bg-gray-100">

                            <tr>
                                <th className="p-4">Code</th>
                                <th>Discount</th>
                                <th>Min Order</th>
                                <th>Usage</th>
                                <th>Expiry</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>
                                    <td colSpan="7" className="text-center p-6">
                                        Loading...
                                    </td>
                                </tr>

                            ) : filteredCoupons.length > 0 ? (

                                filteredCoupons.map((coupon) => (

                                    <tr key={coupon._id} className="border-t text-center">

                                        <td className="p-4 flex justify-center gap-2">

                                            <button
                                                onClick={() => copyCoupon(coupon.code)}
                                                className="text-blue-800 text-xs"
                                            >
                                                {coupon.code}
                                            </button>

                                        </td>

                                        <td>
                                            {coupon.discountType === "percentage"
                                                ? `${coupon.discountValue}%`
                                                : `₹${coupon.discountValue}`}
                                        </td>

                                        <td>₹{coupon.minOrderValue}</td>

                                        <td>
                                            {coupon.usedCount}/{coupon.usageLimit}
                                        </td>

                                        <td>
                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </td>

                                        <td>
                                            <span className={`px-3 py-1 rounded-full text-sm ${coupon.isActive
                                                ? "bg-green-100 text-green-600"
                                                : "bg-red-100 text-red-600"
                                                }`}>
                                                {coupon.isActive ? "Active" : "Disabled"}
                                            </span>
                                        </td>

                                        <td className="relative">

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
                                                    className="absolute right-0 top-8 w-40 bg-white border rounded-lg shadow-lg z-50"
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

                                ))

                            ) : (

                                <tr>
                                    <td colSpan="7" className="text-center p-6">
                                        No Coupons Found
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

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