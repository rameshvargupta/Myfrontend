import React, { useEffect, useState } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const getPasswordStrength = (password) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", percent: 30 };
  if (score === 3 || score === 4)
    return { label: "Medium", color: "bg-yellow-500", percent: 65 };

  return { label: "Strong", color: "bg-green-500", percent: 100 };
};


const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const [timer, setTimer] = useState(30);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    otp: "",
    password: "",
  });
  const strength = getPasswordStrength(formData.password);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /*  RESEND OTP
================================ */
  const resendOtpHandler = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/v1/user/resend-signup-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to resend OTP");
        return;
      }

      toast.success("OTP resent successfully 📩");

      // 🔁 reset timer
      setTimer(30);

    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
      HANDLE INPUT CHANGE
  ================================ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ===============================
      SEND OTP
  ================================ */
  const sendOtpHandler = async () => {
    if (!formData.email) {
      toast.error("Please enter email");

      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/v1/user/signup/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      toast.info("OTP sent to your email");


    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
      VERIFY OTP & REGISTER
  ================================ */
  const submitHandler = async (e) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      toast.error(
        "Password must have uppercase, lowercase, number & special character"
      );
      return;
    }


    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/v1/user/signup/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success("Account created successfully 🎉");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        otp: "",
        password: "",
      });

      setOtpSent(false);
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Verify email with OTP and create account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submitHandler} className="flex flex-col gap-3">

            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>First Name</Label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Last Name</Label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={otpSent}
                required
              />
            </div>

            {/* Send OTP Button */}
            {!otpSent && (
              <Button
                type="button"
                onClick={sendOtpHandler}
                disabled={loading}
                className="cursor-pointer bg-pink-600 hover:bg-pink-500"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            )}

            {/* OTP + Password */}
            {otpSent && (
              <>
                <div className="grid gap-2">
                  <Label>OTP</Label>
                  <Input
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button
                  type="button"
                  onClick={resendOtpHandler}
                  disabled={timer > 0 || loading}
                  variant="ghost"
                  className="text-pink-600 hover:text-pink-700"
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                </Button>


                <div className="grid gap-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    {showPassword ? (
                      <EyeOff
                        className="absolute right-3 top-2 cursor-pointer"
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <Eye
                        className="absolute right-3 top-2 cursor-pointer"
                        onClick={() => setShowPassword(true)}
                      />
                    )}
                  </div>
                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                      <div
                        className={`h-2 rounded ${strength.color} transition-all duration-700 ease-in-out`}
                        style={{ width: `${strength.percent}%` }}
                      ></div>
                    </div>

                  )}

                </div>


                <Button className="cursor-pointer bg-pink-600 hover:bg-pink-500" type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Register"}
                </Button>
              </>
            )}

          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-pink-700 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
