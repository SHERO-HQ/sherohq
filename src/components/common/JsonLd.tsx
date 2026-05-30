import React from "react";

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://sherohq.com/#organization",
        "name": "SHERO HQ",
        "url": "https://sherohq.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://sherohq.com/shero.png",
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
        "@id": "https://sherohq.com/#localbusiness",
        "name": "SHERO Tech",
        "parentOrganization": {
          "@id": "https://sherohq.com/#organization"
        },
        "url": "https://sherohq.com",
        "telephone": "+233240000000",
        "email": "support@sherohq.com",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Shero Tech Hub, Spintex Road",
          "addressLocality": "Accra",
          "addressRegion": "Greater Accra",
          "postalCode": "GA-102-3920",
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
        "image": "https://sherohq.com/shero.png"
      },
      {
        "@type": "ProfessionalService",
        "@id": "https://sherohq.com/#software-solutions",
        "name": "SHERO Solutions",
        "parentOrganization": {
          "@id": "https://sherohq.com/#organization"
        },
        "url": "https://sherohq.com/solutions",
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
