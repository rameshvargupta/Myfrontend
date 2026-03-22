import React, { useState } from "react";
import axios from "axios";

const ContactUs = () => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // 👉 Backend API call
            const { data } = await axios.post("/api/contact", formData);

            setSuccess("Your message has been sent successfully!");
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: ""
            });

        } catch (error) {
            console.log(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">

            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">

                {/* LEFT INFO SECTION */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-8 shadow-lg flex flex-col justify-between">

                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-4">
                            Contact Us
                        </h1>

                        <p className="text-sm md:text-base opacity-90 mb-6">
                            Have any issue or question? Fill the form and our team will help you as soon as possible.
                        </p>

                        <div className="space-y-4 text-sm">

                            <div>
                                <p className="font-semibold">📍 Address</p>
                                <p>Jungal Gulariha</p>
                            </div>

                            <div>
                                <p className="font-semibold">📞 Phone</p>
                                <p>7523062030</p>
                            </div>

                            <div>
                                <p className="font-semibold">⏰ Support Time</p>
                                <p>10 AM - 7 PM (Mon - Sat)</p>
                            </div>

                        </div>
                    </div>

                    <div className="text-xs opacity-80 mt-6">
                        We usually respond within 24 hours.
                    </div>
                </div>

                {/* RIGHT FORM SECTION */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">

                    <h2 className="text-xl font-semibold mb-6 text-gray-800">
                        Send Message
                    </h2>

                    {success && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name */}
                        <div>
                            <label className="text-sm text-gray-600">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter your name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm text-gray-600">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-sm text-gray-600">Mobile Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter mobile number"
                            />
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="text-sm text-gray-600">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter subject"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="text-sm text-gray-600">Message</label>
                            <textarea
                                name="message"
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe your issue..."
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
                        >
                            {loading ? "Sending..." : "Send Message"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;