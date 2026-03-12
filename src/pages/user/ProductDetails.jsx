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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const token = useSelector((state) => state.user?.token);

  const [product, setProduct] = useState(null);
  const [sold30Days, setSold30Days] = useState(0);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [zoomStyle, setZoomStyle] = useState({});

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const res = await fetch(
          `http://localhost:5000/api/v1/products/${slug}`
        );

        const data = await res.json();

        if (!data.success || !data.product) {
          setProduct(null);
          return;
        }

        setProduct(data.product);
        setActiveImage(data.product.images?.[0]?.url);

      } catch (error) {

        setProduct(null);

      } finally {

        setLoading(false);

      }

    };

    fetchProduct();

  }, [slug]);

  /* ================= SOLD COUNT ================= */

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

    if (product?._id) fetchSoldCount();

  }, [product?._id]);

  /* ================= ADD TO CART ================= */

  const handleAddToCart = () => {

    if (!product || product.stock === 0) {
      toast.error("Product out of stock");
      return;
    }

    const alreadyInCart = cartItems.find(
      (item) => item.productId === product._id
    );

    if (alreadyInCart) {

      toast.info("Product already in cart");
      return;

    }

    dispatch(
      addToCart({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.finalPrice,
        image: product.images?.[0]?.url,
        quantity: quantity,
      })
    );

    toast.success("Product added to cart");

  };

  /* ================= BUY NOW ================= */

  const handleBuyNow = () => {

    if (!product || product.stock === 0) {
      toast.error("Product out of stock");
      return;
    }

    const buyNowProduct = {

      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.finalPrice,
      image: product.images?.[0]?.url,
      quantity: quantity,

    };

    navigate("/checkout", {
      state: { buyNowProduct },
    });

  };

  /* ================= RECENTLY VIEWED ================= */

  useEffect(() => {

    const saveRecentlyViewed = async () => {

      try {

        if (!token || !product?._id) return;

        await axios.post(
          "http://localhost:5000/api/v1/user/recently-viewed",
          { productId: product._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      } catch (error) {

        console.log(
          "Recently viewed error:",
          error.response?.data || error.message
        );

      }

    };

    saveRecentlyViewed();

  }, [product?._id, token]);

  /* ================= LOADING ================= */

  if (loading) return <ProductSkeleton />;

  /* ================= PRODUCT NOT FOUND ================= */

  if (!product) {

    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">

          <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md">

            <h2 className="text-2xl font-bold text-gray-800">
              This product is no longer available
            </h2>

            <p className="text-gray-500 mt-2">
              The product you are looking for has been removed or deleted.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition"
            >
              Continue Shopping
            </button>

          </div>

        </div>
      </>
    );
  }

  /* ================= UI ================= */

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-4">

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

            {/* LEFT IMAGE */}

            <div className="space-y-5">

              <div className="relative bg-white rounded-3xl shadow-xl border overflow-hidden group">

                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-[380px] sm:h-[480px] lg:h-[600px] object-cover"
                />

                {product.discountPrice > 0 && (
                  <span className="absolute top-4 left-4 bg-pink-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow">
                    SALE
                  </span>
                )}

              </div>

              {/* THUMBNAILS */}

              <div className="flex gap-3 overflow-x-auto">

                {product.images.map((img) => (

                  <button
                    key={img.public_id}
                    onClick={() => setActiveImage(img.url)}
                    className={`rounded-xl border-2
                    ${
                      activeImage === img.url
                        ? "border-pink-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  </button>

                ))}

              </div>

            </div>

            {/* RIGHT SECTION */}

            <div className="space-y-6">

              <div className="bg-white rounded-3xl shadow-lg border p-6">

                <h1 className="text-3xl font-bold">{product.name}</h1>

                <p className="text-gray-500 mt-2">
                  Category · {product.category?.name}
                </p>

                {/* PRICE */}

                <div className="mt-6 flex items-center gap-4">

                  <span className="text-4xl font-bold text-pink-600">
                    ₹{product.finalPrice}
                  </span>

                  {product.discountPrice > 0 && (
                    <span className="line-through text-gray-400">
                      ₹{product.price}
                    </span>
                  )}

                </div>

                {/* STOCK */}

                <div className="mt-4">

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      product.stock > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {product.stock > 0
                      ? "✔ In Stock"
                      : "✖ Out of Stock"}
                  </span>

                  {sold30Days > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      🔥 {sold30Days}+ sold in last 30 days
                    </p>
                  )}

                </div>

                {/* QUANTITY */}

                <div className="mt-6 flex items-center gap-3">

                  <button
                    onClick={() =>
                      setQuantity((prev) =>
                        prev > 1 ? prev - 1 : 1
                      )
                    }
                    className="px-3 py-1 border rounded"
                  >
                    -
                  </button>

                  <span>{quantity}</span>

                  <button
                    onClick={() =>
                      setQuantity((prev) => prev + 1)
                    }
                    className="px-3 py-1 border rounded"
                  >
                    +
                  </button>

                </div>

                {/* BUTTONS */}

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-bold"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="py-4 rounded-2xl border border-pink-500 text-pink-600 font-bold"
                  >
                    Buy Now
                  </button>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="bg-white rounded-3xl shadow-lg border p-8">

                <h2 className="text-xl font-bold mb-4">
                  Product Description
                </h2>

                <p className="text-gray-700">
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