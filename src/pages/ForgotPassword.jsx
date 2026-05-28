import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  Lock,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ShoppingBag,
  TimerReset,
} from "lucide-react";

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

  if (score <= 2)
    return {
      label: "Weak",
      color: "bg-red-500",
      percent: 30,
    };

  if (score <= 4)
    return {
      label: "Medium",
      color: "bg-yellow-500",
      percent: 65,
    };

  return {
    label: "Strong",
    color: "bg-green-500",
    percent: 100,
  };
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [otpBoxes, setOtpBoxes] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const otpRefs = useRef([]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const strength = getPasswordStrength(formData.newPassword);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!formData.email)
      return toast.error("Email required");

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/v1/user/forgot-password-otp`,
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

      if (!res.ok)
        return toast.error(data.message);

      toast.success("OTP sent to your email 📩");

      setStep(2);
      setTimer(30);

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const resendOtpHandler = async () => {
    if (timer > 0) return;

    setOtpBoxes(["", "", "", "", "", ""]);

    setFormData((prev) => ({
      ...prev,
      otp: "",
    }));

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/v1/user/forgot-password-otp`,
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

      if (!res.ok)
        return toast.error(data.message);

      toast.success("OTP resent successfully 🔁");

      setTimer(30);
    } catch {
      toast.error("Resend OTP failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const resetPassword = async () => {
    const {
      email,
      otp,
      newPassword,
      confirmPassword,
    } = formData;

    if (!otp || otp.length !== 6) {
      return toast.error("Enter valid 6-digit OTP");
    }

    if (!newPassword || !confirmPassword) {
      return toast.error("All fields are required");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return toast.error("Password must include uppercase, lowercase, number & special character");
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/v1/user/reset-password-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok)
        return toast.error(data.message);

      toast.success("Password updated successfully 🎉");

      navigate("/login");
    } catch {
      toast.error("Password update failed");
    } finally {
      setLoading(false);
    }
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

  const handleOtpKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otpBoxes[index] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fafafa] flex items-center justify-center px-4 py-8">

      {/* BG EFFECTS */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl"></div>

      {/* MAIN GRID */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">

        {/* LEFT SIDE - INFO SECTION */}
        <div className="hidden lg:block">

          {/* LOGO */}
          <div className="inline-flex items-center gap-3 bg-white border border-pink-100 shadow-sm px-5 py-3 rounded-2xl">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">GT_Shop</h2>
              <p className="text-xs text-gray-500">Premium Shopping Platform</p>
            </div>
          </div>

          {/* TEXT */}
          <div className="mt-10">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
              <KeyRound className="w-4 h-4" />
              Reset Your Password
            </div>

            <h1 className="text-5xl font-black leading-tight text-gray-900 mt-6">
              Recover Your{" "}
              <span className="bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
                Account Access
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600 max-w-xl">
              Don't worry! Resetting your password is easy. Just verify your email and create a strong new password to secure your account.
            </p>

            {/* FEATURES */}
            <div className="mt-10 space-y-4">
              <div className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Secure OTP Verification</h3>
                  <p className="text-sm text-gray-500 mt-1">Email-based verification for maximum security.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Strong Password Protection</h3>
                  <p className="text-sm text-gray-500 mt-1">Create a robust password with our strength checker.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Instant Access Restored</h3>
                  <p className="text-sm text-gray-500 mt-1">Get back to shopping with your new password immediately.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM SECTION */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="border-0 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
              <CardContent className="p-8">

                {/* MOBILE LOGO */}
                <div className="lg:hidden flex justify-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-lg">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-gray-900">GT_Shop</h2>
                      <p className="text-xs text-gray-500">Shopping Platform</p>
                    </div>
                  </div>
                </div>

                {/* HEADER */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <KeyRound className="w-4 h-4" />
                    {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {step === 1 ? "Forgot Password?" : "Reset Password"}
                  </h2>
                  <p className="text-gray-500 mt-2">
                    {step === 1 
                      ? "Enter your email to receive a verification code" 
                      : "Create a strong new password for your account"}
                  </p>
                </div>

                {/* FORM */}
                <div className="space-y-5">
                  {/* EMAIL */}
                  <div className="space-y-2">
                    <Label className="text-gray-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={step === 2}
                        placeholder="Enter your email"
                        className="h-12 pl-11 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* STEP 1 - SEND OTP BUTTON */}
                  {step === 1 && (
                    <Button
                      onClick={sendOtp}
                      disabled={loading}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold shadow-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send Verification Code"
                      )}
                    </Button>
                  )}

                  {/* STEP 2 - OTP AND PASSWORD */}
                  {step === 2 && (
                    <>
                      {/* OTP SECTION */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700">Verification Code</Label>
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Code Sent
                          </div>
                        </div>

                        <div className="flex justify-between gap-2">
                          {otpBoxes.map((digit, index) => (
                            <Input
                              key={index}
                              ref={(el) => (otpRefs.current[index] = el)}
                              value={digit}
                              maxLength={1}
                              onChange={(e) => handleOtpChange(e.target.value, index)}
                              onKeyDown={(e) => handleOtpKeyDown(e, index)}
                              className="h-12 text-center text-lg font-bold rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500 bg-white"
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={timer > 0}
                          onClick={resendOtpHandler}
                          className="mt-2 text-sm font-medium text-pink-600 hover:text-pink-500 disabled:text-gray-400"
                        >
                          {timer > 0 ? `Resend code in ${timer}s` : "Resend Code"}
                        </button>
                      </div>

                      {/* NEW PASSWORD */}
                      <div className="space-y-2">
                        <Label className="text-gray-700">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Create new password"
                            autoComplete="new-password"
                            className="h-12 pl-11 pr-11 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500 bg-white"
                          />
                          {showPassword ? (
                            <EyeOff
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer"
                              onClick={() => setShowPassword(false)}
                            />
                          ) : (
                            <Eye
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer"
                              onClick={() => setShowPassword(true)}
                            />
                          )}
                        </div>

                        {/* PASSWORD STRENGTH */}
                        {formData.newPassword && (
                          <div className="mt-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`${strength.color} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${strength.percent}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-gray-500">Password Strength</p>
                              <p className="text-xs font-semibold text-gray-700">{strength.label}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CONFIRM PASSWORD */}
                      <div className="space-y-2">
                        <Label className="text-gray-700">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className="h-12 pl-11 pr-11 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500 bg-white"
                          />
                          {showConfirmPassword ? (
                            <EyeOff
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer"
                              onClick={() => setShowConfirmPassword(false)}
                            />
                          ) : (
                            <Eye
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer"
                              onClick={() => setShowConfirmPassword(true)}
                            />
                          )}
                        </div>
                      </div>

                      {/* RESET BUTTON */}
                      <Button
                        onClick={resetPassword}
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold shadow-lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {/* FOOTER */}
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400">OR</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <p className="text-sm text-center text-gray-500">
                    Remember your password?{" "}
                    <Link to="/login" className="font-semibold text-pink-600 hover:text-pink-500">
                      Back to Login
                    </Link>
                  </p>

                  <div className="mt-5 text-center">
                    <Link to="/" className="text-sm text-gray-500 hover:text-pink-600 transition">
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

export default ForgotPassword;