import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";

import { setUser } from "@/redux/userSlice";
import { loadUserCart } from "@/redux/cartSlice";
import { loadWishlist } from "@/redux/wishlistSlice";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // ✅ HANDLE CHANGE
  const handleChange = (e) => {
    const key =
      e.target.name === "login_email"
        ? "email"
        : e.target.name === "login_password"
          ? "password"
          : e.target.name;

    setFormData({
      ...formData,
      [key]: e.target.value,
    });
  };

  // ✅ LOGIN HANDLER
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/v1/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      const token = data.token;

      const profileRes = await fetch(
        `${API_URL}/api/v1/user/my-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profileData = await profileRes.json();

      if (!profileData.success) {
        throw new Error("Failed to fetch profile");
      }

      dispatch(
        setUser({
          user: profileData.user,
          token,
        })
      );

      dispatch(loadUserCart(profileData.user._id));
      dispatch(loadWishlist());

      const name = `${profileData.user?.firstName || ""} ${profileData.user?.lastName || ""
        }`.trim();

      toast.success(`Welcome back ${name || "User"} 👋`);

      const from = location.state?.from || "/";
      navigate(from);

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fafafa] flex items-center justify-center px-4 py-8">

      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl"></div>

      {/* GRID */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">

        {/* LEFT SIDE */}
        <div className="hidden lg:block">

          {/* LOGO */}
          <div className="inline-flex items-center gap-3 bg-white border border-pink-100 shadow-sm px-5 py-3 rounded-2xl">

            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>

            <div>
              <h2 className="font-bold text-lg text-gray-900">
                GT_Shop
              </h2>

              <p className="text-xs text-gray-500">
                Smart Shopping Platform
              </p>
            </div>
          </div>

          {/* TEXT */}
          <div className="mt-10">

            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              New Shopping Experience
            </div>

            <h1 className="text-5xl font-black leading-tight text-gray-900 mt-6">
              Shop Smarter With{" "}
              <span className="bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
                GT_Shop
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600 max-w-xl">
              Discover trending products, premium collections,
              secure payments and ultra-fast shopping experience
              built for modern users.
            </p>

            {/* FEATURES */}
            <div className="mt-10 space-y-4">

              <div className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">

                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-pink-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    Secure Authentication
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Your account and payments are protected with secure systems.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">

                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-violet-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    Faster Shopping
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Access cart, wishlist and orders instantly from anywhere.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex justify-center">

          <Card className="w-full max-w-md border-0 shadow-[0_20px_80px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl">

            {/* TOP GRADIENT */}

            {/* HIDDEN INPUTS */}
            <input
              type="text"
              name="fakeuser"
              autoComplete="username"
              className="hidden"
            />

            <input
              type="password"
              name="fakepass"
              autoComplete="current-password"
              className="hidden"
            />

            <CardContent className="p-8">

              {/* MOBILE LOGO */}
              <div className="lg:hidden flex justify-center mb-6">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <h2 className="font-bold text-lg text-gray-900">
                      GT_Shop
                    </h2>

                    <p className="text-xs text-gray-500">
                      Shopping Platform
                    </p>
                  </div>
                </div>
              </div>

              {/* HEADING */}
              <div className="text-center mb-8">

                <h2 className="text-3xl font-black text-gray-900">
                  Welcome Back 👋
                </h2>

                <p className="text-gray-500 mt-2">
                  Login to continue shopping with GT_Shop
                </p>
              </div>

              {/* FORM */}
              <form
                onSubmit={submitHandler}
                autoComplete="off"
                className="space-y-5"
              >

                {/* EMAIL */}
                <div className="space-y-2">

                  <Label className="text-gray-700">
                    Email Address
                  </Label>

                  <div className="relative">

                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <Input
                      name="login_email"
                      type="email"
                      autoComplete="off"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="h-12 pl-11 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">

                  <div className="flex items-center justify-between">

                    <Label className="text-gray-700">
                      Password
                    </Label>

                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-pink-600 hover:text-pink-500"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="relative">

                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <Input
                      name="login_password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="h-12 pl-11 pr-11 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    />

                    {showPassword ? (
                      <EyeOff
                        onClick={() => setShowPassword(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer"
                      />
                    ) : (
                      <Eye
                        onClick={() => setShowPassword(true)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer"
                      />
                    )}
                  </div>
                </div>

                {/* BUTTON */}
                <Button
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold shadow-lg transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* FOOTER */}
              <div className="mt-7 text-center">

                <p className="text-sm text-gray-500">
                  Don’t have an account?{" "}

                  <Link
                    to="/signup"
                    className="font-semibold text-pink-600 hover:text-pink-500"
                  >
                    Create Account
                  </Link>
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;