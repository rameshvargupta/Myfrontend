import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterNavbar from "@/components/user/FooterNavbar";
import {
  RefreshCw,
  PackageX,
  Truck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Phone,
  MapPin,
  Mail,
  Shield,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  MessageCircle,
  ThumbsUp,
  Info,
  ArrowRight
} from "lucide-react";

const RefundPolicy = () => {
  const [lastUpdated] = useState("January 15, 2024");
  const [effectiveDate] = useState("January 1, 2024");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100   ">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <RefreshCw size={16} />
              <span className="text-sm font-medium">Updated {lastUpdated}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Refund & Return Policy</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Clear, transparent, and customer-first refund policy guidelines
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          
          {/* Quick Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 sticky top-4 z-10">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-red-600" />
              Quick Navigation
            </h3>
            <div className="flex flex-wrap gap-2">
              {["No Refund Policy", "Open Box Delivery", "Cancellation", "Exceptions", "Contact", "FAQs"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-full transition"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-red-500 to-orange-600 px-6 md:px-8 py-6">
              <div className="flex items-center gap-3 text-white">
                <RefreshCw size={28} />
                <div>
                  <h2 className="text-xl font-semibold">Refund Policy Statement</h2>
                  <p className="text-sm opacity-90">Effective Date: {effectiveDate}</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              
              {/* Important Notice Banner */}
              <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">Important Notice</p>
                    <p className="text-sm text-red-600 mt-1">
                      At <span className="font-bold">Ecart</span>, we maintain a strict no-refund policy 
                      after product delivery and acceptance. Please read our policy carefully.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1 - No Refund After Delivery */}
              <div id="no-refund-policy" className="scroll-mt-24">
                <Section 
                  title="1. No Refund After Delivery" 
                  icon={PackageX}
                  gradient="from-red-500 to-rose-600"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
                      <div className="flex items-center gap-3 mb-3">
                        <XCircle size={28} className="text-red-500" />
                        <h3 className="font-bold text-red-700 text-lg">Strict No-Refund Policy</h3>
                      </div>
                      <p className="text-gray-700">
                        Once a product is delivered and accepted by the customer, <strong className="text-red-600">no refund or exchange</strong> will be issued. 
                        All sales are final after delivery acceptance.
                      </p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <PolicyCard 
                        icon={Clock}
                        title="Time Frame"
                        description="No refunds accepted after delivery confirmation"
                        color="red"
                      />
                      <PolicyCard 
                        icon={CheckCircle}
                        title="Acceptance"
                        description="Delivery acceptance = Final sale"
                        color="orange"
                      />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 2 - Open Box Delivery */}
              <div id="open-box-delivery" className="scroll-mt-24">
                <Section 
                  title="2. Open Box Delivery Advantage" 
                  icon={Truck}
                  gradient="from-blue-500 to-cyan-600"
                >
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Eye size={24} className="text-blue-500" />
                        <h3 className="font-semibold text-blue-700">Inspect Before Accepting</h3>
                      </div>
                      <p className="text-gray-600 mb-3">
                        We offer Open Box Delivery to protect our customers. Follow these steps:
                      </p>
                      <div className="space-y-2">
                        <StepItem number="1" text="Open the package at the time of delivery" />
                        <StepItem number="2" text="Thoroughly inspect the product for damage or defects" />
                        <StepItem number="3" text="Check if the product matches your order" />
                        <StepItem number="4" text="If satisfied, accept the delivery" />
                        <StepItem number="5" text="If damaged or incorrect, reject immediately" />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <BenefitCard 
                        icon={ThumbsUp}
                        title="Benefits"
                        items={["Inspect before payment", "Immediate damage detection", "Peace of mind"]}
                        color="blue"
                      />
                      <WarningCard 
                        icon={AlertCircle}
                        title="Important"
                        items={["No refund after acceptance", "Document unboxing video", "Contact support for disputes"]}
                        color="orange"
                      />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 3 - Cancellation & Refund */}
              <div id="cancellation" className="scroll-mt-24">
                <Section 
                  title="3. Order Cancellation & Refund" 
                  icon={CreditCard}
                  gradient="from-green-500 to-teal-600"
                >
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={18} className="text-green-500" />
                          <h3 className="font-semibold text-green-700">Before Dispatch</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          Full refund processed within <strong>5-7 business days</strong>
                        </p>
                      </div>
                      <div className="bg-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle size={18} className="text-gray-500" />
                          <h3 className="font-semibold text-gray-700">After Dispatch</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          No cancellation or refund available
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-yellow-700 flex items-center gap-2">
                        <Clock size={14} />
                        Refunds for cancelled orders are processed within 5-7 business days to the original payment method.
                      </p>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 4 - Exceptions */}
              <div id="exceptions" className="scroll-mt-24">
                <Section 
                  title="4. Special Exceptions" 
                  icon={Shield}
                  gradient="from-purple-500 to-pink-600"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      In rare cases, we may consider exceptions on a case-by-case basis:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <ExceptionCard 
                        title="Wrong Product Delivered"
                        description="If product doesn't match your order"
                      />
                      <ExceptionCard 
                        title="Manufacturing Defect"
                        description="Major defects reported within 48 hours"
                      />
                      <ExceptionCard 
                        title="Missing Items"
                        description="Incomplete order reported immediately"
                      />
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 mt-3">
                      <p className="text-xs text-purple-700 flex items-center gap-2">
                        <Info size={14} />
                        All exception cases require video evidence and within 24 hours of delivery.
                      </p>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 5 - Return Process */}
              <div className="scroll-mt-24">
                <Section 
                  title="5. Return Process (If Applicable)" 
                  icon={RefreshCw}
                  gradient="from-indigo-500 to-blue-600"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">1</span>
                      </div>
                      <p className="text-sm text-gray-600">Contact customer support within 24 hours</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">2</span>
                      </div>
                      <p className="text-sm text-gray-600">Provide order details and evidence (photos/videos)</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">3</span>
                      </div>
                      <p className="text-sm text-gray-600">Our team will review and respond within 2-3 days</p>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Section 6 - FAQs */}
              <div id="faqs" className="scroll-mt-24">
                <Section 
                  title="6. Frequently Asked Questions" 
                  icon={MessageCircle}
                  gradient="from-cyan-500 to-blue-600"
                >
                  <div className="space-y-4">
                    <FAQ 
                      question="What if I receive a damaged product?"
                      answer="Do not accept delivery. If already accepted, contact us within 24 hours with video evidence."
                    />
                    <FAQ 
                      question="How long does a refund take?"
                      answer="For cancelled orders before dispatch, refunds take 5-7 business days after processing."
                    />
                    <FAQ 
                      question="Can I exchange a product?"
                      answer="We do not offer exchanges. Please carefully review products before accepting delivery."
                    />
                    <FAQ 
                      question="What if I accidentally accepted a wrong order?"
                      answer="Contact support immediately with proof. Cases are reviewed individually."
                    />
                  </div>
                </Section>
              </div>

              {/* Section 7 - Contact */}
              <div id="contact" className="scroll-mt-24">
                <Section 
                  title="7. Contact Us" 
                  icon={Mail}
                  gradient="from-gray-600 to-gray-800"
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">For any refund-related queries, please contact our support team:</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <ContactCard icon={Phone} label="Support Hotline" value="+91 75230 62030" />
                      <ContactCard icon={Mail} label="Email Support" value="refunds@ecart.com" />
                      <ContactCard icon={MapPin} label="Address" value="123 Business Avenue, Mumbai - 400001" />
                      <ContactCard icon={Clock} label="Support Hours" value="Mon-Fri: 9AM - 8PM" />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Footer Note */}
              <div className="border-t pt-6 mt-6 text-center">
                <p className="text-xs text-gray-400">
                  By placing an order, you acknowledge and agree to our refund policy.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  © {new Date().getFullYear()} Ecart. All rights reserved.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <TrustBadge icon={Shield} text="Secure Payments" />
            <TrustBadge icon={Truck} text="Open Box Delivery" />
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

// Policy Card
const PolicyCard = ({ icon: Icon, title, description, color }) => {
  const colors = {
    red: "from-red-50 to-red-100 border-red-200 text-red-700",
    orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-700"
  };
  
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-4 border`}>
      <Icon size={20} className="mb-2" />
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-xs mt-1 opacity-80">{description}</p>
    </div>
  );
};

// Step Item
const StepItem = ({ number, text }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-red-600">{number}</span>
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

// Exception Card
const ExceptionCard = ({ title, description }) => (
  <div className="bg-purple-50 rounded-lg p-3">
    <h4 className="font-semibold text-sm text-purple-700">{title}</h4>
    <p className="text-xs text-purple-600 mt-1">{description}</p>
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
    <Icon size={24} className="text-red-600 mx-auto mb-1" />
    <p className="text-xs font-medium text-gray-600">{text}</p>
  </div>
);

export default RefundPolicy;