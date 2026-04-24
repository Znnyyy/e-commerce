import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "./store/useAuthStore";

const queryClient = new QueryClient();

useAuthStore.getState().checkAuth();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
