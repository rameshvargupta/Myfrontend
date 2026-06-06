import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import {
    FileText,
    Shield,
    Truck,
    RotateCcw,
    CreditCard,
    AlertCircle,
    CheckCircle,
    Phone,
    MapPin,
    Mail,
    Clock,
    Scale,
    ShoppingBag,
    Package,
    DollarSign,
    Lock,
    Globe,
    UserCheck,
    BookOpen,
    ArrowRight,
    Info,
    Building,
    Smartphone,Eye,
    MessageCircle
} from "lucide-react";

const TermsAndConditions = () => {
    const [lastUpdated] = useState("January 15, 2024");
    const [effectiveDate] = useState("January 1, 2024");

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <FileText size={16} />
                            <span className="text-sm font-medium">Updated {lastUpdated}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
                        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                            Please read these terms carefully before using our services
                        </p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">

                    {/* Quick Navigation */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 sticky top-4 z-10">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <BookOpen size={18} className="text-gray-600" />
                            Quick Navigation
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {["Shop Info", "Order Policy", "Delivery", "Return", "Payment", "Contact", "FAQs"].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full transition"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 md:px-8 py-6">
                            <div className="flex items-center gap-3 text-white">
                                <Scale size={28} />
                                <div>
                                    <h2 className="text-xl font-semibold">Legal Agreement</h2>
                                    <p className="text-sm opacity-90">Effective Date: {effectiveDate}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">

                            {/* Introduction Banner */}
                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-700">Welcome to Ecart</p>
                                        <p className="text-sm text-blue-600 mt-1">
                                            By accessing or using our website, you agree to be bound by these
                                            Terms & Conditions. If you disagree with any part, please do not use our services.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 1 - Shop Information */}
                            <div id="shop-info" className="scroll-mt-24">
                                <Section
                                    title="1. Shop Information"
                                    icon={Building}
                                    gradient="from-indigo-500 to-purple-600"
                                >
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <InfoCard icon={ShoppingBag} label="Shop Name" value="Ecart" />
                                        <InfoCard icon={MapPin} label="Address" value="123 Business Avenue, Mumbai - 400001" />
                                        <InfoCard icon={Phone} label="Phone Number" value="+91 75230 62030" />
                                        <InfoCard icon={Mail} label="Email" value="support@ecart.com" />
                                        <InfoCard icon={Clock} label="Business Hours" value="Mon-Sat: 9AM - 8PM" />
                                        <InfoCard icon={Globe} label="Website" value="www.ecart.com" />
                                    </div>
                                </Section>
                            </div>

                            {/* Section 2 - Order Policy */}
                            <div id="order-policy" className="scroll-mt-24">
                                <Section
                                    title="2. Order Policy"
                                    icon={ShoppingBag}
                                    gradient="from-blue-500 to-cyan-600"
                                >
                                    <div className="space-y-4">
                                        <p className="text-gray-600">
                                            All orders placed on our platform are subject to availability and confirmation.
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                            <PolicyRule
                                                icon={CheckCircle}
                                                title="Order Confirmation"
                                                description="Orders are confirmed only after successful payment verification"
                                            />
                                            <PolicyRule
                                                icon={AlertCircle}
                                                title="Cancellation Rights"
                                                description="We reserve the right to cancel orders due to stock or pricing errors"
                                            />
                                            <PolicyRule
                                                icon={Clock}
                                                title="Processing Time"
                                                description="Orders are processed within 24-48 hours of confirmation"
                                            />
                                            <PolicyRule
                                                icon={Package}
                                                title="Order Modifications"
                                                description="Order changes are only allowed before processing begins"
                                            />
                                        </div>
                                    </div>
                                </Section>
                            </div>

                            {/* Section 3 - Delivery Policy */}
                            <div id="delivery" className="scroll-mt-24">
                                <Section
                                    title="3. Delivery Policy"
                                    icon={Truck}
                                    gradient="from-green-500 to-teal-600"
                                >
                                    <div className="space-y-4">
                                        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                                            <div className="flex items-center gap-3 mb-3">
                                                <PackageOpen size={24} className="text-green-500" />
                                                <h3 className="font-semibold text-green-700">Open Box Delivery</h3>
                                            </div>
                                            <p className="text-gray-600 mb-3">
                                                We provide Open Box Delivery to ensure transparency and customer satisfaction:
                                            </p>
                                            <ul className="space-y-2">
                                                <DeliveryItem text="Inspect the product at the time of delivery" />
                                                <DeliveryItem text="Check for any damage or defects" />
                                                <DeliveryItem text="Verify product matches your order" />
                                                <DeliveryItem text="Reject immediately if damaged or incorrect" />
                                            </ul>
                                        </div>

                                        <div className="grid sm:grid-cols-3 gap-4 mt-4">
                                            <TimelineCard
                                                title="Standard Delivery"
                                                timeframe="3-5 Business Days"
                                                location="Metro Cities"
                                            />
                                            <TimelineCard
                                                title="Standard Delivery"
                                                timeframe="5-7 Business Days"
                                                location="Tier 2 Cities"
                                            />
                                            <TimelineCard
                                                title="Standard Delivery"
                                                timeframe="7-10 Business Days"
                                                location="Remote Areas"
                                            />
                                        </div>
                                    </div>
                                </Section>
                            </div>

                            {/* Section 4 - Return Policy */}
                            <div id="return" className="scroll-mt-24">
                                <Section
                                    title="4. Return & Refund Policy"
                                    icon={RotateCcw}
                                    gradient="from-red-500 to-rose-600"
                                >
                                    <div className="space-y-4">
                                        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                                            <div className="flex items-center gap-3 mb-3">
                                                <XCircle size={24} className="text-red-500" />
                                                <h3 className="font-semibold text-red-700">No Return After Acceptance</h3>
                                            </div>
                                            <p className="text-gray-600">
                                                We do NOT offer returns or replacements after successful delivery.
                                                Customers must verify products during Open Box Delivery.
                                            </p>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                            <ReturnRule
                                                icon={Eye}
                                                title="Inspect Before Accepting"
                                                description="Check product thoroughly during delivery"
                                            />
                                            <ReturnRule
                                                icon={XCircle}
                                                title="No Post-Delivery Returns"
                                                description="Returns not accepted after delivery confirmation"
                                            />
                                            <ReturnRule
                                                icon={AlertCircle}
                                                title="Exceptions"
                                                description="Case-by-case review for genuine issues"
                                            />
                                            <ReturnRule
                                                icon={Clock}
                                                title="Report Timeline"
                                                description="Issues must be reported within 24 hours"
                                            />
                                        </div>
                                    </div>
                                </Section>
                            </div>

                            {/* Section 5 - Payment Terms */}
                            <div id="payment" className="scroll-mt-24">
                                <Section
                                    title="5. Payment Terms"
                                    icon={CreditCard}
                                    gradient="from-purple-500 to-pink-600"
                                >
                                    <div className="space-y-4">
                                        <p className="text-gray-600">
                                            We accept various secure payment methods to ensure safe transactions:
                                        </p>
                                        <div className="grid sm:grid-cols-3 gap-4 mt-4">
                                            <PaymentMethod icon={CreditCard} title="Credit/Debit Cards" description="Visa, Mastercard, RuPay" />
                                            <PaymentMethod icon={Smartphone} title="UPI" description="Google Pay, PhonePe, Paytm" />
                                            <PaymentMethod icon={DollarSign} title="Net Banking" description="All major banks" />
                                            <PaymentMethod icon={Lock} title="COD" description="Cash on Delivery (selected areas)" />
                                            <PaymentMethod icon={CheckCircle} title="EMI" description="No cost EMI available" />
                                            <PaymentMethod icon={Shield} title="Secure" description="256-bit SSL encryption" />
                                        </div>

                                        <div className="bg-yellow-50 rounded-lg p-3 mt-4">
                                            <p className="text-xs text-yellow-700 flex items-center gap-2">
                                                <Info size={14} />
                                                All transactions are processed securely. Your payment information is never stored with us.
                                            </p>
                                        </div>
                                    </div>
                                </Section>
                            </div>

                            {/* Section 6 - User Accounts */}
                            <div className="scroll-mt-24">
                                <Section
                                    title="6. User Accounts"
                                    icon={UserCheck}
                                    gradient="from-cyan-500 to-blue-600"
                                >
                                    <div className="space-y-3">
                                        <UserRule text="You must be 18 years or older to create an account" />
                                        <UserRule text="Provide accurate and complete information" />
                                        <UserRule text="Maintain the security of your account credentials" />
                                        <UserRule text="Notify us immediately of any unauthorized use" />
                                        <UserRule text="We reserve the right to suspend or terminate accounts" />
                                    </div>
                                </Section>
                            </div>

                            {/* Section 7 - Privacy & Data */}
                            <div className="scroll-mt-24">
                                <Section
                                    title="7. Privacy & Data Protection"
                                    icon={Lock}
                                    gradient="from-teal-500 to-green-600"
                                >
                                    <div className="space-y-3">
                                        <p className="text-gray-600">
                                            We are committed to protecting your privacy. Your personal information is:
                                        </p>
                                        <ul className="space-y-2 mt-3">
                                            <PrivacyItem text="Never sold or shared with third parties" />
                                            <PrivacyItem text="Used only for order processing and delivery" />
                                            <PrivacyItem text="Protected with industry-standard security" />
                                            <PrivacyItem text="Stored in compliance with data protection laws" />
                                        </ul>
                                        <div className="bg-blue-50 rounded-lg p-3 mt-3">
                                            <p className="text-xs text-blue-700">
                                                For more details, please review our <a href="/privacy-policy" className="underline font-semibold">Privacy Policy</a>
                                            </p>
                                        </div>
                                    </div>
                                </Section>
                            </div>

                            {/* Section 8 - Changes to Terms */}
                            <div className="scroll-mt-24">
                                <Section
                                    title="8. Changes to Terms"
                                    icon={FileText}
                                    gradient="from-gray-500 to-gray-600"
                                >
                                    <div className="space-y-3">
                                        <p className="text-gray-600">
                                            We reserve the right to modify these terms at any time:
                                        </p>
                                        <ul className="list-disc pl-5 text-gray-600 space-y-1">
                                            <li>Changes are effective immediately upon posting</li>
                                            <li>Continued use of the site constitutes acceptance</li>
                                            <li>Material changes will be notified via email</li>
                                            <li>Last updated date will be revised accordingly</li>
                                        </ul>
                                    </div>
                                </Section>
                            </div>

                            {/* Section 9 - FAQs */}
                            <div id="faqs" className="scroll-mt-24">
                                <Section
                                    title="9. Frequently Asked Questions"
                                    icon={MessageCircle}
                                    gradient="from-orange-500 to-red-600"
                                >
                                    <div className="space-y-4">
                                        <FAQ
                                            question="Can I cancel my order after placement?"
                                            answer="Orders can be cancelled within 1 hour of placement before processing begins. Contact support immediately."
                                        />
                                        <FAQ
                                            question="What happens if I miss my delivery?"
                                            answer="Delivery attempts will be made twice. After that, the order will be cancelled and refunded."
                                        />
                                        <FAQ
                                            question="Is COD available everywhere?"
                                            answer="COD is available in select pin codes. Check availability at checkout."
                                        />
                                        <FAQ
                                            question="How do I track my order?"
                                            answer="Track your order from 'My Orders' section or via the tracking link sent to your email/SMS."
                                        />
                                        <FAQ
                                            question="What if I receive a defective product?"
                                            answer="Reject during Open Box Delivery. If accepted by mistake, contact support within 24 hours."
                                        />
                                        <FAQ
                                            question="Are there any hidden charges?"
                                            answer="No hidden charges. The price shown is the final price including taxes."
                                        />
                                    </div>
                                </Section>
                            </div>

                            {/* Section 10 - Contact */}
                            <div id="contact" className="scroll-mt-24">
                                <Section
                                    title="10. Contact Us"
                                    icon={Phone}
                                    gradient="from-gray-700 to-gray-900"
                                >
                                    <div className="space-y-4">
                                        <p className="text-gray-600">For questions or concerns about these Terms & Conditions:</p>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <ContactCard icon={Phone} label="Customer Support" value="+91 75230 62030" />
                                            <ContactCard icon={Mail} label="Legal Department" value="legal@ecart.com" />
                                            <ContactCard icon={MapPin} label="Registered Address" value="123 Business Avenue, Mumbai - 400001" />
                                            <ContactCard icon={Clock} label="Support Hours" value="Mon-Fri: 9AM - 8PM" />
                                        </div>
                                    </div>
                                </Section>
                            </div>

                            {/* Footer Note */}
                            <div className="border-t pt-6 mt-6 text-center">
                                <p className="text-xs text-gray-400">
                                    By using our website, you acknowledge that you have read, understood, and agree to these Terms & Conditions.
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    © {new Date().getFullYear()} Ecart. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                        <TrustBadge icon={Shield} text="Secure Payments" />
                        <TrustBadge icon={Truck} text="Fast Delivery" />
                        <TrustBadge icon={RotateCcw} text="Open Box Delivery" />
                        <TrustBadge icon={Lock} text="Data Protected" />
                        <TrustBadge icon={CheckCircle} text="Verified Shop" />
                    </div>
                </div>
            </div>
            <FooterNavbar />
        </>
    );
};

