import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart } from "@/redux/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import { toast } from "sonner";

const CartPage = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleQuantity = (e, id, qty) => {
    e.stopPropagation();
    if (qty < 1) return;

    dispatch(updateQuantity({ productId: id, quantity: qty }));
  };

  const handleProductClick = (item) => {
    if (!item?.slug) {
      toast.error("Product no longer available");
      return;
    }

    navigate(`/product/${item.slug}`);
  };

  const handleApplyCoupon = () => {
    if (coupon === "ECART10") {
      setDiscount(10);
      toast.success("Coupon Applied 🎉");
    } else {
      toast.error("Invalid coupon");
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-2 mb-20">

        <h1 className="text-3xl font-bold mt-2 mb-5">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (

          <div className="bg-white border rounded-2xl p-10 text-center shadow">
            <h2 className="text-2xl font-semibold mb-3">
              Your cart is empty 🛒
            </h2>

            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600"
            >
              Continue Shopping
            </Link>
          </div>

        ) : (

          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT CART ITEMS */}

            <div className="lg:col-span-2 space-y-6">

              {cartItems.map((item) => (

                <div key={item.productId}>

                  <div className="flex gap-5">

                    {/* IMAGE */}

                    <img
                      src={item.image}
                      alt={item.name}
                      onClick={() => handleProductClick(item)}
                      className="w-28 h-28 object-cover rounded-xl border cursor-pointer"
                    />

                    {/* DETAILS */}

                    <div className="flex-1">

                      <h2
                        onClick={() => handleProductClick(item)}
                        className="font-semibold text-lg hover:text-pink-600 cursor-pointer"
                      >
                        {item.name}
                      </h2>

                      <p className="text-gray-500 text-sm mt-1">
                        ₹{item.price} each
                      </p>

                      <p className="text-green-600 text-sm mt-1">
                        In Stock
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Delivery by 3-5 days
                      </p>

                      {/* QUANTITY */}

                      <div className="flex items-center gap-3 mt-4">

                        <button
                          onClick={(e) =>
                            handleQuantity(
                              e,
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 border rounded-full"
                        >
                          -
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={(e) =>
                            handleQuantity(
                              e,
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 border rounded-full"
                        >
                          +
                        </button>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex gap-4 mt-4 text-sm">

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeFromCart(item.productId));
                          }}
                          className="flex items-center gap-1 text-red-500"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>

                        <button className="flex items-center gap-1 text-pink-500">
                          <Heart size={16} />
                          Save for later
                        </button>

                      </div>

                    </div>

                    {/* PRICE */}

                    <div className="text-right">

                      <p className="font-bold text-lg">
                        ₹{item.price * item.quantity}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-4 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600"
            >
              Proceed to Checkout
            </button>

          </div>

        )}

      </div>

      <FooterNavbar />
    </>
  );
};

export default CartPage;