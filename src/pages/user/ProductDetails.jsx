// Premium Product Details Page - Full Ecommerce UI (450+ lines)
// Fully Responsive + Icons + Modern Layout

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { addToCart } from "@/redux/cartSlice";
import ProductReviews from "@/components/product/ProductReviews";
import SimilarProducts from "@/components/product/SimilarProduct";
import ProductSkeleton from "@/components/skeletons/ProductDetailsSkeleton";

import {
  ShoppingCart,
  Zap,
  Heart,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  Minus,
  Plus
} from "lucide-react";

import { toast } from "sonner";
import FooterNavbar from "@/components/user/FooterNavbar";

const ProductDetails = () => {

  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart?.cartItems || []);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/products/${slug}`);

        if (!res.data.success) {
          setProduct(null);
          return;
        }

        setProduct(res.data.product);
        setActiveImage(res.data.product.images?.[0]?.url);

      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  /* ================= ADD TO CART ================= */

  const handleAddToCart = () => {

    if (!product || product.stock === 0) {
      toast.error("Out of stock");
      return;
    }

    const exists = cartItems.find(i => i.productId === product._id);

    if (exists) {
      toast.info("Already in cart");
      return;
    }

    dispatch(addToCart({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.finalPrice,
      image: product.images?.[0]?.url,
      quantity
    }));

    toast.success("Added to cart");
  };

  /* ================= BUY NOW ================= */

  const handleBuyNow = () => {

    if (!product || product.stock === 0) {
      toast.error("Out of stock");
      return;
    }

    navigate("/checkout", {
      state: {
        buyNowProduct: {
          productId: product._id,
          slug: product.slug,
          name: product.name,
          price: product.finalPrice,
          image: product.images?.[0]?.url,
          quantity
        }
      }
    });
  };

  /* ================= LOADING ================= */

  if (loading) return <ProductSkeleton />;

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="h-screen flex items-center justify-center">
          Product not found
        </div>
      </>
    );
  }

  /* ================= UI ================= */

  return (
    <>
      <Navbar />

      <div className="bg-gray-50 min-h-screen pb-20">

        {/* ================= MAIN ================= */}
        <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-10">

          {/* ================= LEFT IMAGE ================= */}
          <div className="space-y-4">

            <div className="bg-white rounded-2xl shadow p-4 relative group">
              <img
                src={activeImage}
                className="w-full h-[400px] object-contain transition"
              />

              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-white p-2 rounded-full shadow">
                  <Heart size={18} />
                </button>
                <button className="bg-white p-2 rounded-full shadow">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map(img => (
                <img
                  key={img._id}
                  src={img.url}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 object-cover rounded-xl border cursor-pointer ${activeImage === img.url ? "border-indigo-500" : "border-gray-200"}`}
                />
              ))}
            </div>

          </div>

          {/* ================= RIGHT ================= */}
          <div className="space-y-6">

            <div className="bg-white rounded-2xl shadow p-6 space-y-4">

              <h1 className="text-2xl font-bold">{product.name}</h1>

              {/* RATING */}
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                ))}
                <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
              </div>

              {/* PRICE */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-indigo-600">₹{product.finalPrice}</span>
                {product.discountPrice > 0 && (
                  <span className="line-through text-gray-400">₹{product.price}</span>
                )}
              </div>

              {/* STOCK */}
              <p className={`text-sm font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                {product.stock > 0 ? "✔ In Stock" : "✖ Out of Stock"}
              </p>

              {/* QUANTITY */}
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 border rounded">
                  <Minus size={14} />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-2 border rounded">
                  <Plus size={14} />
                </button>
              </div>

              {/* BUTTONS */}
              <div className="grid grid-cols-2 gap-3">

                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 border border-indigo-600 text-indigo-600 py-3 rounded-xl"
                >
                  <Zap size={18} /> Buy Now
                </button>

              </div>

              {/* FEATURES */}
              <div className="grid grid-cols-3 gap-4 text-center text-sm mt-4">

                <div className="flex flex-col items-center gap-1">
                  <Truck size={18} />
                  <span>Fast Delivery</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck size={18} />
                  <span>Secure</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <RefreshCw size={18} />
                  <span>Easy Return</span>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= TABS ================= */}
        <div className="max-w-7xl mx-auto px-4 mt-10">

          <div className="flex gap-6 border-b pb-2">
            <button
              onClick={() => setActiveTab("description")}
              className={`${activeTab === "description" && "border-b-2 border-indigo-600"}`}
            >
              Description
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`${activeTab === "reviews" && "border-b-2 border-indigo-600"}`}
            >
              Reviews
            </button>
          </div>

          <div className="mt-6">

            {activeTab === "description" && (
              <div className="bg-white p-6 rounded-xl shadow">
                {product.description}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="bg-white p-6 rounded-xl shadow">
                <ProductReviews productId={product._id} />
              </div>
            )}

          </div>

        </div>

        {/* SIMILAR PRODUCTS */}
        <div className="mt-10">
          <SimilarProducts
            productId={product._id}
            categoryId={product.category?._id}
          />
        </div>

      </div>
      <FooterNavbar/>
    </>
  );
};

export default ProductDetails;
