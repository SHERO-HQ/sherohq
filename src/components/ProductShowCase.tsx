import { motion } from "motion/react";
import { NavLink } from "react-router-dom";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  badge?: string;
}

const ProductShowcase = () => {
  // Products data
  const products: Product[] = [
    {
      id: "1",
      name: "Wireless Earbuds Pro",
      category: "Accessories",
      price: 19,
      image: "🎧",
      rating: 4.8,
      badge: "Best Seller",
    },
    {
      id: "2",
      name: "USB-C Hub 7-in-1",
      category: "Accessories",
      price: 49,
      image: "🔌",
      rating: 4.6,
    },
    {
      id: "3",
      name: "Mechanical Keyboard",
      category: "Accessories",
      price: 19,
      image: "⌨️",
      rating: 4.9,
      badge: "New Arrival",
    },
    {
      id: "4",
      name: "Laptop Stand Aluminum",
      category: "Accessories",
      price: 79,
      image: "💻",
      rating: 4.7,
    },
    {
      id: "5",
      name: "Wireless Mouse",
      category: "Accessories",
      price: 69,
      image: "🖱️",
      rating: 4.5,
    },
    {
      id: "6",
      name: "Phone Case Premium",
      category: "Mobile",
      price: 29,
      image: "📱",
      rating: 4.4,
    },
  ];

  const categories = ["All", "Laptop", "Accessories", "Mobile"];
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Debug logs
//   console.log("Component rendered with activeCategory:", activeCategory);

  // Simple, clean filter function
  const getFilteredProducts = () => {
    // console.log("Filtering products for category:", activeCategory);
    if (activeCategory === "All") {
      return products;
    }
    const filtered = products.filter((product) => product.category === activeCategory);
    // console.log("Filtered result:", filtered.length, "products");
    return filtered;
  };

  const filteredProducts = getFilteredProducts();

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, y: 30 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.5,
//         ease: easeOut,
//       },
//     },
//   };

  return (
    <section className="relative w-full py-20 bg-white dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center px-4 py-1.5 mb-4 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <ShoppingCart className="mr-2 w-4 h-4" />
            Featured Products
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-200 mb-4">
            Premium Tech Accessories
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover our curated collection of high-quality tech products designed to enhance your digital lifestyle
          </p>
        </motion.div>

        {/* Debug Info - Remove this after testing */}
        <div className="text-center mb-4 text-sm text-slate-500">
          Active: {activeCategory} | Showing: {filteredProducts.length} products
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // console.log("Button clicked:", category);
                // console.log("Current state:", activeCategory);
                setActiveCategory(category);
                // console.log("Should now be:", category);
              }}
              className={`px-5 py-2 rounded text-sm font-medium transition-all duration-300 cursor-pointer
                ${activeCategory === category
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* {console.log("Rendering grid with", filteredProducts.length, "products")} */}
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
            //   console.log("Rendering product:", product.name);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className="group relative bg-slate-50 dark:bg-slate-900 rounded overflow-hidden
                           border border-slate-200 dark:border-slate-800
                           hover:border-emerald-500 dark:hover:border-emerald-500
                           hover:shadow-2xl hover:shadow-emerald-500/10
                           transition-all duration-300"
                >
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded text-xs font-semibold
                                bg-emerald-600 text-white">
                    {product.badge}
                  </div>
                )}

                {/* Image Container */}
                <div className="relative h-64 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700
                              flex items-center justify-center overflow-hidden">
                  <div className="text-8xl group-hover:scale-110 transition-transform duration-300">
                    {product.image}
                  </div>

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                                flex items-center justify-center transition-opacity duration-300">
                    <button className="px-6 py-2 bg-white text-slate-900 rounded font-semibold
                                     hover:bg-emerald-600 hover:text-white transition-colors duration-300 cursor-pointer">
                      Quick View
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Category */}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {product.category}
                  </span>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2 mb-3
                               group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                               transition-colors duration-300">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {product.rating}
                    </span>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-sora text-slate-900 dark:text-slate-100">
                      GH₵{product.price}
                    </span>
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded
                                     bg-emerald-600 hover:bg-emerald-700
                                     text-white font-semibold text-sm
                                     transition-all duration-300
                                     group-hover:gap-3 cursor-pointer">
                      <span>Add to Cart</span>
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No products found in this category
              </p>
            </div>
          )}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center"
        >
          <NavLink
            to="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 rounded
                     border-2 border-slate-300 dark:border-slate-700
                     text-slate-700 dark:text-slate-300 font-semibold
                     hover:border-emerald-500 dark:hover:border-emerald-500
                     hover:text-emerald-600 dark:hover:text-emerald-400
                     hover:shadow-lg
                     transition-all duration-300 group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductShowcase;