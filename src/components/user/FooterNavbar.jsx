import React from "react";
import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, Flame, Package, Menu } from "lucide-react";

const FooterNavbar = () => {
  return (
    <>
      {/* Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-xl mb-2">
        <div className="flex justify-between items-center h-16 px-3">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/productCategoryDetails" icon={LayoutGrid} label="Categories" />
          <NavItem to="/top-deals" icon={Flame} label="Hot Deals" />
          <NavItem to="/myorders" icon={Package} label="Orders" />
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
          className={`
            relative flex flex-col items-center justify-center h-full 
            transition-all duration-300
            ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-indigo-500"}
          `}
        >
          {/* Animated active indicator */}
          <div
            className={`
              absolute -top-1 w-10 h-1 rounded-full bg-indigo-600
              transition-all duration-300
              ${isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}
            `}
          ></div>

          {/* Icon with scale animation */}
          <Icon
            size={20}
            className={`
              transition-transform duration-300 
              ${isActive ? "scale-110 animate-bounce" : "scale-100"}
            `}
          />

          {/* Label */}
          <span
            className={`
              text-[11px] mt-1 transition-all duration-300
              ${isActive ? "font-semibold text-indigo-600" : "font-medium"}
            `}
          >
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
};

export default FooterNavbar;