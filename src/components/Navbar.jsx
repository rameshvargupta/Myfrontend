import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  Heart,
  Search,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/userSlice";
import { toast } from "sonner";
import { loadUserCart } from "@/redux/cartSlice";
import Avatar from "@/pages/profile/Avatar";
import { clearAddressState } from "@/redux/addressSlice";
const API_URL = import.meta.env.VITE_API_URL;
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profileDropdown, setProfileDropdown] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const adminRef = useRef(null);

  // ===== Redux State =====
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);
  const { user, isAuth, authChecked } = useSelector(
    (state) => state.user || {}
  );

  if (!authChecked) return null;

  const isAdmin = isAuth && user?.role === "admin";
  const wishlistCount = wishlistItems.length;

  const totalQty =
    isAuth && Array.isArray(cartItems)
      ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
      : 0;

  useEffect(() => {
    if (isAuth && user?._id) {
      dispatch(loadUserCart(user._id));
    }
  }, [isAuth, user?._id, dispatch]);


  // ===== Logout =====
  const logoutHandler = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API_URL}/api/v1/user/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.log("Logout API skipped");
    } finally {
      dispatch(clearAddressState());
      dispatch(logoutUser());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully 👋");
      navigate("/login", { replace: true });
    }
  };

  // ===== Search Submit =====
  const searchHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${keyword}`);
    } else {
      navigate("/products");
    }
    setShowDropdown(false);
  };

  // ===== Live Search =====
  useEffect(() => {
    const fetchProducts = async () => {
      if (keyword.trim().length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/api/v1/products?keyword=${keyword}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
        const data = await res.json();

        if (!res.ok) {
          console.log("Backend error:", data.message);
          setSearchResults([]);
          setShowDropdown(false);
          return;
        }

        setSearchResults(data.products || []);
        setShowDropdown(true);
      } catch (error) {
        console.log("Search error:", error);
      }
    };

    const delay = setTimeout(fetchProducts, 400); // debounce
    return () => clearTimeout(delay);
  }, [keyword]);

  // ===== Outside Click Close =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-8">

            <Link
              to="/"
              className="text-2xl font-bold text-pink-600 tracking-wide"
            >
              GT Shop
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
              <Link to="/" className="hover:text-pink-600">
                Home
              </Link>
              <Link to="/products" className="hover:text-pink-600">
                Products
              </Link>

              {isAdmin && (
                <div className="relative" ref={adminRef}>
                  <button
                    onClick={() => setAdminDropdown(!adminDropdown)}
                    className="flex items-center gap-1 hover:text-pink-600"
                  >
                    Admin <ChevronDown size={16} />
                  </button>

                  {adminDropdown && (
                    <div className="absolute top-8 left-0 w-52 bg-white rounded-xl shadow-lg border">
                      <Link to="/adminDashboard" className="block px-3 py-2 hover:bg-gray-50">
                        Dashboard
                      </Link>
                      <Link to="/admin/OrderPannel" className="block px-3 py-2 hover:bg-gray-50">
                        Manage Orders
                      </Link>
                      <Link to="/admin/couponPage" className="block px-3 py-2 hover:bg-gray-50">
                        Coupon Sections
                      </Link>
                      <Link to="/admin/products" className="block px-3 py-2 hover:bg-gray-50">
                        Manage Products
                      </Link>
                      <Link to="/admin/UserPannel" className="block px-3 py-2 hover:bg-gray-50">
                        Manage Users
                      </Link>
                      <Link to="/admin/UserReviews" className="block px-3 py-2 hover:bg-gray-50">
                        Manage User Reviews
                      </Link>
                      <Link to="/admin/add-banner" className="block px-3 py-2 hover:bg-gray-50">
                        Manage Banner
                      </Link>

                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* ================= CENTER SEARCH ================= */}
          <div className="hidden md:flex flex-1 justify-center px-10 search-box">
            <div className="relative w-full max-w-xl">
              <form
                onSubmit={searchHandler}
                className="flex items-center bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-pink-500"
                onClick={(e) => e.stopPropagation()}
              >
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-sm"
                />
              </form>

              {showDropdown && (
                <div className="absolute top-12 w-full bg-white shadow-xl rounded-xl border max-h-80 overflow-y-auto z-[999]">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => {
                          navigate(`/product/${product._id}`);
                          setKeyword("");
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition"
                      >
                        <img
                          src={product.images?.[0]?.url}
                          alt={product.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">₹ {product.finalPrice}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500">No products found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-5">
            <Link to="/wishlist" className="relative">
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cartpage" className="relative">
              <ShoppingCart size={22} />
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalQty}
                </span>
              )}
            </Link>

            {isAuth ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2"
                >
                  <Avatar user={user} />
                  <span className="text-sm font-medium">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border">
                    <Link to="/profile" className="block px-4 py-3 hover:bg-gray-50">
                      My Profile
                    </Link>
                    <Link to="/myorders" className="block px-4 py-3 hover:bg-gray-50">
                      My Orders
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden md:block">
                <button className="bg-pink-600 text-white px-4 py-1.5 rounded-full text-sm">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* spacing for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;