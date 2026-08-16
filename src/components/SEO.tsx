import { Helmet } from 'react-helmet-async';

const SITE_URL = "https://maa-fusion.vercel.app";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({ 
  title = "MaaFusion | Timeless Heritage. Digital Fusion.", 
  description = "MaaFusion blends traditional Indian artistry with contemporary digital design to create exquisite jewelry and Murti sculptures.",
  image = "/og-image.png",
  url = SITE_URL,
  type = "website"
}: SEOProps) {
  // Open Graph requires absolute URLs - crawlers do not resolve relative paths.
  const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  const siteTitle = title === "MaaFusion | Contemporary Jewelry & Murti Design" 
    ? title 
    : `${title} | MaaFusion`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={absoluteImage} />
    </Helmet>
  );
}
