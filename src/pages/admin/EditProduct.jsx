import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import Navbar from "@/components/Navbar";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replaceImages, setReplaceImages] = useState(false);

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
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/categories");
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH PRODUCT ================= */
  const fetchProduct = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/admin/product/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      if (!data.success) return toast.error("Product not found");

      const p = data.product;

      setFormData({
        name: p.name,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        category: p.category?._id,
        oldImages: p.images,
        images: [],
      });
    } catch (err) {
      toast.error("Failed to load product");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

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

      const res = await fetch(
        `http://localhost:5000/api/v1/admin/product/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: data,
        }
      );

      const result = await res.json();
      if (!res.ok) return toast.error(result.message);

      toast.success("Product updated successfully ✅");
      navigate("/admin/products");
    } catch (err) {
      toast.error("Update failed");
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
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <Card className="rounded-3xl shadow-xl ">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Edit Product
            </CardTitle>
            <p className="text-sm text-gray-500">
              Update product information & images carefully
            </p>
          </CardHeader>


          <CardContent>
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

              {/* EXISTING IMAGES */}
              {formData.oldImages.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-4">
                    Existing Images
                  </h3>

                  <div className="flex gap-4 flex-wrap">
                    {formData.oldImages.map((img) => (
                      <img
                        key={img.public_id}
                        src={img.url}
                        className="w-24 h-24 object-cover rounded-xl border"
                      />
                    ))}
                  </div>

                  <label className="flex items-center gap-2 mt-4 text-sm">
                    <input
                      type="checkbox"
                      checked={replaceImages}
                      onChange={(e) =>
                        setReplaceImages(e.target.checked)
                      }
                    />
                    Replace all existing images
                  </label>
                </section>
              )}

              {/* IMAGES */}
              <section>
                <h3 className="text-lg font-semibold mb-4">
                  Upload New Images
                </h3>

                <label className="cursor-pointer block">
                  <div
                    className="flex items-center justify-between gap-4 
                  border-2 border-dashed border-gray-300 
                  rounded-2xl px-6 py-6 
                  hover:border-black transition"
                  >
                    <div className="flex items-center gap-3 text-gray-600">
                      <Upload size={18} />
                      <span className="text-sm">
                        {formData.images.length
                          ? `${formData.images.length} image(s) selected`
                          : "Click to upload new images"}
                      </span>
                    </div>
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
                {loading ? "Updating Product..." : "Update Product"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditProduct;
