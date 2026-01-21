import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SimilarProducts = ({ productId, categoryId }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!productId || !categoryId) return;

    fetch(
      `http://localhost:5000/api/v1/products/similar/${productId}/${categoryId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
      });
  }, [productId, categoryId]);

  if (products.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">
        Similar Products
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link
            key={p._id}
            to={`/product/${p.slug}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={p.images?.[0]?.url}
              className="w-full h-44 object-cover"
            />

            <div className="p-3">
              <h3 className="font-semibold line-clamp-1">
                {p.name}
              </h3>

              <p className="text-pink-600 font-bold mt-1">
                ₹{p.finalPrice}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
