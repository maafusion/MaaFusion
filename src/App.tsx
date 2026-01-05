import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

import Gallery from "./pages/Gallery";
import AdminAddProducts from "./pages/AdminAddProducts";
import AdminManageProducts from "./pages/AdminManageProducts";
import AdminInquiries from "./pages/AdminInquiries";

import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./hooks/use-auth";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route
              path="/gallery"
              element={
                <ProtectedRoute reason="gallery">
                  <Gallery />
                </ProtectedRoute>
              }
            />
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
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
