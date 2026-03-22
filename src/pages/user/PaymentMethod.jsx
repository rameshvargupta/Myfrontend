import React from "react";
import { CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";

const PaymentMethod = ({ paymentMethod, setPaymentMethod }) => {

  const methods = [
    {
      id: "ONLINE",
      title: "Pay Online",
      desc: "UPI, Cards, Netbanking",
      icon: <CreditCard size={20} />,
      highlight: "Coming Soon",
      disabled: true, // ✅ correct flag
    },
    {
      id: "COD",
      title: "Cash on Delivery",
      desc: "Pay when product arrives",
      icon: <Truck size={20} />,
      disabled: false,
    },
  ];

  const handleSelect = (method) => {
    if (method.disabled) {
      toast.info("Online payment coming soon 🚀");
      return;
    }
    setPaymentMethod(method.id);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">
        Payment Method
      </h2>

      <div className="grid gap-4">
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => handleSelect(method)}
            className={`p-4 rounded-xl border transition 
              ${
                method.disabled
                  ? "bg-gray-100 cursor-not-allowed opacity-60"
                  : paymentMethod === method.id
                  ? "border-pink-500 bg-pink-50 cursor-pointer"
                  : "hover:border-gray-400 cursor-pointer"
              }
            `}
          >
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-3">
                {method.icon}
                <div>
                  <h3 className="font-medium">
                    {method.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {method.desc}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                
                {method.highlight && (
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                    {method.highlight}
                  </span>
                )}

                {method.disabled && (
                  <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-full">
                    Disabled
                  </span>
                )}

              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethod;