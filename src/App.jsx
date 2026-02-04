import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser, setUser } from "@/redux/userSlice";
import { Toaster } from "sonner";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import Footer from "./components/Footer";
import Profile from "./pages/Profile";
import AddProduct from "./pages/admin/AddProduct";
import Products from "./pages/user/Products";
import ProductList from "./pages/admin/ProductList";
import EditProduct from "./pages/admin/EditProduct";
import ProductDetails from "./pages/user/ProductDetails";
import Checkout from "./pages/user/Checkout";
import CartPage from "./pages/user/CartPage";
import OrderSuccess from "./pages/user/OrderSuccess";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import MyOrders from "./pages/user/MyOrders";
import AdminUserDetails from "./pages/admin/dashboard/components/AdminUserDetails";
import AddBanner from "./pages/admin/dashboard/AddBanners";

/* =========================
   ROUTER
========================= */
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <Home />
        <Footer />
      </>
    ),
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/profile",
    element: (
      <>
        <Navbar />
        <Profile />
      </>
    ),
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },

  //  user?
  { path: "/products", element: < Products /> },
  { path: "/product/:slug", element: <ProductDetails /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/cartpage", element: <CartPage /> },
  { path: "/myorders", element: <MyOrders /> },

  { path: "/ordersuccess/:orderId", element: <OrderSuccess /> },

  // {/* ADMIN */ }
  { path: "/admin/products", element: < ProductList /> },
  { path: "/admin/add-banner", element: < AddBanner /> },
  { path: "/adminDashboard", element: < AdminDashboard /> },
  { path: "/admin/add-product", element: < AddProduct /> },
  { path: "/admin/users/:id", element: < AdminUserDetails /> },
  {
    path: "/admin/product/edit/:id",
    element: <EditProduct />
  }

]);

/* =========================
   APP COMPONENT
========================= */
const App = () => {
  const dispatch = useDispatch();
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedUser && token) {
      dispatch(setUser({
        user: JSON.parse(storedUser),
        token
      }));
    }


    if (!token) {
      dispatch(logoutUser()); // authChecked = true
      setLoadingUser(false);
      return;
    }


    if (token) {
      fetch("http://localhost:5000/api/v1/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            localStorage.clear();
            dispatch(logoutUser());
          } else {
            dispatch(setUser({ user: data.user, token }));
          }
          setLoadingUser(false);
        })
        .catch(() => {
          localStorage.clear();
          dispatch(logoutUser());
          setLoadingUser(false);
        });
    } else {
      setLoadingUser(false);
    }
  }, [dispatch]);

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
