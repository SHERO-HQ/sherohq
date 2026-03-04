"use client";
import { motion, AnimatePresence } from "motion/react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/services/api";
import { X, Heart, Trash2, ShoppingCart } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { type WishlistItem } from "@/context/WishlistContextType";

const WishlistDrawer = () => {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();
  const { addItem } = useCart();

  // Lock scroll
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isWishlistOpen]);

  const handleMoveToCart = (item: WishlistItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category || "",
    });
    removeFromWishlist(item.id);
  };

  const handleAddAllToCart = () => {
    wishlist.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category || "",
      });
    });
    clearWishlist();
    setIsWishlistOpen(false);
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsWishlistOpen(false)}
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
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sora">
                  Your Wishlist ({wishlist.length})
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWishlistOpen(false)}
                aria-label="Close Wishlist"
                className="rounded-full"
              >
                <X className="w-6 h-6 text-slate-500" />
              </Button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Wishlist is empty
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Save items you love for later!
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsWishlistOpen(false)}
                    variant="brand"
                    className="font-bold"
                  >
                    Explore Shop
                  </Button>
                </div>
              ) : (
                wishlist.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 group border-b border-slate-100 dark:border-slate-800 pb-4 sm:pb-0 sm:border-0"
                  >
                    <div className="w-full sm:w-24 h-32 sm:h-24 bg-slate-100 dark:bg-slate-800 rounded shrink-0 overflow-hidden">
                      {item.image.startsWith("http") ||
                      item.image.startsWith("/uploads") ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://placehold.co/200x200?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {item.image}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base">
                            {item.name}
                          </h4>
                          <span className="font-bold text-slate-900 dark:text-white shrink-0 text-sm sm:text-base">
                            GH₵{item.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            {item.category}
                          </p>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            aria-label={`Remove ${item.name} from wishlist`}
                            className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          variant="brand"
                          onClick={() => handleMoveToCart(item)}
                          className="h-8 gap-2 text-xs font-bold w-full sm:w-auto"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
              <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <Button
                  onClick={handleAddAllToCart}
                  variant="brand"
                  className="w-full h-12 font-bold group"
                >
                  Add All to Cart
                  <ShoppingCart className="w-5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => setIsWishlistOpen(false)}
                  variant="outline"
                  className="w-full h-12 font-bold"
                >
                  Continue Browsing
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
