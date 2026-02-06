interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

import { Helmet } from "react-helmet-async";

const Seo = ({
  title,
  description,
  image,
  url,
  type = "website",
}: SeoProps) => {
  const siteTitle = "SHERO - Redefine Possible";
  const defaultDescription =
    "Innovative technology solutions that scale to elevate people, businesses, and communities. Premium tech products, consultation, partnerships, and custom software development.";
  const siteUrl = "https://www.sherohq.com"; // Replace with actual domain when live
  const defaultImage = "/og-image.jpg"; // You should ensure this image exists in public folder

  const metaTitle = title ? `${title} | SHERO` : siteTitle;
  const metaDescription = description || defaultDescription;
  let metaImage: string;
  if (image) {
    metaImage = image.startsWith("http") ? image : `${siteUrl}${image}`;
  } else {
    metaImage = `${siteUrl}${defaultImage}`;
  }
  const metaUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content="SheroTech" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
};

export default Seo;
