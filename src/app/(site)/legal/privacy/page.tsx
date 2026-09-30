import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { Fill } from "@/components/ui/Fill";
import { missing } from "@/lib/content";
import { business, routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What SHERO collects when you use sherohq.com, why, how long we keep it and what you can ask us to do with it.",
  alternates: { canonical: routes.privacy },
};

// Retention periods must match docs/admin-scope.md, which the admin enforces.
// TODO(owner): lawyer review; accountant to confirm the order retention period.
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      current={routes.privacy}
      updated={missing("date")}
      intro={
        <p>
          This page explains what we collect when you use sherohq.com, why, and what you can ask us to do with it.
          We&rsquo;ve kept it plain on purpose.
        </p>
      }
      sections={[
        {
          id: "collect",
          title: "What we collect",
          body: (
            <p>
              When you order, book a consultation or contact us, we collect your name, phone number, delivery details
              and, if you give it, your email. When you book a consultation, we also keep what you tell us about your
              business.
            </p>
          ),
        },
        {
          id: "use",
          title: "How we use it",
          body: (
            <p>
              To deliver your order, reply to your request, send your order number and tracking link, and provide
              support under our warranty. So we can reply quickly, a copy of each order, request or waitlist signup is
              emailed to SHERO&rsquo;s own inbox through our email provider, Resend. We don&rsquo;t sell your details.
            </p>
          ),
        },
        {
          id: "referrals",
          title: "Referrals",
          body: (
            <p>
              If you give us the phone number of someone who referred you, we use it to thank them. We only keep it if
              they agree when we contact them; otherwise we delete it.
            </p>
          ),
        },
        {
          id: "payments",
          title: "Payments",
          body: (
            <p>
              Payments by MoMo and card are processed by Hubtel and Paystack. We don&rsquo;t see or store your card
              number or MoMo PIN.
            </p>
          ),
        },
        {
          id: "analytics",
          title: "Analytics and cookies",
          body: (
            <p>
              We use Google Analytics and Microsoft Clarity to understand how people use this site. They use cookies,
              which you can accept or decline. See our{" "}
              <Link href={routes.cookies} className="font-medium text-primary underline underline-offset-3">
                Cookies page
              </Link>
              .
            </p>
          ),
        },
        {
          id: "retention",
          title: "How long we keep it",
          body: (
            <ul className="flex flex-col gap-2">
              <li>
                Orders and payments: <Fill value={missing("6")} scale={1} /> years, for tax records, then we remove
                your name and phone number.
              </li>
              <li>Consultation requests: 12 months after we last spoke, if no work followed.</li>
              <li>Waitlist signups: until 6 months after the product launches, or until you ask to leave.</li>
              <li>
                Referral numbers: until we contact them, at most 30 days after delivery, unless they agree to stay in
                touch.
              </li>
              <li>CVs: 12 months.</li>
              <li>Analytics data: 14 months.</li>
            </ul>
          ),
        },
        {
          id: "rights",
          title: "Your rights",
          body: (
            <p>
              You can ask to see, correct or delete the information we hold about you. Email{" "}
              <a href={`mailto:${business.email}`} className="font-medium text-primary underline underline-offset-3">
                {business.email}
              </a>{" "}
              and we&rsquo;ll respond within <Fill value={missing("X")} scale={1} /> days.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          body: (
            <p>
              SHERO, {business.city} · {business.email} · {business.phoneDisplay}
            </p>
          ),
        },
      ]}
    />
  );
}
