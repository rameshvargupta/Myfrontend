import React from "react";

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">

      <div className="bg-white rounded-xl shadow-xl p-6 w-[400px] animate-fadeIn">

        <h2 className="text-xl font-semibold mb-3">
          Delete Coupon
        </h2>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this coupon?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
};

export default DeleteModal;