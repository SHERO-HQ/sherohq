import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import About from "@/pages/About";
import Products from "@/pages/Products";
import Solutions from "@/pages/Solutions";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="products" element={<Products />} />
      <Route path="solutions" element={<Solutions />} />
      <Route path="about-us" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