// Section Component
const Section = ({ title, icon: Icon, gradient, children }) => (
    <div className="border rounded-xl overflow-hidden shadow-sm">
        <div className={`bg-gradient-to-r ${gradient} px-6 py-4`}>
            <div className="flex items-center gap-2">
                {Icon && <Icon size={20} className="text-white" />}
                <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// Info Card
const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <Icon size={18} className="text-indigo-600" />
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value}</p>
        </div>
    </div>
);

// Policy Rule
const PolicyRule = ({ icon: Icon, title, description }) => (
    <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
            <Icon size={14} className="text-blue-600" />
            <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <p className="text-xs text-gray-600">{description}</p>
    </div>
);

// Delivery Item
const DeliveryItem = ({ text }) => (
    <li className="flex items-center gap-2 text-sm text-gray-600">
        <CheckCircle size={14} className="text-green-500" />
        {text}
    </li>
);

// Timeline Card
const TimelineCard = ({ title, timeframe, location }) => (
    <div className="bg-green-50 rounded-lg p-3 text-center">
        <h4 className="font-semibold text-sm text-green-700">{title}</h4>
        <p className="text-xs text-green-600 mt-1">{timeframe}</p>
        <p className="text-xs text-green-500 mt-1">{location}</p>
    </div>
);

// Return Rule
const ReturnRule = ({ icon: Icon, title, description }) => (
    <div className="bg-red-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
            <Icon size={14} className="text-red-600" />
            <h4 className="font-semibold text-sm text-red-700">{title}</h4>
        </div>
        <p className="text-xs text-red-600">{description}</p>
    </div>
);

