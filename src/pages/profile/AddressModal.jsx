import { motion } from "framer-motion";

const AddressModal = ({
  addressForm,
  setAddressForm,
  onClose,
  onSave,
  editId,
}) => {

  const handleChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1e293b] p-8 rounded-2xl w-full max-w-lg space-y-4"
      >
        <h2 className="text-xl font-semibold text-white">
          {editId ? "Edit Address" : "Add New Address"}
        </h2>

        {["fullName","phone","address","city","state","pincode"].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={addressForm[field] || ""}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white"
          />
        ))}

        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 rounded-lg text-white"
          >
            Cancel
          </button>

          <button
            onClick={onSave}   // ✅ Correct
            className="px-4 py-2 bg-indigo-600 rounded-lg text-white"
          >
            {editId ? "Update" : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddressModal;
