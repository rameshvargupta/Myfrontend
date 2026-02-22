import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, ChevronDown, Heart } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/userSlice";
import { toast } from "sonner";
import { loadUserCart } from "@/redux/cartSlice";
import Avatar from "@/pages/profile/Avatar";
import { clearAddressState } from "@/redux/addressSlice";
import { Search } from "lucide-react";
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);
  // ===== Redux State =====
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const { user, isAuth, authChecked } = useSelector((state) => state.user || {});
  const firstName = user?.name?.split(" ")[0] || "";
  if (!authChecked) {
    return null; // ya skeleton navbar
  }


  const isAdmin = isAuth && user?.role === "admin";

  const totalQty = isAuth && Array.isArray(cartItems)
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
        await fetch("http://localhost:5000/api/v1/user/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.log("Backend logout skipped");
    } finally {

      // ❌ clearCart() remove karo
      dispatch(clearAddressState());
      dispatch(logoutUser());

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("Logged out successfully 👋");
      navigate("/login", { replace: true });
    }
  };

  const searchHandler = (e) => {
    e.preventDefault();

    if (keyword.trim()) {
      navigate(`/products?keyword=${keyword}`);
    } else {
      navigate("/products");
    }

    setKeyword("");
  };
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);



  const wishlistItems = useSelector(state => state.wishlist.items);
  const wishlistCount = wishlistItems.length;
  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

          {/* ================= LEFT ================= */}
          <div className="flex items-center gap-8">
            {/* LOGO */}
            <Link to="/" className="text-2xl font-bold text-pink-600 tracking-wide">
              Ecart
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
              <Link to="/" className="hover:text-pink-600 transition">Home</Link>
              <Link to="/products" className="hover:text-pink-600 transition">Products</Link>

              {/* ================= ADMIN DROPDOWN ================= */}
              {isAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setAdminDropdown(!adminDropdown)}
                    className="flex items-center gap-1 hover:text-pink-600 transition"
                  >
                    Admin
                    <ChevronDown size={16} />
                  </button>

                  {adminDropdown && (
                    <div className="absolute top-8 left-0 w-52 bg-white rounded-xl shadow-lg border overflow-hidden animate-fadeIn">
                      <Link
                        to="/adminDashboard"
                        onClick={() => setAdminDropdown(false)}
                        className="block px-4 py-3 hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/products"
                        onClick={() => setAdminDropdown(false)}
                        className="block px-4 py-3 hover:bg-gray-50"
                      >
                        All Products
                      </Link>
                      <Link
                        to="/admin/add-product"
                        onClick={() => setAdminDropdown(false)}
                        className="block px-4 py-3 hover:bg-gray-50"
                      >
                        Add Product
                      </Link>
                      <Link
                        to="/admin/add-banner"
                        onClick={() => setAdminDropdown(false)}
                        className="block px-4 py-3 hover:bg-gray-50"
                      >
                        Add Banner
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* ================= CENTER SEARCH ================= */}
          <div className="hidden md:flex flex-1 justify-center px-10">
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

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-12 w-full bg-white shadow-2xl rounded-xl border max-h-80 overflow-y-auto z-[999]">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => {
                        navigate(`/product/${product._id}`);
                        setKeyword("");
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">₹ {product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex items-center gap-5">
            {/* WISHLIST */}
            <Link to="/wishlist" className="relative">
              <Heart size={24} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* CART */}
            <Link to="/cartpage" className="relative">
              <ShoppingCart size={24} className="hover:text-pink-600 transition" />
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalQty}
                </span>
              )}
            </Link>

            {/* USER */}
            {isAuth ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2"
                >
                  <Avatar user={user} />
                  <span className="hidden md:block text-sm font-medium">
                    {user?.firstName}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border overflow-hidden">
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
              <Link to="/login">
                <button className="bg-pink-600 text-white px-4 py-1.5 rounded-full text-sm">
                  Login
                </button>
              </Link>
            )}

          </div>
        </div>

      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl p-6 space-y-5">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Menu</h2>
              <X size={22} onClick={() => setMobileMenuOpen(false)} />
            </div>

            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Products</Link>

            {isAdmin && (
              <>
                <button
                  onClick={() => setMobileAdminOpen(!mobileAdminOpen)}
                  className="flex items-center justify-between w-full"
                >
                  Admin
                  <ChevronDown size={16} />
                </button>

                {mobileAdminOpen && (
                  <div className="pl-4 space-y-3 text-sm">
                    <Link to="/adminDashboard">Dashboard</Link>
                    <Link to="/admin/products">All Products</Link>
                    <Link to="/admin/add-product">Add Product</Link>
                    <Link to="/admin/add-banner">Add Banner</Link>
                  </div>
                )}
              </>
            )}

            {isAuth ? (
              <button
                onClick={logoutHandler}
                className="w-full bg-red-500 text-white py-2 rounded-lg mt-4"
              >
                Logout
              </button>
            ) : (
              <Link to="/login">
                <button className="w-full bg-pink-600 text-white py-2 rounded-lg mt-4">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

      <br />
      <br />
      <br />
    </>
  );

};

export default Navbar;
