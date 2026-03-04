import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { X, Pencil, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";

const POSITIONS = ["TOP", "MIDDLE", "BOTTOM"];

const AddBanners = () => {
  const [banners, setBanners] = useState({});
  const [files, setFiles] = useState({});
  const [editMode, setEditMode] = useState({});
  const [uploading, setUploading] = useState({});

  const token = localStorage.getItem("token");

  const fetchBanners = async (pos) => {
    const res = await axios.get(`/api/v1/banners/active?position=${pos}`);
    setBanners((p) => ({ ...p, [pos]: res.data }));
  };

  useEffect(() => {
    POSITIONS.forEach(fetchBanners);
  }, []);

  /* ================= UPLOAD ================= */
  const uploadImages = async (pos) => {
    if (!files[pos]?.length) return toast.error("Select image(s)");

    try {
      setUploading((p) => ({ ...p, [pos]: true }));

      const formData = new FormData();
      formData.append("position", pos);

      Array.from(files[pos]).forEach((f) =>
        formData.append("images", f)
      );

      await axios.post("/api/v1/banners", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Banner images uploaded");
      fetchBanners(pos);
      setFiles((p) => ({ ...p, [pos]: null }));
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading((p) => ({ ...p, [pos]: false }));
    }
  };


  /* ================= DELETE ================= */
  const deleteImage = async (pos, bannerId, imageId) => {
    await axios.delete(
      `/api/v1/banners/${bannerId}/image/${imageId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Image deleted");
    fetchBanners(pos);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto  space-y-2 mb-15">
        <h1 className="text-3xl font-bold pl-6">Banner Manager</h1>

        {POSITIONS.map((pos) => {
          const banner = banners[pos];
          const isEdit = editMode[pos];

          return (
            <div
              key={pos}
              className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{pos} Banner</h2>

                <button
                  onClick={() =>
                    setEditMode((p) => ({ ...p, [pos]: !p[pos] }))
                  }
                  className="flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <Pencil size={14} />
                  {isEdit ? "Done" : "Edit"}
                </button>
              </div>

              {/* IMAGE SCROLLER */}
              <div className="flex gap-6 overflow-x-auto pb-4  scrollbar-hide">
                {banner?.images?.map((img) => (
                  <div
                    key={img._id}
                    className="relative min-w-[200px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* IMAGE */}
                    <img
                      src={img.imageUrl}
                      className="h-36 w-full object-cover rounded-t-2xl"
                    />

                    {/* CARD FOOTER */}
                    <div className="p-2 text-center text-xs text-gray-500">
                      Banner Image
                    </div>

                    {/* DELETE ICON (EDIT MODE) */}
                    {isEdit && (
                      <>
                        <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>

                        <button
                          onClick={() =>
                            deleteImage(pos, banner._id, img._id)
                          }
                          className="absolute top-2 right-2 bg-black/60 backdrop-blur 
                     text-white rounded-full p-1.5 shadow-md 
                     hover:bg-red-600 hover:scale-110 transition"
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}

                  </div>
                ))}
              </div>


              {/* UPLOAD SECTION */}
              <div className="flex flex-col md:flex-row items-center gap-4 mt-4">

                {/* FILE PICKER */}
                <label className="w-full md:flex-1 cursor-pointer">
                  <div className="flex items-center justify-between gap-4 
                    border-2 border-dashed border-gray-300 
                    rounded-xl px-4 py-3 
                    hover:border-black transition">

                    <div className="flex items-center gap-3 text-gray-600">
                      <Upload size={18} />
                      <span className="text-sm">
                        {files[pos]?.length
                          ? `${files[pos].length} file(s) selected`
                          : "Click to select banner image(s)"}
                      </span>
                    </div>

                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                      JPG / PNG
                    </span>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setFiles((p) => ({ ...p, [pos]: e.target.files }))
                    }
                    className="hidden"
                  />
                </label>

                {/* UPLOAD BUTTON */}
                <button
                  onClick={() => uploadImages(pos)}
                  disabled={uploading[pos]}
                  className={`group flex items-center justify-center gap-2 
    px-6 py-3 rounded-xl 
    font-medium text-white
    transition-all duration-200
    ${uploading[pos]
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-black to-gray-800 hover:shadow-xl active:scale-95"
                    }`}
                >
                  {uploading[pos] ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
                        />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="group-hover:animate-bounce" />
                      Upload Banner
                    </>
                  )}
                </button>

              </div>

            </div>
          );
        })}
      </div>
      <FooterNavbar />
    </>
  );
};

export default AddBanners;
