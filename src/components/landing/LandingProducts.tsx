import { motion } from "motion/react";
import { NavLink } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/data/products";

const LandingProducts = () => {
  // Products data with extended fields for detail view
  const products: Product[] = [
    {
      id: "1",
      name: "Wireless Earbuds Pro",
      category: "Accessories",
      price: 400,
      image: "🎧",
      images: ["🎧", "🎵", "🔊"],
      rating: 4.8,
      reviews: 156,
      badge: "Best Seller",
      inStock: true,
      description:
        "Premium wireless earbuds with active noise cancellation and 30-hour battery life.",
      features: [
        "Active Noise Cancellation",
        "30-hour battery",
        "Premium sound quality",
      ],
      specifications: {
        "Battery Life": "30 hours",
        Bluetooth: "5.2",
        Charging: "USB-C Fast Charge",
      },
    },
    {
      id: "2",
      name: "USB-C Hub 7-in-1",
      category: "Accessories",
      price: 200,
      image: "🔌",
      rating: 4.6,
      reviews: 89,
      inStock: true,
      description:
        "Versatile 7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader.",
      features: ["7 ports", "4K HDMI output", "Fast data transfer"],
    },
    {
      id: "4",
      name: "Laptop",
      category: "Laptops",
      price: 120,
      image: "💻",
      rating: 4.7,
      reviews: 234,
      badge: "New Arrival",
      inStock: true,
    },
    {
      id: "5",
      name: "Wireless Mouse",
      category: "Accessories",
      price: 100,
      image: "🖱️",
      rating: 4.5,
      reviews: 67,
      inStock: true,
    },
    {
      id: "6",
      name: "Protective Phone Case",
      category: "Mobile",
      price: 35,
      image: "📱",
      rating: 4.4,
      reviews: 145,
      inStock: true,
    },
    {
      id: "7",
      name: "Ultra Slim Laptop Pro",
      category: "Laptop",
      price: 4500,
      image: "💻",
      images: ["💻", "⌨️", "🖥️", "🔋"],
      rating: 4.9,
      reviews: 312,
      badge: "Premium",
      inStock: true,
      description:
        "High-performance laptop with premium build quality and all-day battery life.",
      features: [
        "Intel i7 Processor",
        "16GB RAM",
        "512GB SSD",
        "14-hour battery",
      ],
      specifications: {
        Processor: "Intel Core i7",
        RAM: "16GB DDR4",
        Storage: "512GB NVMe SSD",
        Display: "14-inch Retina",
      },
    },
  ];

  const categories = ["All", "Laptop", "Accessories", "Mobile"];
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const getFilteredProducts = () => {
    if (activeCategory === "All") {
      return products;
    }
    return products.filter((product) => product.category === activeCategory);
  };

  const filteredProducts = getFilteredProducts();

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
          <span className="inline-flex items-center px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <ShoppingCart className="mr-2 w-4 h-4" />
            Featured Products
          </span>
          <h2 className="text-4xl md:text-5xl font-sora font-bold text-slate-900 dark:text-slate-200 mb-4">
            Premium Tech Products
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Elevate your tech experience with our curated collection of
            high-quality products designed to enhance your digital lifestyle
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded text-sm font-medium transition-all duration-300 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950
                ${
                  activeCategory === category
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="cursor-pointer grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
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
            to="/products"
            className="inline-flex items-center gap-3 px-8 py-3 rounded
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

export default LandingProducts;
