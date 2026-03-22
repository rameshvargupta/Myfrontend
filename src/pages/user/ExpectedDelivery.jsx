// src/components/ExpectedDelivery.jsx
import React from "react";
import PropTypes from "prop-types";
import { Truck } from "lucide-react";

const ExpectedDelivery = ({ pincode, className }) => {
  if (!pincode) return null;

  const getDeliveryRange = (pincode) => {
    const today = new Date();
    let minDays = 4, maxDays = 6;

    if (pincode.startsWith("22")) { minDays = 2; maxDays = 4; }

    const min = new Date(today);
    min.setDate(today.getDate() + minDays);

    const max = new Date(today);
    max.setDate(today.getDate() + maxDays);

    return { min, max };
  };

  const range = getDeliveryRange(pincode);

  if (!range) return null;

  return (
    <div className={`bg-green-50 border border-green-200 rounded-xl p-4 mt-4 ${className || ""}`}>
      <div className="flex items-center gap-2 text-green-700 font-medium">
        <Truck size={18} /> 
        <span>Expected Delivery: {range.min.toLocaleDateString()} - {range.max.toLocaleDateString()}</span>
      </div>
    </div>
  );
};

ExpectedDelivery.propTypes = {
  pincode: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ExpectedDelivery;