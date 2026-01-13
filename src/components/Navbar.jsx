import { ShoppingCart } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/userSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuth } = useSelector((state) => state.user);

  // ✅ SAFE access
  const firstName = user?.name?.split(" ")?.[0] || "";

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
    } catch (err) {
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
    <header className="bg-pink-50 fixed w-full z-20 border-b border-pink-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3">

        <img src="./download.png" alt="logo" className="w-[100px]" />

        <nav className="flex gap-10 items-center">
          <ul className="flex gap-7 items-center text-xl font-semibold">
            <Link to="/"><li>Home</li></Link>
            <Link to="/products"><li>Product</li></Link>

            {isAuth && (
              <Link to="/profile">
                <li>Hello {firstName}</li>
              </Link>
            )}
          </ul>

          <Link to="/cart" className="relative">
            <ShoppingCart />
            <span className="bg-pink-500 rounded-full absolute text-white -top-3 -right-5 px-2">
              0
            </span>
          </Link>

          {isAuth ? (
            <Button
              onClick={logoutHandler}
              className="bg-pink-500 text-white cursor-pointer"
            >
              Logout
            </Button>
          ) : (
            <Link to="/login">
              <Button className="bg-gradient-to-tl from-blue-600 to-purple-600 text-white cursor-pointer">
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
