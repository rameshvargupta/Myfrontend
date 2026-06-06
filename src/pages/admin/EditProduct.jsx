import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Upload, 
  Package, 
  Tag, 
  DollarSign, 
  Layers, 
  Image as ImageIcon,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Trash2,
  X,
  Info,
  ShoppingBag,
  Save
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import { fetchCategories } from "@/api/productApi";

const API_URL = import.meta.env.VITE_API_URL;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [replaceImages, setReplaceImages] = useState(false);
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
    oldImages: [],
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

  /* ================= FETCH PRODUCT ================= */
  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/products/admin/product/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (!data.success) {
        toast.error("Product not found");
        navigate("/admin/products");
        return;
      }

      const p = data.product;

      setFormData({
        name: p.name,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice || "",
        stock: p.stock,
        category: p.category?._id || "",
        oldImages: p.images || [],
        images: [],
      });
    } catch (err) {
      toast.error("Failed to load product");
      navigate("/admin/products");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
    fetchProduct();
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
  
  const removeNewImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
    
    const newPreviews = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviewUrls(newPreviews);
  };

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
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("discountPrice", formData.discountPrice);
      data.append("stock", formData.stock);
      data.append("category", formData.category);
      data.append("replaceImages", replaceImages);

      for (let img of formData.images) {
        data.append("images", img);
      }

      const res = await fetch(`${API_URL}/api/v1/products/admin/product/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("Product updated successfully ✅");
      setSuccess(true);
      
      // Navigate after 2 seconds
      setTimeout(() => {
        navigate("/admin/products");
      }, 2000);
      
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const inputClass = "w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

  if (fetchLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="animate-spin text-indigo-600" size={40} />
            <p className="text-gray-500">Loading product details...</p>
          </div>
        </div>
        <FooterNavbar />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 lg:p-8 mb-15">
        
        {/* HEADER */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                  <Package className="text-white" size={24} />
                </div>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Edit Product
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Update product information, pricing, and images
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <Link to="/admin/add-product">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all">
                  + Add Product
                </Button>
              </Link>
              <Link to="/admin/products">
                <Button variant="outline" className="border-2 border-gray-200 px-5 py-2.5 rounded-xl">
                  All Products
                </Button>
              </Link>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
              <CheckCircle className="text-green-600" size={20} />
              <p className="text-green-700">Product updated successfully! Redirecting to products list...</p>
            </div>
          )}
        </div>

        {/* MAIN FORM */}
        <div className="max-w-7xl mx-auto">
          <form onSubmit={submitHandler} className="grid lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN - Main Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Information Card */}
              <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-4">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Info size={20} />
                    Basic Information
                  </h3>
                </div>
                
                <div className="p-4 space-y-3">
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
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                      <Layers size={16} className="text-indigo-500" />
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`${inputClass} ${formErrors.category ? "border-red-500" : ""}`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
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
                
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-5">
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
                        <ShoppingBag size={16} className="text-blue-500" />
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
            <div className="space-y-6">
              
              {/* Existing Images Card */}
              {formData.oldImages.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <ImageIcon size={20} />
                      Current Images
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-3">
                      {formData.oldImages.map((img, index) => (
                        <img
                          key={img.public_id || index}
                          src={img.url}
                          alt="Product"
                          className="w-full h-24 object-cover rounded-xl border"
                        />
                      ))}
                    </div>
                    
                    <label className="flex items-center gap-3 mt-5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                      <input
                        type="checkbox"
                        checked={replaceImages}
                        onChange={(e) => setReplaceImages(e.target.checked)}
                        className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">
                        Replace all existing images
                      </span>
                      {replaceImages && (
                        <AlertCircle size={14} className="text-red-500 ml-auto" />
                      )}
                    </label>
                    
                    {replaceImages && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Current images will be removed when you upload new ones
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* New Images Upload Card */}
              <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Upload size={20} />
                    Upload New Images
                  </h3>
                </div>
                
                <div className="p-6">
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl px-6 py-8 transition-all hover:border-indigo-500 hover:bg-indigo-50">
                      <Upload size={32} className="mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600 font-medium">Click to upload new images</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB each</p>
                      <p className="text-xs text-indigo-500 mt-2">Maximum 5 images</p>
                      {formData.images.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          {formData.images.length} image(s) selected
                        </p>
                      )}
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  {/* New Images Preview */}
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
                            onClick={() => removeNewImage(index)}
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
                className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin mr-2" />
                    Updating Product...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" />
                    Update Product
                  </>
                )}
              </Button>

              {/* Info Note */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-500 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-semibold mb-1">Update Tips:</p>
                    <ul className="space-y-1">
                      <li>• Check the "Replace images" box to update product photos</li>
                      <li>• Discount price must be less than original price</li>
                      <li>• Changes will reflect immediately on the store</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <FooterNavbar />
    </>
  );
};

export default EditProduct;