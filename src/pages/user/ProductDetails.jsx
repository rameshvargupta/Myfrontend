import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Plus,
  AlertCircle,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight
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

  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  // Swipe states
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

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
    setActiveImage(img);
    setCurrentImageIndex(index);
    setShowImagePreview(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    // Restore body scroll
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    if (!product?.images?.length) return;
    let newIndex = currentImageIndex + 1;
    if (newIndex >= product.images.length) {
      newIndex = 0;
    }
    setCurrentImageIndex(newIndex);
    setActiveImage(product.images[newIndex].url);
  };

  const prevImage = () => {
    if (!product?.images?.length) return;
    let newIndex = currentImageIndex - 1;
    if (newIndex < 0) {
      newIndex = product.images.length - 1;
    }
    setCurrentImageIndex(newIndex);
    setActiveImage(product.images[newIndex].url);
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  // Handle touch end - normal swipe without effects
  const handleTouchEnd = () => {
    if (touchStartX === 0 || touchEndX === 0) return;

    const swipeDistance = touchStartX - touchEndX;
    const minSwipeDistance = 50; // Minimum swipe distance

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next image
        nextImage();
      } else {
        // Swipe right - previous image
        prevImage();
      }
    }

    // Reset touch values
    setTouchStartX(0);
    setTouchEndX(0);
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3 md:mb-4">
            <Link to={'/'} className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <Link to={'/products'} className="hover:text-gray-700">Products</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>

          {/* Main Product Section */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">

            {/* Left - Image Gallery */}
            <div className="space-y-3">
              {/* Main Image Container */}
              <div className="relative bg-gray-50 rounded-xl overflow-hidden group">

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>

                {/* MAIN IMAGE */}
                <div className="relative overflow-hidden cursor-pointer">
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
                    className="w-full aspect-square object-contain p-4 transition-transform duration-300 hover:scale-105"
                  />

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
                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-md hover:scale-105 transition"
                  >
                    <Maximize2 size={16} />
                  </button>

                  {/* Heart Button */}
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
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-md hover:scale-105 transition"
                  >
                    <Heart
                      size={16}
                      className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"}
                    />
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare()}
                    className="absolute top-3 right-12 bg-white/90 backdrop-blur p-2 rounded-full shadow-md hover:scale-105 transition"
                  >
                    <Share2 size={16} className="text-gray-700" />
                  </button>

                  {/* STOCK BADGE */}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        Only {product.stock} left
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImage(img.url);
                      setCurrentImageIndex(idx);
                    }}
                    className={`
                      flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all
                      ${activeImage === img.url
                        ? "border-indigo-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
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

              {/* IMAGE PREVIEW MODAL - White background with normal swipe */}
              {showImagePreview && (
                <div
                  className="fixed inset-0 z-[999] bg-white flex items-center justify-center"
                  onClick={closeImagePreview}
                >
                  {/* Close Button */}
                  <button
                    onClick={closeImagePreview}
                    className="absolute top-4 right-4 z-50 bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-700 transition shadow-md"
                  >
                    <X size={24} />
                  </button>

                  {/* Previous Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-gray-100 hover:bg-gray-200 rounded-full p-3 text-gray-700 transition shadow-md"
                  >
                    <ChevronLeft size={28} />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-gray-100 hover:bg-gray-200 rounded-full p-3 text-gray-700 transition shadow-md"
                  >
                    <ChevronRight size={28} />
                  </button>

                  {/* Image Container with Normal Swipe Support - No Effects */}
                  <div
                    className="w-full max-w-6xl px-4"
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Current Image - No animation effects */}
                    <div className="flex justify-center items-center">
                      <img
                        src={activeImage}
                        alt={product.name}
                        className="w-auto max-h-[80vh] object-contain select-none"
                        draggable={false}
                      />
                    </div>

                    {/* Image Counter */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {product.images.length}
                    </div>

                    {/* Thumbnails in modal */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImage(img.url);
                            setCurrentImageIndex(idx);
                          }}
                          className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all
                            ${currentImageIndex === idx
                              ? "border-indigo-500 shadow-lg scale-105"
                              : "border-gray-300 hover:border-gray-400"
                            }`}
                        >
                          <img
                            src={img.url}
                            alt={`Thumbnail ${idx + 1}`}
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
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1.5 leading-tight">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-0.5 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                    <span>{product.rating?.toFixed(1)}</span>
                    <Star size={11} className="fill-white ml-0.5" />
                  </div>
                  <span className="text-xs text-gray-500">{product.numReviews} Ratings & Reviews</span>
                  {product.soldCount > 0 && (
                    <span className="text-xs text-gray-500">{product.soldCount}+ sold</span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">₹{product.finalPrice?.toLocaleString()}</span>
                {product.price > product.finalPrice && (
                  <>
                    <span className="text-gray-400 line-through text-sm">₹{product.price?.toLocaleString()}</span>
                    <span className="text-green-600 text-sm font-medium">{discountPercent}% off</span>
                  </>
                )}
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Truck size={14} className="text-indigo-600" />
                  <span className="text-xs font-medium">Delivery</span>
                </div>
                {selectedAddress ? (
                  <ExpectedDelivery pincode={selectedAddress.pincode} />
                ) : (
                  <button onClick={() => navigate("/address")} className="text-xs text-indigo-600 font-medium hover:underline">
                    + Add delivery address
                  </button>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Quantity:</span>
                <div className="flex items-center gap-2 border rounded-md p-0.5">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-1.5 hover:bg-gray-100 rounded transition disabled:opacity-50"
                    disabled={quantity === 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-1.5 hover:bg-gray-100 rounded transition disabled:opacity-50"
                    disabled={quantity === product.stock}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-gray-500">{product.stock} items left</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingCart size={16} />
                  ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <Zap size={16} />
                  BUY NOW
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                {[
                  { icon: ShieldCheck, text: "Secure" },
                  { icon: RefreshCw, text: "Returns" },
                  { icon: Truck, text: "Free Shipping" }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <item.icon size={14} className="mx-auto text-indigo-600 mb-0.5" />
                    <p className="text-xs text-gray-500">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-8">
            <div className="border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === "description" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Description
                  {activeTab === "description" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === "reviews" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Reviews ({product.numReviews || 0})
                  {activeTab === "reviews" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4">
              {activeTab === "description" ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>
                </div>
              ) : (
                <ProductReviews productId={product._id} />
              )}
            </div>
          </div>

          {/* Recently Viewed & Similar Products */}
          <div className="mt-8 space-y-8">
            <RecentlyViewed />
            <SimilarProducts productId={product._id} categoryId={product.category?._id} />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold">Share this product</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center justify-center gap-2 p-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
              >
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center justify-center gap-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center justify-center gap-2 p-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition text-sm"
              >
                Twitter
              </button>
              <button
                onClick={() => handleShare('email')}
                className="flex items-center justify-center gap-2 p-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
              >
                Email
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center justify-center gap-2 p-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition col-span-2 text-sm"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg p-3 flex gap-3 lg:hidden z-50">
        <div className="flex items-center gap-2 bg-gray-100 rounded-md px-2">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1.5" disabled={quantity === 1}>
            <Minus size={14} />
          </button>
          <span className="font-medium min-w-[28px] text-center text-sm">{quantity}</span>
          <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-1.5" disabled={quantity === product.stock}>
            <Plus size={14} />
          </button>
        </div>
        <button onClick={handleAddToCart} className="flex-1 bg-yellow-500 text-white py-2.5 rounded-md text-sm font-medium">
          ADD TO CART
        </button>
        <button onClick={handleBuyNow} className="flex-1 bg-orange-500 text-white py-2.5 rounded-md text-sm font-medium">
          BUY NOW
        </button>
      </div>
      <div className="mb-10"></div>
      <FooterNavbar />
    </>
  );
};

export default ProductDetails;