import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <>
      <AdminHeader title="New project" />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <Link href="/admin/work" className="self-start text-label text-primary hover:underline">
          <InlineArrow direction="left" /> All projects
        </Link>
        <ProjectEditor project={null} saved={false} />
      </div>
    </>
  );
}
