import { business, siteUrl } from "@/lib/site";
import { schedule } from "@/lib/hours";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pad = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

/**
 * Tells search engines what SHERO is and where: based in Tamale, serving all
 * of Ghana. Only facts that are true today; no ratings or reviews.
 */
export function BusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ComputerStore"],
    "@id": `${siteUrl}/#business`,
    name: business.name,
    url: siteUrl,
    logo: `${siteUrl}/assets/logo/shero.svg`,
    image: `${siteUrl}/opengraph-image`,
    email: business.email,
    telephone: business.phoneE164,
    description:
      "SHERO builds custom software, sells tested refurbished laptops and supports the technology businesses run on. Based in Tamale, delivering across Ghana.",
    address: {
      "@type": "PostalAddress",
      addressLocality: business.locality,
      addressRegion: business.region,
      addressCountry: business.country,
    },
    areaServed: [
      { "@type": "City", name: "Tamale" },
      { "@type": "Country", name: "Ghana" },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: schedule.openDays.map((d) => DAYS[d]),
      opens: pad(schedule.openHour),
      closes: pad(schedule.closeHour),
    },
    paymentAccepted: "Mobile Money, Visa, Mastercard, Cash",
    currenciesAccepted: "GHS",
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output from constants only; escape "<" so it can't close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
