import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "../redux/cartSlice";
import { Link } from "react-router-dom";

const CartPage = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector(state => state.cart);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty. <Link to="/">Go shopping</Link></p>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.productId} className="flex justify-between items-center border p-4 rounded">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover"/>
              <div className="flex-1 px-4">
                <h3 className="font-semibold">{item.name}</h3>
                <p>${item.price}</p>
                <input
                  type="number"
                  min={1}
                  max={item.stock}
                  value={item.quantity}
                  onChange={e => dispatch(updateQuantity({ productId: item.productId, quantity: Number(e.target.value) }))}
                  className="border w-20 px-2 py-1 rounded mt-1"
                />
              </div>
              <button onClick={() => dispatch(removeFromCart(item.productId))} className="text-red-500">Remove</button>
            </div>
          ))}

          <div className="flex justify-end mt-6">
            <h3 className="font-bold text-xl">Total: ${totalPrice.toFixed(2)}</h3>
          </div>

          <Link to="/checkout" className="bg-green-500 text-white px-4 py-2 rounded inline-block mt-4">
            Proceed to Checkout
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
