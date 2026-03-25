import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
import Navbar from "@/components/Navbar";
import AddressSection from "@/components/address/AddressSection";
import OrderSummary from "./OrderSummary";
import PaymentMethod from "./PaymentMethod";
import CouponSection from "./CouponSection";
import { updateQuantity, removeFromCart } from "@/redux/cartSlice";
import { setAddresses, selectAddress } from "@/redux/addressSlice";
import { clearCart } from "@/redux/cartSlice";

import { toast } from "sonner";
import { fetchAddresses } from "@/api/addressApi";
import FooterNavbar from "@/components/user/FooterNavbar";

const Checkout = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= BUY NOW PRODUCT ================= */

  const buyNowProduct = location.state?.buyNowProduct;

  /* ================= STATES ================= */

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  /* ================= REDUX ================= */

  const cartItems = useSelector((state) => state.cart.cartItems || []);

  // 🔹 REDUX SELECTORS
  const selectedAddress = useSelector((state) => state.address.selectedAddress);

  // 🔹 FUNCTION: calculate delivery range
  const getDeliveryRange = (pincode) => {
    if (!pincode) return null;
    const today = new Date();
    let minDays = 4, maxDays = 6;

    if (pincode.startsWith("22")) { minDays = 2; maxDays = 4; }

    const min = new Date(today);
    min.setDate(today.getDate() + minDays);

    const max = new Date(today);
    max.setDate(today.getDate() + maxDays);

    return {
      min: min.toLocaleDateString(),
      max: max.toLocaleDateString()
    };
  };

  // 🔹 COMPUTE EXPECTED DELIVERY
  const expectedDelivery = selectedAddress ? getDeliveryRange(selectedAddress.pincode) : null;


  /* ================= CHECKOUT ITEMS ================= */
  useEffect(() => {

    fetch("/api/v1/coupons/available")
      .then(res => res.json())
      .then(data => {
        if (data.success) setCoupons(data.coupons);
      });

  }, []);

  const checkoutItems = buyNowProduct ? [buyNowProduct] : cartItems;
  /* ================= TOTAL ================= */

  const cartTotal = useMemo(() => {

    return checkoutItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

  }, [checkoutItems]);

  const finalTotal = cartTotal - discount;

  /* ================= LOAD ADDRESSES ================= */

  useEffect(() => {

    const loadAddresses = async () => {

      const data = await fetchAddresses();

      if (!data.success) return;

      dispatch(setAddresses(data.addresses));

      if (data.addresses.length === 0) {
        dispatch(selectAddress(null));
        return;
      }

      const backendDefault =
        data.addresses.find((a) => a.isDefault) ||
        data.addresses[0];

      dispatch(selectAddress(backendDefault));

    };

    loadAddresses();

  }, [dispatch]);


  const handleIncrease = (productId) => {

    const item = cartItems.find((i) => i.productId === productId);

    dispatch(
      updateQuantity({
        productId,
        quantity: item.quantity + 1,
      })
    );

  };

  const handleDecrease = (productId) => {

    const item = cartItems.find((i) => i.productId === productId);

    if (item.quantity <= 1) return;

    dispatch(
      updateQuantity({
        productId,
        quantity: item.quantity - 1,
      })
    );

  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };
  /* ================= PLACE ORDER ================= */

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please add address");
      return;
    }

    if (!paymentMethod) {
      toast.error("Select payment method");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // ================= ONLINE PAYMENT =================
      if (paymentMethod === "ONLINE") {

        // 1. Create Razorpay order
        const res = await fetch(`${API_URL}/api/v1/payment/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: finalTotal }),
        });

        const data = await res.json();

        if (!data.success) {
          toast.error("Payment init failed");
          return;
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: "INR",
          name: "Ecart",
          description: "Order Payment",
          order_id: data.orderId,

          handler: async function (response) {

            // 2. VERIFY PAYMENT
            const verifyRes = await fetch(
              `${API_URL}/api/v1/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  ...response,
                  orderItems: checkoutItems,
                  addressId: selectedAddress._id,
                  totalAmount: finalTotal,
                  couponCode: appliedCoupon?.code || null,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success("Payment Successful 🎉");

              if (!buyNowProduct) dispatch(clearCart());

              navigate(`/ordersuccess/${verifyData.order._id}`);
            } else {
              toast.error("Payment verification failed");
            }
          },

          theme: {
            color: "#ec4899",
          },
        };

        if (!window.Razorpay) {
          toast.error("Razorpay not loaded");
          return;
        }

        const rzp = new window.Razorpay(options); rzp.open();
      }

      // ================= COD =================
      else {

        const res = await fetch(`${API_URL}/api/v1/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderItems: checkoutItems,
            selectedAddressId: selectedAddress._id,
            totalAmount: finalTotal,
            couponCode: appliedCoupon?.code || null,
            paymentMethod: "COD",
            paymentStatus: "Pending",
          }),
        });

        const data = await res.json();

        if (!data.success) {
          toast.error("Order failed");
          return;
        }

        if (!buyNowProduct) dispatch(clearCart());

        toast.success("Order placed (COD)");

        navigate(`/ordersuccess/${data.order._id}`);
      }

    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EMPTY ================= */

  if (checkoutItems.length === 0) {

    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <h2 className="text-2xl font-semibold">
            No product to checkout
          </h2>
        </div>
      </>
    );

  }

  /* ================= UI ================= */

  return (

    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 mb-20">

        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">

          <h1 className="text-3xl font-bold">
            Checkout
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT SECTION */}

            <div className="lg:col-span-2 space-y-6">

              <AddressSection />

              <PaymentMethod
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />

              <CouponSection
                cartTotal={cartTotal}
                coupons={coupons}
                appliedCoupon={appliedCoupon}
                setAppliedCoupon={setAppliedCoupon}
                setDiscount={setDiscount}
              />



            </div>

            {/* RIGHT SECTION */}

            <div className="lg:sticky lg:top-24 h-fit">

              <OrderSummary
                cartItems={checkoutItems}
                discount={discount}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                isOrderDetails={true}
                expectedDelivery={selectedAddress?.pincode ? selectedAddress.pincode : null}
              />

            </div>

          </div>

          {/* PLACE ORDER */}

          <div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress || !paymentMethod}
              className={`w-full py-4 rounded-2xl text-lg font-semibold transition
              ${loading || !selectedAddress || !paymentMethod
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-pink-500 text-white hover:bg-pink-600"
                }`}
            >

              {loading
                ? "Placing Order..."
                : `Place Order • ₹${finalTotal}`}

            </button>

          </div>

        </div>

      </div>
      <FooterNavbar />

    </>

  );

};

export default Checkout;