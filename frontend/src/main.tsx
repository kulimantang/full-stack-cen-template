import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";

import { StrictMode } from "react";
import { OpenAPI } from "./client";

import "@/globals.css";
import { ThemeProvider } from "./components/Theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

OpenAPI.BASE = import.meta.env.VITE_API_URL;
OpenAPI.BASE = OpenAPI.BASE || "";
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || "";
};

console.log(OpenAPI.BASE);

const queryClient = new QueryClient();

const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster richColors />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
