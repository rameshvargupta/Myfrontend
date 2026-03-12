import React, { useMemo } from "react";
import { Minus, Plus, Trash2, Truck, Tag } from "lucide-react";

const PLATFORM_FEE = 5;

const OrderSummary = ({
  cartItems = [],
  discount = 0,
  onIncrease,
  onDecrease,
  onRemove
}) => {

  /* ================= CALCULATE ================= */

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const shipping = subtotal > 499 ? 0 : 40;

  const finalTotal = subtotal + shipping + PLATFORM_FEE - discount;

  const savings = discount + (shipping === 0 ? 40 : 0);

  /* ================= EMPTY ================= */

  if (!cartItems.length) {
    return (
      <div className="bg-white border rounded-xl p-10 text-center">
        <p className="text-gray-500 text-lg">
          No products in order summary
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl shadow-lg overflow-hidden">

      {/* HEADER */}

      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">
          Order Summary ({cartItems.length} Items)
        </h2>
      </div>

      {/* FREE SHIPPING MESSAGE */}

      {subtotal > 499 && (
        <div className="flex items-center gap-2 px-6 py-3 text-green-600 bg-green-50 text-sm font-medium">
          <Truck size={16} />
          You unlocked FREE Shipping 🎉
        </div>
      )}

      {/* PRODUCT LIST */}

      <div className="divide-y max-h-[420px] overflow-y-auto">

        {cartItems.map((item) => (

          <div
            key={item.productId}
            className="flex gap-4 p-5 items-center hover:bg-gray-50 transition"
          >

            {/* IMAGE */}

            <div className="w-20 h-20 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover rounded-lg border"
              />
            </div>

            {/* INFO */}

            <div className="flex-1">

              <p className="font-semibold text-gray-900 line-clamp-2">
                {item.name}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                ₹{item.price}
              </p>

              {/* QUANTITY */}

              <div className="flex items-center gap-2 mt-3">

                <button
                  onClick={() => {
                    if (item.quantity > 1) {
                      onDecrease(item.productId);
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>

                <span className="px-3 font-medium">
                  {item.quantity}
                </span>

                <button
                  onClick={() => onIncrease(item.productId)}
                  className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>

              </div>

            </div>

            {/* PRICE + DELETE */}

            <div className="flex flex-col items-end gap-2">

              <p className="font-semibold text-gray-900">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>

              <button
                onClick={() => onRemove(item.productId)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* PRICE DETAILS */}

      <div className="px-6 py-5 border-t bg-gray-50 space-y-3">

        <h3 className="font-semibold text-gray-900 text-sm">
          PRICE DETAILS
        </h3>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Price ({cartItems.length} items)</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Platform Fee</span>
          <span>₹{PLATFORM_FEE}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery Charges</span>
          {shipping === 0 ? (
            <span className="text-green-600 font-medium">
              FREE
            </span>
          ) : (
            <span>₹{shipping}</span>
          )}
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span className="flex items-center gap-1">
              <Tag size={14} />
              Coupon Discount
            </span>
            <span>- ₹{discount}</span>
          </div>
        )}

        <hr />

        <div className="flex justify-between text-lg font-bold text-gray-900">

          <span>Total Amount</span>

          <span className="text-pink-600">
            ₹{finalTotal.toFixed(2)}
          </span>

        </div>

        {savings > 0 && (
          <p className="text-green-600 text-sm font-medium">
            You saved ₹{savings.toFixed(2)} on this order 🎉
          </p>
        )}

      </div>

    </div>
  );
};

export default OrderSummary;