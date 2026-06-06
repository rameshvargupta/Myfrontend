import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddCategory from "./AddCategory";
import {
  Upload,
  ImagePlus,
  X,
  CheckCircle,
  AlertCircle,
  Package,
  Tag,
  DollarSign,
  Layers,
  Image as ImageIcon,
  ChevronDown,
  Search,
  Plus,
  RefreshCw,
  Info
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import { fetchCategories } from "@/api/productApi";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    category: "",
    images: [],
  });

  /* ================= FETCH CATEGORIES ================= */
  const getCategories = async () => {
    try {
      const data = await fetchCategories();
      if (!data.success) throw new Error(data.message);
      setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Check file sizes (max 5MB each)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    setFormData({ ...formData, images: files });

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(urls);
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });

    const newPreviews = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviewUrls(newPreviews);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".category-dropdown")) {
        setCatOpen(false);
        setCatSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.price) errors.price = "Price is required";
    if (parseFloat(formData.price) <= 0) errors.price = "Price must be greater than 0";
    if (formData.discountPrice && parseFloat(formData.discountPrice) >= parseFloat(formData.price)) {
      errors.discountPrice = "Discount price must be less than original price";
    }
    if (!formData.stock) errors.stock = "Stock is required";
    if (parseInt(formData.stock) < 0) errors.stock = "Stock cannot be negative";
    if (!formData.category) errors.category = "Please select a category";
    if (formData.images.length === 0) errors.images = "At least one product image is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "images") data.append(key, value);
      });
      formData.images.forEach((file) => {
        data.append("images", file);
      });

      const res = await fetch(`${API_URL}/api/v1/products/admin/product`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("Product added successfully ✅");
      setSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          name: "",
          description: "",
          price: "",
          discountPrice: "",
          stock: "",
          category: "",
          images: [],
        });
        setImagePreviewUrls([]);
        setSuccess(false);
      }, 2000);

    } catch (err) {
      toast.error(err.message || "Product creation failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 lg:p-8  mb-17">

        {/* HEADER */}
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <Package className="text-white" size={24} />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Add New Product
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Create a new product with detailed information and images
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <Link to="/admin/products">
                <Button className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl">
                  All Products
                </Button>
              </Link>
              <AddCategory onSuccess={fetchCategories} />
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
              <CheckCircle className="text-green-600" size={20} />
              <p className="text-green-700">Product created successfully! Redirecting...</p>
            </div>
          )}

          {/* Categories Warning */}
          {categories.length === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={20} />
              <p className="text-yellow-700">Please add a category first before creating products.</p>
            </div>
          )}
        </div>

        {/* MAIN FORM */}
        <div className="max-w-7xl mx-auto">
          {categories.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Package size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Available</h3>
              <p className="text-gray-400 mb-6">Please add a category to start adding products</p>
              <AddCategory onSuccess={fetchCategories} />
            </div>
          ) : (
            <form onSubmit={submitHandler} className="grid lg:grid-cols-3 gap-8">

              {/* LEFT COLUMN - Main Form */}
              <div className="lg:col-span-2 space-y-3">

                {/* Basic Information Card */}
                <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-4">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <Info size={20} />
                      Basic Information
                    </h3>
                  </div>

                  <div className="p-4 space-y-2">
                    {/* Product Name */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Tag size={16} className="text-indigo-500" />
                        Product Name
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${inputClass} ${formErrors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                        placeholder="e.g., iPhone 15 Pro"
                      />
                      {formErrors.name && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Category Selection */}
                    <div className="relative category-dropdown">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Layers size={16} className="text-indigo-500" />
                        Category
                      </label>

                      <div
                        onClick={() => setCatOpen(!catOpen)}
                        className={`${inputClass} cursor-pointer flex justify-between items-center ${formErrors.category ? "border-red-500" : ""}`}
                      >
                        <span className={!formData.category ? "text-gray-400" : "text-gray-700"}>
                          {formData.category
                            ? categories.find((c) => c._id === formData.category)?.name
                            : "Select Category"}
                        </span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                      </div>

                      {catOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-xl p-3 animate-in slide-in-from-top duration-200">
                          <div className="relative mb-3">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search category..."
                              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                              value={catSearch}
                              onChange={(e) => setCatSearch(e.target.value)}
                            />
                          </div>

                          <div className="max-h-52 overflow-y-auto space-y-1">
                            {filteredCategories.length === 0 ? (
                              <p className="text-gray-400 text-sm text-center py-4">No category found</p>
                            ) : (
                              filteredCategories.map((cat) => (
                                <div
                                  key={cat._id}
                                  onClick={() => {
                                    setFormData({ ...formData, category: cat._id });
                                    setCatOpen(false);
                                    setCatSearch("");
                                    if (formErrors.category) setFormErrors({ ...formErrors, category: "" });
                                  }}
                                  className="px-3 py-2 rounded-lg hover:bg-indigo-50 cursor-pointer text-sm transition-colors"
                                >
                                  {cat.name}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {formErrors.category && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Info size={16} className="text-indigo-500" />
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className={`${inputClass} resize-none ${formErrors.description ? "border-red-500" : ""}`}
                        placeholder="Write detailed product description..."
                      />
                      {formErrors.description && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing & Inventory Card */}
                <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <DollarSign size={20} />
                      Pricing & Inventory
                    </h3>
                  </div>

                  <div className="p-4">
                    <div className="grid md:grid-cols-3 gap-3">
                      {/* Price */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                          <DollarSign size={16} className="text-green-500" />
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className={`${inputClass} ${formErrors.price ? "border-red-500" : ""}`}
                          placeholder="0.00"
                        />
                        {formErrors.price && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>
                        )}
                      </div>

                      {/* Discount Price */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                          <Tag size={16} className="text-orange-500" />
                          Discount Price (₹)
                        </label>
                        <input
                          type="number"
                          name="discountPrice"
                          value={formData.discountPrice}
                          onChange={handleChange}
                          className={`${inputClass} ${formErrors.discountPrice ? "border-red-500" : ""}`}
                          placeholder="0.00"
                        />
                        {formErrors.discountPrice && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.discountPrice}</p>
                        )}
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                          <Package size={16} className="text-blue-500" />
                          Stock
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          className={`${inputClass} ${formErrors.stock ? "border-red-500" : ""}`}
                          placeholder="0"
                        />
                        {formErrors.stock && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.stock}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Images & Submit */}
              <div className="space-y-2 ">

                {/* Image Upload Card */}
                <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden sticky top-15">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <ImageIcon size={20} />
                      Product Images
                    </h3>
                  </div>

                  <div className="p-4">
                    <label className="cursor-pointer block">
                      <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl px-6 py-8 transition-all hover:border-indigo-500 hover:bg-indigo-50 ${formErrors.images ? "border-red-500 bg-red-50" : "border-gray-300"}`}>
                        <ImagePlus size={32} className={`mb-3 ${formErrors.images ? "text-red-500" : "text-gray-400"}`} />
                        <p className="text-sm text-gray-600 font-medium">Click to upload product images</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB each</p>
                        <p className="text-xs text-indigo-500 mt-2">Maximum 5 images</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>

                    {formErrors.images && (
                      <p className="text-xs text-red-500 mt-2 text-center">{formErrors.images}</p>
                    )}

                    {/* Image Preview Grid */}
                    {imagePreviewUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mt-5">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-xl border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={20} className="animate-spin mr-2" />
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="mr-2" />
                      Publish Product
                    </>
                  )}
                </Button>

                {/* Info Note */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-blue-500 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-semibold mb-1">Product Publishing Tips:</p>
                      <ul className="space-y-1">
                        <li>• Use high-quality images for better visibility</li>
                        <li>• Set competitive pricing with discounts</li>
                        <li>• Write detailed descriptions for SEO</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      <FooterNavbar />
    </>
  );
};

export default AddProduct;