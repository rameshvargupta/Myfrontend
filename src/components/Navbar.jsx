import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/userSlice";
import { Button } from "./ui/button";
import { toast } from "sonner";
import Avatar from "@/pages/profile/Avatar";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // ===== Redux State =====
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const { user, isAuth, authChecked } = useSelector((state) => state.user || {});
  const firstName = user?.name?.split(" ")[0] || "";
  if (!authChecked) {
    return null; // ya skeleton navbar
  }
  console.log("NAVBAR 👉", { isAuth, user, authChecked });

  const isAdmin = isAuth && user?.role === "admin";

  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
    } catch {
      console.log("Backend logout skipped");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logoutUser());
      toast.success("Logged out successfully 👋");
      navigate("/login");
    }
  };
  console.log(user?.profilePic);


  return (
    <>
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

          {/* ================= LOGO ================= */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="./download1.png"
              alt="Ecart"
              className="w-25 md:w-25 object-contain"
            />
          </Link>

          {/* ================= DESKTOP NAV ================= */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-gray-700">
            <Link className="hover:text-pink-600 transition" to="/">Home</Link>
            <Link className="hover:text-pink-600 transition" to="/products">Products</Link>

            {isAdmin && (
              <>
                <Link className="hover:text-pink-600 transition" to="/adminDashboard">Dashboard</Link>
                <Link className="hover:text-pink-600 transition" to="/admin/products">Admin Products</Link>
                <Link className="hover:text-pink-600 transition" to="/admin/add-product">Add Product</Link>
                <Link className="hover:text-pink-600 transition" to="/admin/add-banner">Add Banner</Link>
              </>
            )}
          </nav>

          {/* ================= RIGHT SIDE ================= */}
          <div className="flex items-center gap-4">

            {/* CART */}
            <Link to="/cartpage" className="relative group">
              <ShoppingCart size={26} className="text-gray-700 group-hover:text-pink-600 transition" />
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow">
                  {totalQty}
                </span>
              )}
            </Link>

            {/* USER PROFILE */}
            {isAuth ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                >
                  <Avatar user={user} />

                  <span className="hidden md:block text-sm font-medium">
                    {user?.firstName || "User"}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {/* DROPDOWN */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdown(false)}
                      className="block px-4 py-3 hover:bg-gray-50 transition"
                    >
                      Profile
                    </Link>

                    <Link
                      to="/myorders"
                      onClick={() => setProfileDropdown(false)}
                      className="block px-4 py-3 hover:bg-gray-50 transition"
                    >
                      Orders
                    </Link>

                    <button
                      onClick={logoutHandler}
                      className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-5">
                  Login
                </Button>
              </Link>
            )}

            {/* MOBILE TOGGLE */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg px-6 py-6 space-y-4 animate-slideDown">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block font-medium hover:text-pink-600">
              Home
            </Link>

            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block font-medium hover:text-pink-600">
              Products
            </Link>

            {isAdmin && (
              <>
                <Link to="/adminDashboard" onClick={() => setMobileMenuOpen(false)} className="block hover:text-pink-600">
                  Dashboard
                </Link>
                <Link to="/admin/products" onClick={() => setMobileMenuOpen(false)} className="block hover:text-pink-600">
                  Admin Products
                </Link>
                <Link to="/admin/add-product" onClick={() => setMobileMenuOpen(false)} className="block hover:text-pink-600">
                  Add Product
                </Link>
                <Link to="/admin/add-banner" onClick={() => setMobileMenuOpen(false)} className="block hover:text-pink-600">
                  Add Banner
                </Link>
              </>
            )}

            {isAuth ? (
              <button
                onClick={logoutHandler}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg"
              >
                Logout
              </button>
            ) : (
              <Link to="/login">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Login
                </Button>
              </Link>
            )}
          </div>
        )}

      </header>
      <br />
      <br />
      <br />
    </>
  );

};

export default Navbar;
