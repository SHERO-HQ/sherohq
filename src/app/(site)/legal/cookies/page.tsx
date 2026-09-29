import type { Metadata } from "next";
import { ConsentSettings } from "@/components/analytics/ConsentSettings";
import { LegalPage } from "@/components/legal/LegalPage";
import { missing } from "@/lib/content";
import { CONSENT_COOKIE } from "@/lib/analytics";
import { CART_COOKIE, PLACED_COOKIE } from "@/lib/cart";
import { business, routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookies",
  description: "The cookies sherohq.com uses, what each one is for, and how to change your choice.",
  alternates: { canonical: routes.cookies },
};

const cookies = [
  { name: CONSENT_COOKIE, who: "SHERO", purpose: "Remembers whether you allowed analytics.", lasts: "6 months" },
  { name: CART_COOKIE, who: "SHERO", purpose: "Remembers which devices are in your cart.", lasts: "30 days" },
  {
    name: PLACED_COOKIE,
    who: "SHERO",
    purpose: "Shows your order confirmation after checkout. Holds only the order number.",
    lasts: "1 day",
  },
  { name: "_ga, _ga_*", who: "Google Analytics", purpose: "Counts visits and tells returning visitors apart.", lasts: "Up to 2 years" },
  { name: "_clck", who: "Microsoft Clarity", purpose: "Tells returning visitors apart.", lasts: "1 year" },
  { name: "_clsk", who: "Microsoft Clarity", purpose: "Groups page views into one visit.", lasts: "1 day" },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies"
      current={routes.cookies}
      updated={missing("date")}
      intro={
        <p>
          Cookies are small files a website stores in your browser. We use a few of our own to make the site work, and
          analytics cookies only if you allow them.
        </p>
      }
      sections={[
        {
          id: "choice",
          title: "Your choice",
          body: (
            <>
              <p>
                Google Analytics and Microsoft Clarity only run after you choose &ldquo;Allow analytics&rdquo;. You can
                change your mind here at any time.
              </p>
              <ConsentSettings />
            </>
          ),
        },
        {
          id: "list",
          title: "The cookies we use",
          body: (
            <div className="overflow-x-auto">
              <table className="w-full min-w-130 border-collapse text-left text-body">
                <thead>
                  <tr className="border-b border-border font-mono text-meta text-ink-muted">
                    <th className="py-2.5 pr-4 font-normal">cookie</th>
                    <th className="py-2.5 pr-4 font-normal">set by</th>
                    <th className="py-2.5 pr-4 font-normal">what it&rsquo;s for</th>
                    <th className="py-2.5 font-normal">lasts</th>
                  </tr>
                </thead>
                <tbody>
                  {cookies.map((cookie) => (
                    <tr key={cookie.name} className="border-b border-border align-top">
                      <td className="py-3 pr-4 font-mono text-meta">{cookie.name}</td>
                      <td className="py-3 pr-4">{cookie.who}</td>
                      <td className="py-3 pr-4 text-ink-secondary">{cookie.purpose}</td>
                      <td className="py-3 whitespace-nowrap text-ink-secondary">{cookie.lasts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: "data",
          title: "What analytics can see",
          body: (
            <p>
              Which pages are visited, roughly where visitors are, what device and browser they use, and how they move
              through a page. We keep analytics data for 14 months. We never send your name, phone number or order
              details to either service.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Questions",
          body: (
            <p>
              Email{" "}
              <a href={`mailto:${business.email}`} className="font-medium text-primary underline underline-offset-3">
                {business.email}
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
