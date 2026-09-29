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
      <section className="container-site grid gap-8 pt-8 pb-12 lg:grid-cols-2 lg:items-start lg:gap-[88px] lg:pt-24 lg:pb-[104px]">
        <div className="flex flex-col gap-5 lg:gap-7">
          <h1 className="font-display text-[44px]/[46px] font-bold tracking-[-0.03em] text-heading lg:text-[80px]/[83px] lg:tracking-[-0.035em]">
            Build with us.
          </h1>
          <p className="max-w-[540px] text-[17px]/[26px] text-ink-secondary lg:text-xl/[31px]">
            There are no open roles right now. If you&rsquo;d like to help build technology that makes more possible,
            from Tamale, we&rsquo;d still like to hear from you.
          </p>
          <div className="flex flex-col gap-2 rounded-md border border-border bg-surface px-5 py-5 lg:px-6 lg:py-[22px]">
            <span className="text-[13px]/[18px] text-ink-secondary lg:text-sm/5">Send your CV to</span>
            <a
              href={cvMail}
              className="self-start font-display text-[21px]/7 font-semibold text-heading hover:underline lg:text-2xl/[30px]"
            >
              {business.email}
            </a>
            <span className="font-mono text-xs/4 text-ink-muted lg:text-[13px]/[18px]">subject: careers · your name</span>
          </div>
          <div className="flex flex-col lg:mt-2">
            <span className="pb-1.5 text-[15px]/[22px] font-medium text-ink">Include:</span>
            {include.map((item) => (
              <div key={item.title} className="flex flex-col gap-1.5 border-t border-border py-4 lg:py-5">
                <span className="font-display text-[17px]/[23px] font-semibold text-heading lg:text-xl/[26px]">
                  {item.title}
                </span>
                <span className="text-sm/[21px] text-ink-secondary lg:text-base/[25px]">
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
            className="hidden h-[620px] rounded-md border border-border bg-surface lg:flex"
          />
          {/* Retention promise from docs/admin-scope.md: CVs kept 12 months. */}
          <figcaption className="text-sm/5 text-ink-secondary">
            We keep CVs for 12 months and reach out if a role opens that fits.
          </figcaption>
        </figure>
      </section>

      <section className="border-t border-border bg-surface py-10 lg:pt-[88px] lg:pb-[104px]">
        <div className="container-site grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <h2 className="font-display text-[26px]/[29px] font-bold text-heading lg:text-[40px]/[44px] lg:tracking-[-0.025em]">
            What we look for.
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2 lg:gap-x-12 lg:gap-y-8">
            {lookFor.map((value) => (
              <div key={value.name} className="flex flex-col gap-1.5">
                <dt className="font-display text-[22px]/7 font-bold text-heading lg:text-[28px]/8 lg:tracking-[-0.015em]">
                  {value.name}
                </dt>
                <dd className="text-base/[25px] text-ink-secondary lg:text-[17px]/[26px]">{value.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
