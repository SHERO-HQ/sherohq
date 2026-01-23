import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useEffect } from "react";

const CartDrawer = () => {
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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-101 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sora">
                  Your Cart ({totalQuantity})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Close Cart"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={item.id}
                    className="flex gap-4 group"
                  >
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-4xl shrink-0">
                      {item.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate pr-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        {item.category}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-8">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                          </button>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          GH₵{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 space-y-4">
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
                <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all group">
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
