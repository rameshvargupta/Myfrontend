// src/components/ExpectedDelivery.jsx
import React from "react";
import PropTypes from "prop-types";
import { Truck } from "lucide-react";

const ExpectedDelivery = ({ pincode, className }) => {
  if (!pincode) return null;

  const getDeliveryRange = (pincode) => {
    const today = new Date();
    let minDays = 4, maxDays = 6;

    if (pincode.startsWith("22")) {
      minDays = 2;
      maxDays = 4;
    }

    const min = new Date(today);
    min.setDate(today.getDate() + minDays);

    const max = new Date(today);
    max.setDate(today.getDate() + maxDays);

    return { min, max };
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const range = getDeliveryRange(pincode);

  return (
    <span className="flex items-center gap-1">
      <Truck size={16} className="mt-[1px]" />
      <span>
        Delivery: {formatDate(range.min)} - {formatDate(range.max)}
      </span>
    </span>
  );
};

ExpectedDelivery.propTypes = {
  pincode: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ExpectedDelivery;