"use client";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/services/api";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AppImage from "@/components/common/AppImage";

const CartDrawer = () => {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    totalPrice,
    totalQuantity,
  } = useCart();

  // Lock scroll
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl z-110 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sora">
                  Your Cart ({totalQuantity})
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close Cart"
                className="rounded-full"
              >
                <X className="w-6 h-6 text-slate-500" />
              </Button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Your cart is empty
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Time to add some premium tech!
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    variant="brand"
                    className="font-bold"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={item.id}
                    className="flex sm:flex-row gap-3 sm:gap-4 group border-b border-slate-200 dark:border-slate-700 pb-4"
                  >
                    <div className="relative w-24 h-32 sm:h-24 bg-slate-100 dark:bg-slate-800 rounded shrink-0 overflow-hidden">
                      {item.image.startsWith("http") ||
                      item.image.startsWith("/uploads") ? (
                        <AppImage
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center text-4xl">
                          {item.image}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="gap-2">
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            {item.category}
                          </p>
                          <h4 className="font-sora font-bold text-slate-900 dark:text-white truncate text-lg">
                            {item.name}
                          </h4>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Price: GH₵{item.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="">
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                              Total(x{item.quantity}):
                            </p>
                            <span className="font-bold font-sora text-slate-900 dark:text-white shrink-0">
                              GH₵{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded overflow-hidden h-8">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="cursor-pointer px-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                          </button>
                          <span className="w-8 text-center text-[12px] sm:text-sm font-bold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="cursor-pointer px-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors mt-3"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-slate-600 dark:text-slate-400">
                    Subtotal
                  </span>
                  <span className="text-slate-900 dark:text-white font-sora">
                    GH₵{totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Shipping and taxes calculated at checkout.
                </p>
                <Button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/checkout");
                  }}
                  variant="brand"
                  className="w-full h-12 font-bold group"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
