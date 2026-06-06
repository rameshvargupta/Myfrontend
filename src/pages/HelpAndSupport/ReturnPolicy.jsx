import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import {
  RotateCcw,
  PackageOpen,
  XCircle,
  ShieldCheck,
  Eye,
  Truck,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Mail,
  Clock,
  FileText,
  ThumbsUp,
  ShoppingBag,
  Calendar,
  MessageCircle,
  ArrowRight,
  Info,
  Ban
} from "lucide-react";

const ReturnPolicy = () => {
  const [lastUpdated] = useState("January 15, 2024");
  const [effectiveDate] = useState("January 1, 2024");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <RotateCcw size={16} />
              <span className="text-sm font-medium">Updated {lastUpdated}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Return & Refund Policy</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Clear, transparent, and customer-first return policy guidelines
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          
          {/* Quick Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 sticky top-4 z-10">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-orange-600" />
              Quick Navigation
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Open Box Delivery", "No Return Policy", "Customer Responsibility", "Exceptions", "Contact", "FAQs"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-full transition"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 md:px-8 py-6">
              <div className="flex items-center gap-3 text-white">
                <RotateCcw size={28} />
                <div>
                  <h2 className="text-xl font-semibold">Return Policy Statement</h2>
                  <p className="text-sm opacity-90">Effective Date: {effectiveDate}</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              
              {/* Important Notice Banner */}
              <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-700">Important Notice</p>
                    <p className="text-sm text-orange-600 mt-1">
                      At <span className="font-bold">Ecart</span>, we have a strict <strong className="underline">no return policy</strong> after 
                      successful delivery. Please read our policy carefully before accepting delivery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1 - Open Box Delivery */}
              <div id="open-box-delivery" className="scroll-mt-24">
                <Section 
                  title="1. Open Box Delivery" 
                  icon={PackageOpen}
                  gradient="from-blue-500 to-cyan-600"
                >
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Eye size={24} className="text-blue-500" />
                        <h3 className="font-semibold text-blue-700 text-lg">Inspect Before You Accept</h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        We provide <strong className="text-blue-600">Open Box Delivery</strong> for all eligible orders. 
                        Follow these steps to ensure a safe delivery:
                      </p>
                      <div className="space-y-3">
                        <StepItem number="1" text="Open the package at the time of delivery" />
                        <StepItem number="2" text="Thoroughly inspect the product for any damage" />
                        <StepItem number="3" text="Verify the product matches your order" />
                        <StepItem number="4" text="Check all accessories and items are included" />
                        <StepItem number="5" text="If satisfied, accept the delivery" />
                        <StepItem number="6" text="If damaged or incorrect, reject immediately" />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <BenefitCard 
                        icon={ThumbsUp}
                        title="Benefits"
                        items={["Inspect before payment", "Immediate damage detection", "Peace of mind", "Zero risk acceptance"]}
                        color="blue"
                      />
                      <WarningCard 
                        icon={AlertCircle}
                        title="Important Notes"
                        items={["Record unboxing video for proof", "Don't accept if seal is broken", "Check expiration dates", "Verify warranty cards"]}
                        color="orange"
                      />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 2 - No Return Policy */}
              <div id="no-return-policy" className="scroll-mt-24">
                <Section 
                  title="2. No Return Policy" 
                  icon={Ban}
                  gradient="from-red-500 to-rose-600"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
                      <div className="flex items-center gap-3 mb-3">
                        <XCircle size={32} className="text-red-500" />
                        <h3 className="font-bold text-red-700 text-lg">Strict No Return Policy</h3>
                      </div>
                      <p className="text-gray-700">
                        Once a product is <strong className="text-red-600">accepted during delivery</strong>, 
                        it is considered <strong className="text-red-600">final sale</strong>. 
                        We do NOT accept returns, replacements, or exchanges after successful delivery.
                      </p>
                    </div>
                    
                    <div className="grid sm:grid-cols-3 gap-4 mt-4">
                      <PolicyCard 
                        icon={XCircle}
                        title="No Returns"
                        description="No returns accepted after delivery"
                        color="red"
                      />
                      <PolicyCard 
                        icon={RotateCcw}
                        title="No Exchanges"
                        description="Exchanges not available"
                        color="red"
                      />
                      <PolicyCard 
                        icon={ShoppingBag}
                        title="No Refunds"
                        description="Refunds not issued after acceptance"
                        color="red"
                      />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 3 - Customer Responsibility */}
              <div id="customer-responsibility" className="scroll-mt-24">
                <Section 
                  title="3. Customer Responsibility" 
                  icon={ShieldCheck}
                  gradient="from-green-500 to-teal-600"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      As a responsible customer, you agree to:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      <ResponsibilityItem text="Check the product thoroughly during delivery" />
                      <ResponsibilityItem text="Reject damaged or incorrect products immediately" />
                      <ResponsibilityItem text="Not accept the product if seal is broken" />
                      <ResponsibilityItem text="Verify all items and accessories are present" />
                      <ResponsibilityItem text="Take responsibility after accepting delivery" />
                      <ResponsibilityItem text="Document unboxing with video evidence" />
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-3 mt-4">
                      <p className="text-xs text-yellow-700 flex items-center gap-2">
                        <Info size={14} />
                        After accepting delivery, the responsibility transfers to the customer.
                      </p>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 4 - Exceptions */}
              <div id="exceptions" className="scroll-mt-24">
                <Section 
                  title="4. Exceptions (Case-by-Case Basis)" 
                  icon={AlertCircle}
                  gradient="from-purple-500 to-pink-600"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      While we maintain a strict no-return policy, we may review exceptional cases:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <ExceptionCard 
                        title="Wrong Product Delivered"
                        description="Product doesn't match the ordered item"
                        icon={PackageOpen}
                      />
                      <ExceptionCard 
                        title="Manufacturing Defect"
                        description="Major defect reported within 24 hours"
                        icon={AlertCircle}
                      />
                      <ExceptionCard 
                        title="Missing Items"
                        description="Incomplete order with missing accessories"
                        icon={ShoppingBag}
                      />
                      <ExceptionCard 
                        title="Delivery Acceptance Error"
                        description="Accepted by mistake with proof"
                        icon={Eye}
                      />
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4 mt-3">
                      <p className="text-sm text-purple-700 font-semibold mb-2">Requirements for Exception:</p>
                      <ul className="text-xs text-purple-600 space-y-1">
                        <li>• Unboxing video evidence required</li>
                        <li>• Report within 24 hours of delivery</li>
                        <li>• Product must be unused and in original condition</li>
                        <li>• All original packaging and accessories intact</li>
                      </ul>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 5 - What to Do If Issue Found */}
              <div className="scroll-mt-24">
                <Section 
                  title="5. What to Do If You Find an Issue?" 
                  icon={MessageCircle}
                  gradient="from-cyan-500 to-blue-600"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-cyan-600 font-bold text-sm">1</span>
                      </div>
                      <p className="text-sm text-gray-600"><strong>Do NOT accept</strong> the delivery if product is damaged</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-cyan-600 font-bold text-sm">2</span>
                      </div>
                      <p className="text-sm text-gray-600">Inform the delivery person and mark as rejected</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-cyan-600 font-bold text-sm">3</span>
                      </div>
                      <p className="text-sm text-gray-600">Contact our support team immediately</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-cyan-600 font-bold text-sm">4</span>
                      </div>
                      <p className="text-sm text-gray-600">Provide photos/videos as evidence</p>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 6 - FAQs */}
              <div id="faqs" className="scroll-mt-24">
                <Section 
                  title="6. Frequently Asked Questions" 
                  icon={MessageCircle}
                  gradient="from-indigo-500 to-purple-600"
                >
                  <div className="space-y-4">
                    <FAQ 
                      question="Can I return a product after delivery?"
                      answer="No, we do not accept returns after successful delivery. Please inspect the product during open box delivery."
                    />
                    <FAQ 
                      question="What if the product is defective?"
                      answer="If you notice a defect during open box delivery, reject the product immediately. Contact support for assistance."
                    />
                    <FAQ 
                      question="What if I accidentally accepted a damaged product?"
                      answer="Contact support within 24 hours with video evidence. Cases are reviewed individually."
                    />
                    <FAQ 
                      question="How does Open Box Delivery work?"
                      answer="You can open and inspect the product at delivery time. If satisfied, accept; if not, reject immediately."
                    />
                    <FAQ 
                      question="Is refund available if I reject delivery?"
                      answer="Yes, if you reject delivery due to damage or incorrect product, a full refund will be processed."
                    />
                    <FAQ 
                      question="How long does a refund take?"
                      answer="Refunds for rejected deliveries are processed within 5-7 business days."
                    />
                  </div>
                </Section>
              </div>

              {/* Section 7 - Contact */}
              <div id="contact" className="scroll-mt-24">
                <Section 
                  title="7. Need Help? Contact Us" 
                  icon={Phone}
                  gradient="from-gray-600 to-gray-800"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">If you have any concerns or questions about our return policy:</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <ContactCard icon={Phone} label="Customer Support" value="+91 75230 62030" />
                      <ContactCard icon={Mail} label="Email Support" value="returns@ecart.com" />
                      <ContactCard icon={Clock} label="Support Hours" value="Mon-Fri: 9AM - 8PM" />
                      <ContactCard icon={MapPin} label="Corporate Address" value="123 Business Avenue, Mumbai - 400001" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">
                        Our support team typically responds within 24 hours
                      </p>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Footer Note */}
              <div className="border-t pt-6 mt-6 text-center">
                <p className="text-xs text-gray-400">
                  By placing an order, you acknowledge and agree to our return policy.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  © {new Date().getFullYear()} Ecart. All rights reserved.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <TrustBadge icon={PackageOpen} text="Open Box Delivery" />
            <TrustBadge icon={ShieldCheck} text="Quality Assured" />
            <TrustBadge icon={Clock} text="24/7 Support" />
            <TrustBadge icon={CheckCircle} text="100% Transparent" />
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

