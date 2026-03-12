import React, { useState } from "react";
import { toast } from "sonner";
import { Tag, CheckCircle, XCircle } from "lucide-react";

const CouponSection = ({
  cartTotal,
  coupons = [],
  discount,
  setDiscount,
  appliedCoupon,
  setAppliedCoupon
}) => {

  const [couponCode, setCouponCode] = useState("");
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
          code: couponCode,
          subtotal: cartTotal
        })
      });

      const data = await res.json();

      if (data.success) {

        setDiscount(data.discount);
        setAppliedCoupon(finalCode.toUpperCase());

        toast.success(`Coupon ${finalCode} applied`);

        setCouponCode("");

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

  return (

    <div className="border rounded-xl bg-white p-4 mt-4 space-y-4">

      <h2 className="font-semibold flex items-center gap-2">
        <Tag size={18} />
        Coupons
      </h2>

      {/* COUPON INPUT */}

      {!appliedCoupon && (

        <div className="flex gap-2">

          <input
            type="text"
            placeholder="Enter Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <button
            onClick={() => applyCoupon()}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            {loading ? "Applying..." : "Apply"}
          </button>

        </div>

      )}

      {/* APPLIED COUPON */}

      {appliedCoupon && (

        <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg px-4 py-3">

          <div className="flex items-center gap-2 text-green-700">

            <CheckCircle size={18} />

            <span className="font-medium">
              {appliedCoupon} Applied
            </span>

          </div>

          <button
            onClick={removeCoupon}
            className="text-red-500"
          >
            Remove
          </button>

        </div>

      )}

      {/* AVAILABLE COUPONS */}

      {coupons.length > 0 && !appliedCoupon && (

        <div className="space-y-3 max-h-52 overflow-y-auto">

          {coupons.map((coupon) => {

            const eligible = cartTotal >= coupon.minOrderValue;

            return (

              <div
                key={coupon._id}
                className={`border rounded-lg p-3 flex justify-between items-center
                ${eligible ? "bg-gray-50" : "opacity-60"}
                `}
              >

                <div>

                  <p className="font-semibold text-sm">
                    {coupon.code}
                  </p>

                  <p className="text-xs text-gray-500">

                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`}

                    {" • Min ₹"}
                    {coupon.minOrderValue}

                  </p>

                </div>

                {eligible ? (

                  <button
                    onClick={() => applyCoupon(coupon.code)}
                    className="text-pink-600 font-semibold text-sm"
                  >
                    APPLY
                  </button>

                ) : (

                  <XCircle
                    size={18}
                    className="text-gray-400"
                  />

                )}

              </div>

            );

          })}

        </div>

      )}

      {/* DISCOUNT */}

      {discount > 0 && (

        <div className="text-green-600 text-sm font-medium">
          Discount Applied: ₹{discount}
        </div>

      )}

    </div>

  );

};

export default CouponSection;