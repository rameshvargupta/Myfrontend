import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const UserOrders = ({ user, token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/v1/orders/admin/user/${user._id}/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="space-y-4">
      {/* User Header */}
      <div className="bg-white p-4 rounded shadow flex items-center gap-4">
        <img
          src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          className="w-14 h-14 rounded-full"
        />
        <div>
          <h3 className="font-bold text-lg">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Orders */}
      {orders.length === 0 && (
        <p className="text-gray-500">No orders found</p>
      )}

      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white p-4 rounded-md shadow space-y-3"
        >
          {/* Order Header */}
          <div className="flex justify-between items-center">
            <p className="font-semibold">
              Order ID: <span className="text-sm">{order._id.slice(-6)}</span>
            </p>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                order.orderStatus === "Delivered"
                  ? "bg-green-100 text-green-700"
                  : order.orderStatus === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.orderStatus}
            </span>
          </div>

          {/* Items */}
          <div className="border-t pt-2 space-y-1">
            {order.orderItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{item.price}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center border-t pt-2 text-sm">
            <p>
              <b>Total:</b> ₹{order.totalAmount}
            </p>
            <p className="text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserOrders;
