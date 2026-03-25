import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Pencil, Trash2, Search, Plus } from "lucide-react";
import { fetchCategories } from "@/api/productApi";
const API_URL = import.meta.env.VITE_API_URL;

const CategoryList = ({ onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");

  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef();

  /* ================= FETCH ================= */
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

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= ADD ================= */
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name required");

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/v1/categories/admin/category`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Category added ✅");

      setName("");
      setAddModal(false);
      fetchCategories();
      onSuccess && onSuccess();
    } catch (err) {
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ================= */
  const updateHandler = async () => {
    if (!editName.trim()) return toast.error("Category name required");

    try {
      const res = await fetch(
        `${API_URL}/api/v1/categories/admin/category/${selectedCategory._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name: editName }),
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Category updated ✅");
      setEditModal(false);
      fetchCategories();
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= DELETE ================= */
  const deleteHandler = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/v1/categories/admin/category/${selectedCategory._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Category deleted ✅");
      setDeleteModal(false);
      fetchCategories();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="flex gap-2 w-full">

        <Button
          variant="outline"
          onClick={() => setOpen(!open)}
          className="flex justify-between flex-1"
        >
          Categories ({categories.length})
          <ChevronDown size={16} />
        </Button>

        <Button
          onClick={() => setAddModal(true)}
          className="flex gap-2 shrink-0"
        >
          <Plus size={16} />
          Add Category
        </Button>

      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-xl p-4">
          <div className="flex items-center border rounded-lg px-2 mb-3">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredCategories.map((cat) => (
              <div
                key={cat._id}
                className="flex justify-between items-center px-2 py-2 hover:bg-gray-50 rounded-lg"
              >
                <span>{cat.name}</span>
                <div className="flex gap-3">
                  <Pencil
                    size={18}
                    className="cursor-pointer text-blue-600"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setEditName(cat.name);
                      setEditModal(true);
                    }}
                  />
                  <Trash2
                    size={18}
                    className="cursor-pointer text-red-600"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setDeleteModal(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Add Category</h2>
            <Input
              placeholder="Enter Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitHandler} disabled={loading}>
                {loading ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Edit Category</h2>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={updateHandler}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-red-600">
              Delete Category?
            </h2>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteModal(false)}>
                Cancel
              </Button>
              <Button onClick={deleteHandler}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;