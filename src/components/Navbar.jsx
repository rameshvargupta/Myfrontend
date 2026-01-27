import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/userSlice";
import { Button } from "./ui/button";
import { toast } from "sonner";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // ===== Redux State =====
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const { user, isAuth } = useSelector((state) => state.user || {});
  const firstName = user?.name?.split(" ")[0] || "";
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

  return (
    <header className="bg-white fixed w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link to="/">
          <img src="./download.png" alt="Ecart" className="w-32 md:w-36" />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 font-medium">
          <Link className="hover:text-pink-600 transition" to="/">Home</Link>
          <Link className="hover:text-pink-600 transition" to="/products">Products</Link>

          {isAdmin && (
            <>
              <Link to="/adminDashboard">Dashboard</Link>
              <Link to="/admin/products">Admin Products</Link>
              <Link to="/admin/add-product">Add Product</Link>
            </>
          )}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link to="/cartpage" className="relative">
            <ShoppingCart size={28} className="hover:text-pink-600 transition" />
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-3 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* User / Profile */}
          {isAuth ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 border px-3 py-1 rounded hover:bg-gray-100 transition"
              >
                {/* Use avatar.url safely */}
                <img
                  src={user?.avatar?.url || "/download.png"}
                  alt={user?.name || "User"}
                  className="w-6 h-6 rounded-full"
                />
                <span>{user?.name?.split(" ")[0] || "Guest"}</span>
                <ChevronDown size={16} />
              </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-md overflow-hidden z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-pink-50 transition"
                    onClick={() => setProfileDropdown(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/myorders"
                    className="block px-4 py-2 hover:bg-pink-50 transition"
                    onClick={() => setProfileDropdown(false)}
                  >
                    Orders
                  </Link>
                  <button
                    onClick={logoutHandler}
                    className="w-full text-left px-4 py-2 hover:bg-pink-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button className="bg-gradient-to-tl from-blue-600 to-purple-600 text-white">
                Login
              </Button>
            </Link>
          )}


          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-md border"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md border-t p-4 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">Home</Link>
          <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">Products</Link>

          {isAdmin &&(
            <>
              <Link to="/adminDashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">Dashboard</Link>
              <Link to="/admin/products" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">Admin Products</Link>
              <Link to="/admin/add-product" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">Add Product</Link>
            </>
          )}

          {isAuth && !isAdmin && (
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">Hello {firstName}</Link>
          )}

          {isAuth ? (
            <button
              onClick={logoutHandler}
              className="w-full bg-pink-500 text-white py-2 rounded"
            >
              Logout
            </button>
          ) : (
            <Link to="/login">
              <Button className="w-full bg-gradient-to-tl from-blue-600 to-purple-600 text-white">
                Login
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
