import { Fragment, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Package,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Filter,
  Calendar,
  ShoppingBag,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Eye,
  Truck,
  CreditCard,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";

const API_URL = import.meta.env.VITE_API_URL;

/* ================= TIME BUTTONS ================= */
const timeButtons = [
  ["today", "Today"],
  ["7days", "7 Days"],
  ["1month", "1 Month"],
  ["6months", "6 Months"],
  ["1year", "1 Year"],
  ["all", "Overall"],
];

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountSort, setAmountSort] = useState(null);
  const [dateSort, setDateSort] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [openOrder, setOpenOrder] = useState(null);
  const [updating, setUpdating] = useState({ id: null, field: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/v1/orders/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isWithinRange = (date, range) => {
    const now = new Date();
    const d = new Date(date);
    switch (range) {
      case "today": return d.toDateString() === now.toDateString();
      case "7days": return d >= new Date(new Date().setDate(now.getDate() - 7));
      case "1month": return d >= new Date(new Date().setMonth(now.getMonth() - 1));
      case "6months": return d >= new Date(new Date().setMonth(now.getMonth() - 6));
      case "1year": return d >= new Date(new Date().setFullYear(now.getFullYear() - 1));
      default: return true;
    }
  };

  const updateOrder = async (orderId, payload) => {
    const token = localStorage.getItem("token");
    setUpdating({ id: orderId, field: Object.keys(payload)[0] });
    try {
      const { data } = await axios.put(`${API_URL}/api/v1/orders/admin/order/${orderId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating({ id: null, field: null });
    }
  };

  const categories = useMemo(() => {
    const set = new Set();
    orders.forEach(order => {
      order.orderItems?.forEach(item => {
        const cat = item.categoryName || item.category?.name;
        if (cat) set.add(cat);
      });
    });
    return ["all", ...Array.from(set)];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let temp = [...orders];
    temp = temp.filter(order => isWithinRange(order.createdAt, timeRange));
    if (statusFilter !== "all") {
      temp = temp.filter(order => order.orderStatus === statusFilter);
    }
    if (categoryFilter !== "all") {
      temp = temp.filter(order => {
        const category = order.orderItems?.[0]?.categoryName || order.orderItems?.[0]?.category?.name;
        return category === categoryFilter;
      });
    }
    if (amountSort) {
      temp.sort((a, b) => amountSort === "asc" ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount);
    } else if (dateSort) {
      temp.sort((a, b) => dateSort === "asc" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt));
    }
    return temp;
  }, [orders, timeRange, statusFilter, categoryFilter, amountSort, dateSort]);

  const revenue = filteredOrders
    .filter(o => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "shipped": return "bg-indigo-100 text-indigo-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const paymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-700";
      case "failed": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const StatCard = ({ icon: Icon, title, value, gradient, trend }) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient} hover:shadow-xl transition-all transform hover:-translate-y-1`}>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl" />
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <h3 className="text-2xl font-extrabold mt-1 tracking-tight">{value}</h3>
          {trend && <p className="text-xs opacity-75 mt-1">{trend}</p>}
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="animate-spin text-indigo-600" size={40} />
            <p className="text-gray-500">Loading orders...</p>
          </div>
        </div>
        <FooterNavbar />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-15">
        
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <Package className="text-white" size={24} />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Orders Analytics
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Overview of order performance, revenue, and customer insights
              </p>
            </div>

            {/* TIME FILTER */}
            <div className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full p-1 shadow-sm">
              {timeButtons.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTimeRange(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    timeRange === key
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={Package}
              title="Total Orders"
              value={filteredOrders.length}
              gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
            />
            <StatCard
              icon={Clock}
              title="Pending Orders"
              value={filteredOrders.filter(o => o.orderStatus === "Pending").length}
              gradient="bg-gradient-to-br from-yellow-400 to-orange-500"
            />
            <StatCard
              icon={Truck}
              title="Processing & Shipped"
              value={filteredOrders.filter(o => o.orderStatus === "Processing" || o.orderStatus === "Shipped").length}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
            />
            <StatCard
              icon={CheckCircle}
              title="Delivered"
              value={filteredOrders.filter(o => o.orderStatus === "Delivered").length}
              gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            />
            <StatCard
              icon={XCircle}
              title="Cancelled"
              value={filteredOrders.filter(o => o.orderStatus === "Cancelled").length}
              gradient="bg-gradient-to-br from-red-500 to-rose-600"
            />
          </div>

          {/* REVENUE & STATS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <h2 className="text-3xl font-bold">₹{revenue.toLocaleString()}</h2>
                  <p className="text-xs opacity-75 mt-1">From {filteredOrders.length} orders</p>
                </div>
                <TrendingUp size={40} className="opacity-80" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Order Value</p>
                  <h2 className="text-3xl font-bold text-gray-800">
                    ₹{(filteredOrders.length > 0 ? revenue / filteredOrders.length : 0).toFixed(2)}
                  </h2>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <TrendingUp size={24} className="text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white rounded-2xl shadow-lg border-0 p-5">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
                <Filter size={16} className="text-gray-500" />
                <select
                  className="bg-transparent outline-none text-sm"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
                <ShoppingBag size={16} className="text-gray-500" />
                <select
                  className="bg-transparent outline-none text-sm"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setAmountSort(amountSort === "asc" ? "desc" : "asc");
                  setDateSort(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  amountSort ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Amount {amountSort === "asc" ? "↑" : "↓"}
              </button>

              <button
                onClick={() => {
                  setDateSort(dateSort === "asc" ? "desc" : "asc");
                  setAmountSort(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  dateSort ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Date {dateSort === "asc" ? "↑" : "↓"}
              </button>

              <button
                onClick={fetchOrders}
                className="ml-auto px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
          </div>

          {/* ORDERS TABLE */}
          <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="p-4 text-left rounded-l-xl">Customer</th>
                    <th className="p-4 text-left">Amount</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Order Status</th>
                    <th className="p-4 text-left">Payment</th>
                    <th className="p-4 text-left rounded-r-xl">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <Fragment key={order._id}>
                      <tr
                        onClick={() => setOpenOrder(openOrder === order._id ? null : order._id)}
                        className="hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-gray-900">{order.addresses?.fullName || "N/A"}</p>
                            <p className="text-xs text-gray-500">{order.user?.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold">
                            ₹{order.totalAmount}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            {order.orderItems?.[0]?.categoryName || order.orderItems?.[0]?.category?.name || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <select
                            value={order.orderStatus}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateOrder(order._id, { orderStatus: e.target.value })}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold outline-none border shadow-sm transition cursor-pointer ${statusColor(order.orderStatus)}`}
                            disabled={updating.id === order._id && updating.field === "orderStatus"}
                          >
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={order.paymentStatus}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateOrder(order._id, { paymentStatus: e.target.value })}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold outline-none border shadow-sm transition cursor-pointer ${paymentStatusColor(order.paymentStatus)}`}
                            disabled={updating.id === order._id && updating.field === "paymentStatus"}
                          >
                            <option>Pending</option>
                            <option>Paid</option>
                            <option>Failed</option>
                          </select>
                        </td>
                      </tr>

                      {/* EXPANDED DETAILS */}
                      {openOrder === order._id && (
                        <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                          <td colSpan="7" className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {/* User Details */}
                              <div
                                onClick={() => order.user?._id && navigate(`/admin/users/${order.user._id}`)}
                                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <User size={18} className="text-indigo-600" />
                                  <h4 className="font-semibold text-gray-800">User Details</h4>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">{order.user?.firstName} {order.user?.lastName}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <Mail size={12} /> {order.user?.email}
                                </p>
                                <p className="text-xs text-indigo-600 mt-3 group-hover:underline">Click to view full profile →</p>
                              </div>

                              {/* Delivery Address */}
                              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                  <MapPin size={18} className="text-green-600" />
                                  <h4 className="font-semibold text-gray-800">Delivery Address</h4>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">{order.addresses?.fullName}</p>
                                <p className="text-xs text-gray-500 mt-1">{order.addresses?.address}, {order.addresses?.city}</p>
                                <p className="text-xs text-gray-500">{order.addresses?.state} - {order.addresses?.pincode}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <Phone size={12} /> {order.addresses?.phone}
                                </p>
                              </div>

                              {/* Products */}
                              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                  <ShoppingBag size={18} className="text-purple-600" />
                                  <h4 className="font-semibold text-gray-800">Ordered Products</h4>
                                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {order.orderItems?.map((item) => (
                                    <div
                                      key={item._id}
                                      onClick={() => navigate(`/admin/product/view/${item.slug}`)}
                                      className="flex items-center gap-3 p-2 rounded-lg border hover:bg-gray-50 transition-all cursor-pointer group"
                                    >
                                      <img
                                        src={item.image}
                                        alt={item.productName}
                                        className="w-14 h-14 rounded-lg object-cover"
                                      />
                                      <div className="flex-1">
                                        <p className="font-semibold text-sm text-gray-800 group-hover:text-indigo-600">
                                          {item.productName}
                                        </p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                      </div>
                                      <p className="font-bold text-indigo-600">₹{item.price}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-14">
                        <div className="flex flex-col items-center gap-3">
                          <Package size={48} className="text-gray-300" />
                          <p className="text-gray-400">No orders found for the selected period</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <FooterNavbar />
    </>
  );
};

export default OrdersPanel;