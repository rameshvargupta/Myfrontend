import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AddCategory = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name required");

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/v1/admin/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message);

      toast.success("Category added ✅");
      setName("");
      onSuccess(); // 🔁 refresh category list
    } catch {
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitHandler} className="flex gap-3">
          <Input
            placeholder="Category name (e.g. Mobile)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCategory;
