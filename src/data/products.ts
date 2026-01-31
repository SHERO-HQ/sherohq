export interface Product {
  id: string;
  name: string;
  sku?: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
  description?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

export const products: Product[] = [
  {
    id: "1",
    name: 'MacBook Pro 16" M3',
    category: "laptops",
    price: 8999,
    originalPrice: 9999,
    image: "💻",
    images: ["💻", "🖥️", "⌨️", "🖱️"],
    rating: 4.9,
    reviews: 245,
    badge: "Best Seller",
    inStock: true,
    description:
      "Experience the ultimate pro laptop. The new MacBook Pro features the M3 chip line, up to 22 hours of battery life, and the world's best laptop display.",
    features: [
      "Apple M3 Pro or M3 Max chip",
      "Up to 22 hours of battery life",
      "Liquid Retina XDR display",
      "Advanced camera and audio",
    ],
    specifications: {
      Processor: "Apple M3 Pro",
      Memory: "18GB Unified Memory",
      Storage: "512GB SSD",
      Display: '16.2" Liquid Retina XDR',
    },
  },
  {
    id: "2",
    name: "iPhone 15 Pro Max",
    category: "phones",
    price: 4599,
    image: "📱",
    images: ["📱", "🤳", "📲", "🔋"],
    rating: 4.8,
    reviews: 892,
    badge: "New",
    inStock: true,
    description:
      "The first iPhone to feature an aerospace-grade titanium design, using the same alloy that spacecraft use for missions to Mars.",
    features: [
      "A17 Pro chip",
      "Titanium design",
      "Action button",
      "48MP Main camera system",
    ],
    specifications: {
      Display: '6.7" Super Retina XDR',
      Processor: "A17 Pro chip",
      Camera: "48MP Main | Ultra Wide | Telephoto",
      Material: "Titanium",
    },
  },
  {
    id: "3",
    name: "Sony WH-1000XM5",
    category: "audio",
    price: 1299,
    originalPrice: 1499,
    image: "🎧",
    images: ["🎧", "🎵", "🔊", "📻"],
    rating: 4.7,
    reviews: 456,
    inStock: true,
    description:
      "Our best noise cancelling gets even better. See how these Sony noise cancelling headphones combine our best noise cancelling technology with superlative sound for a truly remarkable listening experience.",
    features: [
      "Industry-leading noise cancellation",
      "Magnificent sound, engineered to perfection",
      "Crystal clear hands-free calling",
      "Up to 30-hour battery life",
    ],
    specifications: {
      "Driver Unit": "30mm",
      "Frequency Response": "4Hz-40,000Hz",
      "Headphone Type": "Closed, dynamic",
      "Cord Length": "approx. 1.2m",
    },
  },
  {
    id: "4",
    name: 'Dell UltraSharp 27"',
    category: "monitors",
    price: 2199,
    image: "🖥️",
    rating: 4.6,
    reviews: 178,
    inStock: true,
    description:
      "Experience captivating visuals with this 27-inch 4K monitor featuring wide color coverage and ComfortView Plus.",
    features: [
      "4K UHD (3840 x 2160) Resolution",
      "IPS Technology",
      "USB-C Hub Monitor",
      "ComfortView Plus",
    ],
    specifications: {
      "Screen Size": '27"',
      Resolution: "3840 x 2160",
      "Panel Type": "IPS",
      "Refresh Rate": "60Hz",
    },
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
    description:
      "Introducing MX Keys - the key to mastering your next big project. It's the first ever MX keyboard – designed for creatives and engineered for coders.",
    features: [
      "Perfect Stroke Keys",
      "Smart Illumination",
      "Multi-Device & Multi-OS",
      "USB-C Rechargeable",
    ],
    specifications: {
      Connectivity: "Bluetooth / USB Receiver",
      "Battery Life": "up to 10 days",
      Backlighting: "Yes",
      Weight: "810g",
    },
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
    description:
      "Meet MX Master 3S – an iconic mouse remastered. Feel every moment of your workflow with even more precision, tactility, and performance.",
    features: [
      "8K DPI-Track-on-Glass Sensor",
      "Quiet Clicks",
      "Magspeed Scrolling",
      "App-Specific Customizations",
    ],
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
    description:
      "The light, pocket-sized Portable SSD T7 delivers fast speeds with easy and reliable data storage for transferring large files.",
    features: [
      "Transfer in a flash",
      "Built strong and safe",
      "Sophisticated thermal solution",
      "Sleek and compact style",
    ],
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
    description:
      "Expand your connectivity with this 7-in-1 USB-C hub. Features 4K HDMI, USB 3.0 ports, SD card readers, and Pass-Through charging.",
    features: [
      "7-in-1 Connectivity",
      "4K HDMI Output",
      "High-Speed Data Transfer",
      "Compact Design",
    ],
  },
  {
    id: "9",
    name: 'MacBook Pro 16" M3',
    category: "Desktops",
    price: 8999,
    originalPrice: 9999,
    image: "💻",
    rating: 4.9,
    reviews: 245,
    badge: "Best Seller",
    inStock: true,
    description:
      "Experience the ultimate pro laptop. The new MacBook Pro features the M3 chip line, up to 22 hours of battery life, and the world's best laptop display.",
    features: [
      "Apple M3 Pro or M3 Max chip",
      "Up to 22 hours of battery life",
      "Liquid Retina XDR display",
      "Advanced camera and audio",
    ],
  },
];
