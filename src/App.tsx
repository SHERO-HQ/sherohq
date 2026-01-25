import { useLocation } from "react-router-dom";
import Nav from "./components/layout/Nav";
import { ThemeProvider } from "./context/Theme";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationProvider";
import CartDrawer from "./components/cart/CartDrawer";
import ScrollToTop from "./components/common/ScrollToTop";

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <ThemeProvider>
      <CartProvider>
        <AuthProvider>
          <NotificationProvider>
            <ScrollToTop />
            {!isAdminRoute && <Nav />}
            {!isAdminRoute && <CartDrawer />}
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
