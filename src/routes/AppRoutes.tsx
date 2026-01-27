import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "@/pages/Home";
import About from "@/pages/About";
import Products from "@/pages/Products";
import Solutions from "@/pages/Solutions";
import Consultation from "@/pages/Consultation";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Partners from "@/pages/Partners";
import Support from "@/pages/Support";
import FAQ from "@/pages/FAQ";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Cookies from "@/pages/Cookies";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Profile from "@/pages/auth/Profile";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import MockPaymentGateway from "@/pages/MockPaymentGateway";
// Admin imports
import { AdminProvider } from "@/context/AdminContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import ProductForm from "@/pages/admin/ProductForm";
import AdminReports from "@/pages/admin/AdminReports";
import AdminProfile from "@/pages/admin/AdminProfile";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="products" element={<Products />} />
      <Route path="products/:id" element={<ProductDetail />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="checkout/success" element={<CheckoutSuccess />} />
      <Route path="solutions" element={<Solutions />} />
      <Route path="consultation" element={<Consultation />} />
      <Route path="about-us" element={<About />} />
      <Route path="partners" element={<Partners />} />
      <Route path="support" element={<Support />} />
      <Route path="faq" element={<FAQ />} />
      <Route path="contact-us" element={<Contact />} />
      <Route path="terms" element={<Terms />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="cookies" element={<Cookies />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="profile" element={<Profile />} />
      <Route path="verify-email" element={<VerifyEmail />} />
      <Route path="mock-payment" element={<MockPaymentGateway />} />

      {/* Admin Routes */}
      <Route
        path="admin/*"
        element={
          <AdminProvider>
            <Routes>
              <Route path="login" element={<AdminLogin />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="products"
                element={
                  <ProtectedRoute>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="products/new"
                element={
                  <ProtectedRoute>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="products/:id/edit"
                element={
                  <ProtectedRoute>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AdminProvider>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
