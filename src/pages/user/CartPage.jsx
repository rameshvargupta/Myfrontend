import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart } from "@/redux/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          Your cart is empty.{" "}
          <Link to="/products" className="text-pink-600 font-semibold">
            Shop Now
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 border rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-28 h-28 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <Link to={`/product/${item.productId}`}>
                    <h2 className="font-semibold text-lg hover:text-pink-600 transition">
                      {item.name}
                    </h2>
                  </Link>
                  <p className="text-gray-500 mt-1">₹{item.price.toFixed(2)}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      className="px-2 py-1 border rounded hover:bg-gray-100 transition"
                      onClick={() =>
                        handleQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border rounded">{item.quantity}</span>
                    <button
                      className="px-2 py-1 border rounded hover:bg-gray-100 transition"
                      onClick={() =>
                        handleQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(removeFromCart(item.productId))}
                  className="text-red-500 hover:text-red-700 transition ml-auto"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="border rounded-xl p-6 shadow-md h-fit sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span className="font-bold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Delivery</span>
              <span className="font-semibold">Free</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between mb-4">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold">₹{subtotal.toFixed(2)}</span>
            </div>
            <Button
              onClick={() => navigate("/checkout")}
              className="w-full bg-pink-600 hover:bg-pink-500"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
