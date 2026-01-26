import { Link, useParams } from "react-router-dom";
import { CheckCircle, Truck, Package, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/v1/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrder(data.order);
    };
    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading your order details…</p>
      </div>
    );
  }

  return (
    <>
      <Navbar/>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-pink-50 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircle className="mx-auto text-green-600" size={80} />

            <h1 className="mt-4 text-3xl font-bold text-gray-800">
              Order Confirmed 🎉
            </h1>

            <p className="mt-2 text-gray-600">
              Thank you for shopping with <span className="font-semibold">Ecart</span>.
              <br />Your order has been successfully placed.
            </p>

            {/* Order Info */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="border rounded-xl p-4">
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-semibold break-all">{order._id}</p>
              </div>
              <div className="border rounded-xl p-4">
                <p className="text-xs text-gray-500">Order Status</p>
                <p className="font-semibold text-green-600">{order.orderStatus}</p>
              </div>
              <div className="border rounded-xl p-4">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="font-semibold">₹{order.totalAmount}</p>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                What happens next?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                <div className="flex flex-col items-center text-center">
                  <Package className="text-pink-600" />
                  <p className="mt-2 font-medium">Order Packed</p>
                  <p className="text-gray-500">We’re preparing your items</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Truck className="text-yellow-500" />
                  <p className="mt-2 font-medium">Shipped</p>
                  <p className="text-gray-500">Out for delivery soon</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <CheckCircle className="text-green-600" />
                  <p className="mt-2 font-medium">Delivered</p>
                  <p className="text-gray-500">Enjoy your purchase</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/myorders"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
              >
                View My Orders <ArrowRight size={18} />
              </Link>

              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-xl hover:bg-gray-100 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-gray-600">
            <div className="bg-white rounded-xl p-4 shadow">🔒 Secure Payments</div>
            <div className="bg-white rounded-xl p-4 shadow">🚚 Fast Delivery</div>
            <div className="bg-white rounded-xl p-4 shadow">💬 24×7 Support</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
