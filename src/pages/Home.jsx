import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import { X, Eye, EyeOff } from "lucide-react";
import { setUser } from "@/redux/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
const Home = () => {
  const [products, setProducts] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <div className="space-y-16 relative">

      {/* ================= LOGIN MODAL ================= */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[95%] max-w-4xl rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 relative animate-fadeIn">

            {/* Close */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X size={22} />
            </button>

            {/* Left Side Image */}
            <div className="hidden md:block bg-indigo-600 text-white p-10 flex flex-col justify-center">
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

      {/* ================= WEBSITE CONTENT ================= */}

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