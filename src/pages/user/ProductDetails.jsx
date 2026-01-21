import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import ProductSkeleton from "@/components/skeletons/ProductDetailsSkeleton";
import ProductReviews from "@/components/product/ProductReviews";
import SimilarProducts from "@/components/product/SimilarProduct";

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/products/${slug}`
      );
      const data = await res.json();

      if (!data.success) throw new Error();

      setProduct(data.product);
      setActiveImage(data.product.images?.[0]?.url);
    } catch {
      toast.error("Product not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  if (loading) return <ProductSkeleton />;
  if (!product) return null;

  return (
    <>
      <Navbar />

      {/* PRODUCT DETAILS */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT */}
        <div>
          <div className="border rounded-xl overflow-hidden">
            <img
              src={activeImage}
              className="w-full h-[420px] object-cover"
            />
          </div>

          <div className="flex gap-3 mt-4">
            {product.images.map((img) => (
              <img
                key={img.public_id}
                src={img.url}
                onClick={() => setActiveImage(img.url)}
                className={`w-20 h-20 rounded-lg border cursor-pointer ${
                  activeImage === img.url
                    ? "border-pink-500"
                    : "opacity-70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="sticky top-24 h-fit">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <p className="text-gray-500 mt-2">
            Category: {product.category?.name}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-pink-600">
              ₹{product.finalPrice}
            </span>

            {product.discountPrice > 0 && (
              <>
                <span className="line-through text-gray-400">
                  ₹{product.price}
                </span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm">
                  {Math.round(
                    ((product.price - product.discountPrice) /
                      product.price) *
                      100
                  )}
                  % OFF
                </span>
              </>
            )}
          </div>

          <p
            className={`mt-3 font-medium ${
              product.stock > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          <button
            disabled={product.stock === 0}
            className={`mt-6 w-full py-4 rounded-xl text-lg font-semibold ${
              product.stock === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* SIMILAR PRODUCTS */}
      <SimilarProducts
        productId={product._id}
        categoryId={product.category?._id}
      />

      {/* REVIEWS */}
      <ProductReviews productId={product._id} />
    </>
  );
};

export default ProductDetails;
