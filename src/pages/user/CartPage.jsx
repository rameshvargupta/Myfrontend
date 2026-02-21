import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart } from "@/redux/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const CartPage = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleQuantity = (id, qty) => {
    if (qty < 1) return;
    dispatch(updateQuantity({ productId: id, quantity: qty }));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 ">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          /* EMPTY CART */
          <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">
            <p className="text-xl text-gray-500 mb-4">
              Your cart is empty 🛒
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 rounded-xl
                       bg-pink-500 text-white font-semibold
                       hover:bg-pink-600 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ================= LEFT: CART ITEMS ================= */}
            <div className="lg:col-span-2 space-y-5">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-2xl border shadow-sm
                           hover:shadow-md transition p-5"
                >
                  <div className="flex gap-5 items-center">
                    {/* IMAGE */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl border"
                      />
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.slug || item.productId}`}
                        className="block font-semibold text-gray-900
                                 hover:text-pink-600 transition"
                      >
                        {item.name}
                      </Link>

                      <p className="text-sm text-gray-500 mt-1">
                        Price: ₹{item.price}
                      </p>

                      {/* QTY */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() =>
                            handleQuantity(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 rounded-full border
                                   flex items-center justify-center
                                   hover:bg-gray-100 transition font-semibold"
                        >
                          −
                        </button>

                        <span className="min-w-[24px] text-center font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleQuantity(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 rounded-full border
                                   flex items-center justify-center
                                   hover:bg-gray-100 transition font-semibold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* PRICE + REMOVE */}
                    <div className="text-right flex flex-col items-end gap-3">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{item.price * item.quantity}
                      </p>

                      <button
                        onClick={() =>
                          dispatch(removeFromCart(item.productId))
                        }
                        className="text-red-500 hover:text-red-700 transition"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= RIGHT: ORDER SUMMARY ================= */}
            <div className="bg-white rounded-2xl border shadow-sm
                          p-6 h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">
                    Free
                  </span>
                </div>
              </div>

              <div className="border-t my-4"></div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">
                  Total
                </span>
                <span className="text-2xl font-bold text-pink-600">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-4 rounded-2xl text-lg font-semibold
                         bg-pink-500 text-white
                         hover:bg-pink-600 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;
