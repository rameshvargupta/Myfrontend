import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  AlertCircle,
  Facebook,
  Twitter,
  Mail,
  Maximize2,
  Link as LinkIcon,
  X
} from "lucide-react";
import { toast } from "sonner";

import FooterNavbar from "@/components/user/FooterNavbar";
import ExpectedDelivery from "./ExpectedDelivery";
import RecentlyViewed from "./RecentlyViewed";
import {
  loadWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "@/redux/wishlistSlice";
const API_URL = import.meta.env.VITE_API_URL;

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const selectedAddress = useSelector((state) => state.address?.selectedAddress);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const { token } = useSelector((state) => state.user);

  const { items: wishlistItems } = useSelector(
    (state) => state.wishlist
  );
  const isWishlisted = wishlistItems.some(
    (item) => item._id === product?._id
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/products/${slug}`);
        if (!res.data.success) return setProduct(null);
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

  useEffect(() => {
    if (token) {
      dispatch(loadWishlist());
    }
  }, [token, dispatch]);

 const openImagePreview = (img, index) => {
  setDirection(0);
  setActiveImage(img);
  setCurrentImageIndex(index);
  setShowImagePreview(true);
};


  const paginate = (newDirection) => {
    if (!product?.images?.length) return;

    let newIndex = currentImageIndex + newDirection;

    if (newIndex < 0) {
      newIndex = product.images.length - 1;
    }

    if (newIndex >= product.images.length) {
      newIndex = 0;
    }

    setCurrentImageIndex(newIndex);
    setActiveImage(product.images[newIndex].url);
   setDirection(newDirection);
  };
  const handleAddToCart = () => {
    if (!product || product.stock === 0) return toast.error("Out of stock");
    const exists = cartItems.find(i => i.productId === product._id);
    if (exists) return toast.info("Already in cart");
    dispatch(addToCart({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.finalPrice,
      originalPrice: product.price,
      image: product.images?.[0]?.url,
      quantity
    }));
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return toast.error("Out of stock");
    navigate("/checkout", {
      state: {
        buyNowProduct: {
          productId: product._id,
          slug: product.slug,
          name: product.name,
          price: product.finalPrice,
          originalPrice: product.price,
          image: product.images?.[0]?.url,
          quantity
        }
      }
    });
  };

  const handleShare = async (platform) => {
    const productUrl = `${window.location.origin}/product/${product.slug}`;
    const shareText = `Check out this amazing product: ${product.name}\n\nPrice: ₹${product.finalPrice}\n\n${productUrl}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=Check out this product&body=${encodeURIComponent(shareText)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(productUrl);
          toast.success("Link copied to clipboard!");
        } catch (err) {
          toast.error("Failed to copy link");
        }
        break;
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title: product.name,
              text: `Check out ${product.name}`,
              url: productUrl,
            });
          } catch (err) {
            if (err.name !== 'AbortError') {
              toast.error("Failed to share");
            }
          }
        } else {
          setShowShareModal(true);
        }
    }

    setShowShareModal(false);
  };

  const discountPercent = product ? Math.round(((product.price - product.finalPrice) / product.price) * 100) : 0;

  if (loading) return <ProductSkeleton />;
  if (!product) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Product not found</h2>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span className="hover:text-gray-700 cursor-pointer"><Link to={'/'}>Home</Link> </span>
            <span>/</span>
            <span className="hover:text-gray-700 cursor-pointer"><Link to={'/products'}>Products</Link> </span>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>

          {/* Main Product Section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Left - Image Gallery */}
            <div className="space-y-4">
              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden group border border-gray-100 shadow-sm">

                {/* MAIN IMAGE */}
                <div className="relative overflow-hidden">

                  <img
                    src={activeImage}
                    alt={product.name}
                    onClick={() =>
                      openImagePreview(
                        activeImage,
                        product.images.findIndex(
                          (img) => img.url === activeImage
                        )
                      )
                    }
                    className="w-full aspect-square object-contain p-6 cursor-zoom-in hover:scale-105 transition-transform duration-500"
                  />

                  {/* PREMIUM OVERLAY */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />

                  {/* ZOOM BUTTON */}
                  <button
                    onClick={() =>
                      openImagePreview(
                        activeImage,
                        product.images.findIndex(
                          (img) => img.url === activeImage
                        )
                      )
                    }
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-xl hover:scale-105"
                  >
                    <Maximize2 size={18} />
                  </button>

                  {/* TOP ACTIONS */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                    <button
                      onClick={() => {
                        if (!token) {
                          toast.error("Please login first");
                          return;
                        }

                        if (isWishlisted) {
                          dispatch(removeWishlistItem(product._id));
                          toast.success("Removed from wishlist");
                        } else {
                          dispatch(addWishlistItem(product._id));
                          toast.success("Added to wishlist ❤️");
                        }
                      }}
                      className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-lg hover:scale-105 transition"
                    >
                      <Heart
                        size={18}
                        className={
                          isWishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-gray-700"
                        }
                      />
                    </button>

                    <button
                      onClick={() => handleShare()}
                      className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-lg hover:scale-105 transition"
                    >
                      <Share2 size={18} className="text-gray-700" />
                    </button>
                  </div>

                  {/* STOCK BADGE */}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-4 py-1.5 rounded-full font-semibold shadow-lg">
                        Only {product.stock} left
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">

                {product.images.map((img, idx) => (

                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentImageIndex ? 1 : -1);
                      setActiveImage(img.url);
                      setCurrentImageIndex(idx);
                    }}
                    className={`
        flex-shrink-0
        w-20
        h-20
        rounded-2xl
        overflow-hidden
        border-2
        transition-all
        ${activeImage === img.url
                        ? "border-indigo-600 scale-105"
                        : "border-gray-200 hover:border-gray-400"
                      }
      `}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>

                ))}

              </div>

              {/* ================= IMAGE PREVIEW MODAL ================= */}
              {showImagePreview && (
                <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex items-center justify-center">

                  {/* CLOSE */}
                  <button
                    onClick={() => setShowImagePreview(false)}
                    className="absolute top-5 right-5 z-50 bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-full text-white transition"
                  >
                    <X size={24} />
                  </button>



                  {/* IMAGE */}
                  <div className="w-full max-w-5xl px-6">
                    <AnimatePresence mode="wait">

                      <motion.img
                        key={activeImage}
                        src={activeImage}
                        alt={product.name}

                        drag="x"
                        dragElastic={0.2}
                        dragConstraints={{ left: 0, right: 0 }}

                        onDragEnd={(e, { offset }) => {

                          // LEFT SWIPE
                          if (offset.x < -80) {
                            paginate(1);
                          }

                          // RIGHT SWIPE
                          else if (offset.x > 80) {
                            paginate(-1);
                          }
                        }}

                        initial={{
                          opacity: 0,
                          x: direction > 0 ? 120 : -120,
                        }}

                        animate={{
                          opacity: 1,
                          x: 0,
                        }}

                        exit={{
                          opacity: 0,
                          x: direction > 0 ? -120 : 120,
                        }}

                        transition={{
                          duration: 0.25,
                        }}

                        className="
      w-full
      max-h-[82vh]
      object-contain
      cursor-grab
      active:cursor-grabbing
      select-none
      touch-pan-y
    "
                      />

                    </AnimatePresence>


                    {/* THUMBNAILS */}
                    <div className="flex justify-center gap-3 mt-6 flex-wrap">

                      {product.images.map((img, idx) => (

                        <button
                          key={idx}
                          onClick={() => {
                            setActiveImage(img.url);
                            setCurrentImageIndex(idx);
                          }}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition
            ${currentImageIndex === idx
                              ? "border-white scale-110"
                              : "border-white/20"
                            }`}
                        >
                          <img
                            src={img.url}
                            className="w-full h-full object-cover"
                          />
                        </button>

                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Right - Product Info */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    ))}
                    <span className="text-sm font-medium ml-1">{product.rating?.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
                  {product.soldCount > 0 && <span className="text-sm text-green-600 font-medium">{product.soldCount}+ sold</span>}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-indigo-600">₹{product.finalPrice?.toLocaleString()}</span>
                {product.price > product.finalPrice && (
                  <>
                    <span className="text-gray-400 line-through">₹{product.price?.toLocaleString()}</span>
                    <span className="bg-green-50 text-green-600 text-sm font-semibold px-2 py-1 rounded">{discountPercent}% OFF</span>
                  </>
                )}
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Truck size={18} className="text-indigo-600" />
                  <span className="text-sm font-medium">Delivery Information</span>
                </div>
                {selectedAddress ? (
                  <ExpectedDelivery pincode={selectedAddress.pincode} />
                ) : (
                  <button onClick={() => navigate("/address")} className="text-sm text-indigo-600 font-medium hover:underline">
                    + Add delivery address
                  </button>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-3 border rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-1.5 hover:bg-gray-100 rounded transition disabled:opacity-50"
                    disabled={quantity === 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-1.5 hover:bg-gray-100 rounded transition disabled:opacity-50"
                    disabled={quantity === product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-xs text-gray-500">{product.stock} items available</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  Buy Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                {[
                  { icon: ShieldCheck, text: "Secure Payment" },
                  { icon: RefreshCw, text: "Easy Returns" },
                  { icon: Truck, text: "Free Shipping" }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <item.icon size={20} className="mx-auto text-indigo-600 mb-1" />
                    <p className="text-xs text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "description" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Description
                  {activeTab === "description" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "reviews" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Reviews ({product.numReviews || 0})
                  {activeTab === "reviews" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6">
              {activeTab === "description" ? (
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              ) : (
                <ProductReviews productId={product._id} />
              )}
            </div>
          </div>

          {/* Recently Viewed & Similar Products */}
          <div className="mt-12 space-y-12">
            <RecentlyViewed />
            <SimilarProducts productId={product._id} categoryId={product.category?._id} />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share this product</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <Share2 size={18} />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Facebook size={18} />
                Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
              >
                <Twitter size={18} />
                Twitter
              </button>
              <button
                onClick={() => handleShare('email')}
                className="flex items-center gap-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Mail size={18} />
                Email
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center gap-2 p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition col-span-2"
              >
                <LinkIcon size={18} />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg p-4 flex gap-3 lg:hidden z-50">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2" disabled={quantity === 1}>
            <Minus size={16} />
          </button>
          <span className="font-medium min-w-[30px] text-center">{quantity}</span>
          <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-2" disabled={quantity === product.stock}>
            <Plus size={16} />
          </button>
        </div>
        <button onClick={handleAddToCart} className="flex-1 bg-gray-900 text-white py-3 rounded-lg text-sm font-medium">
          Add to Cart
        </button>
        <button onClick={handleBuyNow} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg text-sm font-medium">
          Buy Now
        </button>
      </div>

      <FooterNavbar />
    </>
  );
};

export default ProductDetails;