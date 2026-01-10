import { useState, useEffect } from "react";
// import { AnimatePresence } from "motion/react";
import ProductHero from "@/components/ProductsHero";
import ProductCategories from "@/components/ProductsCategories";
import { defaultCategories } from "@/utils/defaultCategories";
import  type { Category } from "@/components/ProductsCategories"
import ProductFilters from "@/components/ProductFilters";
import type { FilterState } from "@/components/ProductFilters"
import ProductGrid from "@/components/ProductsGrid";
import type { Product } from "@/components/ProductCard";

// Sample products data - Replace with your actual products
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "MacBook Pro 16\" M3",
    category: "laptops",
    price: 8999,
    originalPrice: 9999,
    image: "💻",
    rating: 4.9,
    reviews: 245,
    badge: "Best Seller",
    inStock: true,
  },
  {
    id: "2",
    name: "iPhone 15 Pro Max",
    category: "phones",
    price: 4599,
    image: "📱",
    rating: 4.8,
    reviews: 892,
    badge: "New",
    inStock: true,
  },
  {
    id: "3",
    name: "Sony WH-1000XM5",
    category: "audio",
    price: 1299,
    originalPrice: 1499,
    image: "🎧",
    rating: 4.7,
    reviews: 456,
    inStock: true,
  },
  {
    id: "4",
    name: "Dell UltraSharp 27\"",
    category: "monitors",
    price: 2199,
    image: "🖥️",
    rating: 4.6,
    reviews: 178,
    inStock: true,
  },
  {
    id: "5",
    name: "Logitech MX Keys",
    category: "keyboards",
    price: 399,
    image: "⌨️",
    rating: 4.8,
    reviews: 324,
    badge: "Popular",
    inStock: true,
  },
  {
    id: "6",
    name: "Logitech MX Master 3S",
    category: "mice",
    price: 349,
    image: "🖱️",
    rating: 4.9,
    reviews: 567,
    inStock: false,
  },
  {
    id: "7",
    name: "Samsung T7 SSD 2TB",
    category: "storage",
    price: 899,
    originalPrice: 1099,
    image: "💾",
    rating: 4.7,
    reviews: 289,
    inStock: true,
  },
  {
    id: "8",
    name: "USB-C Hub",
    category: "accessories",
    price: 149,
    image: "🔌",
    rating: 4.5,
    reviews: 412,
    inStock: true,
  },
];

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    brands: [],
    minRating: 0,
    inStock: false,
    sortBy: "newest",
  });

  // Add product counts to categories
  const categoriesWithCount: Category[] = defaultCategories.map((cat) => ({
    ...cat,
    count: cat.id === "all" 
      ? sampleProducts.length 
      : sampleProducts.filter((p) => p.category === cat.id).length,
  }));

  // Filter and sort products
  const getFilteredProducts = (): Product[] => {
    let filtered = [...sampleProducts];

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter((p) => p.rating >= filters.minRating);
    }

    // Filter by stock
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.inStock);
    }

    // Sort products
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default: // newest
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 500);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    console.log("Add to cart:", product);
    // Implement your cart logic here
    alert(`Added ${product.name} to cart!`);
  };

  // Handle quick view
  const handleQuickView = (product: Product) => {
    console.log("Quick view:", product);
    // Implement your quick view modal here
    alert(`Quick view: ${product.name}`);
  };

  // Close mobile filters when clicking outside
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobileFilters]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <ProductHero
        onSearch={handleSearch}
        onFilterToggle={() => setShowMobileFilters(true)}
      />

      {/* Categories */}
      <ProductCategories
        categories={categoriesWithCount}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* Products Grid - Full Width on Mobile */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {activeCategory === "all" ? "All Products" : 
                   categoriesWithCount.find(c => c.id === activeCategory)?.name}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
                </p>
              </div>
            </div>

            {/* Products */}
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              onAddToCart={handleAddToCart}
              onQuickView={handleQuickView}
              columns={3}
            />
          </main>
        </div>
      </div>

      {/* Mobile Filters */}
      <ProductFilters
        filters={filters}
        onFilterChange={setFilters}
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
      />
    </div>
  );
};

export default ShopPage;