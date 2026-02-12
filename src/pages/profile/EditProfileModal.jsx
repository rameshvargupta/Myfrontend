import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {updateUser } from "@/redux/userSlice";

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#111827] w-[95%] max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl"
            >
                <h3 className="text-2xl font-semibold mb-6 text-center">
                    Edit Profile
                </h3>

                {/* ================= IMAGE PREVIEW ================= */}
                <div className="flex justify-center mb-6">
                    <div
                        onClick={handleImageClick}
                        className="relative cursor-pointer group"
                    >
                        <img
                            src={preview}
                            alt="profile"
                            className="w-28 h-28 rounded-full border-4 border-white/20 object-cover"
                        />

                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm">
                            Change
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

                {/* ================= BUTTONS ================= */}
                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-50"
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
