import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Flame, Package, Menu } from "lucide-react";

const FooterNavbar = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(null);

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/productCategoryDetails", icon: LayoutGrid, label: "Categories" },
    { to: "/top-deals", icon: Flame, label: "Deals" },
    { to: "/myorders", icon: Package, label: "Orders" },
    { to: "/menubar", icon: Menu, label: "Menu" },
  ];

  return (
    <>
      {/* Mobile Bottom Navbar - Full Width */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
          <div className="flex justify-between items-center h-16 px-2">
            {navItems.map((item, index) => (
              <NavItem
                key={index}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
                onTap={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>

    </>
  );
};

const NavItem = ({ to, icon: Icon, label, isActive, onTap }) => {
  return (
    <NavLink to={to} className="flex-1 h-full" onClick={onTap}>
      <div
        className={`
          relative flex flex-col items-center justify-center h-full 
          transition-all duration-200
          ${isActive ? "text-indigo-600" : "text-gray-500"}
        `}
      >
        {/* Active indicator */}
        <div
          className={`
            absolute -top-1 w-8 h-0.5 rounded-full bg-indigo-600
            transition-all duration-200
            ${isActive ? "opacity-100" : "opacity-0"}
          `}
        ></div>

        {/* Icon */}
        <Icon
          size={20}
          className={`
            transition-transform duration-200 
            ${isActive ? "scale-105" : "scale-100"}
          `}
        />

        {/* Label */}
        <span
          className={`
            text-[10px] mt-1 transition-all duration-200
            ${isActive ? "font-medium text-indigo-600" : "font-normal text-gray-500"}
          `}
        >
          {label}
        </span>
      </div>
    </NavLink>
  );
};

export default FooterNavbar;