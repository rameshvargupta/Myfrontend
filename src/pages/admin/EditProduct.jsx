import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  /* ---------------- FETCH CATEGORIES ---------------- */
  const fetchCategories = async () => {
    const res = await fetch("http://localhost:5000/api/v1/categories");
    const data = await res.json();
    if (data.success) setCategories(data.categories);
  };

  /* ---------------- FETCH PRODUCT DETAILS ---------------- */
  const fetchProduct = async () => {
    const res = await fetch(`http://localhost:5000/api/v1/admin/product/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

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
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ---------------- SUBMIT ---------------- */
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

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={submitHandler} className="flex flex-col gap-3">

            <Label>Name</Label>
            <Input name="name" value={formData.name} onChange={handleChange} />

            <Label>Description</Label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

            <Label>Price</Label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />

            <Label>Discount Price</Label>
            <Input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleChange}
            />

            <Label>Stock</Label>
            <Input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
            />

            <Label>Category</Label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* ---------- EXISTING IMAGES ---------- */}
            {formData.oldImages.length > 0 && (
              <>
                <Label>Existing Images</Label>
                <div className="flex gap-3 flex-wrap">
                  {formData.oldImages.map((img) => (
                    <img
                      key={img.public_id}
                      src={img.url}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              </>
            )}

            {/* ---------- REPLACE IMAGES ---------- */}
            <label className="flex gap-2 items-center mt-2">
              <input
                type="checkbox"
                checked={replaceImages}
                onChange={(e) => setReplaceImages(e.target.checked)}
              />
              Replace all images
            </label>

            <Label>Upload New Images</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, images: e.target.files })
              }
            />

            <Button disabled={loading}>
              {loading ? "Updating..." : "Update Product"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
