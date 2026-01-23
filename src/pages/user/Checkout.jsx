import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  updateQuantity,
  removeFromCart,
  clearCart,
  addAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
} from "@/redux/cartSlice";


const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [editId, setEditId] = useState(null);

  /* ================== REDUX ================== */
  const cartState = useSelector((state) => state.cart);
  const cartItems = cartState?.cartItems || [];

  /* ================== ADDRESS STATE ================== */
  const { addresses, selectedAddressId } = useSelector(
    (state) => state.cart
  );
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  /* ================== OTHER STATE ================== */
  const [deliveryType, setDeliveryType] = useState("standard");
  const [totalAmount, setTotalAmount] = useState(0);

  /* ================== TOTAL ================== */
  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalAmount(total);
  }, [cartItems]);

  /* ================== CART QTY ================== */
  const handleIncreaseQty = (id) => {
    const item = cartItems.find((i) => i.productId === id);
    if (!item) return;
    dispatch(updateQuantity({ productId: id, quantity: item.quantity + 1 }));
  };

  const handleDecreaseQty = (id) => {
    const item = cartItems.find((i) => i.productId === id);
    if (!item) return;
    if (item.quantity === 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ productId: id, quantity: item.quantity - 1 }));
    }
  };

  /* ================== ADDRESS FORM ================== */
  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveAddress = () => {
    const { fullName, mobile, address, city, pincode, state } = addressForm;

    if (!fullName || !mobile || !address || !city || !pincode || !state) {
      alert("Please fill all address fields");
      return;
    }

    const payload = {
      id: editId ? editId : Date.now(),
      fullName,
      mobile,
      address,
      city,
      pincode,
      state,
    };

    if (editId) {
      dispatch(updateAddress(payload)); // ✏️ EDIT
    } else {
      dispatch(addAddress(payload)); // ➕ ADD
    }

    setEditId(null);
    setAddressForm({
      fullName: "",
      mobile: "",
      address: "",
      city: "",
      pincode: "",
      state: "",
    });

    setShowAddressForm(false);
  };

  /* ================== PLACE ORDER ================== */
 const handlePlaceOrder = () => {
  const selectedAddress = addresses.find(
    (a) => a.id === selectedAddressId
  );

  if (!selectedAddress) {
    alert("Please select delivery address");
    return;
  }

  // 👉 yaha backend API call jayegi (next step)
  dispatch(clearCart());
  navigate("/ordersuccess");
};


  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-5xl mx-auto px-4 space-y-6">

          <h1 className="text-3xl font-bold">Checkout</h1>

          {/* ================== ADDRESS SECTION ================== */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <Button
                onClick={() => setShowAddressForm(true)}
                className="bg-green-600 hover:bg-green-500"
              >
                + Add New Address
              </Button>
            </div>

            {/* ADDRESS FORM */}
            {showAddressForm && (
              <div className="border rounded-lg p-4 mb-4 space-y-3">
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={addressForm.fullName}
                  onChange={handleAddressChange}
                  className="w-full border p-2 rounded"
                />
                <input
                  name="mobile"
                  placeholder="Mobile Number"
                  value={addressForm.mobile}
                  onChange={handleAddressChange}
                  className="w-full border p-2 rounded"
                />
                <textarea
                  name="address"
                  placeholder="Address"
                  value={addressForm.address}
                  onChange={handleAddressChange}
                  className="w-full border p-2 rounded"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="city"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    className="border p-2 rounded"
                  />
                  <input
                    name="pincode"
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={handleAddressChange}
                    className="border p-2 rounded"
                  />
                </div>
                <input
                  name="state"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                  className="w-full border p-2 rounded"
                />

                <Button
                  onClick={handleSaveAddress}
                  className="bg-pink-600 hover:bg-pink-500"
                >
                  Save Address
                </Button>
              </div>
            )}

            {/* ADDRESS PREVIEW LIST */}
            <div className="max-h-60 overflow-y-auto space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`border rounded-lg p-4 ${selectedAddressId === addr.id
                    ? "border-pink-600 bg-pink-50"
                    : ""
                    }`}
                >
                  <div className="flex justify-between">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        checked={selectedAddressId === addr.id}
                        onChange={() => dispatch(selectAddress(addr.id))}
                        className="mr-2"
                      />
                      <span className="font-semibold">{addr.fullName}</span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAddressForm(addr);
                          setEditId(addr.id);
                          setShowAddressForm(true);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>


                      <button
                        onClick={() => dispatch(deleteAddress(addr.id))}
                        className="text-red-600"
                      >
                        Delete
                      </button>

                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-sm">📞 {addr.mobile}</p>
                </div>
              ))}

            </div>
          </div>

          {/* ================== ORDER SUMMARY ================== */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between items-center border-b py-3"
              >
                <div className="flex gap-4">
                  <img src={item.image} className="w-16 h-16 rounded" />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p>₹{item.price}</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <button onClick={() => handleDecreaseQty(item.productId)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleIncreaseQty(item.productId)}>
                    +
                  </button>
                  <span className="ml-4 font-semibold">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            ))}

            <p className="text-right mt-4 text-xl font-bold">
              Total: ₹{totalAmount}
            </p>
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={!selectedAddressId || cartItems.length === 0}
            className="w-full bg-pink-600 hover:bg-pink-500 py-4 text-lg"
          >
            Place Order
          </Button>
        </div>
      </div>
    </>
  );
};

export default Checkout;
