import type { Metadata } from "next";
import SupportGuideDetail from "@/views/support/SupportGuideDetail";

interface Props {
 params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const { slug } = await params;
 const title = slug
 .split("-")
 .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
 .join(" ");

 return {
 title,
 description: `SHERO support guide: ${title}.`,
 };
}

export default function SupportGuideDetailPage() {
 return <SupportGuideDetail />;
}
