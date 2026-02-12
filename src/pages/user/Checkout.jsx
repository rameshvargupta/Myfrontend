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
import {
  fetchAddresses,
  saveAddress,
  deleteAddress,
} from "@/api/addressApi";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editId, setEditId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");


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
    const loadAddresses = async () => {
      const data = await fetchAddresses();
      if (data.success) {
        dispatch(setAddresses(data.addresses));
        if (data.addresses.length > 0) {
          dispatch(selectAddress(data.addresses[0]));
        }
      }
    };

    loadAddresses();
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
      const data = await saveAddress(addressForm, editId);

      if (!data.success) {
        alert(data.message || "Address save failed");
        return;
      }

      dispatch(setAddresses(data.addresses));
      dispatch(selectAddress(data.addresses[data.addresses.length - 1]));
      toast.success("Address Added successfully");
      resetForm();
    } catch (err) {
      console.error("SAVE ADDRESS ERROR", err);
      alert("Something went wrong");
    }
  };

  const handleEditAddress = (addr) => {
    setEditId(addr._id);

    // 🔥 clone object to avoid direct reference issue
    setAddressForm({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
    });
    toast.success("Address Updated successfully");
    setShowAddressForm(true);
  };


  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const data = await deleteAddress(id);

      if (!data.success) {
        toast.error(data.message || "Delete failed");
        return;
      }

      dispatch(setAddresses(data.addresses));

      // 🔥 if deleted address was selected, reset selection
      if (selectedAddress?._id === id) {
        dispatch(selectAddress(data.addresses[0] || null));
      }

      toast.success("Address deleted successfully");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      toast.error("Something went wrong");
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
    if (!paymentMethod) {
      toast.error("Please select a payment method");
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
            categoryId: item.categoryId,
            categoryName: item.categoryName, // ✅ now filled
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          selectedAddressId: selectedAddress._id, // 🔥 send ID instead of full address
          totalAmount,
          paymentMethod:
            paymentMethod === "ONLINE"
              ? "Online Payment"
              : "Cash on Delivery",

          paymentStatus:
            paymentMethod === "ONLINE"
              ? "Pending"
              : "Pending", // COD bhi pending hi rahega
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
        <div className="max-w-5xl mx-auto px-4 space-y-6 mt-10">
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
                            onClick={() => handleEditAddress(addr)}
                          >
                            Edit
                          </Button>


                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAddress(addr._id)}   // ✅ correct
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>


              </div>

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

                {/* HEADER */}
                <div className="px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-white">
                  <h2 className="text-xl font-bold text-gray-900">
                    Order Summary
                  </h2>
                  <p className="text-sm text-gray-500">
                    Review your items before placing order
                  </p>
                </div>

                {/* ITEMS */}
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 px-6 py-5 items-center"
                    >
                      {/* PRODUCT IMAGE */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl border"
                        />
                      </div>

                      {/* PRODUCT INFO */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 line-clamp-1">
                          {item.name}
                        </p>

                        <p className="text-sm text-gray-500 mt-0.5">
                          Price: ₹{item.price}
                        </p>

                        {/* QTY CONTROLLER */}
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => handleDecreaseQty(item.productId)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center
                         hover:bg-gray-100 transition font-semibold"
                          >
                            −
                          </button>

                          <span className="min-w-[24px] text-center font-medium">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => handleIncreaseQty(item.productId)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center
                         hover:bg-gray-100 transition font-semibold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* ITEM TOTAL */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="font-bold text-gray-900 text-lg">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTAL */}
                <div className="px-6 py-5 border-t bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-pink-600">
                      ₹{totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* ================= PAYMENT METHOD ================= */}
              <div className="mt-6 bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-3">
                  Payment Method
                </h3>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3
               focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">-- Select Payment Method --</option>
                  <option value="COD">Cash on Delivery</option>
                  <option value="ONLINE">Online Payment</option>
                </select>
              </div>

              {/* ================= PLACE ORDER BUTTON ================= */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress || !paymentMethod}
                className={`mt-6 w-full py-4 rounded-2xl text-lg font-semibold transition
    ${loading || !selectedAddress || !paymentMethod
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-pink-500 text-white hover:bg-pink-600"
                  }`}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>


            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;
