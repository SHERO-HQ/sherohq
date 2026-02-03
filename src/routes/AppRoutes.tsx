import { Route, Routes, Navigate, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";
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
import Faq from "@/pages/FAQ";
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

// Lazy loaded Admin Pages
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));
const ProductForm = lazy(() => import("@/pages/admin/ProductForm"));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports"));
const AdminProfile = lazy(() => import("@/pages/admin/AdminProfile"));
const OrderDetails = lazy(() => import("@/pages/admin/OrderDetails"));
const AdminSupport = lazy(() => import("@/pages/admin/AdminSupport"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminProjects = lazy(() => import("@/pages/admin/AdminProjects"));
const ProjectForm = lazy(() => import("@/pages/admin/ProjectForm"));
import AdminGuides from "@/pages/admin/AdminGuides";
import AdminGuideEditor from "@/pages/admin/AdminGuideEditor";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";

// Public support pages
import SupportGuidesPage from "@/pages/support/SupportGuidesPage";
import SupportGuideDetail from "@/pages/support/SupportGuideDetail";

const AppLoading = () => (
  <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 bg-slate-50">
    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

import { getSubdomain } from "@/utils/subdomain";

const RedirectToShopProduct = () => {
  const { id } = useParams();
  return <Navigate to={`/shop/${id}`} replace />;
};

const AdminSection = () => (
  <Suspense fallback={<AppLoading />}>
    <BreadcrumbProvider>
      <AdminProvider>
        <Routes>
          {/* Handle cases where /admin prefix is still present on admin subdomain */}
          <Route path="admin/*" element={<AdminSectionInternal />} />
          <Route path="*" element={<AdminSectionInternal />} />
        </Routes>
      </AdminProvider>
    </BreadcrumbProvider>
  </Suspense>
);

const AdminSectionInternal = () => (
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
    <Route path="products/:id" element={<Navigate to="edit" replace />} />
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
      path="orders/:id"
      element={
        <ProtectedRoute>
          <OrderDetails />
        </ProtectedRoute>
      }
    />
    <Route
      path="users"
      element={
        <ProtectedRoute>
          <AdminUsers />
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
    <Route
      path="support"
      element={
        <ProtectedRoute>
          <AdminSupport />
        </ProtectedRoute>
      }
    />
    <Route
      path="guides"
      element={
        <ProtectedRoute>
          <AdminGuides />
        </ProtectedRoute>
      }
    />
    <Route
      path="projects"
      element={
        <ProtectedRoute>
          <AdminProjects />
        </ProtectedRoute>
      }
    />
    <Route
      path="projects/new"
      element={
        <ProtectedRoute>
          <ProjectForm />
        </ProtectedRoute>
      }
    />
    <Route
      path="projects/:id/edit"
      element={
        <ProtectedRoute>
          <ProjectForm />
        </ProtectedRoute>
      }
    />
    <Route
      path="guides/new"
      element={
        <ProtectedRoute>
          <AdminGuideEditor />
        </ProtectedRoute>
      }
    />
    <Route
      path="guides/edit/:id"
      element={
        <ProtectedRoute>
          <AdminGuideEditor />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const SupportSection = () => (
  <Routes>
    {/* Handle /support prefix on support subdomain */}
    <Route path="support/*" element={<SupportSectionInternal />} />
    <Route path="*" element={<SupportSectionInternal />} />
  </Routes>
);

const SupportSectionInternal = () => (
  <Routes>
    <Route path="" element={<Support />} />
    <Route path="faq" element={<Faq />} />
    <Route
      path=":category"
      element={
        <Suspense fallback={<AppLoading />}>
          <SupportGuidesPage />
        </Suspense>
      }
    />
    <Route
      path=":category/:slug"
      element={
        <Suspense fallback={<AppLoading />}>
          <SupportGuideDetail />
        </Suspense>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const ShopSection = () => (
  <Routes>
    {/* Handle /shop or /products prefix on shop subdomain */}
    <Route path="shop/*" element={<ShopSectionInternal />} />
    <Route path="products/*" element={<ShopSectionInternal />} />
    <Route path="checkout/*" element={<ShopSectionInternal />} />
    <Route path="*" element={<ShopSectionInternal />} />
  </Routes>
);

const ShopSectionInternal = () => (
  <Routes>
    <Route path="" element={<Products />} />
    <Route path=":id" element={<ProductDetail />} />
    <Route path="checkout" element={<Checkout />} />
    <Route path="checkout/success" element={<CheckoutSuccess />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const AppRoutes = () => {
  const subdomain = getSubdomain();

  // Route entirely based on subdomain if present
  if (subdomain === "admin") return <AdminSection />;
  if (subdomain === "support") return <SupportSection />;
  // 'shop' subdomain or 'products' fallback (legacy)
  if (subdomain === "shop") return <ShopSection />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="shop" element={<Products />} />
      <Route path="shop/:id" element={<ProductDetail />} />
      <Route path="products" element={<Navigate to="/shop" replace />} />
      <Route path="products/:id" element={<RedirectToShopProduct />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="checkout/success" element={<CheckoutSuccess />} />
      <Route path="solutions" element={<Solutions />} />
      <Route path="consultation" element={<Consultation />} />
      <Route path="about-us" element={<About />} />
      <Route path="partners" element={<Partners />} />
      <Route path="support" element={<Support />} />
      <Route path="faq" element={<Faq />} />
      <Route path="contact-us" element={<Contact />} />
      <Route path="terms" element={<Terms />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="cookies" element={<Cookies />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="profile" element={<Profile />} />
      <Route path="verify-email" element={<VerifyEmail />} />
      <Route path="mock-payment" element={<MockPaymentGateway />} />

      {/* Support Guide Routes */}
      <Route
        path="support/:category"
        element={
          <Suspense fallback={<AppLoading />}>
            <SupportGuidesPage />
          </Suspense>
        }
      />
      <Route
        path="support/:category/:slug"
        element={
          <Suspense fallback={<AppLoading />}>
            <SupportGuideDetail />
          </Suspense>
        }
      />

      {/* Admin Path-Based Routes (Compatibility) */}
      <Route path="admin/*" element={<AdminSection />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
