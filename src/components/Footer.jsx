import { Facebook, Instagram, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">

        {/* BRAND */}
        <div className="lg:col-span-2">
          <h3 className="text-3xl font-bold text-white tracking-wide">
            Ecart
          </h3>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-sm">
            Your trusted destination for premium electronics, gadgets and
            accessories. Fast delivery, secure payments & genuine products.
          </p>

          {/* SOCIAL ICONS */}
          <div className="flex gap-4 mt-6">
            <a className="footer-icon"><Facebook size={18} /></a>
            <a className="footer-icon"><Instagram size={18} /></a>
            <a className="footer-icon"><Twitter size={18} /></a>
            <a className="footer-icon"><Linkedin size={18} /></a>
          </div>
        </div>

        {/* SHOP */}
        <div>
          <h4 className="footer-title">Shop</h4>
          <ul className="footer-links">
            <li>Mobiles</li>
            <li>Laptops</li>
            <li>Accessories</li>
            <li>Smart Gadgets</li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h4 className="footer-title">Company</h4>
          <ul className="footer-links">
            <li>About Us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Blog</li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h4 className="footer-title">Support</h4>
          <ul className="footer-links">
            <li>Help Center</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
      </div>

      {/* NEWSLETTER */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-400">
            Subscribe to get special offers, free giveaways & updates.
          </p>

          <div className="flex w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full md:w-72 px-4 py-2 bg-gray-900 border border-gray-700 rounded-l-md text-sm text-gray-200 focus:outline-none"
            />
            <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-r-md flex items-center gap-2">
              <Mail size={16} />
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="text-center py-4 text-xs text-gray-500 border-t border-gray-800">
        © {new Date().getFullYear()} Ecart. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
