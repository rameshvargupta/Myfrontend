import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
/* ================= PASSWORD STRENGTH ================= */
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) return { color: "bg-red-500", percent: 30 };
  if (score <= 4) return { color: "bg-yellow-500", percent: 65 };
  return { color: "bg-green-500", percent: 100 };
};

const ForgotPassword = () => {
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // OTP only numeric & max 6 digits
    if (name === "otp") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 6) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!formData.email) return toast.error("Email required");

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/v1/user/forgot-password-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("OTP sent to email");
      setStep(2);
      setTimer(30);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const resendOtpHandler = async () => {
    if (timer > 0) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/v1/user/forgot-password-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("OTP resent successfully");
      setTimer(30);
    } catch {
      toast.error("Resend OTP failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const resetPassword = async () => {
    const { email, otp, newPassword, confirmPassword } = formData;

    if (!otp || otp.length !== 6)
      return toast.error("Enter valid 6-digit OTP");

    if (!newPassword || !confirmPassword)
      return toast.error("All fields required");

    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(newPassword))
      return toast.error(
        "Password must include uppercase, lowercase, number & special character"
      );

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/v1/user/reset-password-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Password updated successfully");
      navigate("/login");
    } catch {
      toast.error("Password update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* EMAIL */}
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={step === 2}
            />
          </div>

          {/* SEND OTP */}
          {step === 1 && (
            <Button onClick={sendOtp} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          )}

          {/* OTP + PASSWORD */}
          {step === 2 && (
            <>
              {/* OTP */}
              <div className="grid gap-2">
                <Label>OTP</Label>
                <Input
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                />
              </div>

              <Button
                variant="ghost"
                onClick={resendOtpHandler}
                disabled={timer > 0 || loading}
                className="text-pink-600"
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
              </Button>

              {/* NEW PASSWORD */}
              <div className="grid gap-2 relative">
                <Label>New Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                {formData.newPassword && (
                  <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className={`h-2 ${strength.color} transition-all`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="grid gap-2 relative">
                <Label>Confirm Password</Label>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <Button onClick={resetPassword} disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
