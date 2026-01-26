import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { setAddresses, selectAddress } from "@/redux/addressSlice";
import {
  updateQuantity,
  removeFromCart,
  clearCart,
} from "@/redux/cartSlice";
import { toast } from "sonner";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editId, setEditId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  /* ================= CART ================= */
  const cartItems = useSelector((state) => state.cart.cartItems || []);

  /* ================= ADDRESS ================= */
  const { addresses, selectedAddress } = useSelector(
    (state) => state.address
  );

  /* ================= TOTAL ================= */
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /* ================= FETCH ADDRESS ================= */
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          "http://localhost:5000/api/v1/user/address",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (data.success) {
          dispatch(setAddresses(data.addresses)); // 🔥 clean replace
        }
      } catch (err) {
        console.error("FETCH ADDRESS ERROR", err);
      }
    };

    fetchAddresses();
  }, [dispatch]);

  /* ================= CART QTY ================= */
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

  /* ================= ADDRESS FORM ================= */
  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditId(null);
    setShowAddressForm(false);
    setAddressForm({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      state: "",
    });
  };

  const handleSaveAddress = async () => {
    const { fullName, phone, address, city, pincode, state } = addressForm;

    if (!fullName || !phone || !address || !city || !pincode || !state) {
      alert("Please fill all address fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/v1/user/address",
        {
          method: editId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            addressId: editId,
            ...addressForm,
          }),
        }
      );

      const data = await res.json();
      toast.success("Login successful 👋");
      if (!data.success) {
        alert(data.message || "Address save failed");
        return;
      }

      dispatch(setAddresses(data.addresses)); // 🔥 always sync with backend
      resetForm();
    } catch (err) {
      console.error("SAVE ADDRESS ERROR", err);
      alert("Something went wrong");
    }
  };

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select delivery address");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderItems: cartItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          shippingAddress: {
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            address: selectedAddress.address,
            city: selectedAddress.city,
            pincode: selectedAddress.pincode,
            state: selectedAddress.state,
          },
          totalAmount,
          paymentMethod: "Cash on Delivery",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Order failed");
        setLoading(false);
        return;
      }

      dispatch(clearCart());
      navigate(`/ordersuccess/${data.order._id}`);
    } catch (error) {
      console.error("PLACE ORDER ERROR:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <h1 className="text-3xl font-bold">Checkout</h1>

          {cartItems.length === 0 ? (
            <p className="text-center mt-20 text-xl">Cart is empty</p>
          ) : (
            <>
              {/* ================= ADDRESS ================= */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between mb-4">
                  <h2 className="text-lg font-semibold">Shipping Address</h2>
                  <Button onClick={() => setShowAddressForm(true)}>
                    + Add Address
                  </Button>
                </div>

                {showAddressForm && (
                  <div className="border p-4 rounded mb-4 space-y-3">
                    {["fullName", "phone", "address", "city", "pincode", "state"].map(
                      (field) => (
                        <input
                          key={field}
                          name={field}
                          placeholder={field.toUpperCase()}
                          value={addressForm[field]}
                          onChange={handleAddressChange}
                          className="w-full border p-2 rounded"
                        />
                      )
                    )}

                    <div className="flex gap-2">
                      <Button onClick={handleSaveAddress}>Save</Button>
                      <Button variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* ADDRESS CARD */}
            
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`border rounded-lg p-4 flex justify-between items-start ${selectedAddress?._id === addr._id
                        ? "border-green-600 bg-green-50"
                        : ""
                        }`}
                    >
                      <label className="flex gap-3 cursor-pointer">
                        <input
                          type="radio"
                          checked={selectedAddress?._id === addr._id}
                          onChange={() => dispatch(selectAddress(addr))}
                        />
                        <div>
                          <p className="font-semibold">{addr.fullName}</p>
                          <p className="text-sm text-gray-600">
                            {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-sm">📞 {addr.phone}</p>
                        </div>
                      </label>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditId(addr._id);
                            setAddressForm(addr);
                            setShowAddressForm(true);
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            const token = localStorage.getItem("token");
                            const res = await fetch(
                              `http://localhost:5000/api/v1/user/address/${addr._id}`,
                              {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                              }
                            );
                            const data = await res.json();
                            dispatch(setAddresses(data.addresses));
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* ================= ORDER SUMMARY ================= */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between border-b py-3"
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
                disabled={loading || !selectedAddress}
                className="w-full py-4 text-lg"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;
