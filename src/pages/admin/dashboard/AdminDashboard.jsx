import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userOrdersLoading, setUserOrdersLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/v1/orders/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/v1/orders/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders of specific user
  const fetchUserOrders = async (userId) => {
    try {
      setUserOrdersLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/v1/orders/admin/user/${userId}/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setSelectedUserOrders(data.orders);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user orders");
    } finally {
      setUserOrdersLoading(false);
    }
  };

  // Update order status
  const updateStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      await fetch(`http://localhost:5000/api/v1/orders/admin/order/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      toast.success("Order updated successfully");
      fetchOrders();
      if (selectedUserOrders.length) fetchUserOrders(selectedUserOrders[0]?.user._id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    }
  };

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-10 space-y-6">
        <h2 className="text-3xl font-bold text-center">Admin Dashboard</h2>

        {/* Tabs */}
        <div className="flex gap-2 justify-center">
          {["orders", "users"].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-md font-semibold ${
                activeTab === tab ? "bg-black text-white" : "bg-gray-200 text-black"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "orders" ? "Orders" : "Users"}
            </button>
          ))}
        </div>

        {loading && <p className="text-center">Loading...</p>}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {orders.map((order) => (
              <details
                key={order._id}
                className="bg-white p-4 rounded-md shadow"
              >
                <summary className="cursor-pointer font-semibold flex justify-between items-center">
                  <span>
                    {order.user.firstName} {order.user.lastName} | ₹{order.totalAmount}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    order.orderStatus === "Delivered" ? "bg-green-100" :
                    order.orderStatus === "Cancelled" ? "bg-red-100" : "bg-yellow-100"
                  }`}>
                    {order.orderStatus}
                  </span>
                </summary>
                <div className="mt-2 space-y-2">
                  <p><b>Email:</b> {order.user.email}</p>
                  <p>
                    <b>Order Status:</b>{" "}
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        updateStatus(order._id, e.target.value, order.paymentStatus)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option>Pending</option>
                      <option>Processing</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </p>
                  <p>
                    <b>Payment Status:</b>{" "}
                    <select
                      value={order.paymentStatus}
                      onChange={(e) =>
                        updateStatus(order._id, order.orderStatus, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option>Pending</option>
                      <option>Completed</option>
                      <option>Failed</option>
                    </select>
                  </p>
                  <hr />
                  <div className="space-y-1">
                    {order.orderItems.map((item, i) => (
                      <p key={i}>
                        {item.name} × {item.quantity} — ₹{item.price}
                      </p>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="flex gap-4">
            {/* Users List */}
            <div className="w-1/3 max-h-[70vh] overflow-y-auto space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-white p-3 rounded-md shadow cursor-pointer hover:bg-gray-100"
                  onClick={() => fetchUserOrders(user._id)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt="profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{user.firstName} {user.lastName}</p>
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-gray-500">Role: {user.role}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    {user.addresses?.length ? (
                      user.addresses.map((addr, i) => (
                        <p key={i}>
                          {addr.address}, {addr.city}, {addr.state} – {addr.pincode}
                        </p>
                      ))
                    ) : (
                      <p>No address</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected User Orders */}
            <div className="flex-1 max-h-[70vh] overflow-y-auto space-y-4">
              {userOrdersLoading && <p>Loading...</p>}
              {selectedUserOrders.map((order) => (
                <div key={order._id} className="bg-white p-4 rounded-md shadow">
                  <div className="flex justify-between">
                    <span>Order ₹{order.totalAmount}</span>
                    <span>{order.orderStatus}</span>
                  </div>
                  <div className="mt-2">
                    {order.orderItems.map((item, i) => (
                      <p key={i}>{item.name} × {item.quantity} — ₹{item.price}</p>
                    ))}
                  </div>
                </div>
              ))}
              {!userOrdersLoading && selectedUserOrders.length === 0 && (
                <p>Select a user to see their orders</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
