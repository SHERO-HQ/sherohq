import type { Metadata } from "next";
import Cookies from "@/views/Cookies";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how Shero Technologies uses cookies to improve your experience.",
};

export default function CookiesPage() {
  return <Cookies />;
}
