// import { useDispatch, useSelector } from "react-redux";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "@/components/Navbar";
// import { clearCart } from "@/redux/cartSlice";
// import {
//   setAddresses,
//   addAddress,
//   selectAddress,
// } from "@/redux/addressSlice";

// import { toast } from "sonner";

// /* ------------------ CONSTANTS ------------------ */
// const emptyAddress = {
//   fullName: "",
//   phone: "",
//   address: "",
//   city: "",
//   pincode: "",
//   state: "",
// };

// /* ------------------ COMPONENT ------------------ */
// const PlaceOrderPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   /* ------------------ REDUX STATE ------------------ */
//   const cartItems = useSelector((state) => state.cart.cartItems);
//   const addresses = useSelector((state) => state.address.addresses);
//  const selectedAddress = addresses.find(
//   (a) => a.id === selectedAddressId
// );

//   /* ------------------ LOCAL STATE ------------------ */
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState(emptyAddress);
//   const [deliveryOption, setDeliveryOption] =
//     useState("Cash on Delivery");
//   const [paymentMethod, setPaymentMethod] =
//     useState("Cash on Delivery");

//   /* ------------------ FETCH USER ADDRESSES ------------------ */
//   useEffect(() => {
//     const fetchAddresses = async () => {
//       try {
//         const res = await fetch(
//           "http://localhost:5000/api/v1/users/profile",
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem(
//                 "token"
//               )}`,
//             },
//           }
//         );

//         const data = await res.json();

//         if (data.success && data.user?.addresses) {
//           dispatch(setAddresses(data.user.addresses));
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     if (addresses.length === 0) {
//       fetchAddresses();
//     }
//   }, [dispatch]);

//   /* ------------------ PRICE ------------------ */
//   const subtotal = cartItems.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0
//   );

//   /* ------------------ SAVE ADDRESS ------------------ */
//   const handleSaveAddress = () => {
//     const { fullName, phone, address, city, pincode, state } =
//       form;

//     if (
//       !fullName ||
//       !phone ||
//       !address ||
//       !city ||
//       !pincode ||
//       !state
//     ) {
//       return toast.error("Fill all address fields");
//     }

//     dispatch(addAddress(form));
//     dispatch(selectAddress(form));
//     toast.success("Address added");
//     setForm(emptyAddress);
//     setShowForm(false);
//   };

//   /* ------------------ PLACE ORDER ------------------ */
//   const placeOrderHandler = async () => {
//     if (!selectedAddress) {
//       return toast.error("Select delivery address");
//     }

//     try {
//       const res = await fetch(
//         "http://localhost:5000/api/v1/orders",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem(
//               "token"
//             )}`,
//           },
//           body: JSON.stringify({
//             orderItems: cartItems,
//             shippingAddress: selectedAddress,
//             totalAmount:
//               subtotal +
//               (deliveryOption === "Fast Delivery" ? 50 : 0),
//             paymentMethod,
//             deliveryOption,
//           }),
//         }
//       );

//       const data = await res.json();

//       if (!data.success) {
//         throw new Error(data.message);
//       }

//       dispatch(clearCart());
//       toast.success("Order placed successfully 🎉");
//       navigate("/order-success");
//     } catch (err) {
//       toast.error(err.message || "Order failed");
//     }
//   };

//   if (cartItems.length === 0) {
//     return <p className="text-center mt-20">Cart empty</p>;
//   }

//   /* ------------------ UI ------------------ */
//   return (
//     <>
//       <Navbar />

//       <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* ---------------- CART ---------------- */}
//         <div className="lg:col-span-2 space-y-4">
//           <h2 className="text-2xl font-bold">Your Cart</h2>

//           {cartItems.map((item) => (
//             <div
//               key={item.productId}
//               className="flex gap-4 border p-4 rounded"
//             >
//               <img
//                 src={item.image}
//                 className="w-24 h-24 rounded object-cover"
//               />
//               <div className="flex-1">
//                 <p className="font-semibold">{item.name}</p>
//                 <p>₹{item.price}</p>
//                 <p>Qty: {item.quantity}</p>
//               </div>
//               <p className="font-bold">
//                 ₹{item.price * item.quantity}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* ---------------- RIGHT ---------------- */}
//         <div className="border rounded-lg p-6 space-y-6 sticky top-24">
//           {/* ---------- ADDRESS SLIDER ---------- */}
//           <div>
//             <h2 className="text-xl font-bold mb-2">
//               Delivery Address
//             </h2>

//             {addresses.length > 0 && (
//               <div className="flex gap-4 overflow-x-auto pb-2">
//                 {addresses.map((addr, index) => (
//                   <label
//                     key={index}
//                     className={`min-w-[260px] border rounded p-3 cursor-pointer ${
//                       selectedAddress === addr
//                         ? "border-green-600 bg-green-50"
//                         : ""
//                     }`}
//                   >
//                     <input
//                       type="radio"
//                       name="address"
//                       checked={selectedAddress === addr}
//                       onChange={() =>
//                         dispatch(selectAddress(addr))
//                       }
//                       className="mr-2"
//                     />

//                     <p className="font-medium">
//                       {addr.fullName}
//                     </p>
//                     <p className="text-sm">{addr.phone}</p>
//                     <p className="text-sm line-clamp-2">
//                       {addr.address}, {addr.city}
//                     </p>
//                     <p className="text-sm">
//                       {addr.state} - {addr.pincode}
//                     </p>
//                   </label>
//                 ))}
//               </div>
//             )}

//             <button
//               onClick={() => setShowForm(true)}
//               className="mt-3 text-pink-600 underline"
//             >
//               + Add New Address
//             </button>

//             {/* ---------- ADDRESS FORM ---------- */}
//             {showForm && (
//               <div className="mt-3 space-y-2">
//                 {Object.keys(emptyAddress).map((key) => (
//                   <input
//                     key={key}
//                     value={form[key]}
//                     placeholder={key.toUpperCase()}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         [key]: e.target.value,
//                       })
//                     }
//                     className="w-full border p-2 rounded"
//                   />
//                 ))}

//                 <div className="flex gap-3">
//                   <button
//                     onClick={handleSaveAddress}
//                     className="flex-1 bg-pink-500 text-white py-2 rounded"
//                   >
//                     Save Address
//                   </button>

//                   <button
//                     onClick={() => setShowForm(false)}
//                     className="flex-1 border py-2 rounded"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ---------- SUMMARY ---------- */}
//           <div className="border-t pt-4 space-y-2">
//             <div className="flex justify-between">
//               <span>Subtotal</span>
//               <span>₹{subtotal}</span>
//             </div>

//             <div className="flex justify-between">
//               <span>Shipping</span>
//               <span>
//                 {deliveryOption === "Fast Delivery"
//                   ? "₹50"
//                   : "FREE"}
//               </span>
//             </div>

//             <hr />

//             <div className="flex justify-between font-bold">
//               <span>Total</span>
//               <span>
//                 ₹
//                 {subtotal +
//                   (deliveryOption === "Fast Delivery"
//                     ? 50
//                     : 0)}
//               </span>
//             </div>

//             <button
//               onClick={placeOrderHandler}
//               disabled={!selectedAddress}
//               className={`w-full py-3 rounded mt-3 ${
//                 !selectedAddress
//                   ? "bg-gray-300 cursor-not-allowed"
//                   : "bg-green-600 text-white"
//               }`}
//             >
//               Place Order
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default PlaceOrderPage;
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
