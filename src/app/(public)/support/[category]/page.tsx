import type { Metadata } from "next";
import SupportGuidesPage from "@/views/support/SupportGuidesPage";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const title = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${title} Support Guides`,
    description: `Browse SHERO support guides for ${title.toLowerCase()}.`,
  };
}

export default function SupportCategoryPage() {
  return <SupportGuidesPage />;
}
