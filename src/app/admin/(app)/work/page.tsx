import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/admin/Badge";
import { buttonClass } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { emptyProjectFields } from "@/lib/admin/project-form";
import { adminProjects } from "@/lib/admin/projects";

export const metadata: Metadata = { title: "Work" };

export default async function WorkAdminPage() {
  await requireAdmin();
  const rows = await adminProjects();
  return (
    <>
      <AdminHeader title="Work" meta={rows.length === 1 ? "1 project" : `${rows.length} projects`}>
        <Link href="/admin/work/new" className={buttonClass()}>
          <Plus aria-hidden="true" size={18} strokeWidth={1.5} />
          New project
        </Link>
      </AdminHeader>
      <div className="px-gutter py-6">
        <p className="mb-5 max-w-measure text-body-sm text-ink-secondary">
          Client projects for the Work page, their case studies and the &ldquo;We&rsquo;ve worked with&rdquo; row on Home.
          Show a project only with the client&rsquo;s permission.
        </p>
        {rows.length === 0 ? (
          <p className="py-8 text-body text-ink-secondary">No projects yet.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-left">
              <thead className="bg-surface font-mono text-meta text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-normal">project</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal md:table-cell">client</th>
                  <th scope="col" className="px-4 py-3 font-normal">on the site</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal sm:table-cell">case study</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((project) => {
                  const empty = emptyProjectFields(project).length;
                  return (
                    <tr key={project.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <Link href={`/admin/work/${project.id}`} className="text-body-sm font-medium text-heading hover:underline">
                          {project.name}
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3 text-body-sm text-ink md:table-cell">{project.client ?? <span className="text-ink-muted">–</span>}</td>
                      <td className="px-4 py-3">
                        {project.published ? <Badge tone="info">Shown</Badge> : <Badge tone="none">Hidden</Badge>}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        {empty === 0 ? <Badge tone="done">complete</Badge> : <Badge tone="todo">{empty} to write</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
