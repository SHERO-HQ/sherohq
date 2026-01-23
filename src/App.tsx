import Nav from "./components/layout/Nav";
import { ThemeProvider } from "./context/Theme";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/cart/CartDrawer";
import ScrollToTop from "./components/common/ScrollToTop";

const App = () => {
  return (
    <ThemeProvider>
      <CartProvider>
        <ScrollToTop />
        <Nav />
        <CartDrawer />
        <AppRoutes />
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
