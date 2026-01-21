import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

const fetchProducts = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      "http://localhost:5000/api/v1/admin/products",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Fetch failed");
    }

    setProducts(data.products);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch products");
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------- TOGGLE ACTIVE ---------- */
  const toggleStatus = async (id) => {
    const res = await fetch(
      `http://localhost:5000/api/v1/admin/product/status/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await res.json();

    if (!data.success) return toast.error("Status update failed");

    setProducts((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, isActive: data.isActive } : p
      )
    );

    toast.success(
      data.isActive ? "Product Activated" : "Product Deactivated"
    );
  };

  /* ---------- DELETE ---------- */
  const deleteHandler = async (id) => {
    if (!confirm("Permanent delete? This cannot be undone")) return;

    const res = await fetch(
      `http://localhost:5000/api/v1/admin/product/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await res.json();
    if (!data.success) return toast.error(data.message);

    toast.success("Product permanently deleted");

    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <>
    <Navbar/>
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Products</h1>
        <Link
          to="/admin/add-product"
          className="bg-pink-500 text-white px-4 py-2 rounded"
        >
          + Add Product
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Final</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr
                key={p._id}
                className={`border-t ${
                  !p.isActive && "bg-red-50"
                }`}
              >
                <td className="p-3">
                  <img
                    src={p.images?.[0]?.url}
                    className="w-14 h-14 rounded object-cover"
                  />
                </td>

                <td className="p-3 font-medium">
                  {p.name}
                  <p className="text-xs text-gray-500 truncate max-w-xs">
                    {p.description}
                  </p>
                </td>

                <td className="p-3">{p.category?.name}</td>
                <td className="p-3">₹{p.price}</td>
                <td className="p-3 font-semibold">
                  ₹{p.finalPrice}
                </td>
                <td className="p-3">{p.stock}</td>

                <td className="p-3">
                  <button
                    onClick={() => toggleStatus(p._id)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.isActive ? "Active" : "Hidden"}
                  </button>
                </td>

                <td className="p-3 flex gap-2">
                    <Link
                    to={`/admin/product/edit/${p._id}`}
                    className={`px-3 py-1 rounded text-white ${
                      !p.isActive
                        ? "bg-gray-400 pointer-events-none"
                        : "bg-blue-500"
                    }`}
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteHandler(p._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default ProductList;
