import React from "react";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { COMPANY_EMAILS } from "@/constants/emails";

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `https://${COMPANY_CONTACTS.WEBSITE}/#organization`,
        "name": "SHERO HQ",
        "url": `https://${COMPANY_CONTACTS.WEBSITE}`,
        "logo": {
          "@type": "ImageObject",
          "url": `https://${COMPANY_CONTACTS.WEBSITE}/shero.png`,
          "width": "1200",
          "height": "630"
        },
        "sameAs": [
          "https://twitter.com/sherohq",
          "https://linkedin.com/company/sherohq",
          "https://github.com/sherohq"
        ]
      },
      {
        "@type": "LocalBusiness",
        "@id": `https://${COMPANY_CONTACTS.WEBSITE}/#localbusiness`,
        "name": "SHERO",
        "parentOrganization": {
          "@id": `https://${COMPANY_CONTACTS.WEBSITE}/#organization`
        },
        "url": `https://${COMPANY_CONTACTS.WEBSITE}`,
        "telephone": `+${COMPANY_CONTACTS.WHATSAPP}`,
        "email": COMPANY_EMAILS.SUPPORT,
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Shero Tech Hub, Jisonayili Road",
          "addressLocality": "Tamale",
          "addressRegion": "Northern",
          "postalCode": "NS-124-3920",
          "addressCountry": "GH"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "5.6037",
          "longitude": "-0.1870"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:00",
            "closes": "18:00"
          }
        ],
        "image": `https://${COMPANY_CONTACTS.WEBSITE}/shero.png`
      },
      {
        "@type": "ProfessionalService",
        "@id": `https://${COMPANY_CONTACTS.WEBSITE}/#software-solutions`,
        "name": "SHERO Solutions",
        "parentOrganization": {
          "@id": `https://${COMPANY_CONTACTS.WEBSITE}/#organization`
        },
        "url": `https://${COMPANY_CONTACTS.WEBSITE}/solutions`,
        "description": "High-performance custom platforms, software engineering, managed enterprise IT infrastructure, and cloud systems designed to grow with your ambitions.",
        "areaServed": [
          {
            "@type": "Country",
            "name": "Ghana"
          },
          {
            "@type": "Country",
            "name": "Nigeria"
          },
          {
            "@type": "Country",
            "name": "Kenya"
          }
        ],
        "offers": {
          "@type": "Offer",
          "description": "Custom Software Development, API Integration, and IT Management Services"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
