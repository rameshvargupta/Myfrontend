import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function Profile() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    address: "",
    city: "",
    pinCode: "",
  });

  const [imagePreview, setImagePreview] = useState("/download.png");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  if (!user || loading) return;

  setFormData({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phoneNo: user.phoneNo || "",
    address: user.address || "",
    city: user.city || "",
    pinCode: user.pinCode || "",
  });

  const imageUrl = user.profilePic || "/download.png";
  setImagePreview(`${imageUrl}?t=${new Date(user.updatedAt).getTime()}`);
}, [user, loading]);


  /* =============================
     INPUT HANDLERS
  ============================== */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // instant preview
  };

  /* =============================
     SUBMIT
  ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value)
      );

      if (imageFile) data.append("avatar", imageFile);

      const res = await fetch(
        "http://localhost:5000/api/v1/user/update-profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      const updatedUser = {
        ...result.user,
        avatar: {
          url: result.user.profilePic,
          publicId: result.user.profilePicPublicId,
        },
      };

      // 🔥 REDUX UPDATE (single source of truth)
      dispatch(setUser({ user: updatedUser, token }));

      toast.success("Profile updated successfully ✅");
      setImageFile(null);
    } catch (err) {
      toast.error(err.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     UI
  ============================== */
  return (
    <div className="pt-20 min-h-screen flex justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-6 text-center">
          Update Profile
        </h2>

        <div className="flex flex-col items-center mb-6">
          <img
            src={imagePreview}
            alt="Profile"
            className="w-28 h-28 rounded-full border object-cover"
          />

          <Label className="mt-3 cursor-pointer bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded">
            Change Photo
            <input type="file" hidden onChange={handleImageChange} />
          </Label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            "firstName",
            "lastName",
            "phoneNo",
            "address",
            "city",
            "pinCode",
          ].map((field) => (
            <input
              key={field}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={field}
              className="w-full border p-2 rounded"
            />
          ))}

          <input
            disabled
            value={user?.email || ""}
            className="w-full border p-2 rounded bg-gray-100"
          />

          <Button
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-500"
          >
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