// Payment Method
const PaymentMethod = ({ icon: Icon, title, description }) => (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
        <Icon size={20} className="mx-auto mb-1 text-gray-600" />
        <h4 className="font-semibold text-xs">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
);

// User Rule
const UserRule = ({ text }) => (
    <div className="flex items-center gap-2 p-2 bg-cyan-50 rounded-lg">
        <CheckCircle size={14} className="text-cyan-600" />
        <span className="text-sm text-cyan-700">{text}</span>
    </div>
);

// Privacy Item
const PrivacyItem = ({ text }) => (
    <li className="flex items-center gap-2 text-sm text-gray-600">
        <Lock size={14} className="text-green-600" />
        {text}
    </li>
);

// FAQ Component
const FAQ = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition"
            >
                <span className="font-medium text-gray-800">{question}</span>
                <ArrowRight size={16} className={`transform transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600">{answer}</p>
                </div>
            )}
        </div>
    );
};

// Contact Card
const ContactCard = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="p-2 bg-gray-200 rounded-lg">
            <Icon size={16} className="text-gray-600" />
        </div>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value}</p>
        </div>
    </div>
);

// Trust Badge
const TrustBadge = ({ icon: Icon, text }) => (
    <div className="bg-white rounded-xl p-3 text-center shadow-md">
        <Icon size={20} className="text-gray-600 mx-auto mb-1" />
        <p className="text-xs font-medium text-gray-600">{text}</p>
    </div>
);

// PackageOpen Icon (custom since not imported)
const PackageOpen = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 9.5v5a2 2 0 0 1-1 1.73l-6 3.27a2 2 0 0 1-2 0l-6-3.27a2 2 0 0 1-1-1.73v-5M4 4l8 4 8-4" />
        <path d="M12 12v8" />
        <path d="M8 7v8" />
        <path d="M16 7v8" />
    </svg>
);

// XCircle Icon (custom since not imported)
const XCircle = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

export default TermsAndConditions;