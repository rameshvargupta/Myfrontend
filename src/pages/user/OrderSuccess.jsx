import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const OrderSuccess = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border rounded-lg shadow-md p-6 text-center">
          
          {/* ICON */}
          <CheckCircle size={70} className="mx-auto text-green-600 mb-4" />

          {/* MESSAGE */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Order Placed Successfully 🎉
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for shopping with <span className="font-semibold">Ecart</span>.
            <br />
            Your order has been placed and will be delivered soon.
          </p>

          {/* ACTION BUTTONS */}
          <div className="space-y-3">
            <Link
              to="/orders"
              className="block w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              View My Orders
            </Link>

            <Link
              to="/"
              className="block w-full border border-gray-300 py-2 rounded hover:bg-gray-100 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
