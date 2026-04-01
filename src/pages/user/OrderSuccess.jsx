// src/pages/user/OrderSuccess.jsx
import { Link, useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;
const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const navigate = useNavigate();
  // Set window size for confetti
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");

      // ❌ NO TOKEN
      if (!token) {
        toast.error("Please login to view order");

        navigate("/login", {
          state: { from: `/ordersuccess/${orderId}` },
        });

        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/v1/orders/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (!data.success) {
          throw new Error("Order fetch failed");
        }

        if (!res.ok) {
          if (res.status === 401) {
            navigate("/login", { state: { from: `/ordersuccess/${orderId}` } });
          } else {
            toast.error("Something went wrong");
          }
          return;
        }

        setOrder(data.order);
        setShowConfetti(true);

        setTimeout(() => setShowConfetti(false), 8000);

      } catch (err) {
        toast.error("Failed to load order");
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <p className="text-gray-600 text-lg">Loading your order…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* ================= CELEBRATION ANIMATIONS ================= */}
      {showConfetti && (
        <div className="absolute inset-0 z-[999] pointer-events-none">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={400}
            gravity={0.4}
            initialVelocityX={{ min: -15, max: 15 }}
            initialVelocityY={{ min: -25, max: -5 }}
            recycle={false}
          />
          {/* 🔹 Optional: Lottie fireworks/flower animation overlay here */}
        </div>
      )}

      {/* ================= PAGE WRAPPER ================= */}
      <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-pink-50 px-4">

        {/* ================= ORDER CARD ================= */}
        <motion.div
          initial={{ opacity: 0, y: 200 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, duration: 1.5 }}
          className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center w-full max-w-md relative z-10"
        >
          {/* ICON */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ type: "spring", stiffness: 500, damping: 15, duration: 1 }}
            className="flex justify-center"
          >
            <CheckCircle className="text-green-600" size={64} />
          </motion.div>

          {/* TITLE */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-5 text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Order Confirmed! 🎉
          </motion.h1>

          {/* THANK YOU TEXT */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-4 text-gray-600 max-w-xs mx-auto"
          >
            Thank you for shopping with <span className="font-semibold">Gt Shop</span>. Your order is now confirmed and will be delivered soon.
          </motion.p>

          {/* ORDER ID */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-4 text-sm text-gray-500 break-all"
          >
            <span className="font-medium text-gray-700">Order ID:</span> {order._id}
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-8 flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/myorders"
              className="flex-1 bg-pink-500 text-white py-3 rounded-2xl font-semibold hover:bg-pink-600 transition text-center"
            >
              View My Orders
            </Link>

            <Link
              to="/"
              className="flex-1 border border-gray-300 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition text-center"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <FooterNavbar />
    </>
  );
};

export default OrderSuccess;