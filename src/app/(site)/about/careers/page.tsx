import type { Metadata } from "next";
import { getOpenRoles } from "@/lib/careers";
import { business, routes } from "@/lib/site";

// Roles come from the admin; saving one refreshes this page.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const open = await getOpenRoles();
  return {
    title: "Careers",
    description: open.length
      ? `SHERO in Tamale is hiring: ${open.map((r) => r.title).join(", ")}. Send your CV and something you've made.`
      : "No open roles right now at SHERO in Tamale, but we'd still like to hear from you. Send your CV and something you've made.",
    alternates: { canonical: routes.careers },
  };
}

const include = [
  { title: "What you're good at", text: "A few lines, in your own words. Titles matter less than what you can do." },
  { title: "Something you've made", text: "A link to work, code, designs or a project you're proud of." },
  { title: "How to reach you", text: "Your phone number and where you're based." },
];

const cvMail = `mailto:${business.email}?subject=${encodeURIComponent("Careers · ")}`;

export default async function CareersPage() {
  const open = await getOpenRoles();
  return (
    <section className="container-site py-section">
      <div className="flex max-w-2xl flex-col gap-5 lg:gap-7">
        <h1 className="font-display text-h1 text-heading">Work with SHERO.</h1>
        {open.length === 0 ? (
          <p className="max-w-measure text-body-lg text-ink-secondary">
            There are no open roles right now. If you build software or look after hardware and want to work from
            Tamale, we&rsquo;d still like to hear from you.
          </p>
        ) : (
          <>
            <p className="max-w-measure text-body-lg text-ink-secondary">
              {open.length === 1 ? "One role is open" : `${open.length} roles are open`} in Tamale.
            </p>
            <ul className="flex flex-col gap-4">
              {open.map((role) => (
                <li key={role.id} className="flex flex-col gap-3 rounded-md border border-border bg-surface-raised p-5 lg:p-6">
                  <h2 className="font-display text-h3 text-heading">{role.title}</h2>
                  <p className="text-body whitespace-pre-line text-ink-secondary">{role.description}</p>
                  <p className="text-body-sm text-ink">
                    <span className="font-medium">How to apply: </span>
                    {role.howToApply}
                  </p>
                </li>
              ))}
            </ul>
            <p className="max-w-measure text-body text-ink-secondary">
              Not one of these, but want to work with us? We&rsquo;d still like to hear from you.
            </p>
          </>
        )}
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface px-5 py-5 lg:px-6 lg:py-5.5">
          <span className="text-body-sm text-ink-secondary">Send your CV to</span>
          <a href={cvMail} className="self-start font-display text-h2 text-heading hover:underline">
            {business.email}
          </a>
          <span className="font-mono text-meta text-ink-muted">subject: careers · your name</span>
        </div>
        <div className="flex flex-col lg:mt-2">
          <span className="pb-1.5 text-body font-medium text-ink">Include:</span>
          {include.map((item) => (
            <div key={item.title} className="flex flex-col gap-1.5 border-t border-border py-4 lg:py-5">
              <span className="font-display text-h3 text-heading">{item.title}</span>
              <span className="text-body text-ink-secondary">{item.text}</span>
            </div>
          ))}
        </div>
        {/* Retention promise from docs/admin-scope.md: CVs kept 12 months. */}
        <p className="border-t border-border pt-5 text-body-sm text-ink-secondary">
          We keep CVs for 12 months and get in touch if a role opens that fits.
        </p>
      </div>
    </section>
  );
}
