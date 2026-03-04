import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import { X, Eye, EyeOff, ChevronDown } from "lucide-react";
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

const Home = () => {
  const [products, setProducts] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);

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
  console.log(defaultAddress);

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/v1/products")
      .then((res) => {
        if (res.data.success) {
          setProducts(res.data.products);
        }
      })
      .catch(console.error);
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


  const searchHandler = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setSearchKeyword(keyword);
  };

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
        "http://localhost:5000/api/v1/user/login",
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
        "http://localhost:5000/api/v1/user/my-profile",
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
      <div className="space-y-10 relative pt-28 pb-24 md:pt-0 md:pb-0">

        {/* ================= LOGIN MODAL ================= */}
        {showLoginPopup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[95%] max-w-4xl rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 relative animate-fadeIn">

              {/* Close */}

              <button
                onClick={handleClosePopup}
                className="absolute top-4 right-4 text-white md:text-gray-500 md:hover:text-black"
              >
                <X size={22} />
              </button>

              {/* Left Side Image */}
              <div className=" bg-indigo-600 text-white p-10 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4">
                  Welcome to Ecart
                </h2>
                <p className="text-sm opacity-90">
                  Login now to access exclusive deals, offers
                  and track your orders easily.
                </p>
              </div>

              {/* Right Side Form */}
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Login to Continue
                </h2>

                {error && (
                  <p className="text-red-500 text-sm mb-4 text-center">
                    {error}
                  </p>
                )}

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-4 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <div className="relative mb-5">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-3 cursor-pointer text-gray-500"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>

                <p className="text-sm text-center mt-5">
                  Not registered?{" "}
                  <span
                    onClick={() => navigate("/signup")}
                    className="text-indigo-600 font-semibold cursor-pointer hover:underline"
                  >
                    Create Account
                  </span>
                </p>
              </div>

            </div>
          </div>
        )}

        {/* for middle devices   */}
        <div className="md:hidden fixed top-0 mt-12 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-100">

          <div className="px-4 pt-4 pb-3 space-y-3">

            {/* Search Bar */}
            <form
              onSubmit={searchHandler}
              className="flex items-center bg-gray-100 rounded-full px-4 h-11 focus-within:ring-2 focus-within:ring-pink-500 transition-all"
            >
              <Search size={18} className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search for products, brands..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm"
              />
            </form>

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


        <ProductCategory />

        <div className="px-4 md:px-8">
          <HeroSlider
            position="TOP"
            className="h-[130px] sm:h-[180px] md:h-[220px] lg:h-[260px]"
          />
        </div>



        <Section title="Trending Products">
          {trendingProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </Section>

        <RecentlyViewed />

        <div className="px-4 md:px-8">
          <HeroSlider
            position="MIDDLE"
            className="h-[120px] sm:h-[150px] md:h-[230px] lg:h-[250px]"
          />
        </div>

        <Section title="Best Offers">
          {bestOffers.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </Section>

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


      </div>
      
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="block md:hidden">
        <FooterNavbar />
      </div>
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