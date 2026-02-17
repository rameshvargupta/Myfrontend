
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
const ORDERS_PER_PAGE = 2;

const AdminUserDetails = () => {
    const { id } = useParams();


    const token = localStorage.getItem("token");

    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");
    const [search, setSearch] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
        loadData();
    }, [id, statusFilter, paymentFilter]);

    const loadData = async () => {
        try {
            setLoading(true);

            const [userRes, ordersRes] = await Promise.all([
                fetch(`http://localhost:5000/api/v1/orders/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`http://localhost:5000/api/v1/orders/admin/user/${id}/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const userData = await userRes.json();
            const ordersData = await ordersRes.json();

            if (!userData.success) throw new Error(userData.message);

            const rawOrders = ordersData.orders || [];

            // ✅ RAW orders save
            setAllOrders(rawOrders);

            // ✅ UI filter apply
            let filteredOrders = rawOrders;

            if (statusFilter !== "All") {
                filteredOrders = filteredOrders.filter(
                    o => o.orderStatus === statusFilter
                );
            }

            if (paymentFilter !== "All") {
                filteredOrders = filteredOrders.filter(
                    o => o.paymentStatus === paymentFilter
                );
            }

            setOrders(filteredOrders);
            setUser(userData.user);
        } catch (err) {
            toast.error(err.message || "Failed to load user");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-lg text-gray-500">Loading user details...</p>
            </div>
        );
    }




    // ===== Pagination Logic =====
    const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

    const paginatedOrders = orders.slice(
        (currentPage - 1) * ORDERS_PER_PAGE,
        currentPage * ORDERS_PER_PAGE
    );


    const totalOrders = allOrders.length;

    const validOrders = allOrders.filter(
        o =>
            o.orderStatus === "Delivered" &&
            o.paymentStatus === "Completed"
    );

    const deliveredOrders = validOrders.length;

   const totalPurchaseAmount = validOrders.reduce(
  (sum, order) => sum + Number(order.totalAmount || 0),
  0
);

    const chartData = [
        { name: "Total Orders", value: totalOrders },
        { name: "Delivered", value: deliveredOrders },
        {
            name: "Pending",
            value: orders.filter(o => o.orderStatus === "Pending").length
        },
    ];
    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">

            {/* ===== USER PROFILE ===== */}

            <div className="bg-white shadow-xl rounded-xl p-4 sm:p-6 space-y-6">

                {/* ===== TOP PROFILE SECTION ===== */}
                <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">

                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                        {user.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt="Profile"
                                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-indigo-500"
                            />
                        ) : (
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold border-4 border-indigo-500">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 w-full">
                        <h2 className="text-2xl font-bold text-gray-800 text-center lg:text-left">
                            {user.firstName} {user.lastName}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                            <Info label="Email" value={user.email} />
                            <Info label="Mobile" value={user.phoneNo || "N/A"} />

                            <Info
                                label="Role"
                                value={
                                    <span className="px-3 py-1 rounded-full text-xs bg-indigo-600 text-white">
                                        {user.role}
                                    </span>
                                }
                            />

                            <Info
                                label="Account Status"
                                value={
                                    <span className={`px-3 py-1 rounded-full text-xs text-white
              ${user.isBlocked ? "bg-red-500" : "bg-green-500"}`}>
                                        {user.isBlocked ? "Blocked" : "Active"}
                                    </span>
                                }
                            />

                            <Info
                                label="Email Verified"
                                value={
                                    <span className={`px-3 py-1 rounded-full text-xs text-white
              ${user.isVerified ? "bg-green-500" : "bg-yellow-500"}`}>
                                        {user.isVerified ? "Verified" : "Not Verified"}
                                    </span>
                                }
                            />

                            <Info
                                label="Logged In"
                                value={
                                    <span className={`px-3 py-1 rounded-full text-xs text-white
              ${user.isLoggedIn ? "bg-green-500" : "bg-gray-400"}`}>
                                        {user.isLoggedIn ? "Yes" : "No"}
                                    </span>
                                }
                            />

                            <Info label="Signup Date" value={new Date(user.createdAt).toLocaleString()} />
                            <Info label="Last Update" value={new Date(user.updatedAt).toLocaleString()} />
                        </div>
                    </div>
                </div>

                {/* ===== USER STATS ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Orders"
                        value={totalOrders}
                        color="indigo"
                    />
                    <StatCard
                        title="Total Purchase"
                        value={`₹${totalPurchaseAmount.toLocaleString()}`}
                        color="green"
                    />
                    <StatCard
                        title="Delivered Orders"
                        value={deliveredOrders}
                        color="yellow"
                    />
                </div>

                {/* ===== CHART ===== */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold mb-4">
                        Order Overview
                    </h2>

                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>


            {/* ===== SEARCH ===== */}
            <input
                type="text"
                placeholder="Search product or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-4 py-2 rounded w-full md:w-1/3"
            />

            {/* ===== ORDERS ===== */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Orders ({orders.length})
                </h2>

                {/* Filters */}
                <div className="flex gap-4 mb-4">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border px-3 py-1 rounded">
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="border px-3 py-1 rounded">
                        <option value="All">All Payment</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {paginatedOrders.map(order => {
                    const filteredItems = order.orderItems.filter(item =>
                        item.productId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        item.category?.name?.toLowerCase().includes(search.toLowerCase())
                    );

                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={order._id} className="border rounded-lg p-4 mb-4">
                            <div className="overflow-x-auto">
                                <table className="min-w-full border">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2">Image</th>
                                            <th className="p-2">Product</th>
                                            <th className="p-2">Category</th>
                                            <th className="p-2">Qty</th>
                                            <th className="p-2">Price</th>
                                            <th className="p-2">Order</th>
                                            <th className="p-2">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.map(item => (
                                            <tr key={item._id} className="border-t">
                                                <td className="p-2">
                                                    <img src={item.image} className="w-12 h-12 rounded" />
                                                </td>
                                                <td className="p-2">{item.productId?.name}</td>
                                                <td className="p-2">{item.category?.name}</td>
                                                <td className="p-2">{item.quantity}</td>
                                                <td className="p-2">₹{item.price}</td>
                                                <td className="p-2">{order.orderStatus}</td>
                                                <td className="p-2">{order.paymentStatus}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}

                {/* Pagination Buttons */}
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-4 py-1 border rounded disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <span>Page {currentPage} of {totalPages}</span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-4 py-1 border rounded disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* ===== ADDRESSES ===== */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Addresses</h2>

                <div className="overflow-x-auto max-h-80">
                    <table className="min-w-full border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2">Full Name</th>
                                <th className="p-2">Phone</th>
                                <th className="p-2">Address</th>
                                <th className="p-2">City</th>
                                <th className="p-2">Pincode</th>
                                <th className="p-2">State</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user.addresses?.map((addr, i) => (
                                <tr key={i} className="border-t">
                                    <td className="p-2">{addr.fullName}</td>
                                    <td className="p-2">{addr.phone}</td>
                                    <td className="p-2">{addr.address}</td>
                                    <td className="p-2">{addr.city}</td>
                                    <td className="p-2">{addr.pincode}</td>
                                    <td className="p-2">{addr.state}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AdminUserDetails;





// 👇 file ke bottom me likh do
const Info = ({ label, value }) => (
    <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="font-medium text-sm break-words">
            {value}
        </div>
    </div>
);

const StatCard = ({ title, value, color }) => (
    <div className={`bg-${color}-50 rounded-xl p-4 text-center`}>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-3xl font-bold text-${color}-600`}>
            {value}
        </p>
    </div>
);
