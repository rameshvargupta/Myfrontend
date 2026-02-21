import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { loadUserCart } from "@/redux/cartSlice";
const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 🔹 handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 login submit
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ LOGIN
      const res = await fetch("http://localhost:5000/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const token = data.token;

      // 2️⃣ FETCH FULL PROFILE (IMPORTANT)
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

      // 3️⃣ SET COMPLETE USER (including addresses)
      dispatch(
        setUser({
          user: profileData.user,
          token: token,
        })
      );
      dispatch(loadUserCart(profileData.user._id));

      const name =
        `${profileData.user?.firstName || ""} ${profileData.user?.lastName || ""
          }`.trim();

      toast.success(`Welcome back ${name || "User"} 👋`);

      navigate("/");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email and password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submitHandler} className="flex flex-col gap-4">
            {/* Email */}
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {showPassword ? (
                  <EyeOff
                    onClick={() => setShowPassword(false)}
                    className="w-5 h-5 absolute right-3 top-3 cursor-pointer"
                  />
                ) : (
                  <Eye
                    onClick={() => setShowPassword(true)}
                    className="w-5 h-5 absolute right-3 top-3 cursor-pointer"
                  />
                )}
              </div>
            </div>

            <Button disabled={loading} className="bg-pink-600 hover:bg-pink-500">
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
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <p className="text-sm">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-pink-700 hover:underline">
              Register
            </Link>
          </p>
          <Link to="/forgot-password" className="text-sm text-pink-700 hover:underline">
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
