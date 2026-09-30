import type { Metadata } from "next";
import { Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { AdminTabs, tableHead, td, th } from "@/components/admin/parts";
import { RemoveSignup, SignupStatus } from "@/components/admin/WaitlistControls";
import { buttonClass } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { waitlistFor, waitlistProducts } from "@/lib/admin/waitlists";
import { formatGhanaDate } from "@/lib/dates";
import { displayPhone } from "@/lib/phone";

export const metadata: Metadata = { title: "Waitlists" };

const DAY = 24 * 60 * 60 * 1000;

export default async function WaitlistsPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  await requireAdmin();
  const lists = await waitlistProducts();
  const { product: slug } = await searchParams;
  const product = lists.find((p) => p.slug === slug) ?? lists[0];
  const rows = product ? await waitlistFor(product.id) : [];
  const total = lists.reduce((sum, p) => sum + p.signups, 0);
  const deleteOn = product?.launchedAt ? new Date(product.launchedAt.getTime() + 183 * DAY) : null;

  return (
    <>
      <AdminHeader title="Waitlists" meta={total === 1 ? "1 person" : `${total} people`}>
        {product && rows.length > 0 && (
          <a href={`/admin/waitlists/export?product=${product.id}`} className={buttonClass({ variant: "outline" })}>
            <Download aria-hidden="true" size={16} strokeWidth={1.5} /> Export CSV
          </a>
        )}
      </AdminHeader>
      <div className="flex flex-col gap-6 px-gutter py-6">
        {lists.length === 0 ? (
          <p className="py-8 text-body text-ink-secondary">No products in development, so no waitlists.</p>
        ) : (
          <>
            <AdminTabs
              label="Products"
              tabs={lists.map((p) => ({
                href: `/admin/waitlists?product=${p.slug}`,
                label: p.name,
                count: p.signups,
                current: p.id === product?.id,
              }))}
            />
            {rows.length === 0 ? (
              <p className="py-8 text-body text-ink-secondary">Nobody on the {product.name} list yet.</p>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-left">
                  <thead className={tableHead}>
                    <tr>
                      <th scope="col" className={th}>name</th>
                      <th scope="col" className={`${th} hidden md:table-cell`}>{product.businessLabel.toLowerCase()}</th>
                      <th scope="col" className={`${th} hidden sm:table-cell`}>phone</th>
                      <th scope="col" className={`${th} hidden lg:table-cell`}>{product.detailLabel.replace(/\?$/, "").toLowerCase()}</th>
                      <th scope="col" className={`${th} hidden xl:table-cell`}>joined</th>
                      <th scope="col" className={th}>status</th>
                      <th scope="col" className={th}><span className="sr-only">remove</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-t border-border align-top">
                        <td className={td}>
                          <span className="font-medium text-heading">{row.name}</span>
                          <span className="block text-ink-secondary sm:hidden">{displayPhone(row.phone)}</span>
                        </td>
                        <td className={`${td} hidden md:table-cell`}>{row.business}</td>
                        <td className={`${td} hidden whitespace-nowrap sm:table-cell`}>{displayPhone(row.phone)}</td>
                        <td className={`${td} hidden lg:table-cell`}>{row.detail}</td>
                        <td className={`${td} hidden whitespace-nowrap xl:table-cell`}>{formatGhanaDate(row.createdAt)}</td>
                        <td className={td}>
                          <SignupStatus id={row.id} status={row.status} name={row.name} />
                        </td>
                        <td className={td}>
                          <RemoveSignup id={row.id} name={row.name} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-body-sm text-ink-secondary">
              {deleteOn
                ? `${product.name} launched ${formatGhanaDate(product.launchedAt!)}. This list is deleted automatically on ${formatGhanaDate(deleteOn)}, 6 months after launch.`
                : "Kept until 6 months after launch, or until they ask to leave. Deleted automatically then."}
            </p>
          </>
        )}
      </div>
    </>
  );
}
