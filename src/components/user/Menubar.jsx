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
} from "lucide-react";
import { logoutUser } from "@/redux/userSlice";
import FooterNavbar from "./FooterNavbar";

const Menubar = () => {
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [openSection, setOpenSection] = useState(null);
    const [openSub, setOpenSub] = useState(null);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    };

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const toggleSub = (sub) => {
        setOpenSub(openSub === sub ? null : sub);
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 pb-24">

                {/* Header */}
                <div className="flex items-center justify-between p-5 bg-white shadow-sm">
                    <h2 className="text-xl font-bold">Menu</h2>
                    <X size={22} onClick={() => navigate(-1)} className="cursor-pointer" />
                </div>

                {/* 🔥 Ultra Premium Profile Card */}
                {user ? (
                    <div className="mx-4 mt-6 relative group">

                        {/* Gradient Glow */}
                        <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500"></div>

                        {/* Card */}
                        <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/40 transition-all duration-300 group-hover:-translate-y-1">



                            <div className="flex items-center gap-5">

                                {/* Avatar */}
                                <div className="relative">

                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 blur-sm opacity-70 animate-pulse"></div>

                                    {user?.profilePic ? (
                                        <img
                                            src={user.profilePic}
                                            alt="profilePic"
                                            className="relative w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                            {user?.firstName?.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 space-y-2">

                                    {/* Name */}
                                    <h3 className="text-xl font-bold text-gray-900 tracking-wide">
                                        {user.firstName} {user.lastName}
                                    </h3>

                                    {/* Email */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={14} />
                                        <span className="truncate">{user.email}</span>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} />
                                        <span>{user.phoneNo || "Not Added"}</span>
                                    </div>

                                </div>

                                {/* 🔥 Left Floating Edit Button */}
                                <button
                                    onClick={() => navigate("/profile")}
                                    className="absolute top-5 left-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition"
                                >
                                    <Pencil size={16} />
                                </button>

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mx-4 mt-6 bg-white p-5 rounded-2xl shadow text-center">
                        <p className="text-gray-600 mb-4">You are not logged in</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition"
                        >
                            Login Now
                        </button>
                    </div>
                )}

                <div className="mt-6 px-4 space-y-3">

                    {/* MAIN SECTION */}
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

                    {/* ACCOUNT SECTION */}
                    {user && (
                        <Accordion
                            title="Account"
                            icon={User}
                            open={openSection === "account"}
                            onClick={() => toggleSection("account")}
                        >
                            <SubItem text="My Profile" onClick={() => navigate("/profile")} />
                            <SubItem text="My Orders" onClick={() => navigate("/myorders")} />
                            <SubItem text="Address" onClick={() => navigate("/profile")} />
                            <SubItem text="Security" onClick={() => navigate("/profile")} />
                        </Accordion>
                    )}

                    {/* ADMIN PANEL */}
                    {user?.role === "admin" && (
                        <Accordion
                            title="Admin Panel"
                            icon={LayoutDashboard}
                            open={openSection === "admin"}
                            onClick={() => toggleSection("admin")}
                        >
                            <SubItem text="Dashboard" onClick={() => navigate("/adminDashboard")} />
                            <SubItem text="Manage Orders" onClick={() => navigate("/admin/OrderPannel")} />
                            <SubItem text="Coupon Sections" onClick={() => navigate("/admin/couponPage")} />
                            <SubItem text="Manage Products" onClick={() => navigate("/admin/products")} />
                            <SubItem text="Manage Users" onClick={() => navigate("/admin/UserPannel")} />
                            <SubItem text="Manage Banners" onClick={() => navigate("/admin/add-banner")} />
                            <SubItem text="Manage User Views" onClick={() => navigate("/admin/userViews")} />
                        </Accordion>
                    )}

                    {/* 🔁 LOGIN / LOGOUT BUTTON */}
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
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


/* Sub Item */
const SubItem = ({ text, onClick }) => (
    <div
        onClick={onClick}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 cursor-pointer transition"
    >
        <ChevronRight size={14} />
        {text}
    </div>
);



export default Menubar;