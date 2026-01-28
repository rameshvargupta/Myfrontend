// import Navbar from "@/components/Navbar";
// import React, { useEffect, useState } from "react";
// import { toast } from "sonner";

// const AdminDashboard = () => {
//   const [activeTab, setActiveTab] = useState("orders");
//   const [orders, setOrders] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const token = localStorage.getItem("token");

//   /* ================= FETCH ORDERS ================= */
//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(
//         "http://localhost:5000/api/v1/orders/admin/orders",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const data = await res.json();
//       if (data.success) setOrders(data.orders);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= FETCH USERS ================= */
//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(
//         "http://localhost:5000/api/v1/orders/admin/users",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const data = await res.json();
//       if (data.success) setUsers(data.users);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= UPDATE ORDER STATUS ================= */
//   const updateStatus = async (orderId, orderStatus, paymentStatus) => {
//     try {
//       await fetch(
//         `http://localhost:5000/api/v1/orders/admin/order/${orderId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ orderStatus, paymentStatus }),
//         }
//       );
//       toast.success("Order updated successfully");
//       fetchOrders();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update order");
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "orders") fetchOrders();
//     if (activeTab === "users") fetchUsers();
//   }, [activeTab]);

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <Navbar />

//       <div className="max-w-7xl mx-auto px-4 pt-24 pb-10 space-y-6">
//         <h2 className="text-3xl font-bold text-center">Admin Dashboard</h2>

//         {/* ================= TABS ================= */}
//         <div className="flex justify-center gap-3">
//           {["orders", "users"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-6 py-2 rounded-md font-semibold transition ${
//                 activeTab === tab
//                   ? "bg-black text-white"
//                   : "bg-gray-200 hover:bg-gray-300"
//               }`}
//             >
//               {tab === "orders" ? "Orders" : "Users"}
//             </button>
//           ))}
//         </div>

//         {loading && <p className="text-center">Loading...</p>}

//         {/* ================= ORDERS TAB ================= */}
//         {activeTab === "orders" && (
//           <div className="space-y-4 max-h-[70vh] overflow-y-auto">
//             {orders.map((order) => (
//               <details
//                 key={order._id}
//                 className="bg-white p-4 rounded-lg shadow"
//               >
//                 <summary className="cursor-pointer flex justify-between items-center font-semibold">
//                   <span>
//                     {order.user.firstName} {order.user.lastName} — ₹
//                     {order.totalAmount}
//                   </span>
//                   <span
//                     className={`px-3 py-1 rounded-full text-sm ${
//                       order.orderStatus === "Delivered"
//                         ? "bg-green-100 text-green-700"
//                         : order.orderStatus === "Cancelled"
//                         ? "bg-red-100 text-red-700"
//                         : "bg-yellow-100 text-yellow-700"
//                     }`}
//                   >
//                     {order.orderStatus}
//                   </span>
//                 </summary>

//                 <div className="mt-4 space-y-3 text-sm">
//                   <p>
//                     <b>Email:</b> {order.user.email}
//                   </p>

//                   <div className="flex gap-4">
//                     <label>
//                       <b>Order Status</b>
//                       <select
//                         value={order.orderStatus}
//                         onChange={(e) =>
//                           updateStatus(
//                             order._id,
//                             e.target.value,
//                             order.paymentStatus
//                           )
//                         }
//                         className="ml-2 border rounded px-2 py-1"
//                       >
//                         <option>Pending</option>
//                         <option>Processing</option>
//                         <option>Shipped</option>
//                         <option>Delivered</option>
//                         <option>Cancelled</option>
//                       </select>
//                     </label>

//                     <label>
//                       <b>Payment</b>
//                       <select
//                         value={order.paymentStatus}
//                         onChange={(e) =>
//                           updateStatus(
//                             order._id,
//                             order.orderStatus,
//                             e.target.value
//                           )
//                         }
//                         className="ml-2 border rounded px-2 py-1"
//                       >
//                         <option>Pending</option>
//                         <option>Completed</option>
//                         <option>Failed</option>
//                       </select>
//                     </label>
//                   </div>

//                   <hr />

//                   <div className="space-y-1">
//                     {order.orderItems.map((item, i) => (
//                       <div key={i} className="flex justify-between">
//                         <span>
//                           {item.name} × {item.quantity}
//                         </span>
//                         <span>₹{item.price}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </details>
//             ))}
//           </div>
//         )}

//         {/* ================= USERS TAB (NO ORDERS) ================= */}
//         {activeTab === "users" && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[70vh] overflow-y-auto">
//             {users.map((user) => (
//               <div
//                 key={user._id}
//                 className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition space-y-3"
//               >
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={
//                       user.profilePic ||
//                       "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                     }
//                     className="w-14 h-14 rounded-full border"
//                   />
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-lg">
//                       {user.firstName} {user.lastName}
//                     </h3>
//                     <p className="text-sm text-gray-500">{user.email}</p>
//                   </div>
//                   <span
//                     className={`text-xs px-2 py-1 rounded-full ${
//                       user.role === "admin"
//                         ? "bg-purple-100 text-purple-700"
//                         : "bg-blue-100 text-blue-700"
//                     }`}
//                   >
//                     {user.role}
//                   </span>
//                 </div>

//                 <hr />

//                 <div className="text-sm">
//                   <p className="font-medium text-gray-700 mb-1">Address</p>
//                   {user.addresses?.length ? (
//                     user.addresses.map((addr, i) => (
//                       <p key={i} className="text-gray-600">
//                         {addr.address}, {addr.city}, {addr.state} –{" "}
//                         {addr.pincode}
//                       </p>
//                     ))
//                   ) : (
//                     <p className="text-gray-400">No address added</p>
//                   )}
//                 </div>

//                 <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
//                   <span>User ID</span>
//                   <span>{user._id.slice(-6)}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

import Navbar from "@/components/Navbar";
import { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import OrdersPanel from "./components/OrdersPanel";
import UsersPanel from "./components/UsersPanel";
import TransactionsPanel from "./components/TransactionsPanel";
import IncomePanel from "./components/IncomePanel";
import DashboardCards from "./components/DashboardCards";

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState("orders");

  const renderContent = () => {
    switch (activeView) {
      case "orders":
        return <OrdersPanel />;
      case "users":
        return <UsersPanel />;
      case "transactions":
        return <TransactionsPanel />;
      case "income":
        return <IncomePanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto pt-24 px-4 space-y-6">
        {/* ===== HEADER ===== */}
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        {/* ===== TOP STATS ===== */}
        <DashboardCards setActiveView={setActiveView} />

        {/* ===== MAIN AREA ===== */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <AdminSidebar
              activeView={activeView}
              setActiveView={setActiveView}
            />
          </div>

          {/* Content */}
          <div className="col-span-12 md:col-span-9 bg-white rounded-xl shadow p-5">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