// Step Item
const StepItem = ({ number, text }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-blue-600">{number}</span>
    </div>
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);

// Benefit Card
const BenefitCard = ({ icon: Icon, title, items, color }) => (
  <div className="bg-blue-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={16} className="text-blue-600" />
      <h4 className="font-semibold text-sm text-blue-700">{title}</h4>
    </div>
    <ul className="space-y-1">
      {items.map((item, idx) => (
        <li key={idx} className="text-xs text-blue-600 flex items-center gap-1">
          <CheckCircle size={10} /> {item}
        </li>
      ))}
    </ul>
  </div>
);

// Warning Card
const WarningCard = ({ icon: Icon, title, items, color }) => (
  <div className="bg-orange-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={16} className="text-orange-600" />
      <h4 className="font-semibold text-sm text-orange-700">{title}</h4>
    </div>
    <ul className="space-y-1">
      {items.map((item, idx) => (
        <li key={idx} className="text-xs text-orange-600 flex items-center gap-1">
          <AlertCircle size={10} /> {item}
        </li>
      ))}
    </ul>
  </div>
);

// Policy Card
const PolicyCard = ({ icon: Icon, title, description, color }) => {
  const colors = {
    red: "from-red-50 to-red-100 border-red-200 text-red-700"
  };
  
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-4 border text-center`}>
      <Icon size={20} className="mx-auto mb-2" />
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-xs mt-1 opacity-80">{description}</p>
    </div>
  );
};

// Responsibility Item
const ResponsibilityItem = ({ text }) => (
  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
    <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
    <span className="text-sm text-green-700">{text}</span>
  </div>
);

// Exception Card
const ExceptionCard = ({ icon: Icon, title, description }) => (
  <div className="bg-purple-50 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className="text-purple-600" />
      <h4 className="font-semibold text-sm text-purple-700">{title}</h4>
    </div>
    <p className="text-xs text-purple-600">{description}</p>
  </div>
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
    <Icon size={24} className="text-orange-600 mx-auto mb-1" />
    <p className="text-xs font-medium text-gray-600">{text}</p>
  </div>
);

export default ReturnPolicy;