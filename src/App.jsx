import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
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
  { path: "/adminDashboard", element: < AdminDashboard /> },
  { path: "/admin/add-product", element: < AddProduct /> },
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

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const fetchMe = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/v1/user/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        localStorage.clear();
        return;
      }

      const data = await res.json();
      if (!data.success) return;

      dispatch(
        setUser({
          user: data.user,
          token,
        })
      );

      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      console.log("Failed to sync user");
    }
  };

  fetchMe();
}, [dispatch]);



  return (
    <>
      <Toaster richColors position="bottom-right" />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
