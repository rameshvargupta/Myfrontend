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
    path: "/products",
    element: <><AddProduct /></>
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
]);

/* =========================
   APP COMPONENT
========================= */
const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // 🔹 Step 1: Load from localStorage (FAST + offline support)
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      dispatch(
        setUser({
          user: JSON.parse(storedUser),
          token,
        })
      );
    }

    // 🔹 Step 2: Fetch fresh full user from backend (/me)
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

        const data = await res.json();
        if (!data.success) return;

        const fullUser = {
          ...data.user,
          avatar: {
            url: data.user.profilePic,
            publicId: data.user.profilePicPublicId,
          },
        };

        dispatch(
          setUser({
            user: fullUser,
            token,
          })
        );

        localStorage.setItem("user", JSON.stringify(fullUser));
      } catch (error) {
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
