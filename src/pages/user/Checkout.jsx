import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { removeCouponRedux } from "@/redux/couponSlice";
const Checkout = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= BUY NOW PRODUCT ================= */

  const buyNowProduct = location.state?.buyNowProduct;

  /* ================= STATES ================= */

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const { appliedCoupon, discount } = useSelector((state) => state.coupon);
  const [coupons, setCoupons] = useState([]);
  /* ================= REDUX ================= */

  const cartItems = useSelector((state) => state.cart.cartItems || []);

  // 🔹 REDUX SELECTORS
  const selectedAddress = useSelector((state) => state.address.selectedAddress);

  useEffect(() => {
    if (buyNowProduct) {
      localStorage.setItem("buyNowProduct", JSON.stringify(buyNowProduct));
    }
  }, [buyNowProduct]);

  /* ================= CHECKOUT ITEMS ================= */
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/coupons/available`);

        // 👇 check karo JSON hai ya nahi
        const text = await res.text();

        try {
          const data = JSON.parse(text);

          if (data.success) {
            setCoupons(data.coupons);
          }

        } catch {
          console.error("Not JSON response:", text);
        }

      } catch (err) {
        console.error("Coupon fetch error:", err);
      }
    };

    loadCoupons();
  }, []);

  const storedBuyNow = JSON.parse(localStorage.getItem("buyNowProduct"));

  const checkoutItems = buyNowProduct
    ? [buyNowProduct]
    : storedBuyNow
      ? [storedBuyNow]
      : cartItems;
  /* ================= TOTAL ================= */

  const cartTotal = useMemo(() => {

    return checkoutItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

  }, [checkoutItems]);

  const PLATFORM_FEE = 5;
  const shipping = cartTotal > 499 ? 0 : 40;

  const finalTotal =
    cartTotal + shipping + PLATFORM_FEE - discount;

  /* ================= LOAD ADDRESSES ================= */

  useEffect(() => {
    const loadAddresses = async () => {
      const token = localStorage.getItem("token");

      // ❌ agar login nahi hai → address fetch mat karo
      if (!token) {
        dispatch(setAddresses([]));
        dispatch(selectAddress(null));
        return;
      }

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

  useEffect(() => {
    console.log("REDUX COUPON STATE:", {
      appliedCoupon,
      discount,
    });
  }, [appliedCoupon, discount]);

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
    const token = localStorage.getItem("token");

    // ================= VALIDATION =================
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

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

      // 🔥 IMPORTANT: ONLY SEND REQUIRED DATA
      const orderPayload = {
        orderItems: checkoutItems,
        selectedAddressId: selectedAddress._id,
        paymentMethod,
        couponCode: appliedCoupon || null, // ✅ ONLY THIS
      };
      console.log("COUPON SEND:", appliedCoupon);
      // ================= ONLINE PAYMENT =================
      if (paymentMethod === "ONLINE") {

        // 👉 Step 1: Ask backend for final amount
        const previewRes = await fetch(`${API_URL}/api/v1/orders/preview`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderPayload),
        });

        const previewData = await previewRes.json();

        if (!previewData.success) {
          toast.error(previewData.message || "Pricing error");
          return;
        }

        const finalAmount = previewData.totalAmount;

        // 👉 Step 2: Create Razorpay order with correct amount
        const paymentRes = await fetch(`${API_URL}/api/v1/payment/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: finalAmount }),
        });

        const paymentData = await paymentRes.json();

        if (!paymentData.success) {
          toast.error("Payment init failed");
          return;
        }

        const options = {
          key: paymentData.key,
          amount: paymentData.amount,
          currency: "INR",
          name: "Ecart",
          description: "Order Payment",
          order_id: paymentData.orderId,

          handler: async function (response) {

            // 👉 Step 3: Verify payment + create order
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
                  ...orderPayload, // 🔥 IMPORTANT
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success("Payment Successful 🎉");

              if (!buyNowProduct) dispatch(clearCart());
              dispatch(removeCouponRedux());

              localStorage.removeItem("buyNowProduct");

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

        const rzp = new window.Razorpay(options);
        rzp.open();
      }

      // ================= COD =================
      else {

        const res = await fetch(`${API_URL}/api/v1/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderPayload), // 🔥 CLEAN PAYLOAD
        });

        const data = await res.json();

        if (!data.success) {
          toast.error(data.message || "Order failed");
          return;
        }

        if (!buyNowProduct) dispatch(clearCart());

        dispatch(removeCouponRedux());
        localStorage.removeItem("buyNowProduct");

        toast.success("Order placed successfully 🎉");

        navigate(`/ordersuccess/${data.order._id}`);
      }


    } catch (err) {
      console.error("ORDER ERROR:", err);
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
              />
            </div>

            {/* RIGHT SECTION */}

            <div className="lg:sticky lg:top-24 h-fit">

              <OrderSummary
                cartItems={checkoutItems}
                discount={discount}
                couponCode={appliedCoupon}
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