import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

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
        const res = await fetch(
          `http://localhost:5000/api/v1/products/${product._id}/reviews`
        );

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
          fetch(`http://localhost:5000/api/v1/products/${slug}`),
          fetch(`http://localhost:5000/api/v1/orders/admin/orders`, {
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
        const id =
          typeof item?.productId === "object"
            ? item?.productId?._id?.toString()
            : item?.productId?.toString();

        return id && id === productId;
      });
    });
  }, [allOrders, productId]);

  const totalReviews = reviews.length;

  const averageRating =
    reviews.length > 0
      ? (
        reviews.reduce((acc, item) => acc + item.rating, 0) /
        reviews.length
      ).toFixed(1)
      : 0;


  /* ================= ORDER COUNTS ================= */
  const totalOrdersCount = productOrders.length;

  const cancelledOrdersCount = productOrders.filter(
    (order) => order.orderStatus?.toLowerCase() === "cancelled"
  ).length;

  const deliveredOrdersCount = productOrders.filter(
    (order) => order.orderStatus?.toLowerCase() === "delivered"
  ).length;

  /* ================= TOTAL REVENUE ================= */
  const totalRevenue = productOrders.reduce((acc, order) => {
    const productItem = order.orderItems.find((item) => {
      const id =
        typeof item.productId === "object"
          ? item.productId._id
          : item.productId;

      return id?.toString() === product?._id?.toString();
    });

    if (!productItem) return acc;

    const priceAfterDiscount =
      productItem.price -
      (productItem.price * (productItem.discount || 0)) / 100;

    return acc + priceAfterDiscount * productItem.quantity;
  }, 0);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <>
        <Navbar />
        <p className="text-center mt-32 text-gray-500">Loading...</p>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <p className="text-center mt-32 text-red-500">Product not found</p>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-gray-100 min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Product Overview
            </h1>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() =>
                  navigate(`/admin/product/edit/${product._id}`)
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Edit Product
              </button>

              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>
          </div>

          {/* MAIN CARD */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 md:p-10">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* IMAGE SECTION */}
              <div className="space-y-4">

                {/* MAIN IMAGE */}
                <div className="bg-gray-50 rounded-2xl overflow-hidden border">
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-[300px] md:h-[420px] object-cover"
                  />
                </div>

                {/* THUMBNAILS */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images?.map((img, index) => (
                    <img
                      key={index}
                      src={img.url}
                      alt="thumb"
                      onClick={() => setActiveImage(img.url)}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition 
                      ${activeImage === img.url
                          ? "border-indigo-600"
                          : "border-gray-200"
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* DETAILS + ANALYTICS */}
              <div className="space-y-6">

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Category: {product.category?.name || "N/A"}
                  </p>
                </div>

                {/* ORDER SUMMARY CARD */}
                <div className="grid grid-cols-2 gap-4">

                  <div className="bg-indigo-50 p-5 rounded-2xl">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <h3 className="text-2xl font-bold text-indigo-700">
                      {totalOrdersCount}
                    </h3>
                  </div>

                  <div className="bg-green-50 p-5 rounded-2xl">
                    <p className="text-sm text-gray-600">Delivered</p>
                    <h3 className="text-2xl font-bold text-green-700">
                      {deliveredOrdersCount}
                    </h3>
                  </div>

                  <div className="bg-red-50 p-5 rounded-2xl">
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <h3 className="text-2xl font-bold text-red-700">
                      {cancelledOrdersCount}
                    </h3>
                  </div>

                  <div className="bg-purple-50 p-5 rounded-2xl">
                    <p className="text-sm text-gray-600">Revenue</p>
                    <h3 className="text-2xl font-bold text-purple-700">
                      ₹ {totalRevenue.toFixed(2)}
                    </h3>
                  </div>

                </div>

              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-10 border-t pt-8">
              <h3 className="text-xl font-semibold mb-3">
                Product Description
              </h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
            {/* REVIEWS SECTION */}
            <div className="mt-10 border-t pt-8">
              <h3 className="text-xl font-semibold mb-6">
                Customer Reviews
              </h3>

              {/* Review Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <h4 className="text-2xl font-bold text-yellow-600">
                    ⭐ {averageRating}
                  </h4>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <h4 className="text-2xl font-bold text-blue-600">
                    {totalReviews}
                  </h4>
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {reviews.length === 0 && (
                  <p className="text-gray-500">No reviews yet.</p>
                )}

                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-gray-50 p-5 rounded-2xl border"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {review.user?.name || "User"}
                      </h4>
                      <span className="text-yellow-600 font-bold">
                        ⭐ {review.rating}
                      </span>
                    </div>

                    <p className="text-gray-700">
                      {review.comment}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>


          </div>
        </div>
      </div>
    </>
  );

};

export default AdminProductView;
