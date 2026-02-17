
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
import { Upload } from "lucide-react";
import Navbar from "@/components/Navbar";

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

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
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/categories");
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

      for (let i = 0; i < formData.images.length; i++) {
        data.append("images", formData.images[i]);
      }

      const res = await fetch(
        "http://localhost:5000/api/v1/admin/product",
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

  /* ================= INPUT STYLE ================= */
  const inputClass =
    "w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm \
     focus:outline-none focus:ring-2 focus:ring-black/30 focus:border-black";

  return (
    <>
  <Navbar/>
    <div className="max-w-4xl mx-auto">
      <AddCategory onSuccess={fetchCategories} />

      <Card className="rounded-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Add New Product
          </CardTitle>
          <p className="text-sm text-gray-500">
            Fill product details carefully before publishing
          </p>
        </CardHeader>

        <CardContent>
          {categories.length === 0 ? (
            <p className="text-red-500 font-medium">
              ⚠ Please add a category first
            </p>
          ) : (
            <form onSubmit={submitHandler} className="space-y-10">
              {/* BASIC INFO */}
              <section>
                <h3 className="text-lg font-semibold mb-4">
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

                  <div>
                    <label className="text-sm font-medium">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
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
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder="Write detailed product description..."
                  />
                </div>
              </section>

              {/* PRICING */}
              <section>
                <h3 className="text-lg font-semibold mb-4">
                  Pricing
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
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
                </div>
              </section>

              {/* INVENTORY */}
              <section>
                <h3 className="text-lg font-semibold mb-4">
                  Inventory
                </h3>

                <div className="w-full md:w-1/2">
                  <label className="text-sm font-medium">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </section>

              {/* IMAGES */}
              <section>
                <h3 className="text-lg font-semibold mb-4">
                  Product Images
                </h3>

                <label className="cursor-pointer block">
                  <div className="flex items-center justify-between gap-4 
                      border-2 border-dashed border-gray-300 
                      rounded-2xl px-6 py-6 
                      hover:border-black transition">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Upload size={18} />
                      <span className="text-sm">
                        {formData.images.length
                          ? `${formData.images.length} image(s) selected`
                          : "Click to upload product images"}
                      </span>
                    </div>
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                      Max 5
                    </span>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        images: e.target.files,
                      })
                    }
                  />
                </label>
              </section>

              {/* SUBMIT */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-lg rounded-xl"
              >
                {loading ? "Adding Product..." : "Add Product"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
      </>
  );
};

export default AddProduct;
