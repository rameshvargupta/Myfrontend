import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddCategory from "./AddCategory";
import { Upload, ImagePlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import { fetchCategories } from "@/api/productApi";
const API_URL = import.meta.env.VITE_API_URL;

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
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
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5)
      return toast.error("Maximum 5 images allowed");

    setFormData({ ...formData, images: files });
  };
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".relative")) {
        setCatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!formData.category)
      return toast.error("Please select category");

    if (formData.images.length > 5)
      return toast.error("Maximum 5 images allowed");

    try {
      setLoading(true);

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "images") data.append(key, value);
      });

      formData.images.forEach((file) => {
        data.append("images", file);
      });

      const res = await fetch(
        `${API_URL}/api/v1/products/admin/product`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: data,
        }
      );

      const result = await res.json();
      if (!res.ok) return toast.error(result.message);

      toast.success("Product added successfully ✅");

      setFormData({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        stock: "",
        category: "",
        images: [],
      });
    } catch (err) {
      toast.error("Product creation failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm \
     focus:outline-none focus:ring-2 focus:ring-black/30 focus:border-black";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-5 mb-14 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="rounded-3xl shadow-xl border-0">
            <CardHeader className="border-b pb-6">
              <div className="
    flex 
    flex-col 
    md:flex-col 
    lg:flex-row 
    lg:items-center 
    lg:justify-between 
    gap-6
  ">

                {/* LEFT SIDE */}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                    Add New Product
                  </CardTitle>

                  <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-lg">
                    Create a new product with detailed information and images.
                  </p>
                </div>

                {/* RIGHT SIDE */}
                <div className="
      w-full 
      md:w-full 
      lg:w-auto 
      flex 
      justify-start 
      lg:justify-end
    ">
                  <AddCategory onSuccess={fetchCategories} />
                </div>

              </div>
            </CardHeader>

            <CardContent className="">
              {categories.length === 0 ? (
                <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
                  <p className="text-red-600 font-medium">
                    ⚠ Please add a category first
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={submitHandler}
                  className="grid lg:grid-cols-3 gap-10"
                >
                  {/* LEFT SIDE (MAIN FORM) */}
                  <div className="lg:col-span-2 space-y-12">

                    {/* BASIC INFO */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border">
                      <h3 className="text-xl font-semibold mb-6">
                        Basic Information
                      </h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium">
                            Product Name
                          </label>
                          <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="e.g. iPhone 15 Pro"
                          />
                        </div>

                        <div className="relative">
                          <label className="text-sm font-medium">
                            Category
                          </label>

                          {/* Trigger */}
                          <div
                            onClick={() => setCatOpen(!catOpen)}
                            className={`${inputClass} cursor-pointer flex justify-between items-center`}
                          >
                            <span>
                              {formData.category
                                ? categories.find((c) => c._id === formData.category)?.name
                                : "Select Category"}
                            </span>
                            <span className="text-gray-400 text-xs">▼</span>
                          </div>

                          {/* Dropdown */}
                          {catOpen && (
                            <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-xl p-3">

                              {/* SEARCH INPUT */}
                              <input
                                type="text"
                                placeholder="Search category..."
                                className="w-full mb-3 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-black/30"
                                value={catSearch}
                                onChange={(e) => setCatSearch(e.target.value)}
                              />

                              {/* CATEGORY LIST */}
                              <div
                                className={`space-y-1 ${filteredCategories.length > 6
                                  ? "max-h-52 overflow-y-auto"
                                  : ""
                                  }`}
                              >
                                {filteredCategories.length === 0 ? (
                                  <p className="text-gray-400 text-sm">
                                    No category found
                                  </p>
                                ) : (
                                  filteredCategories.map((cat) => (
                                    <div
                                      key={cat._id}
                                      onClick={() => {
                                        setFormData({
                                          ...formData,
                                          category: cat._id,
                                        });
                                        setCatOpen(false);
                                        setCatSearch("");
                                      }}
                                      className="px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                      {cat.name}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                      <div className="mt-6">
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={5}
                          className={`${inputClass} resize-none`}
                          placeholder="Write detailed product description..."
                        />
                      </div>
                    </section>

                    {/* PRICING */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border">
                      <h3 className="text-xl font-semibold mb-6">
                        Pricing & Inventory
                      </h3>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="text-sm font-medium">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Discount Price (₹)
                          </label>
                          <input
                            type="number"
                            name="discountPrice"
                            value={formData.discountPrice}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Stock
                          </label>
                          <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* RIGHT SIDE (IMAGE + SUBMIT) */}
                  <div className="space-y-8">

                    {/* IMAGE UPLOAD */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border">
                      <h3 className="text-xl font-semibold mb-6">
                        Product Images
                      </h3>

                      <label className="cursor-pointer block">
                        <div className="flex flex-col items-center justify-center 
                            border-2 border-dashed border-gray-300 
                            rounded-2xl px-6 py-10 
                            hover:border-black transition text-center">

                          <ImagePlus size={28} className="mb-4 text-gray-500" />

                          <p className="text-sm text-gray-600">
                            Click to upload product images
                          </p>

                          <p className="text-xs text-gray-400 mt-2">
                            Max 5 images allowed
                          </p>
                        </div>

                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>

                      {/* IMAGE PREVIEW */}
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          {formData.images.map((file, index) => (
                            <img
                              key={index}
                              src={URL.createObjectURL(file)}
                              alt="preview"
                              className="h-24 w-full object-cover rounded-xl"
                            />
                          ))}
                        </div>
                      )}
                    </section>

                    {/* SUBMIT BUTTON */}
                    <div className="sticky top-24">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-6 text-lg rounded-2xl"
                      >
                        {loading
                          ? "Adding Product..."
                          : "Publish Product"}
                      </Button>
                    </div>

                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <FooterNavbar />
    </>
  );
};

export default AddProduct;