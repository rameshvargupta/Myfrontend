import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1=email, 2=otp+password
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /* ================= SEND OTP ================= */
    const sendOtp = async () => {
        if (!formData.email) {
            return toast.error("Email required");
        }

        try {
            setLoading(true);

            const res = await fetch(
                "http://localhost:5000/api/v1/user/forgot-password-otp",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email }),
                }
            );

            const data = await res.json();

            if (!res.ok) return toast.error(data.message);

            toast.success("OTP sent to email");
            setStep(2); // 👉 show OTP + password fields

        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    /* ================= RESET PASSWORD ================= */
    const resetPassword = async () => {
        const { otp, newPassword, confirmPassword, email } = formData;

        if (!otp || !newPassword || !confirmPassword) {
            return toast.error("All fields required");
        }

        if (newPassword !== confirmPassword) {
            return toast.error("Passwords does not match");
        }

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
                "http://localhost:5000/api/v1/user/reset-password-otp",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        otp,
                        newPassword
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) return toast.error(data.message);

            toast.success("Password updated successfully");

            // reset form
            setFormData({
                email: "",
                otp: "",
                newPassword: "",
                confirmPassword: ""
            });
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
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

                    {/* SEND OTP BUTTON */}
                    {step === 1 && (
                        <Button className="cursor-pointer bg-pink-600 hover:bg-pink-500" onClick={sendOtp} disabled={loading}>
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </Button>
                    )}

                    {/* OTP + PASSWORD */}
                    {step === 2 && (
                        <>
                            <div className="grid gap-2">
                                <Label>OTP</Label>
                                <Input
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
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
                            <Button className="cursor-pointer bg-pink-600 hover:bg-pink-500" onClick={resetPassword} disabled={loading}>
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
