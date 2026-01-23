import type { Category } from "@/components/products/ProductsCategories";
import {
  Laptop,
  Smartphone,
  // Headphones,
  // Monitor,
  // Keyboard,
  // Mouse,
  // HardDrive,
  Usb,
  Package,
  Monitor,
} from "lucide-react";

// Default categories with icons
export const defaultCategories: Category[] = [
  {
    id: "all",
    name: "All Products",
    icon: <Package className="w-6 h-6" />,
  },
  {
    id: "laptops",
    name: "Laptops",
    icon: <Laptop className="w-6 h-6" />,
  },
  {
    id: "phones",
    name: "Phones",
    icon: <Smartphone className="w-6 h-6" />,
  },
  // {
  //   id: "audio",
  //   name: "Audio",
  //   icon: <Headphones className="w-6 h-6" />,
  // },
  {
    id: "desktops",
    name: "Desktops",
    icon: <Monitor className="w-6 h-6" />,
  },
  // {
  //   id: "keyboards",
  //   name: "Keyboards",
  //   icon: <Keyboard className="w-6 h-6" />,
  // },
  // {
  //   id: "mice",
  //   name: "Mice",
  //   icon: <Mouse className="w-6 h-6" />,
  // },
  // {
  //   id: "storage",
  //   name: "Storage",
  //   icon: <HardDrive className="w-6 h-6" />,
  // },
  {
    id: "accessories",
    name: "Accessories",
    icon: <Usb className="w-6 h-6" />,
  },
];
