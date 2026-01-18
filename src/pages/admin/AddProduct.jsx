import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddCategory from "./AddCategory";

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
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/categories");
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.error("Please select category");

    try {
      setLoading(true);

      // ✅ FormData use karo
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("discountPrice", formData.discountPrice);
      data.append("stock", formData.stock);
      data.append("category", formData.category);

      // ✅ images append
      for (let i = 0; i < formData.images.length; i++) {
        data.append("images", formData.images[i]);
      }
      if (formData.images.length > 5) {
        return toast.error("Maximum 5 images allowed");
      }

      const res = await fetch("http://localhost:5000/api/v1/admin/product", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // ❌ Content-Type mat lagana
        },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) return toast.error(result.message || "Failed to add product");

      toast.success("Product added with images ✅");

      // ✅ reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        stock: "",
        category: "",
        images: [],
      });

    } catch (error) {
      console.error("Add Product Error:", error);
      toast.error("Product creation failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto mt-10">
      <AddCategory onSuccess={fetchCategories} />

      <Card>
        <CardHeader><CardTitle>Add Product</CardTitle></CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-red-500 font-medium">⚠ Please add a category first</p>
          ) : (
            <form onSubmit={submitHandler} className="flex flex-col gap-3">
              <Label>Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} />

              <Label>Description</Label>
              <Input name="description" value={formData.description} onChange={handleChange} />

              <Label>Price</Label>
              <Input type="number" name="price" value={formData.price} onChange={handleChange} />

              <Label>Discount Price</Label>
              <Input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} />

              <Label>Stock</Label>
              <Input type="number" name="stock" value={formData.stock} onChange={handleChange} />

              <Label>Category</Label>
              <select name="category" value={formData.category} onChange={handleChange} className="border p-2 rounded">
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
              <Label>Product Images</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, images: e.target.files })
                }
              />

              <Button disabled={loading}>{loading ? "Adding..." : "Add Product"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
