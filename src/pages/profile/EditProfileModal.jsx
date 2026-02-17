import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { updateUser } from "@/redux/userSlice";

// import { setUser } from "@/redux/userSlice";

const EditProfileModal = ({ user, onClose }) => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNo: user.phoneNo || "",
        profilePic: null,
    });
    const [preview, setPreview] = useState(
        user.profilePic || "/default-user.png"
    );


    useEffect(() => {
        if (user?.profilePic) {
            setPreview(user.profilePic);
        } else {
            setPreview("/default-user.png");
        }
    }, [user]);


    /* ================= HANDLE INPUT ================= */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    /* ================= IMAGE CLICK ================= */
    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));

        setFormData({
            ...formData,
            profilePic: file,
        });
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        try {
            setLoading(true);

            const formDataToSend = new FormData();
            formDataToSend.append("firstName", formData.firstName);
            formDataToSend.append("lastName", formData.lastName);
            formDataToSend.append("phoneNo", formData.phoneNo);

            if (formData.profilePic instanceof File) {
                formDataToSend.append("profilePic", formData.profilePic);
            }
            const token = localStorage.getItem("token");

            const res = await fetch(
                "http://localhost:5000/api/v1/user/profile/update",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formDataToSend,
                }
            );

            const data = await res.json();
            dispatch(updateUser(data.user));

            toast.success("Profile Updated successful");

            if (!res.ok) {
                throw new Error(data.message || "Update failed");
            }

            onClose();

        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-md bg-[#111827] rounded-xl border border-white/10 shadow-2xl p-5"
    >
      <h3 className="text-lg font-semibold text-center mb-5">
        Edit Profile
      </h3>

      {/* ================= IMAGE ================= */}
      <div className="flex justify-center mb-5">
        <div
          onClick={handleImageClick}
          className="relative w-24 h-24 cursor-pointer group"
        >
          <img
            src={preview}
            alt="profile"
            className="w-full h-full rounded-full object-cover border-3 border-indigo-500 shadow-md"
          />

          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <span className="text-white text-xs">Change</span>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* ================= FORM ================= */}
      <div className="space-y-4">

        {/* First + Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          <InputField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        {/* Email + Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Email"
            name="email"
            value={formData.email}
            disabled
          />
          <InputField
            label="Mobile"
            name="phoneNo"
            value={formData.phoneNo}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* ================= BUTTONS ================= */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-sm disabled:opacity-50 transition"
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>
    </motion.div>
  </div>
);



};

export default EditProfileModal;

/* ================= INPUT FIELD ================= */

const InputField = ({ label, disabled = false, ...props }) => (
    <div>
        <label className="text-sm text-gray-400">{label}</label>
        <input
            {...props}
            disabled={disabled}
            className={`w-full mt-2 px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500
      ${disabled
                    ? "bg-white/5 text-gray-500 cursor-not-allowed"
                    : "bg-white/5"
                }`}
        />
    </div>
);
