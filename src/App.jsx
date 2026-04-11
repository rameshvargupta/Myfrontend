
import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser, setUser } from "@/redux/userSlice";
import { Toaster } from "sonner";

import Navbar from "./components/Navbar";

/* pages */
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/profile/Profile";
import Products from "./pages/user/Products";
import ProductDetails from "./pages/user/ProductDetails";
import Checkout from "./pages/user/Checkout";
import CartPage from "./pages/user/CartPage";
import OrderSuccess from "./pages/user/OrderSuccess";
import MyOrders from "./pages/user/MyOrders";

/* admin */
import AddProduct from "./pages/admin/AddProduct";
import ProductList from "./pages/admin/ProductList";
import EditProduct from "./pages/admin/EditProduct";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import AdminUserDetails from "./pages/admin/dashboard/components/AdminUserDetails";
import AddBanner from "./pages/admin/dashboard/AddBanners";
import MainLayout from "./components/MainLayout";
import AdminProductView from "./pages/admin/AdminProductView";
import Wishlist from "./pages/Wishlist";
import ProductCategoryDetails from "./pages/ProductCategoryDetails";
import Menubar from "./components/user/Menubar";
import UsersPanel from "./pages/admin/dashboard/components/UsersPanel";
import OrdersPanel from "./pages/admin/dashboard/components/OrdersPanel";
import CouponPage from "./pages/admin/dashboard/couponePage/CouponPage";
import { UserReviews } from "./pages/admin/UserReviews";
import MyOrdersDetails from "./pages/user/MyOrdersDetails";
import TermsAndConditions from "./pages/HelpAndSupport/TermsAndConditions";
import ContactUs from "./pages/HelpAndSupport/ContactUs";
import ReturnPolicy from "./pages/HelpAndSupport/ReturnPolicy";
import PrivacyPolicy from "./pages/HelpAndSupport/PrivacyPolicy";
import RefundPolicy from "./pages/HelpAndSupport/RefundPolicy";
import SearchBox from "./pages/user/SearchBox";
const API_URL = import.meta.env.VITE_API_URL;


const router = createBrowserRouter([
  {
    element: <MainLayout />, // 👈 ROOT LAYOUT (SCROLL HERE)
    children: [
      {
        path: "/",
        element: (
          <>
            <Navbar />
            <Home />

          </>
        ),
      },

      { path: "/signup", element: <Signup /> },
      { path: "/login", element: <Login /> },
      { path: "/forgot-password", element: <ForgotPassword /> },

      {
        path: "/profile",
        element: (
          <>
            <Navbar />
            <Profile />
          </>
        ),
      },

      /* USER */
      { path: "/products", element: <Products /> },
      { path: "/searchBox", element: <SearchBox /> },
      { path: "/product/:slug", element: <ProductDetails /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/cartpage", element: <CartPage /> },
      { path: "/wishlist", element: <Wishlist /> },
      { path: "/myorders", element: <MyOrders /> },
      { path: "/myorders/:orderId", element: <MyOrdersDetails /> },
      { path: "/ordersuccess/:orderId", element: <OrderSuccess /> },
      { path: "/category/:id", element: <ProductCategoryDetails /> },
      { path: "/menubar", element: <Menubar /> },
      { path: "/productCategoryDetails", element: <ProductCategoryDetails /> },
      //user condition section
      { path: "/termsAndConditions", element: <TermsAndConditions /> },
      { path: "/contactUs", element: <ContactUs /> },
      { path: "/returnPolicy", element: <ReturnPolicy /> },
      { path: "/privacyPolicy", element: <PrivacyPolicy /> },
      { path: "/refundPolicy", element: <RefundPolicy /> },
      // condition section

      /* ADMIN */
      { path: "/admin/products", element: <ProductList /> },
      { path: "/admin/add-product", element: <AddProduct /> },
      { path: "/admin/product/edit/:id", element: <EditProduct /> },
      { path: "/admin/users/:id", element: <AdminUserDetails /> },
      { path: "/admin/add-banner", element: <AddBanner /> },
      { path: "/adminDashboard", element: <AdminDashboard /> },
      { path: "/admin/OrderPannel", element: <OrdersPanel /> },
      { path: "/admin/UserPannel", element: <UsersPanel /> },
      { path: "/admin/UserReviews", element: <UserReviews /> },
      { path: "/admin/product/view/:slug/", element: <AdminProductView /> },
      { path: "/admin/couponPage", element: <CouponPage /> },
    ],
  },
]);

/* =========================
   APP
========================= */
const App = () => {
  const dispatch = useDispatch();
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    let parsedUser = null;

    // ✅ Safe JSON parse
    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Invalid user in localStorage");
      localStorage.removeItem("user");
    }

    // ✅ Agar token aur user dono hain to redux me set karo
    if (parsedUser && token) {
      dispatch(setUser({ user: parsedUser, token }));
    }

    // ❌ Agar token nahi hai
    if (!token) {
      dispatch(logoutUser());
      setLoadingUser(false);
      return;
    }

    // ✅ Server se fresh user fetch karo
    fetch(`${API_URL}/api/v1/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          localStorage.clear();
          dispatch(logoutUser());
        } else {
          localStorage.setItem("user", JSON.stringify(data.user)); // important
          dispatch(setUser({ user: data.user, token }));
        }
        setLoadingUser(false);
      })
      .catch(() => {
        localStorage.clear();
        dispatch(logoutUser());
        setLoadingUser(false);
      });

  }, [dispatch]);
  console.log("API URL:", import.meta.env.VITE_API_URL);


  if (loadingUser) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="bottom-right" />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
