import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
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

  // ✅ FIXED handleChange (supports renamed inputs)
  const handleChange = (e) => {
    const key =
      e.target.name === "login_email"
        ? "email"
        : e.target.name === "login_password"
          ? "password"
          : e.target.name;

    setFormData({ ...formData, [key]: e.target.value });
  };

  // ✅ LOGIN HANDLER (same logic)
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

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

      if (!profileData.success)
        throw new Error("Failed to fetch profile");

      dispatch(
        setUser({
          user: profileData.user,
          token: token,
        })
      );

      dispatch(loadUserCart(profileData.user._id));
      dispatch(loadWishlist());

      const name =
        `${profileData.user?.firstName || ""} ${profileData.user?.lastName || ""
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-pink-200 px-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl">

        {/* 🔥 Hidden autofill blockers */}
        <input type="text" name="fakeuser" autoComplete="username" className="hidden" />
        <input type="password" name="fakepass" autoComplete="current-password" className="hidden" />

        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">
            Welcome Back 👋
          </CardTitle>
          <CardDescription>
            Login to continue shopping
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={submitHandler}
            autoComplete="off"
            className="space-y-5"
          >
            {/* EMAIL */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  name="login_email"
                  type="email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="pl-10"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  name="login_password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                />

                {showPassword ? (
                  <EyeOff
                    onClick={() => setShowPassword(false)}
                    className="w-5 h-5 absolute right-3 top-3 cursor-pointer text-gray-500"
                  />
                ) : (
                  <Eye
                    onClick={() => setShowPassword(true)}
                    className="w-5 h-5 absolute right-3 top-3 cursor-pointer text-gray-500"
                  />
                )}
              </div>
            </div>

            {/* BUTTON */}
            <Button
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-500 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* LINKS */}
          <div className="flex justify-between mt-4 text-sm">
            <Link
              to="/forgot-password"
              className="text-pink-600 hover:underline"
            >
              Forgot password?
            </Link>
            <Link
              to="/signup"
              className="text-pink-600 hover:underline"
            >
              Create account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;