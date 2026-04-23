import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import LandingPage from "../pages/shop/LandingPage";
import Home from "../pages/shop/Home";
import ProductDetail from "../pages/shop/ProductDetail";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProductManager from "../pages/admin/ProductManager";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Checkout from "../pages/cart/Checkout";
import Success from "../pages/cart/Success";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute blockStaff={true} />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
      {
        path: "/",
        element: <LandingPage />
      },
          {
            path: "/",
            element: <LandingPage />
          },
          {
            path: "/home",
            element: <Home />
          },
          {
            path: "/product/:id",
            element: <ProductDetail />
          },
          {
            path: "/checkout",
            element: <Checkout />
          },
          {
            path: "/checkout/success",
            element: <Success />
          }
        ],
      }
    ]
  },
  {
    path: "/admin",
    element: <ProtectedRoute requireStaff={true} />,
    children: [
      {
        path: "",
        element: <DashboardLayout />,
        children: [
          {
            path: "",
            element: <ProtectedRoute requireSuperadmin={true} />,
            children: [
              {
                path: "",
                element: <Navigate to="products" replace />
              }
            ]
          },
          {
            path: "products",
            element: <ProductManager />
          }
        ]
      }
    ]
  },
  {
    path: "/login",
    element: <ProtectedRoute requireUnauth={true} />,
    children: [
      {
        path: "",
        element: <LoginPage />
      }
    ]
  },
  {
    path: "/register",
    element: <ProtectedRoute requireUnauth={true} />,
    children: [
      {
        path: "",
        element: <RegisterPage />
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
