import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import { toast } from "sonner";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Star,
  Eye,
  Edit,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
  Layers,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Image as ImageIcon
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProductView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!product?._id) return;

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/products/${product._id}/reviews`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
        }
      } catch (err) {
        toast.error("Failed to load reviews");
      }
    };

    fetchReviews();
  }, [product]);

  /* ================= FETCH PRODUCT + ALL ORDERS ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/products/${slug}`),
          fetch(`${API_URL}/api/v1/orders/admin/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const productData = await productRes.json();
        const ordersData = await ordersRes.json();

        if (!productData.success) throw new Error("Product not found");

        setProduct(productData.product);
        setActiveImage(productData.product.images?.[0]?.url || "");
        setAllOrders(ordersData.orders || []);
      } catch (err) {
        toast.error(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, token]);

  const productId = product?._id?.toString();

  const productOrders = useMemo(() => {
    if (!productId) return [];
    if (!Array.isArray(allOrders)) return [];

    return allOrders.filter((order) => {
      if (!Array.isArray(order?.orderItems)) return false;
      return order.orderItems.some((item) => {
        const id = typeof item?.productId === "object"
          ? item?.productId?._id?.toString()
          : item?.productId?.toString();
        return id && id === productId;
      });
    });
  }, [allOrders, productId]);

  const totalReviews = reviews.length;
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1)
    : 0;

  /* ================= ORDER COUNTS ================= */
  const totalOrdersCount = productOrders.length;
  const cancelledOrdersCount = productOrders.filter(
    (order) => order.orderStatus?.toLowerCase() === "cancelled"
  ).length;
  const deliveredOrdersCount = productOrders.filter(
    (order) => order.orderStatus?.toLowerCase() === "delivered"
  ).length;
  const pendingOrdersCount = productOrders.filter(
    (order) => order.orderStatus?.toLowerCase() === "pending"
  ).length;

  /* ================= TOTAL REVENUE ================= */
  const totalRevenue = productOrders.reduce((acc, order) => {
    const productItem = order.orderItems.find((item) => {
      const id = typeof item.productId === "object"
        ? item.productId._id
        : item.productId;
      return id?.toString() === product?._id?.toString();
    });
    if (!productItem) return acc;
    const priceAfterDiscount = productItem.price - (productItem.price * (productItem.discount || 0)) / 100;
    return acc + priceAfterDiscount * productItem.quantity;
  }, 0);

  /* ================= RATING DISTRIBUTION ================= */
  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  }, [reviews]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="animate-spin text-indigo-600" size={40} />
            <p className="text-gray-500">Loading product details...</p>
          </div>
        </div>
        <FooterNavbar />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-red-500 text-lg">Product not found</p>
            <button
              onClick={() => navigate("/admin/products")}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >
              Back to Products
            </button>
          </div>
        </div>
        <FooterNavbar />
      </>
    );
  }

  const discount = product.price > product.discountPrice 
    ? ((product.price - product.discountPrice) / product.price * 100).toFixed(0)
    : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 lg:p-8 mb-15">
        
        <div className="max-w-7xl mx-auto">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <Eye className="text-white" size={24} />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Product Overview
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View detailed product information, analytics, and customer feedback
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate(`/admin/product/edit/${product._id}`)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Edit size={18} />
                Edit Product
              </button>
              <button
                onClick={() => navigate("/admin/products")}
                className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Back to Products
              </button>
            </div>
          </div>

          {/* MAIN CARD */}
          <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
            
            {/* Product Header Banner */}
            <div className={`h-2 ${product.isActive ? "bg-gradient-to-r from-green-500 to-teal-500" : "bg-gradient-to-r from-red-500 to-orange-500"}`}></div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT - IMAGE SECTION */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-100">
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="w-full h-[300px] md:h-[420px] object-cover"
                    />
                  </div>
                  
                  {/* Thumbnails */}
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images?.map((img, index) => (
                      <div
                        key={index}
                        onClick={() => setActiveImage(img.url)}
                        className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                          activeImage === img.url ? "border-indigo-500 shadow-lg" : "border-gray-200"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`Thumb ${index + 1}`}
                          className="w-20 h-20 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT - PRODUCT DETAILS */}
                <div className="space-y-6">
                  {/* Title & Status */}
                  <div>
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {product.isActive ? "Active" : "Blocked"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Layers size={14} />
                        <span>{product.category?.name || "Uncategorized"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>Added {new Date(product.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                      {product.discountPrice && product.price > product.discountPrice && (
                        <>
                          <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-lg">
                            {discount}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Package size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Stock: {product.stock} units</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-indigo-50 rounded-xl p-4 text-center">
                      <ShoppingBag size={20} className="text-indigo-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Total Orders</p>
                      <h3 className="text-xl font-bold text-indigo-700">{totalOrdersCount}</h3>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <CheckCircle size={20} className="text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Delivered</p>
                      <h3 className="text-xl font-bold text-green-700">{deliveredOrdersCount}</h3>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 text-center">
                      <Clock size={20} className="text-yellow-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Pending</p>
                      <h3 className="text-xl font-bold text-yellow-700">{pendingOrdersCount}</h3>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center">
                      <XCircle size={20} className="text-red-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Cancelled</p>
                      <h3 className="text-xl font-bold text-red-700">{cancelledOrdersCount}</h3>
                    </div>
                  </div>

                  {/* Revenue Card */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Total Revenue</p>
                        <h3 className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</h3>
                      </div>
                      <TrendingUp size={32} className="opacity-80" />
                    </div>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION SECTION */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <Package size={18} className="text-indigo-500" />
                  Product Description
                </h3>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* REVIEWS SECTION */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <MessageCircle size={18} className="text-indigo-500" />
                  Customer Reviews
                </h3>

                {/* Review Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Rating Summary */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Star size={32} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-3xl font-bold text-gray-800">{averageRating}</span>
                        <span className="text-gray-500">/5</span>
                      </div>
                      <p className="text-sm text-gray-600">Based on {totalReviews} reviews</p>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="bg-blue-50 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-700 mb-3">Rating Distribution</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = ratingDistribution[rating];
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center gap-2">
                            <div className="flex items-center gap-1 w-12">
                              <span className="text-sm font-medium">{rating}</span>
                              <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <MessageCircle size={48} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400">No reviews yet for this product</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                          <div>
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {review.user?.name?.charAt(0) || "U"}
                              </div>
                              {review.user?.name || "Anonymous User"}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterNavbar />
    </>
  );
};

export default AdminProductView;