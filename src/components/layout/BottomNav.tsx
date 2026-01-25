import { Home, ShoppingBag, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useCart } from "@/context/CartContext";

// interface BottomNavProps {
//   onMenuClick: () => void;
// }

const BottomNav = () => {
  const { setIsCartOpen, totalQuantity } = useCart();
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: ShoppingBag, label: "Products", path: "/products" },
    { icon: ShoppingCart, label: "Cart", path: "/cart" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 md:hidden pb-safe">
      <nav className="flex justify-around items-center h-14 py-2">
        {navItems.map((item) => {
          if (item.label === "Cart") {
            return (
              <button
                key={item.label}
                onClick={() => setIsCartOpen(true)}
                aria-label={`Open Cart (${totalQuantity} items)`}
                className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors relative"
              >
                <item.icon className="w-6 h-6" strokeWidth={2} />
                <span className="text-[12px] font-medium">{item.label}</span>
                {totalQuantity > 0 && (
                  <span className="absolute top-1 right-1/2 translate-x-4 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-bold text-white">
                    {totalQuantity}
                  </span>
                )}
              </button>
            );
          }
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`
              }
            >
              <item.icon className="w-6 h-6" strokeWidth={2} />
              <span className="text-[12px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}

        {/* <button
          onClick={onMenuClick}
          className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <Menu className="w-6 h-6" strokeWidth={2} />
          <span className="text-[10px] font-medium">Menu</span>
        </button> */}
      </nav>
    </div>
  );
};

export default BottomNav;
