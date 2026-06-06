import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Cookie,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  AlertTriangle,
  Globe,
  Server,
  CreditCard,
  Smartphone,
  Clock
} from "lucide-react";

const PrivacyPolicy = () => {
  const [lastUpdated] = useState("January 15, 2024");
  const [effectiveDate] = useState("January 1, 2024");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mb-10">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Shield size={16} />
              <span className="text-sm font-medium">Updated {lastUpdated}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Your privacy matters to us. Learn how we collect, use, and protect your information.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          
          {/* Quick Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 sticky top-4 z-10">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              Quick Navigation
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Information Collection", "Usage", "Data Protection", "Cookies", "Your Rights", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 rounded-full transition"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 md:px-8 py-6">
              <div className="flex items-center gap-3 text-white">
                <Shield size={28} />
                <div>
                  <h2 className="text-xl font-semibold">Privacy Commitment</h2>
                  <p className="text-sm opacity-90">Effective Date: {effectiveDate}</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              
              {/* Introduction */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      At <span className="font-semibold">Ecart</span>, we value your privacy and are committed to 
                      protecting your personal information. This Privacy Policy explains how we collect, use, 
                      disclose, and safeguard your information when you use our services.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1 - Information Collection */}
              <div id="information-collection" className="scroll-mt-24">
                <Section 
                  title="1. Information We Collect" 
                  icon={Database}
                  gradient="from-blue-500 to-cyan-600"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">We collect several types of information to provide and improve our services:</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <InfoCard 
                        icon={UserCheck}
                        title="Personal Information"
                        items={["Full name", "Email address", "Phone number", "Date of birth"]}
                        color="blue"
                      />
                      <InfoCard 
                        icon={MapPin}
                        title="Address Information"
                        items={["Shipping address", "Billing address", "Postal code", "City/State"]}
                        color="green"
                      />
                      <InfoCard 
                        icon={CreditCard}
                        title="Payment Information"
                        items={["Payment method details", "Transaction history", "Billing information"]}
                        color="purple"
                      />
                      <InfoCard 
                        icon={Smartphone}
                        title="Technical Information"
                        items={["IP address", "Browser type", "Device information", "Cookies"]}
                        color="orange"
                      />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 2 - How We Use Information */}
              <div id="usage" className="scroll-mt-24">
                <Section 
                  title="2. How We Use Your Information" 
                  icon={Eye}
                  gradient="from-green-500 to-teal-600"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">We use the collected information for various purposes:</p>
                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      <UseCaseItem text="Process and deliver your orders" />
                      <UseCaseItem text="Manage your account and preferences" />
                      <UseCaseItem text="Communicate about orders and updates" />
                      <UseCaseItem text="Improve our products and services" />
                      <UseCaseItem text="Detect and prevent fraud" />
                      <UseCaseItem text="Personalize your shopping experience" />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 3 - Data Protection */}
              <div id="data-protection" className="scroll-mt-24">
                <Section 
                  title="3. Data Protection & Security" 
                  icon={Lock}
                  gradient="from-red-500 to-pink-600"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      We implement robust security measures to protect your personal information:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <SecurityItem icon={Lock} text="SSL Encryption for data transmission" />
                      <SecurityItem icon={Server} text="Secure servers with firewalls" />
                      <SecurityItem icon={Clock} text="Regular security audits" />
                      <SecurityItem icon={CheckCircle} text="PCI compliance for payments" />
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 mt-4">
                      <p className="text-xs text-yellow-700 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        While we strive to protect your data, no method of transmission over the internet is 100% secure.
                      </p>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 4 - Cookies */}
              <div id="cookies" className="scroll-mt-24">
                <Section 
                  title="4. Cookies & Tracking Technologies" 
                  icon={Cookie}
                  gradient="from-yellow-500 to-orange-600"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      We use cookies and similar tracking technologies to enhance your browsing experience:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      <CookieItem type="Essential" description="Required for basic site functionality" />
                      <CookieItem type="Functional" description="Remember your preferences" />
                      <CookieItem type="Analytics" description="Help us improve our services" />
                      <CookieItem type="Marketing" description="Personalize advertisements" />
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      You can control cookie settings through your browser preferences.
                    </p>
                  </div>
                </Section>
              </div>

              {/* Section 5 - Your Rights */}
              <div id="your-rights" className="scroll-mt-24">
                <Section 
                  title="5. Your Privacy Rights" 
                  icon={UserCheck}
                  gradient="from-purple-500 to-pink-600"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">You have the following rights regarding your personal data:</p>
                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      <RightItem text="Access your personal information" />
                      <RightItem text="Correct inaccurate data" />
                      <RightItem text="Request deletion of your data" />
                      <RightItem text="Opt-out of marketing communications" />
                      <RightItem text="Data portability" />
                      <RightItem text="Withdraw consent" />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 6 - Third Party Sharing */}
              <div className="scroll-mt-24">
                <Section 
                  title="6. Third-Party Sharing" 
                  icon={Globe}
                  gradient="from-cyan-500 to-blue-600"
                >
                  <p className="text-gray-600">
                    We do not sell your personal information. We may share your data with:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600 mt-3 space-y-1">
                    <li>Service providers (payment processors, shipping partners)</li>
                    <li>Law enforcement when required by law</li>
                    <li>Business transfers (merger, acquisition)</li>
                  </ul>
                </Section>
              </div>

              {/* Section 7 - Children's Privacy */}
              <div className="scroll-mt-24">
                <Section 
                  title="7. Children's Privacy" 
                  icon={Shield}
                  gradient="from-teal-500 to-green-600"
                >
                  <p className="text-gray-600">
                    Our services are not directed to children under 13. We do not knowingly collect 
                    personal information from children. If you believe a child has provided us with 
                    personal information, please contact us.
                  </p>
                </Section>
              </div>

              {/* Section 8 - Changes to Policy */}
              <div className="scroll-mt-24">
                <Section 
                  title="8. Changes to This Policy" 
                  icon={FileText}
                  gradient="from-gray-500 to-gray-600"
                >
                  <p className="text-gray-600">
                    We may update this Privacy Policy from time to time. We will notify you of any 
                    changes by posting the new policy on this page and updating the "Last Updated" date.
                  </p>
                </Section>
              </div>

              {/* Section 9 - Contact Us */}
              <div id="contact" className="scroll-mt-24">
                <Section 
                  title="9. Contact Us" 
                  icon={Mail}
                  gradient="from-indigo-500 to-purple-600"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">If you have questions about this Privacy Policy, please contact us:</p>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <ContactCard icon={Mail} label="Email" value="privacy@ecart.com" />
                      <ContactCard icon={Phone} label="Phone" value="+91 75230 62030" />
                      <ContactCard icon={MapPin} label="Address" value="123 Business Avenue, Mumbai - 400001" />
                      <ContactCard icon={Clock} label="Support Hours" value="Mon-Fri: 9AM - 8PM" />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Footer Note */}
              <div className="border-t pt-6 mt-6 text-center">
                <p className="text-xs text-gray-400">
                  By using our website, you consent to this Privacy Policy.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  © {new Date().getFullYear()} Ecart. All rights reserved.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <TrustBadge icon={Shield} text="GDPR Compliant" />
            <TrustBadge icon={Lock} text="SSL Secure" />
            <TrustBadge icon={CheckCircle} text="PCI Certified" />
            <TrustBadge icon={Database} text="Data Protected" />
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

