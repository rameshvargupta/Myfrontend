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
  const [showAllAddresses, setShowAllAddresses] = useState(false);

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
  const defaultAddress =
    selectedAddress || (addresses.length > 0 ? addresses[0] : null);

  const addressToShow = showAllAddresses
    ? addresses
    : defaultAddress
      ? [defaultAddress]
      : [];


  /* ================= TOTAL ================= */
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/v1/user/address", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success) {
          dispatch(setAddresses(data.addresses));

          // 🔥 Auto-select first address if none selected
          if (data.addresses.length > 0) {
            dispatch(selectAddress(data.addresses[0]));
          }
        }
      } catch (err) {
        console.error("FETCH ADDRESS ERROR", err);
      }
    };

    fetchAddresses();
  }, [dispatch]); // only run once


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
      dispatch(selectAddress(data.addresses[data.addresses.length - 1])); // select last added
      resetForm();
    } catch (err) {
      console.error("SAVE ADDRESS ERROR", err);
      alert("Something went wrong");
    }
  };

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    // fallback to first address if selectedAddress is null
    const shippingAddress = selectedAddress || addresses[0];

    if (!shippingAddress) {
      alert("Please add a delivery address");
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
            slug: item.slug,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          selectedAddressId: selectedAddress._id, // 🔥 send ID instead of full address
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
                  <div className="flex gap-2">
                    <Button onClick={() => setShowAddressForm(true)}>
                      + Add Address
                    </Button>

                    {addresses.length > 1 && (
                      <Button
                        variant="outline"
                        onClick={() => setShowAllAddresses(!showAllAddresses)}
                      >
                        {showAllAddresses ? "Done" : "Change Address"}
                      </Button>
                    )}
                  </div>

                </div>

                {showAddressForm && (
                  <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                    <h3 className="text-md font-semibold">
                      {editId ? "Edit Address" : "Add New Address"}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Full Name */}
                      <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-700">Full Name</label>
                        <input
                          name="fullName"
                          value={addressForm.fullName}
                          onChange={handleAddressChange}
                          placeholder="John Doe"
                          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-700">Mobile No.</label>
                        <input
                          name="phone"
                          value={addressForm.phone}
                          onChange={handleAddressChange}
                          placeholder="1234567890"
                          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-700">Street Address</label>
                      <textarea
                        name="address"
                        rows={2}
                        value={addressForm.address}
                        onChange={handleAddressChange}
                        placeholder="House No, Street, Area"
                        className="border rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* City */}
                      <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-700">City</label>
                        <input
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          placeholder="City"
                          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      {/* State */}
                      <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-700">State</label>
                        <input
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          placeholder="State"
                          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      {/* Pincode */}
                      <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-700">Pincode</label>
                        <input
                          name="pincode"
                          value={addressForm.pincode}
                          onChange={handleAddressChange}
                          placeholder="123456"
                          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-2 pt-1">
                      <Button variant="outline" size="sm" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveAddress}>
                        {editId ? "Update" : "Save"}
                      </Button>
                    </div>
                  </div>
                )}


                {/* ADDRESS CARD */}

                <div
                  className={`space-y-3 ${showAllAddresses ? "max-h-64 overflow-y-auto" : ""
                    }`}
                >
                  {addressToShow.map((addr) => (
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

                      {/* 🔥 EDIT / DELETE ONLY WHEN CHANGE ADDRESS MODE */}
                      {showAllAddresses && (
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
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );
                              const data = await res.json();
                              dispatch(setAddresses(data.addresses));
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
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
