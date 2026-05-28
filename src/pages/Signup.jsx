import React, { useEffect, useRef, useState } from "react";
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
  Mail,
  User,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TimerReset,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

/* ================= PASSWORD STRENGTH ================= */

const getPasswordStrength = (password) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) {
    return {
      label: "Weak",
      color: "bg-red-500",
      percent: 30,
    };
  }

  if (score <= 4) {
    return {
      label: "Medium",
      color: "bg-yellow-500",
      percent: 65,
    };
  }

  return {
    label: "Strong",
    color: "bg-green-500",
    percent: 100,
  };
};

/* ================= COMPONENT ================= */

const Signup = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    otp: "",
    password: "",
  });

  const [otpBoxes, setOtpBoxes] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const otpRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);
  const [showPassword, setShowPassword] = useState(false);

  const strength = getPasswordStrength(formData.password);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (!otpSent) return;
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, otpSent]);

  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  };

  /* ================= OTP HANDLER ================= */

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otpBoxes];
    updatedOtp[index] = value;

    setOtpBoxes(updatedOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    setFormData((prev) => ({
      ...prev,
      otp: updatedOtp.join(""),
    }));
  };

  /* ================= BACKSPACE ================= */

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpBoxes[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  /* ================= SEND OTP ================= */

  const sendOtpHandler = async () => {
    if (!formData.email) {
      return toast.error("Enter email");
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/v1/user/signup/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      setTimer(30);

      toast.success("OTP sent successfully 📩");

    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */

  const resendOtpHandler = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/v1/user/resend-signup-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        }
      );

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

  /* ================= SUBMIT ================= */

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

      const res = await fetch(
        `${API_URL}/api/v1/user/signup/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Account Created Successfully 🎉");

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

  /* ================= UI ================= */

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fafafa] flex items-center justify-center px-4 py-8">

      {/* BG EFFECTS */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl"></div>

      {/* MAIN GRID */}
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
                Premium Shopping Platform
              </p>
            </div>
          </div>

          {/* TEXT */}
          <div className="mt-10">

            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Join GT_Shop Today
            </div>

            <h1 className="text-5xl font-black leading-tight text-gray-900 mt-6">

              Create Your{" "}

              <span className="bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
                Premium Account
              </span>

            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600 max-w-xl">
              Experience next-generation shopping with secure OTP verification,
              smart recommendations, lightning-fast checkout and premium features.
            </p>

            {/* FEATURES */}
            <div className="mt-10 space-y-4">

              <div className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">

                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-pink-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    OTP Protected Signup
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Secure email verification for trusted account protection.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">

                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-violet-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    Smart Shopping Experience
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Access wishlist, cart, orders and premium collections instantly.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex justify-center">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >

            <Card className="border-0 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.08)]">

              {/* TOP GRADIENT */}

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

                {/* HEADER */}
                <div className="text-center mb-8">

                  <h2 className="text-3xl font-black text-gray-900">
                    Create Account 🚀
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Join GT_Shop and start your premium shopping experience
                  </p>
                </div>

                {/* FORM */}
                <form
                  onSubmit={submitHandler}
                  autoComplete="off"
                  className="space-y-5"
                >

                  {/* NAME */}
                  <div className="grid grid-cols-2 gap-4">

                    <div className="space-y-2">

                      <Label className="text-gray-700">
                        First Name
                      </Label>

                      <div className="relative">

                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          autoComplete="given-name"
                          placeholder="John"
                          className="h-12 pl-11 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">

                      <Label className="text-gray-700">
                        Last Name
                      </Label>

                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        autoComplete="family-name"
                        placeholder="Doe"
                        className="h-12 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-2">

                    <Label className="text-gray-700">
                      Email Address
                    </Label>

                    <div className="relative">

                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        disabled={otpSent}
                        placeholder="Enter your email"
                        className="h-12 pl-11 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  {/* SEND OTP */}
                  {!otpSent && (
                    <Button
                      type="button"
                      onClick={sendOtpHandler}
                      disabled={loading}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold shadow-lg"
                    >
                      {loading ? (
                        <>
                          <TimerReset className="w-4 h-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Send OTP
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}

                  {/* OTP + PASSWORD */}
                  {otpSent && (
                    <>

                      {/* OTP */}
                      <div>

                        <div className="flex items-center justify-between mb-2">

                          <Label className="text-gray-700">
                            Verification OTP
                          </Label>

                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            OTP Sent
                          </div>
                        </div>

                        <div className="flex justify-between gap-2">

                          {otpBoxes.map((digit, index) => (
                            <Input
                              key={index}
                              ref={(el) => (otpRefs.current[index] = el)}
                              value={digit}
                              maxLength={1}
                              onChange={(e) =>
                                handleOtpChange(
                                  e.target.value,
                                  index
                                )
                              }
                              onKeyDown={(e) =>
                                handleOtpKeyDown(e, index)
                              }
                              className="h-12 text-center text-lg font-bold rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={timer > 0}
                          onClick={resendOtpHandler}
                          className="mt-3 text-sm font-medium text-pink-600 hover:text-pink-500 disabled:text-gray-400"
                        >
                          {timer > 0
                            ? `Resend OTP in ${timer}s`
                            : "Resend OTP"}
                        </button>
                      </div>

                      {/* PASSWORD */}
                      <div className="space-y-2">

                        <Label className="text-gray-700">
                          Create Password
                        </Label>

                        <div className="relative">

                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                          <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            placeholder="Create strong password"
                            className="h-12 pl-11 pr-11 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                          />

                          {showPassword ? (
                            <EyeOff
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer"
                              onClick={() =>
                                setShowPassword(false)
                              }
                            />
                          ) : (
                            <Eye
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer"
                              onClick={() =>
                                setShowPassword(true)
                              }
                            />
                          )}
                        </div>

                        {/* PASSWORD STRENGTH */}
                        {formData.password && (
                          <div className="mt-2">

                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">

                              <div
                                className={`${strength.color} h-2 rounded-full transition-all duration-500`}
                                style={{
                                  width: `${strength.percent}%`,
                                }}
                              />
                            </div>

                            <div className="flex justify-between mt-1">

                              <p className="text-xs text-gray-500">
                                Password Strength
                              </p>

                              <p className="text-xs font-semibold text-gray-700">
                                {strength.label}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* REGISTER BUTTON */}
                      <Button
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold shadow-lg"
                      >
                        {loading ? (
                          <>
                            <TimerReset className="w-4 h-4 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </form>

                {/* FOOTER */}
                <div className="mt-8">

                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex-1 h-px bg-gray-200"></div>

                    <span className="text-xs text-gray-400">
                      OR
                    </span>

                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <p className="text-sm text-center text-gray-500">

                    Already have an account?{" "}

                    <Link
                      to="/login"
                      className="font-semibold text-pink-600 hover:text-pink-500"
                    >
                      Login
                    </Link>
                  </p>

                  <div className="mt-5 text-center">

                    <Link
                      to="/"
                      className="text-sm text-gray-500 hover:text-pink-600 transition"
                    >
                      ← Back to Home
                    </Link>
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;