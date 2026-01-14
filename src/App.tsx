import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loading } from "@/components/ui/loading";

import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./hooks/use-auth";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Eager load critical public pages for better UX (no spinner on nav)
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";

// Lazy load secondary and admin pages
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminAddProducts = lazy(() => import("./pages/AdminAddProducts"));
const AdminManageProducts = lazy(() => import("./pages/AdminManageProducts"));
const AdminInquiries = lazy(() => import("./pages/AdminInquiries"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<Loading variant="fullscreen" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={
                <ProtectedRoute reason="gallery">
                  <Gallery />
                </ProtectedRoute>
              } />
              
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/auth" element={<Auth />} />
              
              <Route
                path="/admin/products/add"
                element={
                  <AdminRoute>
                    <AdminAddProducts />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products/manage"
                element={
                  <AdminRoute>
                    <AdminManageProducts />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products/inquiries"
                element={
                  <AdminRoute>
                    <AdminInquiries />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
