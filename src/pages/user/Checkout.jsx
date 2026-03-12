import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

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
  const selectedAddress = useSelector((state) => state.address.selectedAddress);

  /* ================= CHECKOUT ITEMS ================= */
  useEffect(() => {

    fetch("/api/v1/coupons/available")
      .then(res => res.json())
      .then(data => {
        if (data.success) setCoupons(data.coupons);
      });

  }, []);

  const checkoutItems = buyNowProduct ? [buyNowProduct] : cartItems;
console.log("Coupons:", coupons);
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
      toast.error("Please add a delivery address");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error("No product to checkout");
      return;
    }

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/v1/orders", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({

          orderItems: checkoutItems.map((item) => ({
            productId: item.productId,
            slug: item.slug,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),

          selectedAddressId: selectedAddress._id,

          totalAmount: finalTotal,

          coupon: appliedCoupon,

          paymentMethod:
            paymentMethod === "ONLINE"
              ? "Online Payment"
              : "Cash on Delivery",

          paymentStatus: "Pending",

        }),

      });

      const data = await res.json();

      if (!data.success) {

        toast.error(data.message || "Order failed");
        setLoading(false);
        return;

      }

      if (!buyNowProduct) {
        dispatch(clearCart());
      }

      toast.success("Order placed successfully 🎉");

      navigate(`/ordersuccess/${data.order._id}`);

    } catch (error) {

      console.error("ORDER ERROR:", error);
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