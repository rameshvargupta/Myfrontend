import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import ProductCard from "@/components/ProductCard";

const RecentlyViewed = () => {
  const [products, setProducts] = useState([]);
  const token = useSelector((state) => state.user?.token);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        if (!token) return;

        const { data } = await axios.get(
          "http://localhost:5000/api/v1/user/recently-viewed",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.log(
          "Recently viewed fetch error:",
          error.response?.data || error.message
        );
      }
    };

    fetchRecentlyViewed();
  }, [token]);

  if (!token || products.length === 0) return null;

  return (
    <div className="mt-10 px-4">
      <h2 className="text-2xl font-bold mb-5">
        Recently Viewed
      </h2>

      <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-3">
        {products.map((product) => (
          <div key={product._id} className="min-w-[250px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;