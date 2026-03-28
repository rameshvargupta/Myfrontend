
import React, { useEffect, useRef, useState } from "react";
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
import { Eye, EyeOff, Mail, User, Lock, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

// ================= PASSWORD STRENGTH =================
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", percent: 30 };
  if (score <= 4) return { label: "Medium", color: "bg-yellow-500", percent: 65 };
  return { label: "Strong", color: "bg-green-500", percent: 100 };
};

// ================= COMPONENT =================
const Signup = () => {
  const navigate = useNavigate();

  // ================= STATE =================
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    otp: "",
    password: "",
  });

  const [otpBoxes, setOtpBoxes] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);
  const [showPassword, setShowPassword] = useState(false);

  const strength = getPasswordStrength(formData.password);

  // ================= TIMER =================
  useEffect(() => {
    if (!otpSent) return;
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, otpSent]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  };

  // ================= OTP INPUT HANDLER =================
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otpBoxes];
    updatedOtp[index] = value;
    setOtpBoxes(updatedOtp);

    // Move forward
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Update final OTP
    setFormData((prev) => ({
      ...prev,
      otp: updatedOtp.join(""),
    }));
  };

  // ================= BACKSPACE =================
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpBoxes[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ================= SEND OTP =================
  const sendOtpHandler = async () => {
    if (!formData.email) return toast.error("Enter email");

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/v1/user/signup/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      setTimer(30);
      toast.success("OTP sent 📩");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const resendOtpHandler = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/v1/user/resend-signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      setTimer(30);
      toast.success("OTP resent 🔁");
    } catch {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  // ================= SUBMIT =================
  const submitHandler = async (e) => {
    e.preventDefault();

    if (formData.otp.length !== 6) {
      return toast.error("Enter complete OTP");
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      return toast.error("Weak password");
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/v1/user/signup/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Account Created 🎉");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        otp: "",
        password: "",
      });

      setOtpBoxes(["", "", "", "", "", ""]);
      setOtpSent(false);
      navigate("/login");
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-purple-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[380px] shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">
              Create Account 🚀
            </CardTitle>
            <CardDescription className="text-center">
              Secure signup with OTP verification
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={submitHandler} autoComplete="off" className="space-y-4">

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-2">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 size-4 text-gray-400" />
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-8"
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Last Name</Label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="mb-2">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 size-4 text-gray-400" />
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-8"
                    autoComplete="email"
                    disabled={otpSent}
                  />
                </div>
              </div>

              {!otpSent && (
                <Button type="button" onClick={sendOtpHandler} className="w-full bg-pink-600 hover:bg-pink-500">
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              )}

              {/* OTP BOXES */}
              {otpSent && (
                <>
                  <div>
                    <Label>Enter OTP</Label>
                    <div className="flex justify-center gap-2 mt-2">
                      {otpBoxes.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          value={digit}
                          maxLength={1}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          className="w-15 h-12 text-center text-lg font-bold"
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    disabled={timer > 0}
                    onClick={resendOtpHandler}
                    className="text-sm text-pink-600"
                  >
                    {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                  </Button>

                  {/* PASSWORD */}
                  <div>
                    <Label className="mb-2">Create Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2 top-2.5 size-4 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-8 pr-8"
                        autoComplete="new-password"
                      />
                      {showPassword ? (
                        <EyeOff
                          className="absolute right-2 top-2.5 cursor-pointer"
                          onClick={() => setShowPassword(false)}
                        />
                      ) : (
                        <Eye
                          className="absolute right-2 top-2.5 cursor-pointer"
                          onClick={() => setShowPassword(true)}
                        />
                      )}
                    </div>

                    {formData.password && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded">
                          <div
                            className={`${strength.color} h-2 rounded transition-all`}
                            style={{ width: `${strength.percent}%` }}
                          />
                        </div>
                        <p className="text-xs mt-1">{strength.label}</p>
                      </div>
                    )}
                  </div>

                  <Button className="w-full bg-pink-600 hover:bg-pink-500">
                    {loading ? "Creating..." : "Register"}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
<CardFooter className="flex flex-col items-center gap-3 pb-2">

  {/* Divider */}
  <div className="w-full flex items-center gap-2">
    <div className="flex-1 h-px bg-gray-200" />
    <span className="text-xs text-gray-400">OR</span>
    <div className="flex-1 h-px bg-gray-200" />
  </div>

  {/* Login Text */}
  <p className="text-sm text-gray-600 text-center">
    Already have an account?{" "}
    <Link
      to="/login"
      className="font-medium text-pink-600 hover:underline"
    >
      Login
    </Link>
  </p>

  {/* Back to Home */}
  <Link
    to="/"
    className="text-sm text-gray-500 hover:text-pink-600 transition"
  >
    ← Back to Home
  </Link>

</CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;