import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Flame,
  Package,
  Menu,
  User,
  MapPin,
  Heart,
  LogOut,
  X
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/userSlice";

const FooterNavbar = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowDrawer(false);
    navigate("/login");
  };

  return (
    <>
      {/* Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex justify-between items-center h-16 px-2">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/categories" icon={LayoutGrid} label="Categories" />
          <NavItem to="/top-deals" icon={Flame} label="Hot Deals" />
          <NavItem to="/myorders" icon={Package} label="My Orders" />

          {/* Menu Button (No Routing) */}
          <div
            onClick={() => setShowDrawer(true)}
            className="flex-1 h-full flex flex-col items-center justify-center text-gray-500 cursor-pointer"
          >
            <Menu size={22} />
            <span className="text-[11px] mt-1 font-medium">
              Menu
            </span>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            onClick={() => setShowDrawer(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          ></div>

          {/* Drawer Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-slideUp">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setShowDrawer(false)}
              />
            </div>

            {/* User Info */}
            {user && (
              <div className="bg-gray-100 rounded-2xl p-4 mb-4">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            )}

            {/* Account Section */}
            <SectionTitle title="Account" />
            <MenuItem icon={User} label="My Profile" onClick={() => navigate("/profile")} />
            <MenuItem icon={MapPin} label="Saved Addresses" onClick={() => navigate("/addresses")} />
            <MenuItem icon={Heart} label="Wishlist" onClick={() => navigate("/wishlist")} />

            {/* Orders */}
            <SectionTitle title="Orders" />
            <MenuItem icon={Package} label="My Orders" onClick={() => navigate("/myorders")} />

            {/* Logout */}
            <SectionTitle title="Other" />
            <MenuItem icon={LogOut} label="Logout" onClick={handleLogout} danger />

          </div>
        </div>
      )}

      {/* Animation Style */}
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
};

const NavItem = ({ to, icon: Icon, label }) => {
  return (
    <NavLink to={to} className="flex-1 h-full">
      {({ isActive }) => (
        <div
          className={`relative flex flex-col items-center justify-center h-full transition-all duration-300 ${isActive ? "text-indigo-600" : "text-gray-500"
            }`}
        >
          {isActive && (
            <div className="absolute top-0 w-8 h-[3px] bg-indigo-600 rounded-full"></div>
          )}

          <Icon size={22} className={isActive ? "scale-110" : ""} />
          <span className={`text-[11px] mt-1 ${isActive ? "font-semibold" : "font-medium"}`}>
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
};

const SectionTitle = ({ title }) => (
  <h3 className="text-xs text-gray-400 uppercase mt-4 mb-2 tracking-wide">
    {title}
  </h3>
);

const MenuItem = ({ icon: Icon, label, onClick, danger }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${danger
      ? "hover:bg-red-50 text-red-600"
      : "hover:bg-gray-100 text-gray-700"
      }`}
  >
    <Icon size={18} />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default FooterNavbar;