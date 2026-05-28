import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import {
  Eye,
  EyeOff,
  X,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Gift,
  Truck, ChevronDown, MessageCircle
} from "lucide-react";
import { setUser } from "@/redux/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import FooterNavbar from "@/components/user/FooterNavbar";
import { Search, MapPin } from "lucide-react";
import { fetchAddresses, makeDefaultAddress } from "@/api/addressApi";
import { setAddresses, selectAddress } from "@/redux/addressSlice";
import ProductCategory from "./ProductCategory";
import RecentlyViewed from "./user/RecentlyViewed";
import Footer from "@/components/Footer";
import debounce from "lodash.debounce";
import { fetchWithRetry } from "@/utils/auth";
import { Label } from "@radix-ui/react-label";
const API_URL = import.meta.env.VITE_API_URL;


const Home = () => {
  const [products, setProducts] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await fetchAddresses();

        if (!data?.addresses) {
          dispatch(setAddresses([]));
          return;
        }

        dispatch(setAddresses(data.addresses));

        const defaultAddr =
          data.addresses.find((addr) => addr.isDefault) ||
          data.addresses[0];

        if (defaultAddr) {
          dispatch(selectAddress(defaultAddr));
        }

      } catch (error) {
        console.error("Address fetch error:", error);
        dispatch(setAddresses([]));
      }
    };

    if (user) {
      loadAddresses();
    }
  }, [user, dispatch]);

  /* ================= ADDRESS ================= */
  const { addresses, selectedAddress } = useSelector(
    (state) => state.address
  );
  const defaultAddress = selectedAddress;

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        const data = await fetchWithRetry(
          `${API_URL}/api/v1/products`
        );

        if (data?.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Product fetch error:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /* ================= LOGIN POPUP TIMER ================= */

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowLoginPopup(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const debouncedInput = useMemo(
    () =>
      debounce((value) => {
        setDebouncedKeyword(value.trim().toLowerCase());
      }, 300),
    []
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedInput.cancel();
    };
  }, [debouncedInput]);


  const handleClosePopup = () => {
    setShowLoginPopup(false);
  };

  /* ================= LOGIN FUNCTION ================= */

  const handleLogin = async () => {
    if (!email || !password) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);
      setError("");

      // 1️⃣ LOGIN
      const res = await fetch(
        `${API_URL}/api/v1/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const token = data.token;

      // 2️⃣ FETCH FULL PROFILE
      const profileRes = await fetch(
        `${API_URL}/api/v1/user/my-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profileData = await profileRes.json();
      if (!profileData.success)
        throw new Error("Failed to fetch profile");

      // 3️⃣ SET COMPLETE USER
      dispatch(
        setUser({
          user: profileData.user,
          token: token,
        })
      );
      // After dispatch(setUser(...))

      const addressData = await fetchAddresses();

      if (addressData?.addresses) {
        dispatch(setAddresses(addressData.addresses));

        const defaultAddr =
          addressData.addresses.find(a => a.isDefault) ||
          addressData.addresses[0];

        dispatch(selectAddress(defaultAddr));
      }

      const name =
        `${profileData.user?.firstName || ""} ${profileData.user?.lastName || ""
          }`.trim();

      toast.success(`Welcome back ${name || "User"} 👋`);

      setShowLoginPopup(false);

    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = async (address) => {
    try {
      // 🔥 Agar already default hai to API call mat karo
      if (address.isDefault) {
        dispatch(selectAddress(address));
        setShowAddressModal(false);
        return;
      }

      // 1️⃣ Make default in backend
      await makeDefaultAddress(address._id);

      // 2️⃣ Fresh addresses dubara fetch karo (IMPORTANT)
      const fresh = await fetchAddresses();

      if (fresh?.addresses) {
        dispatch(setAddresses(fresh.addresses));

        const newDefault =
          fresh.addresses.find(a => a.isDefault) ||
          fresh.addresses[0];

        dispatch(selectAddress(newDefault));
      }

      toast.success("Default address updated ✅");
      setShowAddressModal(false);

    } catch (error) {
      console.error(error);
      toast.error("Failed to update default ❌");
    }
  };


  /* ================= SORTING ================= */

  const trendingProducts = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 8);

  const bestOffers = [...products]
    .sort(
      (a, b) =>
        (b.price - b.discountPrice) -
        (a.price - a.discountPrice)
    )
    .slice(0, 8);

  const latestProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, 8);


  return (
    <>
      <div className="space-y-10 relative pt-18 pb-24 md:pt-0 md:pb-0">

       {/* ================= PREMIUM LOGIN MODAL ================= */}
{showLoginPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">

    {/* BACKGROUND GLOW */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-0 left-0 w-60 h-60 bg-pink-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-500/20 blur-3xl rounded-full" />
    </div>

    {/* MODAL */}
    <div className="relative w-full max-w-3xl rounded-[28px] overflow-hidden border border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.6)] grid md:grid-cols-2 animate-in fade-in zoom-in-95 duration-300">

      {/* CLOSE BUTTON */}
      <button
        onClick={handleClosePopup}
        className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition"
      >
        <X size={18} />
      </button>

      {/* ================= LEFT SIDE ================= */}
      <div className="relative hidden md:flex flex-col justify-between p-7 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">

        {/* Decorative */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-black/20 rounded-full blur-3xl" />

        {/* LOGO */}
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl mb-5">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight">
            GT_Shop
          </h1>

          <p className="mt-3 text-white/80 text-sm leading-relaxed max-w-xs">
            Exclusive deals, trending products and
            premium shopping experience.
          </p>
        </div>

        {/* FEATURES */}
        <div className="relative z-10 space-y-4 mt-8">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-300" />
            </div>

            <div>
              <p className="text-white text-sm font-semibold">
                Secure Login
              </p>

              <p className="text-white/70 text-xs">
                Advanced protection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Gift className="w-4 h-4 text-pink-200" />
            </div>

            <div>
              <p className="text-white text-sm font-semibold">
                Daily Offers
              </p>

              <p className="text-white/70 text-xs">
                Exclusive discounts
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="relative bg-slate-950/85 backdrop-blur-2xl p-6 md:p-8">

        {/* MOBILE LOGO */}
        <div className="md:hidden text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-500 shadow-2xl mb-3">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>

          <h1 className="text-3xl font-black text-white">
            GT_Shop
          </h1>
        </div>

        {/* HEADING */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Welcome Back 👋
          </h2>

          <p className="text-gray-400 mt-1 text-sm">
            Login to continue shopping
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <div className="mb-4">
          <Label className="text-gray-300 mb-2 block text-sm">
            Email Address
          </Label>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl pl-11 pr-4 text-white placeholder:text-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 outline-none transition"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="mb-5">
          <Label className="text-gray-300 mb-2 block text-sm">
            Password
          </Label>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl pl-11 pr-11 text-white placeholder:text-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 outline-none transition"
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              {showPass ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 text-white font-semibold shadow-[0_10px_30px_rgba(236,72,153,0.35)] transition-all duration-300 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login to GT_Shop"
          )}
        </button>

        {/* LINKS */}
        <div className="mt-5 space-y-3">

          <p className="text-center text-sm">
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-pink-400 hover:text-pink-300 cursor-pointer font-medium transition"
            >
              Forgot Password?
            </span>
          </p>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">
              OR
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition"
            >
              Create Account
            </span>
          </p>

        </div>

      </div>
    </div>
  </div>
)}
        {/* for middle devices   */}
        <div className="md:hidden fixed top-0 mt-12 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-100">

          <div className="px-4 pt-4 pb-3 space-y-3">

            {/* Address Row */}
            <div
              onClick={() => setShowAddressModal(true)}
              className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                <MapPin size={16} className="text-pink-500 flex-shrink-0" />

                <p className="truncate">
                  Deliver to{" "}

                  {defaultAddress ? (
                    <>
                      <span className="font-semibold text-gray-800">
                        {defaultAddress.fullName}
                      </span>{" "}
                      {defaultAddress.city}, {defaultAddress.state} -{" "}
                      {defaultAddress.pincode}
                    </>
                  ) : (
                    "Select Address"
                  )}
                </p>
              </div>

              <ChevronDown size={16} />
            </div>

          </div>
        </div>

        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm mb-15">

            <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl shadow-xl max-h-[85vh] flex flex-col animate-slideUp">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="text-base font-semibold">
                  Select Address
                </h2>

                <button
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              {/* Address Grid */}
              <div className="flex-1 overflow-y-auto p-4">

                {addresses.length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-6">
                    No address found
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress?._id === addr._id;

                    return (
                      <div
                        key={addr._id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`relative border rounded-2xl p-3 cursor-pointer transition-all duration-200 text-xs
                  ${isSelected
                            ? "border-pink-500 bg-pink-50 shadow-md"
                            : "hover:border-gray-300 hover:shadow-sm"
                          }`}
                      >

                        {/* Selected Badge */}
                        {isSelected && (
                          <span className="absolute top-2 right-2 text-[10px] bg-pink-600 text-white px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}

                        {/* Name */}
                        <p className="font-semibold text-gray-800 truncate">
                          {addr.fullName}
                        </p>

                        {/* Phone */}
                        <p className="text-gray-500 truncate">
                          {addr.phone}
                        </p>

                        {/* Address */}
                        <p className="text-gray-600 mt-1 line-clamp-3">
                          {addr.addressLine1}, {addr.city}, {addr.state}
                        </p>

                        {/* Default Tag */}
                        {addr.isDefault && (
                          <span className="inline-block mt-2 text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Bottom Button */}
              <div className="p-3 border-t bg-white">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-xl text-sm font-medium transition"
                >
                  + Add New Address
                </button>
              </div>

            </div>
          </div>
        )}

        {/* first carausel */}
        <div className="px-2 md:px-4 mb-5">
          <HeroSlider
            position="TOP"
            className="h-[150px] sm:h-[180px] md:h-[220px] lg:h-[260px]"
          />
        </div>
        <ProductCategory />
        <Section title="Trending Products">
          {trendingProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </Section>
        {/* first carausel */}


        {/* second cart and carosel */}
        <div className="px-4 md:px-8">
          <HeroSlider
            position="MIDDLE"
            className="h-[120px] sm:h-[150px] md:h-[230px] lg:h-[250px]"
          />
        </div>
        <RecentlyViewed />
        <Section title="Best Offers">
          {bestOffers.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </Section>
        {/* second cart and carosel */}

        {/* Third cart and carosel */}
        <div className="px-4 md:px-8">
          <HeroSlider
            position="BOTTOM"
            className="h-[130px] sm:h-[180px] md:h-[220px] lg:h-[260px]"
          />
        </div>

        <Section title="Latest Products">
          {latestProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </Section>

        {/* Third cart and carosel */}

      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="block md:hidden">
        <FooterNavbar />
      </div>


      {/* ================= WHATSAPP FLOAT BUTTON ================= */}
      <a
        href="https://wa.me/7523062030?text=Hi%20I%20am%20interested%20in%20your%20products"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-4 z-50 group"
      >
        <div className="flex items-center gap-3">

          {/* TEXT (desktop only) */}
          <span className="hidden md:block bg-white text-gray-700 text-sm px-4 py-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition">
            Chat with us
          </span>

          {/* BUTTON */}
          <div className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 animate-bounce">

            <MessageCircle className="text-white" size={26} />

          </div>

        </div>
      </a>
    </>
  );
};

/* ================= REUSABLE SECTION ================= */

const Section = ({ title, children }) => (
  <section className="px-4 md:px-8">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl md:text-2xl font-bold">
        {title}
      </h2>
      <button className="text-sm text-indigo-600 hover:underline">
        View All
      </button>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {children}
    </div>
  </section>
);

export default Home;