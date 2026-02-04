import { Link, useParams } from "react-router-dom";
import {
  CheckCircle,
  Truck,
  Package,
  ArrowRight,
  CreditCard,
  MapPin
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/v1/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) setOrder(data.order);
    };
    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <p className="text-gray-600 text-lg">
            Loading your order details…
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* PAGE WRAPPER */}
      <div className="bg-gradient-to-br from-green-50 via-white to-pink-50">
        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* ================= SUCCESS CARD ================= */}
          <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.12)]
                          p-6 sm:p-10 text-center">

            {/* ICON */}
            <div className="flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="text-green-600" size={64} />
              </div>
            </div>

            {/* TITLE */}
            <h1 className="mt-5 text-3xl sm:text-4xl font-bold text-gray-900">
              Order Confirmed 🎉
            </h1>

            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              Thank you for shopping with{" "}
              <span className="font-semibold text-gray-800">
                Ecart
              </span>.
              Your order has been placed successfully and is now being processed.
            </p>

            {/* ================= ORDER INFO ================= */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="border rounded-2xl p-4">
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-semibold break-all">
                  {order._id}
                </p>
              </div>

              <div className="border rounded-2xl p-4">
                <p className="text-xs text-gray-500">Order Status</p>
                <p className="font-semibold text-green-600">
                  {order.orderStatus}
                </p>
              </div>

              <div className="border rounded-2xl p-4">
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="font-semibold text-lg">
                  ₹{order.totalAmount}
                </p>
              </div>
            </div>

            {/* ================= EXTRA INFO ================= */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="flex gap-3 items-start border rounded-2xl p-4">
                <CreditCard className="text-pink-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start border rounded-2xl p-4">
                <MapPin className="text-pink-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="font-medium text-sm">
                    {order.addresses?.fullName},{" "}
                    {order.addresses?.city}
                  </p>
                </div>
              </div>
            </div>

            {/* ================= TIMELINE ================= */}
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">
                What happens next?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-pink-100 rounded-full p-3">
                    <Package className="text-pink-600" />
                  </div>
                  <p className="mt-2 font-medium">Order Packed</p>
                  <p className="text-gray-500">
                    We’re preparing your items
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="bg-yellow-100 rounded-full p-3">
                    <Truck className="text-yellow-600" />
                  </div>
                  <p className="mt-2 font-medium">Shipped</p>
                  <p className="text-gray-500">
                    Out for delivery soon
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle className="text-green-600" />
                  </div>
                  <p className="mt-2 font-medium">Delivered</p>
                  <p className="text-gray-500">
                    Enjoy your purchase
                  </p>
                </div>
              </div>
            </div>

            {/* ================= CTA ================= */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/myorders"
                className="flex-1 flex items-center justify-center gap-2
                           bg-pink-500 text-white py-4 rounded-2xl
                           font-semibold hover:bg-pink-600 transition"
              >
                View My Orders <ArrowRight size={18} />
              </Link>

              <Link
                to="/products"
                className="flex-1 flex items-center justify-center gap-2
                           border border-gray-300 py-4 rounded-2xl
                           font-semibold hover:bg-gray-100 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* ================= TRUST BADGES ================= */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-gray-600">
            <div className="bg-white rounded-2xl p-4 shadow">
              🔒 Secure Payments
            </div>
            <div className="bg-white rounded-2xl p-4 shadow">
              🚚 Fast Delivery
            </div>
            <div className="bg-white rounded-2xl p-4 shadow">
              💬 24×7 Support
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
