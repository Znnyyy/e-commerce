import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import LandingPage from "../pages/shop/LandingPage";
import Home from "../pages/shop/Home";
import ProductDetail from "../pages/shop/ProductDetail";
import ProductsPage from "../pages/shop/ProductsPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProductManager from "../pages/admin/ProductManager";
import OrderManager from "../pages/admin/OrderManager";
import UserManager from "../pages/admin/UserManager";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import CartRoute from "../components/auth/CartRoute";
import Checkout from "../pages/cart/Checkout";
import Success from "../pages/cart/Success";
import AccountPage from "../pages/account/AccountPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute blockStaff={true} />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: "/home", element: <Home /> },
          { path: "/products", element: <ProductsPage /> },
          { path: "/product/:id", element: <ProductDetail /> },
          {
            path: "/checkout",
            element: <CartRoute />,
            children: [{ index: true, element: <Checkout /> }]
          },
          { path: "/checkout/success", element: <Success /> },
          { path: "/account", element: <AccountPage /> },
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
                index: true,
                element: <AdminDashboard />
              }
            ]
          },
          {
            path: "products",
            element: <ProductManager />
          },
          {
            path: "orders",
            element: <OrderManager />
          },
          {
            path: "users",
            element: <UserManager />
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
