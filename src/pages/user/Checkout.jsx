import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  updateQuantity,
  removeFromCart,
  saveAddress,
  clearCart,
} from "@/redux/cartSlice";
import Navbar from "@/components/Navbar";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems = [], shippingAddress = "" } = useSelector(
    (state) => state.cart || {}
  );


  const [address, setAddress] = useState(shippingAddress || "");
  const [editingAddress, setEditingAddress] = useState(!shippingAddress);
  const [delivery, setDelivery] = useState("standard");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalAmount(total);
  }, [cartItems]);

  const handleIncrement = (productId) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (item) {
      dispatch(updateQuantity({ productId, quantity: item.quantity + 1 }));
    }
  };

  const handleDecrement = (productId) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (item) {
      if (item.quantity === 1) {
        dispatch(removeFromCart(productId));
      } else {
        dispatch(updateQuantity({ productId, quantity: item.quantity - 1 }));
      }
    }
  };

  const handlePlaceOrder = () => {
    if (!address) {
      alert("Please add an address first");
      return;
    }

    dispatch(saveAddress(address));

    // Simulate API call
    // After successful order:
    dispatch(clearCart());
    navigate("/ordersuccess");
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold mt-20">Checkout</h2>

        {/* Shipping Address */}
        <div className="border p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          {editingAddress ? (
            <>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                className="w-full border p-2 rounded"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => setEditingAddress(false)}
                  className="bg-pink-600 hover:bg-pink-500"
                >
                  Save Address
                </Button>
              </div>
            </>
          ) : (
            <>
              <p>{address}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => setEditingAddress(true)}
                  className="bg-yellow-500 hover:bg-yellow-400"
                >
                  Edit Address
                </Button>
                <Button
                  onClick={() => {
                    setAddress("");
                    setEditingAddress(true);
                  }}
                  className="bg-green-600 hover:bg-green-500"
                >
                  Add New Address
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Delivery Options */}
        <div className="border p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Delivery Options</h3>
          <select
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="standard">Standard Delivery (3-5 days)</option>
            <option value="express">Express Delivery (1-2 days)</option>
          </select>
        </div>

        {/* Cart Items */}
        <div className="border p-4 rounded shadow space-y-2">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          {cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between items-center border-b py-2"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">₹{item.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecrement(item.productId)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleIncrement(item.productId)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <span className="ml-4 font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
          <p className="font-bold text-right mt-2">
            Total: ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        {/* Place Order */}
        <Button
          onClick={handlePlaceOrder}
          disabled={cartItems.length === 0 || !address}
          className="bg-pink-600 hover:bg-pink-500 w-full py-3 text-lg font-semibold"
        >
          Place Order
        </Button>
      </div>
    </>
  );
};

export default Checkout;
