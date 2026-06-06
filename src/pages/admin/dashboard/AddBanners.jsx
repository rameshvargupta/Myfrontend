import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Pencil, Upload, Trash2, Check, CloudUpload, AlertCircle, TrendingUp, Image as ImageIcon, Loader, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";

const API_URL = import.meta.env.VITE_API_URL;

const POSITIONS = [
  { key: "TOP", label: "Top Banner", icon: "🎯", color: "purple", description: "Hero Section" },
  { key: "MIDDLE", label: "Middle Banner", icon: "📊", color: "blue", description: "Mid Page" },
  { key: "BOTTOM", label: "Bottom Banner", icon: "🎨", color: "green", description: "Footer Section" }
];

const AddBanners = () => {
  const [banners, setBanners] = useState({});
  const [files, setFiles] = useState({});
  const [editMode, setEditMode] = useState({});
  const [uploading, setUploading] = useState({});
  const [deleting, setDeleting] = useState({});
  const [loading, setLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  const token = localStorage.getItem("token");

  const fetchBanners = async (pos) => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/banners/active?position=${pos}`);
      setBanners((p) => ({ ...p, [pos]: res.data }));
    } catch (err) {
      toast.error(`Failed to fetch ${pos} banners`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all(POSITIONS.map(({ key }) => fetchBanners(key)));
  }, []);

  const handleFileSelect = (pos, selectedFiles) => {
    if (selectedFiles.length > 10) {
      toast.error("Maximum 10 images per upload");
      return;
    }

    const validFiles = Array.from(selectedFiles).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) toast.error(`${file.name} is not an image file`);
      if (!isValidSize) toast.error(`${file.name} exceeds 5MB limit`);
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    setFiles((p) => ({ ...p, [pos]: validFiles }));
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages((p) => ({ ...p, [pos]: previews }));
  };

  const uploadImages = async (pos) => {
    if (!files[pos]?.length) {
      toast.error("Please select at least one image to upload");
      return;
    }

    try {
      setUploading((p) => ({ ...p, [pos]: true }));
      setUploadProgress((p) => ({ ...p, [pos]: 0 }));

      const formData = new FormData();
      formData.append("position", pos);
      files[pos].forEach((f) => formData.append("images", f));

      const progressInterval = setInterval(() => {
        setUploadProgress((p) => ({
          ...p,
          [pos]: Math.min((p[pos] || 0) + 10, 90)
        }));
      }, 200);

      await axios.post(`${API_URL}/api/v1/banners`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress((p) => ({ ...p, [pos]: 100 }));

      toast.success(`Successfully uploaded ${files[pos].length} banner image(s)`);

      if (previewImages[pos]) {
        previewImages[pos].forEach(url => URL.revokeObjectURL(url));
      }

      fetchBanners(pos);
      setFiles((p) => ({ ...p, [pos]: null }));
      setPreviewImages((p) => ({ ...p, [pos]: null }));

      setTimeout(() => {
        setUploadProgress((p) => ({ ...p, [pos]: 0 }));
      }, 1000);

    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed. Please try again.");
      setUploadProgress((p) => ({ ...p, [pos]: 0 }));
    } finally {
      setUploading((p) => ({ ...p, [pos]: false }));
    }
  };

  const deleteImage = async (pos, bannerId, imageId) => {
    try {
      setDeleting((p) => ({ ...p, [`${pos}-${imageId}`]: true }));

      await axios.delete(
        `${API_URL}/api/v1/banners/${bannerId}/image/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Image deleted successfully");
      fetchBanners(pos);
    } catch (err) {
      toast.error("Failed to delete image");
    } finally {
      setTimeout(() => {
        setDeleting((p) => ({ ...p, [`${pos}-${imageId}`]: false }));
      }, 500);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {[1, 2].map((j) => (
              <div key={j} className="min-w-[200px]">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const StatisticsHeader = () => {
    const totalBanners = Object.values(banners).reduce(
      (acc, banner) => acc + (banner?.images?.length || 0), 0
    );
    const activePositions = Object.values(banners).filter(b => b?.images?.length > 0).length;

    const stats = [
      { label: "Total Banners", value: totalBanners, icon: ImageIcon, color: "purple" },
      { label: "Active Positions", value: `${activePositions}/3`, icon: TrendingUp, color: "blue" },
      { label: "Storage Used", value: `${Math.round(totalBanners * 0.5)}MB`, icon: CloudUpload, color: "green" },
      { label: "Last Updated", value: "Today", icon: TrendingUp, color: "orange" }
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">{stat.label}</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Banner Manager
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage banners across different positions</p>
        </div>

        {/* Statistics Header */}
        <StatisticsHeader />

        {/* Main Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-4">
            {POSITIONS.map(({ key: pos, label, icon, color, description }) => {
              const banner = banners[pos];
              const isEdit = editMode[pos];
              const hasImages = banner?.images?.length > 0;
              const previews = previewImages[pos];

              return (
                <div
                  key={pos}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Section Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        <div>
                          <h2 className="font-semibold text-gray-800">{label}</h2>
                          <p className="text-xs text-gray-500">{description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setEditMode((p) => ({ ...p, [pos]: !p[pos] }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isEdit
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {isEdit ? (
                          <>
                            <Check size={14} />
                            Done
                          </>
                        ) : (
                          <>
                            <Pencil size={14} />
                            Edit
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-4">
                    {/* Empty State */}
                    {!hasImages && !isEdit && !previews && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No banners uploaded</p>
                        <p className="text-xs text-gray-400 mt-1">Click Edit to add banners</p>
                      </div>
                    )}

                    {/* Horizontal Image Gallery */}
                    {(hasImages || previews) && (
                      <div className="relative">
                        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
                          {/* Preview Images */}
                          {previews?.map((preview, idx) => (
                            <div
                              key={`preview-${idx}`}
                              className="relative flex-shrink-0 w-[180px] sm:w-[200px] group"
                            >
                              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={preview}
                                  alt={`Preview ${idx + 1}`}
                                  className="h-28 w-full object-cover"
                                />
                                <div className="absolute top-1 right-1">
                                  <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                                    New
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Existing Images */}
                          {banner?.images?.map((img) => (
                            <div
                              key={img._id}
                              className="relative flex-shrink-0 w-[180px] sm:w-[200px] group"
                            >
                              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={img.imageUrl}
                                  alt="Banner"
                                  className="h-28 w-full object-cover"
                                />

                                {/* Hover Overlay */}
                                <div className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${isEdit ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                  }`}>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    {isEdit && (
                                      <button
                                        onClick={() => deleteImage(pos, banner._id, img._id)}
                                        disabled={deleting[`${pos}-${img._id}`]}
                                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-transform hover:scale-110 disabled:opacity-50"
                                      >
                                        {deleting[`${pos}-${img._id}`] ? (
                                          <Loader size={14} className="animate-spin" />
                                        ) : (
                                          <Trash2 size={14} />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Edit Mode Badge */}
                                {isEdit && (
                                  <div className="absolute top-1 right-1">
                                    <div className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded shadow">
                                      Edit
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload Section */}
                    {isEdit && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row gap-3">
                            {/* File Upload Area */}
                            <div className="flex-1">
                              <label className="block cursor-pointer">
                                <div className={`rounded-lg border-2 border-dashed transition-all p-4 text-center ${files[pos]?.length
                                  ? "border-green-400 bg-green-50"
                                  : "border-gray-300 hover:border-gray-400 bg-white"
                                  }`}>
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => handleFileSelect(pos, e.target.files)}
                                    className="hidden"
                                  />

                                  <CloudUpload className={`w-8 h-8 mx-auto mb-2 ${files[pos]?.length ? "text-green-500" : "text-gray-400"
                                    }`} />

                                  {files[pos]?.length ? (
                                    <div>
                                      <p className="text-sm font-medium text-green-600">
                                        {files[pos].length} file(s) selected
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {(files[pos].reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)}MB total
                                      </p>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm text-gray-600">Click to select images</p>
                                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max 10 • 5MB each</p>
                                    </div>
                                  )}
                                </div>
                              </label>
                            </div>

                            {/* Upload Button */}
                            <div className="sm:w-36">
                              <button
                                onClick={() => uploadImages(pos)}
                                disabled={uploading[pos] || !files[pos]?.length}
                                className="w-full relative overflow-hidden"
                              >
                                <div className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${uploading[pos] || !files[pos]?.length
                                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                                  }`}>
                                  <div className="flex items-center justify-center gap-2">
                                    {uploading[pos] ? (
                                      <>
                                        <Loader size={14} className="animate-spin" />
                                        <span>{uploadProgress[pos]}%</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload size={14} />
                                        Upload
                                      </>
                                    )}
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* Upload Tips */}
                          {!files[pos]?.length && (
                            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                              <AlertCircle size={12} />
                              <span>1920x600px (Top) | 1200x400px (Middle/Bottom)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FooterNavbar />

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default AddBanners;