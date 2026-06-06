import React, { useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    CheckCircle,
    AlertCircle,
    Navigation,
    MessageCircle,
    Headphones,
    Globe,
    Award
} from "lucide-react";

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
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear messages on new input
        if (success) setSuccess("");
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phone || !formData.message) {
            setError("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // 👉 Backend API call
            // const { data } = await axios.post("/api/contact", formData);

            // Simulate API call for demo
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess("Your message has been sent successfully! We'll get back to you within 24 hours.");
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: ""
            });

            // Auto clear success message after 5 seconds
            setTimeout(() => setSuccess(""), 5000);

        } catch (error) {
            console.log(error);
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Business hours
    const businessHours = [
        { day: "Monday - Friday", hours: "9:00 AM - 8:00 PM" },
        { day: "Saturday", hours: "10:00 AM - 6:00 PM" },
        { day: "Sunday", hours: "Closed" }
    ];

    // Contact info
    const contactInfo = [
        { icon: MapPin, title: "Visit Us", details: ["123 Business Avenue", "Tech Park, Mumbai - 400001", "Maharashtra, India"] },
        { icon: Phone, title: "Call Us", details: ["+91 75230 62030", "+91 98765 43210"] },
        { icon: Mail, title: "Email Us", details: ["support@ecart.com", "sales@ecart.com"] },
        { icon: Clock, title: "Support Hours", details: ["Mon-Fri: 9AM - 8PM", "Sat: 10AM - 6PM", "Sun: Closed"] }
    ];

    // Social media links
    const socialLinks = [
        { icon: Facebook, name: "Facebook", color: "bg-blue-600", link: "#" },
        { icon: Twitter, name: "Twitter", color: "bg-sky-500", link: "#" },
        { icon: Instagram, name: "Instagram", color: "bg-pink-600", link: "#" },
        { icon: Linkedin, name: "LinkedIn", color: "bg-blue-700", link: "#" },
        { icon: Youtube, name: "YouTube", color: "bg-red-600", link: "#" }
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">Get In Touch</h1>
                        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                            Have questions? We're here to help. Reach out to us anytime.
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <div className="w-12 h-0.5 bg-white/50"></div>
                            <MessageCircle size={20} />
                            <div className="w-12 h-0.5 bg-white/50"></div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">

                    {/* Stats Section */}
                    <div className="grid grid-cols-4 md:grid-cols-4 gap-4 mb-12">
                        <div className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition">
                            <Headphones className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                            <h3 className="text-xl font-bold text-gray-800">24/7</h3>
                            <p className="text-xs text-gray-500">Support Available</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition">
                            <Award className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                            <h3 className="text-xl font-bold text-gray-800">99%</h3>
                            <p className="text-xs text-gray-500">Satisfaction Rate</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition">
                            <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                            <h3 className="text-xl font-bold text-gray-800">&lt;24h</h3>
                            <p className="text-xs text-gray-500">Response Time</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition">
                            <Globe className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                            <h3 className="text-xl font-bold text-gray-800">50K+</h3>
                            <p className="text-xs text-gray-500">Happy Customers</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">

                        {/* LEFT SIDE - Contact Info & Map */}
                        <div className="space-y-6">

                            {/* Contact Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {contactInfo.map((item, index) => (
                                    <div key={index} className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all group">
                                        <div className="flex items-start gap-3">
                                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                                                <item.icon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                                                {item.details.map((detail, idx) => (
                                                    <p key={idx} className="text-sm text-gray-500">{detail}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Business Hours */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock size={20} className="text-indigo-600" />
                                    Business Hours
                                </h3>
                                <div className="space-y-2">
                                    {businessHours.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-sm text-gray-600">{item.day}</span>
                                            <span className={`text-sm font-medium ${item.hours === "Closed" ? "text-red-500" : "text-green-600"}`}>
                                                {item.hours}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Google Map */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="text-indigo-600" />
                                    Our Location
                                </h3>
                                <div className="rounded-xl overflow-hidden h-64">
                                    <iframe
                                        title="Store Location"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241316.64333286168!2d72.74110135781393!3d19.082522317946972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="rounded-lg"
                                    ></iframe>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                    <span>📍 123 Business Avenue, Mumbai</span>
                                    <a href="#" className="text-indigo-600 hover:underline flex items-center gap-1">
                                        <Navigation size={12} /> Get Directions
                                    </a>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="font-semibold text-gray-800 mb-4">Connect With Us</h3>
                                <div className="flex gap-3">
                                    {socialLinks.map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.link}
                                            className={`${social.color} p-2 rounded-lg text-white hover:scale-110 transition-transform`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <social.icon size={18} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE - Contact Form */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5">
                                <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                                    <Send size={20} />
                                    Send us a Message
                                </h2>
                                <p className="text-white/80 text-sm mt-1">
                                    Fill out the form and we'll get back to you within 24 hours
                                </p>
                            </div>

                            <div className="p-6 md:p-8">
                                {/* Success Message */}
                                {success && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
                                        <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-green-700 text-sm font-medium">Success!</p>
                                            <p className="text-green-600 text-xs mt-1">{success}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-red-700 text-sm font-medium">Error!</p>
                                            <p className="text-red-600 text-xs mt-1">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Name and Email - 2 columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1.5">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1.5">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone and Subject - 2 columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1.5">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1.5">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                                placeholder="Order inquiry, Support, etc."
                                            />
                                        </div>
                                    </div>

                                    {/* Message - Full width */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1.5">
                                            Message <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                                            placeholder="Please describe your issue or question in detail..."
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            We aim to respond within 24 hours
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Message
                                            </>
                                        )}
                                    </button>

                                    {/* Trust Badge */}
                                    <div className="text-center pt-4">
                                        <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                                            <CheckCircle size={12} />
                                            Your information is secure with us
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-10 mb-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
                            <p className="text-gray-500 mt-2">Find quick answers to common questions</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
                                <h3 className="font-semibold text-gray-800 mb-2">How long does it take to get a response?</h3>
                                <p className="text-sm text-gray-600">We typically respond within 24 hours during business days.</p>
                            </div>
                            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
                                <h3 className="font-semibold text-gray-800 mb-2">Can I track my order status?</h3>
                                <p className="text-sm text-gray-600">Yes, you can track your order from your account dashboard.</p>
                            </div>
                            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
                                <h3 className="font-semibold text-gray-800 mb-2">Do you offer international shipping?</h3>
                                <p className="text-sm text-gray-600">Currently we ship within India only.</p>
                            </div>
                            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
                                <h3 className="font-semibold text-gray-800 mb-2">How can I return a product?</h3>
                                <p className="text-sm text-gray-600">Visit our Returns page or contact support for assistance.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterNavbar />
        </>
    );
};

export default ContactUs;