import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/cartSlice";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector(state => state.cart);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePayment = () => {
    // implement your payment gateway or order save API
    alert(`Payment of $${totalPrice.toFixed(2)} successful!`);
    dispatch(clearCart());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Billing / Checkout</h2>

      <div className="space-y-4">
        {cartItems.map(item => (
          <div key={item.productId} className="flex justify-between border p-4 rounded">
            <p>{item.name} x {item.quantity}</p>
            <p>${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6 font-bold text-xl">
        <p>Total:</p>
        <p>${totalPrice.toFixed(2)}</p>
      </div>

      <button
        onClick={handlePayment}
        className="bg-pink-500 text-white px-4 py-2 rounded mt-4"
      >
        Pay Now
      </button>
    </div>
  );
};

export default CheckoutPage;
