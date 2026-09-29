import type { Metadata } from "next";
import { Placeholder } from "@/components/ui/Placeholder";
import { business, routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "No open roles right now at SHERO in Tamale, but we'd still like to hear from you. Send your CV and something you've made.",
  alternates: { canonical: routes.careers },
};

const include = [
  {
    title: "What you're good at",
    text: "A few lines, in your own words. Titles matter less than what you can do.",
    textMobile: "In your own words.",
  },
  {
    title: "Something you've made",
    text: "A link to work, code, designs or a project you're proud of.",
    textMobile: "A link to work you're proud of.",
  },
  {
    title: "How to reach you",
    text: "Your phone number and where you're based.",
    textMobile: "Your phone number and where you're based.",
  },
];

const lookFor = [
  { name: "Purpose", text: "We build things that solve real problems." },
  { name: "Integrity", text: "We're honest about what we can do." },
  { name: "Ownership", text: "We see the work through." },
  { name: "Reliability", text: "People depend on what we build." },
];

// TODO(admin phase): list open roles from the admin's Careers section above this message.
const cvMail = `mailto:${business.email}?subject=${encodeURIComponent("Careers · ")}`;

export default function CareersPage() {
  return (
    <>
      <section className="container-site grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-22 py-section">
        <div className="flex flex-col gap-5 lg:gap-7">
          <h1 className="font-display text-h1 text-heading">
            Build with us.
          </h1>
          <p className="max-w-measure text-body-lg text-ink-secondary">
            There are no open roles right now. If you&rsquo;d like to help build technology that makes more possible,
            from Tamale, we&rsquo;d still like to hear from you.
          </p>
          <div className="flex flex-col gap-2 rounded-md border border-border bg-surface px-5 py-5 lg:px-6 lg:py-5.5">
            <span className="text-body-sm text-ink-secondary">Send your CV to</span>
            <a
              href={cvMail}
              className="self-start font-display text-h2 text-heading hover:underline"
            >
              {business.email}
            </a>
            <span className="font-mono text-meta text-ink-muted">subject: careers · your name</span>
          </div>
          <div className="flex flex-col lg:mt-2">
            <span className="pb-1.5 text-body font-medium text-ink">Include:</span>
            {include.map((item) => (
              <div key={item.title} className="flex flex-col gap-1.5 border-t border-border py-4 lg:py-5">
                <span className="font-display text-h3 text-heading">
                  {item.title}
                </span>
                <span className="text-body-sm lg:text-body text-ink-secondary">
                  <span className="lg:hidden">{item.textMobile}</span>
                  <span className="hidden lg:inline">{item.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <figure className="flex flex-col gap-3">
          <Placeholder
            label="Screenshot: a system SHERO built"
            className="hidden h-155 rounded-md border border-border bg-surface lg:flex"
          />
          {/* Retention promise from docs/admin-scope.md: CVs kept 12 months. */}
          <figcaption className="text-body-sm text-ink-secondary">
            We keep CVs for 12 months and reach out if a role opens that fits.
          </figcaption>
        </figure>
      </section>

      <section className="border-t border-border bg-surface py-10 py-section">
        <div className="container-site grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <h2 className="font-display text-h2 text-heading">
            What we look for.
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2 lg:gap-x-12 lg:gap-y-8">
            {lookFor.map((value) => (
              <div key={value.name} className="flex flex-col gap-1.5">
                <dt className="font-display text-h2 text-heading">
                  {value.name}
                </dt>
                <dd className="text-body lg:text-body-lg text-ink-secondary">{value.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
