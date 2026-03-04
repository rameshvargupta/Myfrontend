import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Flame,
  Package,
  Menu,

} from "lucide-react";

const FooterNavbar = () => {

  return (
    <>
      {/* Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex justify-between items-center h-16 px-2">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/productCategoryDetails" icon={LayoutGrid} label="Categories" />
          <NavItem to="/top-deals" icon={Flame} label="Hot Deals" />
          <NavItem to="/myorders" icon={Package} label="My Orders" />
          <NavItem to="/menubar" icon={Menu} label="Menu" />

        </div>
      </div>

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

export default FooterNavbar;