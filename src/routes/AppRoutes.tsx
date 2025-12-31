import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import About from "@/pages/About";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="about-us" element={<About />} />
    </Routes>
  );
};

export default AppRoutes;
