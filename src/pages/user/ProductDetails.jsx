import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import ProductSkeleton from "@/components/skeletons/ProductDetailsSkeleton";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import ProductReviews from "@/components/product/ProductReviews";
import SimilarProducts from "@/components/product/SimilarProduct";
import axios from "axios";

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [sold30Days, setSold30Days] = useState(0);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const cartItems = useSelector(
    (state) => state.cart?.cartItems || []
  );
  const dispatch = useDispatch();


  useEffect(() => {
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

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const fetchSoldCount = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/v1/orders/${product._id}/last-30-days-sold`
        );

        setSold30Days(data.soldLast30Days);
      } catch (err) {
        console.log(err);
      }
    };

    if (product?._id) {
      fetchSoldCount();
    }
  }, [product?._id]);
  console.log(sold30Days);

  const handleAddToCart = () => {
    if (product.stock === 0) return;

    dispatch(
      addToCart({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.finalPrice,
        image: product.images?.[0]?.url,
        quantity: 1,
      })
    );

    navigate("/checkout");
  };

  if (loading) return <ProductSkeleton />;
  if (!product) return null;



  return (
    <>
      <Navbar />

      {/* ===== PAGE WRAPPER (NAVBAR FIX) ===== */}
<div className="bg-gray-50 min-h-screen pt-20">

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* ================= LEFT : IMAGE GALLERY ================= */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="relative group">
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-[320px] sm:h-[420px] lg:h-[520px] object-cover
                               transition-transform duration-500 ease-out
                               group-hover:scale-105"
                  />
                </div>
              </div>

              {/* THUMBNAILS */}
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((img) => (
                  <button
                    key={img.public_id}
                    onClick={() => setActiveImage(img.url)}
                    className={`flex-shrink-0 rounded-xl border p-1 transition
                      ${activeImage === img.url
                        ? "border-pink-500 ring-2 ring-pink-200"
                        : "border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ================= RIGHT : PRODUCT INFO ================= */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Category · {product.category?.name || "N/A"}
              </p>

              {/* PRICE */}
              <div className="mt-5 flex items-center gap-4 flex-wrap">
                <span className="text-3xl font-bold text-pink-600">
                  ₹{product.finalPrice}
                </span>

                {product.discountPrice > 0 && (
                  <>
                    <span className="line-through text-gray-400">
                      ₹{product.price}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
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

              {/* STOCK */}
              <p
                className={`mt-3 font-medium ${product.stock > 0
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {product.stock > 0 ? "✔ In Stock" : "✖ Out of Stock"}
              </p>

              {sold30Days > 0 && (
                <p className="text-sm text-green-600 font-medium mt-2">
                  🔥 {sold30Days}+ sold in last 30 days
                </p>
              )}


              {/* CTA */}
              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  disabled={product.stock === 0}
                  onClick={() => {
                    if (product.stock === 0) return;

                    const alreadyInCart = cartItems.find(
                      (item) => item.productId === product._id
                    );

                    if (alreadyInCart) {
                      toast.info("Product already added to cart");
                      return;
                    }

                    dispatch(
                      addToCart({
                        productId: product._id,
                        name: product.name,
                        price: product.finalPrice,
                        image: product.images?.[0]?.url,
                        quantity: 1,
                      })
                    );

                    toast.success("Product added to cart");
                  }}
                  className={`z
                    ${product.stock > 0
                      ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white hover:opacity-90"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                >
                  Add to Cart
                </button>

                <button
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                  className={`py-3 rounded-xl text-lg font-semibold border transition
                    ${product.stock === 0
                      ? "border-gray-300 text-gray-400"
                      : "border-pink-500 text-pink-600 hover:bg-pink-50"
                    }`}
                >
                  Buy Now
                </button>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-semibold mb-2">
                  Product Details
                </h2>
                <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                  {product.description}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <ProductReviews productId={product._id} />

      {/* SIMILAR PRODUCTS */}
      <SimilarProducts
        productId={product._id}
        categoryId={product.category?._id}
      />
    </>
  );
};

export default ProductDetails;




