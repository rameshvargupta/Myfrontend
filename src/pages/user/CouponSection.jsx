
import React, { useState } from "react";
import { toast } from "sonner";
import {
  Tag,
  CheckCircle,
  XCircle,
  TicketPercent
} from "lucide-react";

const CouponSection = ({
  cartTotal,
  coupons = [],
  discount,
  setDiscount,
  appliedCoupon,
  setAppliedCoupon
}) => {

  const [couponCode, setCouponCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= APPLY COUPON ================= */

  const applyCoupon = async (code) => {

    const finalCode = code || couponCode;

    if (!finalCode.trim()) {
      toast.error("Enter coupon code");
      return;
    }

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch("/api/v1/coupons/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: finalCode,
          subtotal: cartTotal
        })
      });

      const data = await res.json();

      if (data.success) {

        setDiscount(data.discount);

        setAppliedCoupon(finalCode.toUpperCase());

        toast.success(`Coupon ${finalCode.toUpperCase()} applied`);

        setCouponCode("");

        setSelectedCoupon(null);

      } else {

        toast.error(data.message);

      }

    } catch (error) {

      toast.error("Failed to apply coupon");

    } finally {

      setLoading(false);

    }

  };

  /* ================= REMOVE COUPON ================= */

  const removeCoupon = () => {

    setAppliedCoupon(null);

    setDiscount(0);

    toast("Coupon removed");

  };

  /* ================= SELECT COUPON ================= */

  const selectCoupon = (coupon) => {

    setSelectedCoupon(coupon.code);

    setCouponCode(coupon.code);

  };

  return (

    <div className="border rounded-xl bg-white p-4 mt-4 space-y-4">

      {/* HEADER */}

      <h2 className="font-semibold flex items-center gap-2">

        <Tag size={18} />

        Coupons & Offers

      </h2>

      {/* ================= COUPON INPUT ================= */}

      {!appliedCoupon && (

        <div className="flex gap-2">

          <input
            type="text"
            placeholder="Enter Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            onClick={() => applyCoupon()}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            {loading ? "Applying..." : "Apply"}
          </button>

        </div>

      )}

      {/* ================= APPLIED COUPON ================= */}

      {appliedCoupon && (

        <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg px-4 py-3">

          <div className="flex items-center gap-2 text-green-700">

            <CheckCircle size={18} />

            <span className="font-medium text-sm">
              {appliedCoupon} Applied
            </span>

          </div>

          <button
            onClick={removeCoupon}
            className="text-red-500 text-sm hover:underline"
          >
            Remove
          </button>

        </div>

      )}

      {/* ================= COUPON LIST ================= */}

      {coupons.length > 0 && !appliedCoupon && (

        <div className="space-y-2">

          <p className="text-xs text-gray-500">
            Available Coupons
          </p>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">

            {coupons.map((coupon) => {

              const eligible = cartTotal >= coupon.minOrderValue;

              const isSelected = selectedCoupon === coupon.code;

              return (

                <div
                  key={coupon._id}
                  onClick={() => eligible && selectCoupon(coupon)}
                  className={`
                  relative
                  min-w-[220px]
                  cursor-pointer
                  border
                  rounded-xl
                  p-4
                  flex
                  flex-col
                  justify-between
                  transition
                  ${eligible ? "hover:shadow-md" : "opacity-50"}
                  ${isSelected ? "bg-green-50 border-green-400" : "bg-gray-50"}
                  `}
                >

                  {/* RIBBON */}

                  <div className="absolute top-0 right-0 bg-pink-600 text-white text-[10px] px-2 py-[2px] rounded-bl-lg">

                    OFFER

                  </div>

                  {/* TOP */}

                  <div className="flex items-center gap-2 mb-2">

                    <TicketPercent
                      size={18}
                      className="text-pink-600"
                    />

                    <span className="font-semibold text-sm">
                      {coupon.code}
                    </span>

                  </div>

                  {/* DISCOUNT */}

                  <p className="text-sm font-medium text-gray-700">

                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`}

                  </p>

                  {/* MIN ORDER */}

                  <p className="text-xs text-gray-500">

                    Min Order ₹{coupon.minOrderValue}

                  </p>

                  {/* SELECTED */}

                  {isSelected && (

                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">

                      <CheckCircle size={14} />

                      Selected

                    </div>

                  )}

                  {/* NOT ELIGIBLE */}

                  {!eligible && (

                    <div className="flex items-center gap-1 text-xs text-red-400 mt-2">

                      <XCircle size={14} />

                      Not eligible

                    </div>

                  )}

                </div>

              );

            })}

          </div>

        </div>

      )}

      {/* ================= DISCOUNT RESULT ================= */}

      {discount > 0 && (

        <div className="text-green-600 text-sm font-medium">

          Discount Applied: ₹{discount}

        </div>

      )}

    </div>

  );

};

export default CouponSection;

