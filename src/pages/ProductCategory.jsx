import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Smartphone,
  Laptop,
  Shirt,
  Watch,
  Package,
  Headphones,
  Home,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ProductCategory = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/categories/categories`);
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // 🔥 Category Name → Icon Mapping
  const getCategoryIcon = (name) => {
    const lower = name.toLowerCase();

    if (lower.includes("mobile")) return <Smartphone size={20} />;
    if (lower.includes("laptop")) return <Laptop size={20} />;
    if (lower.includes("fashion") || lower.includes("clothing"))
      return <Shirt size={20} />;
    if (lower.includes("watch")) return <Watch size={20} />;
    if (lower.includes("electronics")) return <Headphones size={20} />;
    if (lower.includes("home")) return <Home size={20} />;

    return <Package size={20} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 ">


      <div
        className="
          grid 
          grid-cols-5 
          sm:grid-cols-6 
          md:grid-cols-6 
          lg:grid-cols-8 
          gap-3
        "
      >
        {categories.map((cat) => (
          <div
            key={cat._id}
            onClick={() => navigate(`/category/${cat._id}`)}
            className="
              cursor-pointer
              flex flex-col items-center
              justify-center
              gap-1
              p-3
              rounded-xl
              bg-white
              border
              hover:border-indigo-500
              hover:shadow-md
              transition
              text-center
            "
          >
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
              {getCategoryIcon(cat.name)}
            </div>

            <p className="text-xs font-medium line-clamp-1">
              {cat.name}
            </p>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default ProductCategory;