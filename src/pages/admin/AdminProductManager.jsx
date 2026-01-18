import { useEffect, useState } from "react";
import AddCategory from "./AddCategory";
import AddProduct from "./AddProduct";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminProductManager = () => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    const res = await fetch("http://localhost:5000/api/v1/categories");
    const data = await res.json();
    if (data.success) setCategories(data.categories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <AddCategory onSuccess={fetchCategories} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
        </CardHeader>
        <CardContent>
          <AddProduct categories={categories} />
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminProductManager;
