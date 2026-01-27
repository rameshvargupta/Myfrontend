
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { clearCart } from "@/redux/cartSlice";
import { selectAddress } from "@/redux/addressSlice";
import { toast } from "sonner";

const PlaceOrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ===== REDUX STATE ===== */
  const cartItems = useSelector((state) => state.cart.cartItems) || [];
  const { addresses = [], selectedAddress = null } = useSelector(
    (state) => state.address
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /* ===== PLACE ORDER HANDLER ===== */

const placeOrderHandler = async () => {
  if (!selectedAddress) {
    alert("Please select delivery address");
    return;
  }

  try {
    // 1. Send order to backend
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderItems: cartItems,
        shippingAddress: selectedAddress,
        totalAmount,
        paymentMethod: "Cash on Delivery", // or get from form
      }),
    });

    const data = await res.json();

    if (!data.success) {
      // show backend error
      toast.error(data.message || "Order failed, try again!");
      return;
    }

    // 2. Order is confirmed ✅
    dispatch(clearCart());
    toast.success("Order placed successfully!");
    
    // 3. Redirect after success
    navigate("/ordersuccess");

  } catch (error) {
    console.error("Place Order Error:", error);
    toast.error("Something went wrong! Try again.");
  }
};



  /* ===== UI ===== */
  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Place Order</h2>

        {cartItems.length === 0 ? (
          <p className="text-center mt-20 text-xl">Cart is empty</p>
        ) : (
          <>
            {/* CART ITEMS */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between border p-4 rounded"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p>₹{item.price}</p>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            {/* ADDRESS SELECTION */}
            <div className="mt-6 border p-4 rounded">
              <h3 className="font-semibold mb-2">Delivery Address</h3>

              {addresses.length === 0 ? (
                <p>No saved addresses. Please add an address first.</p>
              ) : (
                addresses.map((addr, index) => (
                  <label
                    key={index}
                    className={`block border p-3 rounded mb-2 cursor-pointer ${
                      selectedAddress === addr
                        ? "border-pink-600 bg-pink-50"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedAddress === addr}
                      onChange={() => dispatch(selectAddress(addr))}
                      className="mr-2"
                    />
                    {addr.fullName}, {addr.address}, {addr.city}
                  </label>
                ))
              )}
            </div>

            {/* TOTAL & PLACE ORDER */}
            <div className="mt-6 text-right">
              <p className="text-xl font-bold">Total: ₹{subtotal}</p>
              <button
                onClick={placeOrderHandler}
                className="mt-4 bg-pink-600 text-white px-6 py-3 rounded"
                disabled={!selectedAddress || cartItems.length === 0}
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PlaceOrderPage;
