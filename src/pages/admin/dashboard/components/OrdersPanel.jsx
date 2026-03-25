import { Fragment, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Package,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const [timeRange, setTimeRange] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");

  const [amountSort, setAmountSort] = useState(null); // asc | desc
  const [dateSort, setDateSort] = useState(null); // asc | desc
  const [categoryFilter, setCategoryFilter] = useState("all");
  const navigate = useNavigate();

  const [openOrder, setOpenOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token"); // 👈 IMPORTANT

      const { data } = await axios.get(
        `${API_URL}/api/v1/orders/admin/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(data);

      setOrders(data.orders || []);
    };

    fetchOrders();
  }, []);


  /* ================= TIME FILTER ================= */
  const isWithinRange = (date, range) => {
    const now = new Date();
    const d = new Date(date);

    switch (range) {
      case "today":
        return d.toDateString() === now.toDateString();
      case "7days":
        return d >= new Date(new Date().setDate(now.getDate() - 7));
      case "1month":
        return d >= new Date(new Date().setMonth(now.getMonth() - 1));
      case "6months":
        return d >= new Date(new Date().setMonth(now.getMonth() - 6));
      case "1year":
        return d >= new Date(new Date().setFullYear(now.getFullYear() - 1));
      default:
        return true;
    }
  };

  const updateOrder = async (orderId, payload) => {
    const token = localStorage.getItem("token");

    const { data } = await axios.put(
      `${API_URL}/api/v1/orders/admin/order/${orderId}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // ✅ always use updated order from backend
    setOrders(prev =>
      prev.map(o =>
        o._id === orderId ? data.order : o
      )
    );
  };


  /* ================= CATEGORIES (AUTO FROM ORDERS) ================= */
  const categories = useMemo(() => {
    const set = new Set();

    orders.forEach(order => {
      order.orderItems?.forEach(item => {
        const cat =
          item.categoryName ||
          item.category?.name;

        if (cat) set.add(cat);
      });
    });

    return ["all", ...Array.from(set)];
  }, [orders]);


  const filteredOrders = useMemo(() => {
    let temp = [...orders];

    /* ================= TIME FILTER ================= */
    temp = temp.filter(order =>
      isWithinRange(order.createdAt, timeRange)
    );

    /* ================= STATUS FILTER ================= */
    if (statusFilter !== "all") {
      temp = temp.filter(
        order => order.orderStatus === statusFilter
      );
    }

    /* ================= CATEGORY FILTER ================= */
    if (categoryFilter !== "all") {
      temp = temp.filter(order => {
        const category =
          order.orderItems?.[0]?.categoryName ||
          order.orderItems?.[0]?.category?.name;

        return category === categoryFilter;
      });
    }

    /* ================= SORTING ================= */
    if (amountSort) {
      temp.sort((a, b) =>
        amountSort === "asc"
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount
      );
    } else if (dateSort) {
      temp.sort((a, b) =>
        dateSort === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return temp;
  }, [
    orders,
    timeRange,
    statusFilter,
    categoryFilter,
    amountSort,
    dateSort,
  ]);

  /* ================= STATS ================= */
  const revenue = filteredOrders
    .filter(o => o.paymentStatus === "Completed")
    .reduce((sum, o) => sum + o.totalAmount, 0);


  const statusColor = status => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Shipped":
        return "bg-indigo-100 text-indigo-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const StatCard = ({ icon, title, value, gradient }) => (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}
    >
      {/* glow */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl" />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <h3 className="text-3xl font-extrabold mt-1 tracking-tight">
            {value}
          </h3>
        </div>

        <div className="bg-white/20 p-3 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
  console.log(orders);


  return (
    <>
      <div className="space-y-6  mb-15">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* TITLE */}
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Orders Analytics
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Overview of order performance & revenue
            </p>
          </div>

          {/* TIME FILTER */}
          <div className="flex gap-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full p-1 shadow-sm">
            {timeButtons.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTimeRange(key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all
          ${timeRange === key
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-6">
          <StatCard
            icon={<Package className="w-6 h-6" />}
            title="Total Orders"
            value={filteredOrders.length}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
          />

          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Pending Orders"
            value={filteredOrders.filter(o => o.orderStatus === "Pending").length}
            gradient="bg-gradient-to-br from-yellow-400 to-orange-500"
          />

          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Delivered"
            value={filteredOrders.filter(o => o.orderStatus === "Delivered").length}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />

          <StatCard
            icon={<XCircle className="w-6 h-6" />}
            title="Cancelled"
            value={filteredOrders.filter(o => o.orderStatus === "Cancelled").length}
            gradient="bg-gradient-to-br from-red-500 to-rose-600"
          />

          <StatCard
            icon={<IndianRupee className="w-6 h-6" />}
            title="Total Revenue"
            value={`₹${revenue}`}
            gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600"
          />
        </div>



        {/* ================= FILTER BAR ================= */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-center">
          <select
            className="border rounded-lg px-3 py-2"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => {
              setAmountSort(amountSort === "asc" ? "desc" : "asc");
              setDateSort(null); // 👈 VERY IMPORTANT
            }}
            className="px-4 py-2 border rounded-lg"
          >
            Amount {amountSort === "asc" ? "↑" : "↓"}
          </button>

          <button
            onClick={() => {
              setDateSort(dateSort === "asc" ? "desc" : "asc");
              setAmountSort(null); // 👈 VERY IMPORTANT
            }}
            className="px-4 py-2 border rounded-lg"
          >
            Date {dateSort === "asc" ? "↑" : "↓"}
          </button>

          <select
            className="border rounded-lg px-3 py-2"
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

        {/* ================= ORDERS TABLE ================= */}

        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_45px_rgba(0,0,0,0.18)] transition-all p-5">
          <div className="overflow-x-auto">

            <table className="w-full text-sm border-separate border-spacing-y-3">
              {/* ================= HEADER ================= */}
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs uppercase tracking-wider rounded-xl">
                  <th className="p-4 text-left rounded-l-xl">Customer</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Order</th>
                  <th className="p-4 text-left">Payment</th>
                  <th className="p-4 text-left rounded-r-xl">Status</th>
                </tr>
              </thead>

              {/* ================= BODY ================= */}
              <tbody className="relative">
                {filteredOrders.map((order, index) => (
                  <Fragment key={order._id}>

                    {/* ===== SUMMARY ROW ===== */}
                    <tr
                      onClick={() =>
                        setOpenOrder(openOrder === order._id ? null : order._id)
                      }
                      className={`
          group
          transition-all duration-300
          cursor-pointer
          backdrop-blur-md
          ${index % 2 === 0
                          ? "bg-white"
                          : "bg-gradient-to-r from-gray-50 to-indigo-50/40"}
          hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
          hover:shadow-[0_8px_25px_rgba(99,102,241,0.15)]
          hover:-translate-y-[2px]
          ${openOrder === order._id
                          ? "ring-2 ring-indigo-400 bg-indigo-50"
                          : "ring-1 ring-gray-200"}
        `}
                    >
                      {/* CUSTOMER */}
                      <td className="p-4">
                        <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition">
                          {order.addresses?.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          📞 {order.addresses?.phone}
                        </p>
                      </td>

                      {/* AMOUNT */}
                      <td className="p-4 font-bold text-gray-900">
                        <span className="px-3 py-1 rounded-lg bg-gray-100 group-hover:bg-indigo-100 transition">
                          ₹{order.totalAmount}
                        </span>
                      </td>

                      {/* CATEGORY */}
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 shadow-sm">
                          {order.orderItems?.[0]?.categoryName ||
                            order.orderItems?.[0]?.category?.name ||
                            "N/A"}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </td>

                      {/* ORDER STATUS */}
                      <td className="p-4">
                        <select
                          value={order.orderStatus}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateOrder(order._id, { orderStatus: e.target.value })
                          }
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold outline-none border shadow-sm transition
            focus:ring-2 focus:ring-indigo-400
            ${statusColor(order.orderStatus)}`}
                        >
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>

                      {/* PAYMENT METHOD */}
                      <td className="p-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-md bg-gray-100">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* PAYMENT STATUS */}
                      <td className="p-4">
                        <select
                          value={order.paymentStatus}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateOrder(order._id, { paymentStatus: e.target.value })
                          }
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold outline-none border shadow-sm transition
            focus:ring-2 focus:ring-indigo-400
            ${order.paymentStatus === "Paid"
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-500"
                              : order.paymentStatus === "Failed"
                                ? "bg-gradient-to-r from-red-400 to-rose-500 text-white border-red-500"
                                : "bg-gradient-to-r from-yellow-300 to-orange-400 text-white border-yellow-400"
                            }`}
                        >
                          <option>Pending</option>
                          <option>Paid</option>
                          <option>Failed</option>
                        </select>
                      </td>
                    </tr>

                    {/* ===== EXPANDED DETAILS ===== */}
                    {openOrder === order._id && (
                      <tr>
                        <td
                          colSpan={7}
                          className="bg-gradient-to-br from-white to-indigo-50 p-6 animate-fadeIn"
                        >
                          <div className="grid md:grid-cols-3 gap-4">

                            {/* USER DETAILS CARD */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                if (order.user?._id) {
                                  navigate(`/admin/users/${order.user._id}`);
                                }
                              }}
                              className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
                            >
                              <h4 className="font-bold text-gray-800 mb-2">
                                👤 User Details
                              </h4>

                              <p className="text-sm text-gray-600 leading-relaxed">
                                {order.user?.firstName} {order.user?.lastName}
                                <br />
                                {order.user?.email}
                              </p>

                              <p className="text-xs text-indigo-600 mt-3 font-medium">
                                Click to view full profile →
                              </p>
                            </div>

                            {/* ADDRESS CARD */}
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border shadow-sm hover:shadow-lg transition">
                              <h4 className="font-bold text-gray-800 mb-2">
                                📦 Delivery Address
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {order.addresses?.fullName}
                                <br />
                                {order.addresses?.address}, {order.addresses?.city}
                                <br />
                                {order.addresses?.state} - {order.addresses?.pincode}
                                <br />
                                📞 {order.addresses?.phone}
                              </p>
                            </div>

                            {/* PRODUCTS */}
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border shadow-sm hover:shadow-lg transition">
                              <h4 className="font-bold text-gray-800 mb-3">
                                🛒 Ordered Products
                              </h4>

                              <div className="space-y-3">
                                {order.orderItems.map((item) => (
                                  <div
                                    key={item._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/admin/product/view/${item.slug}`);
                                    }}
                                    className="flex items-center gap-4 p-3 rounded-xl border hover:shadow-md hover:-translate-y-1 transition cursor-pointer bg-white"
                                  >
                                    <img
                                      src={item.image}
                                      alt={item.productName}
                                      className="w-16 h-16 rounded-xl object-cover hover:scale-105 transition"
                                    />

                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900">
                                        {item.productName}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Qty: {item.quantity}
                                      </p>
                                    </div>

                                    <div className="font-bold text-gray-900">
                                      ₹{item.price}
                                    </div>
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
              </tbody>


            </table>
          </div>
        </div>


      </div>
      <FooterNavbar />
    </>
  );
};

export default OrdersPanel;

/* ================= STAT CARD ================= */
const Stat = ({ icon, title, value }) => (
  <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
    <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </div>
);
