import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Package,
  IndianRupee,
  CalendarDays,
} from "lucide-react";

const statusStyle = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    case "Shipped":
      return "bg-blue-100 text-blue-700";
    case "Processing":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  /* ================= FETCH ALL ORDERS ================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:5000/api/v1/orders/admin/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      await fetch(
        `http://localhost:5000/api/v1/orders/admin/order/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderStatus, paymentStatus }),
        }
      );
      toast.success("Order updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update order");
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // every 30 sec

    return () => clearInterval(interval);
  }, []);


  const filteredOrders = orders.filter(
    (order) =>
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalRevenue = orders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  const deliveredCount = orders.filter(
    (o) => o.orderStatus === "Delivered"
  ).length;

  const downloadInvoice = async (orderId) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/v1/orders/invoice/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error("Invoice download failed");
  }
};


  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <input
        type="text"
        placeholder="Search by Order ID or Email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-4 py-2 w-72"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Orders</p>
          <h3 className="text-2xl font-bold">{orders.length}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Delivered</p>
          <h3 className="text-2xl font-bold text-green-600">
            {deliveredCount}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Revenue</p>
          <h3 className="text-2xl font-bold text-blue-600">
            ₹{totalRevenue}
          </h3>
        </div>
      </div>


      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package size={22} /> All User Orders
        </h2>
        <span className="text-sm text-gray-500">
          Total Orders: {orders.length}
        </span>
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading orders...</p>
      )}

      {!loading && !orders.length && (
        <p className="text-center text-gray-400">
          No orders found
        </p>
      )}

      {/* ORDERS LIST */}
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
        {filteredOrders.map((order) => (
          <details
            key={order._id}
            className="group bg-gray-50 border rounded-xl shadow-sm open:shadow-md transition"
          >
            {/* SUMMARY */}
            <summary className="cursor-pointer list-none p-5 flex flex-wrap justify-between items-center gap-4">
              {/* USER */}
              <div className="flex items-center gap-3">
                <img
                  src={
                    order.user?.profilePic ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  className="w-11 h-11 rounded-full object-cover border"
                />

                <div>
                  <p className="font-semibold text-gray-800">
                    {order.user?.firstName} {order.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.user?.email}
                  </p>
                </div>
              </div>

              {/* DATE */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays size={16} />
                {new Date(order.createdAt).toLocaleDateString()}
              </div>

              {/* AMOUNT */}
              <div className="flex items-center gap-1 font-bold text-gray-800">
                <IndianRupee size={16} />
                {order.totalAmount}
              </div>

              {/* STATUS */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyle(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus}
              </span>
            </summary>

            {/* DETAILS */}
            <div className="border-t bg-white p-5 space-y-5">
              {/* UPDATE STATUS */}
              <div className="flex flex-wrap gap-4">
                <label className="text-sm font-medium">
                  Order Status
                  <select
                    value={order.orderStatus}
                    onChange={(e) =>
                      updateStatus(
                        order._id,
                        e.target.value,
                        order.paymentStatus
                      )
                    }
                    className="ml-2 border rounded px-2 py-1"
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </label>

                <label className="text-sm font-medium">
                  Payment
                  <select
                    value={order.paymentStatus}
                    onChange={(e) =>
                      updateStatus(
                        order._id,
                        order.orderStatus,
                        e.target.value
                      )
                    }
                    className="ml-2 border rounded px-2 py-1"
                  >
                    <option>Pending</option>
                    <option>Completed</option>
                    <option>Failed</option>
                  </select>
                </label>

                <button
                  onClick={() => downloadInvoice(order._id)}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Download Invoice
                </button>

              </div>

              {/* ITEMS */}
              <div className="space-y-3">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center border rounded-lg p-3">
                    <img
                      src={item.image || "/placeholder.png"}
                      className="w-14 h-14 rounded-md object-cover border"
                    />

                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold">₹{item.price}</p>
                  </div>

                ))}
              </div>
            </div>
          </details>
        ))}
      </div>


    </div>
  );
};

export default OrdersPanel;
