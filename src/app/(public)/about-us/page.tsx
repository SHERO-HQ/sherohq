import type { Metadata } from "next";
import About from "@/views/About";

export const metadata: Metadata = {
 title: "About Us",
 description:
 "Learn about SHERO | Our mission, team, values, and the story behind our technology solutions.",
};

export default function AboutPage() {
 return <About />;
}
