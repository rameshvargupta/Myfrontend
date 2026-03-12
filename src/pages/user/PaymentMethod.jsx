import React from "react";

const PaymentMethod = ({ paymentMethod, setPaymentMethod }) => {

  return (

    <div className="border p-4 rounded-lg bg-white mt-4">

      <h2 className="font-semibold mb-3">Payment Method</h2>

      <div className="flex flex-col gap-3">

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="COD"
            checked={paymentMethod === "COD"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash On Delivery
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="ONLINE"
            checked={paymentMethod === "ONLINE"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Razorpay / Online Payment
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="UPI"
            checked={paymentMethod === "UPI"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          UPI
        </label>

      </div>

    </div>

  );

};

export default PaymentMethod;