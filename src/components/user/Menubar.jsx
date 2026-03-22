import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Home,
    User,
    LayoutDashboard,
    Mail, Phone, Pencil,
    LogOut,
    LogIn,
    ChevronDown,
    ChevronRight,
    X,
    HelpCircle,
    CommandIcon,
    ShoppingBag,
} from "lucide-react";
import { logoutUser } from "@/redux/userSlice";
import FooterNavbar from "./FooterNavbar";

const Menubar = () => {
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [openSection, setOpenSection] = useState(null);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    };

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const SubItem = ({ text, onClick, href }) => {

        const handleClick = () => {
            if (href) {
                window.open(href, "_blank");
            } else if (onClick) {
                onClick();
            }
        };

        return (
            <div
                onClick={handleClick}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 cursor-pointer"
            >
                <ChevronRight size={14} />
                {text}
            </div>
        );
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 pb-24">

                {/* Header */}
                <div className="flex items-center justify-between p-5 bg-white shadow-sm">
                    <h2 className="text-xl font-bold">Menu</h2>
                    <X size={22} onClick={() => navigate(-1)} className="cursor-pointer" />
                </div>

                {/* PROFILE */}
                {user ? (
                    <div className="mx-4 mt-6 relative group">
                        <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-70"></div>

                        <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow border">
                            <div className="flex items-center gap-5">

                                <div className="relative">
                                    {user?.profilePic ? (
                                        <img
                                            src={user.profilePic}
                                            alt="profilePic"
                                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                                            {user?.firstName?.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <h3 className="text-lg font-bold">
                                        {user.firstName} {user.lastName}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={14} />
                                        {user.email}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} />
                                        {user.phoneNo || "Not Added"}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate("/profile")}
                                    className="absolute top-4 left-4 bg-indigo-600 text-white p-2 rounded-full"
                                >
                                    <Pencil size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mx-4 mt-6 bg-white p-5 rounded-xl text-center">
                        <p className="mb-3">You are not logged in</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-indigo-600 text-white px-5 py-2 rounded-lg"
                        >
                            Login
                        </button>
                    </div>
                )}

                <div className="mt-6 px-4 space-y-3">

                    {/* MAIN */}
                    <Accordion
                        title="Main"
                        icon={Home}
                        open={openSection === "main"}
                        onClick={() => toggleSection("main")}
                    >
                        <SubItem text="Home" onClick={() => navigate("/")} />
                        <SubItem text="Cart" onClick={() => navigate("/cartpage")} />
                        <SubItem text="Wishlist" onClick={() => navigate("/wishlist")} />
                    </Accordion>

                    {/* SHOP */}
                    <Accordion
                        title="Shop"
                        icon={ShoppingBag}
                        open={openSection === "shop"}
                        onClick={() => toggleSection("shop")}
                    >
                        <SubItem text="All Products" onClick={() => navigate("/products")} />
                        <SubItem text="Categories" onClick={() => navigate("/categories")} />
                        <SubItem text="Offers" onClick={() => navigate("/offers")} />
                    </Accordion>

                    {/* ACCOUNT */}
                    {user && (
                        <Accordion
                            title="Account"
                            icon={User}
                            open={openSection === "account"}
                            onClick={() => toggleSection("account")}
                        >
                            <SubItem text="My Profile" onClick={() => navigate("/profile")} />
                            <SubItem text="My Orders" onClick={() => navigate("/myorders")} />
                            <SubItem text="Track Order" onClick={() => navigate("/track-order")} />
                            <SubItem text="Address" onClick={() => navigate("/profile")} />
                        </Accordion>
                    )}

                    {/* ADMIN */}
                    {user?.role === "admin" && (
                        <Accordion
                            title="Admin Panel"
                            icon={LayoutDashboard}
                            open={openSection === "admin"}
                            onClick={() => toggleSection("admin")}
                        >
                            <SubItem text="Dashboard" onClick={() => navigate("/adminDashboard")} />
                            <SubItem text="Orders" onClick={() => navigate("/admin/OrderPannel")} />
                            <SubItem text="Products" onClick={() => navigate("/admin/products")} />
                            <SubItem text="Users" onClick={() => navigate("/admin/UserPannel")} />
                            <SubItem text="Coupons" onClick={() => navigate("/admin/couponPage")} />
                            <SubItem text="Banners" onClick={() => navigate("/admin/add-banner")} />
                            <SubItem text="Reviews" onClick={() => navigate("/admin/UserReviews")} />
                        </Accordion>
                    )}

                    {/* HELP */}
                    <Accordion
                        title="Help & Support"
                        icon={HelpCircle}
                        open={openSection === "help"}
                        onClick={() => toggleSection("help")}
                    >
                        <SubItem text="Contact Us" onClick={() => navigate("/contactUs")} />

                        <SubItem
                            text="Chat on WhatsApp"
                            href="https://wa.me/7523062030?text=Hi%20I%20am%20interested%20in%20your%20products"
                        />

                        <SubItem text="Return Policy" onClick={() => navigate("/returnPolicy")} />
                    </Accordion>

                    {/* LEGAL */}
                    <Accordion
                        title="Legal"
                        icon={CommandIcon}
                        open={openSection === "legal"}
                        onClick={() => toggleSection("legal")}
                    >
                        <SubItem text="Terms & Conditions" onClick={() => navigate("/termsAndConditions")} />
                        <SubItem text="Privacy Policy" onClick={() => navigate("/privacyPolicy")} />
                        <SubItem text="Refund Policy" onClick={() => navigate("/refundPolicy")} />
                    </Accordion>

                    {/* LOGIN / LOGOUT */}
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-indigo-600 text-white"
                        >
                            <LogIn size={18} />
                            Login
                        </button>
                    )}

                </div>
            </div>

            <FooterNavbar />
        </>
    );
};

/* Accordion */
const Accordion = ({ title, icon: Icon, children, open, onClick }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div
            onClick={onClick}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        >
            <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className="font-medium">{title}</span>
            </div>
            <ChevronDown
                size={18}
                className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
        </div>
        {open && <div className="px-4 pb-3 space-y-2">{children}</div>}
    </div>
);

/* SubItem */
const SubItem = ({ text, onClick }) => (
    <div
        onClick={onClick}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 cursor-pointer"
    >
        <ChevronRight size={14} />
        {text}
    </div>
);

export default Menubar;  