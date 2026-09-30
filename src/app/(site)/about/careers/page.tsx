import type { Metadata } from "next";
import { business, routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "No open roles right now at SHERO in Tamale, but we'd still like to hear from you. Send your CV and something you've made.",
  alternates: { canonical: routes.careers },
};

const include = [
  { title: "What you're good at", text: "A few lines, in your own words. Titles matter less than what you can do." },
  { title: "Something you've made", text: "A link to work, code, designs or a project you're proud of." },
  { title: "How to reach you", text: "Your phone number and where you're based." },
];

// TODO(admin phase): list open roles from the admin's Careers section above this message.
const cvMail = `mailto:${business.email}?subject=${encodeURIComponent("Careers · ")}`;

export default function CareersPage() {
  return (
    <section className="container-site py-section">
      <div className="flex max-w-2xl flex-col gap-5 lg:gap-7">
        <h1 className="font-display text-h1 text-heading">Work with SHERO.</h1>
        <p className="max-w-measure text-body-lg text-ink-secondary">
          There are no open roles right now. If you build software or look after hardware and want to work from
          Tamale, we&rsquo;d still like to hear from you.
        </p>
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
