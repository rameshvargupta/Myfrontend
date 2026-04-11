import React from "react";

const PremiumPriceSummary = ({
  mrp = 0,
  selling = 0,
  productDiscount = 0,
  couponDiscount = 0,
  shipping = 0,
  platformFee = 0,
  totalAmount = 0,
  couponCode,
}) => {

  // ✅ SAFETY (avoid undefined / NaN)
  const safeMRP = Number(mrp) || 0;
  const safeSelling = Number(selling) || 0;
  const safeProductDiscount = Number(productDiscount) || 0;
  const safeCouponDiscount = Number(couponDiscount) || 0;
  const safeShipping = Number(shipping) || 0;
  const safePlatformFee = Number(platformFee) || 0;
  const safeTotal = Number(totalAmount) || 0;

  const totalSavings = safeProductDiscount + safeCouponDiscount;

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-md space-y-4 hover:shadow-lg transition">

      {/* HEADER */}
      <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">
        💰 Price Details
      </h2>

      {/* MRP */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>Max Price</span>
        <span className="line-through">₹{safeMRP.toFixed(2)}</span>
      </div>

      {/* SELLING */}
      <div className="flex justify-between text-sm text-gray-800 font-medium">
        <span>Price</span>
        <span>₹{safeSelling.toFixed(2)}</span>
      </div>

      {/* PRODUCT DISCOUNT */}
      {safeProductDiscount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Product Discount</span>
          <span>- ₹{safeProductDiscount.toFixed(2)}</span>
        </div>
      )}

      {/* COUPON */}
      {safeCouponDiscount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>
            Coupon {couponCode ? `(${couponCode})` : ""}
          </span>
          <span>- ₹{safeCouponDiscount.toFixed(2)}</span>
        </div>
      )}

      {/* PLATFORM */}
      {safePlatformFee > 0 && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Platform Fee</span>
          <span>₹{safePlatformFee.toFixed(2)}</span>
        </div>
      )}

      {/* SHIPPING */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Delivery Charges</span>
        {safeShipping === 0 ? (
          <span className="text-green-600 font-medium">FREE</span>
        ) : (
          <span>₹{safeShipping.toFixed(2)}</span>
        )}
      </div>

      <hr />

      {/* TOTAL */}
      <div className="flex justify-between text-lg font-bold text-gray-900">
        <span>Total Paid</span>
        <span className="text-indigo-600">
          ₹{safeTotal.toFixed(2)}
        </span>
      </div>

      {/* SAVINGS */}
      {totalSavings > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-green-600 text-sm font-medium">
            🎉 You saved ₹{totalSavings.toFixed(2)} on this order
          </p>
        </div>
      )}
    </div>
  );
};

export default PremiumPriceSummary;