// Info Card Component
const InfoCard = ({ icon: Icon, title, items, color }) => {
  const colors = {
    blue: "from-blue-100 to-blue-50 border-blue-200 text-blue-700",
    green: "from-green-100 to-green-50 border-green-200 text-green-700",
    purple: "from-purple-100 to-purple-50 border-purple-200 text-purple-700",
    orange: "from-orange-100 to-orange-50 border-orange-200 text-orange-700"
  };
  
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-4 border`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} />
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <ul className="text-xs space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-current"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Use Case Item
const UseCaseItem = ({ text }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <CheckCircle size={14} className="text-green-500" />
    <span>{text}</span>
  </div>
);

// Security Item
const SecurityItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
    <Icon size={16} className="text-indigo-600" />
    <span>{text}</span>
  </div>
);

// Cookie Item
const CookieItem = ({ type, description }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <p className="font-semibold text-sm text-gray-800">{type}</p>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </div>
);

// Right Item
const RightItem = ({ text }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <CheckCircle size={14} className="text-green-500" />
    <span>{text}</span>
  </div>
);

// Contact Card
const ContactCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="p-2 bg-indigo-100 rounded-lg">
      <Icon size={16} className="text-indigo-600" />
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
    <Icon size={24} className="text-indigo-600 mx-auto mb-1" />
    <p className="text-xs font-medium text-gray-600">{text}</p>
  </div>
);

export default PrivacyPolicy;