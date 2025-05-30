/**
 * SEOHead Component - Manages document head for SEO optimization
 * Uses React Helmet to dynamically update meta tags, titles, and structured data
 */

import React from "react";
import { Helmet } from "react-helmet-async";
import { SEOConfig } from "../../common/seo.config";

interface SEOHeadProps {
  seoConfig: SEOConfig;
  noIndex?: boolean;
  noFollow?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  seoConfig,
  noIndex = false,
  noFollow = false,
}) => {
  const {
    title,
    description,
    keywords,
    author,
    canonical,
    ogType = "website",
    ogImage,
    ogImageAlt,
    twitterCard = "summary_large_image",
    twitterSite,
    twitterCreator,
    structuredData,
  } = seoConfig;

  const robotsContent = [
    noIndex ? "noindex" : "index",
    noFollow ? "nofollow" : "follow",
  ].join(", ");

  const currentUrl =
    canonical || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robotsContent} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      <meta property="og:site_name" content="iBird" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && (
        <meta name="twitter:creator" content={twitterCreator} />
      )}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}

      {/* Additional Meta Tags for Web3/Blockchain */}
      <meta name="application-name" content="iBird" />
      <meta name="apple-mobile-web-app-title" content="iBird" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#000000" />

      {/* Security and Privacy */}
      <meta name="referrer" content="origin-when-cross-origin" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Additional Links */}
      <link rel="icon" href="/icon.png" />
      <link rel="apple-touch-icon" href="/icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />

      {/* DNS prefetch for better performance */}
      <link rel="dns-prefetch" href="//arweave.net" />
      <link rel="dns-prefetch" href="//mainnet-public.mirrornode.hedera.com" />
      <link rel="dns-prefetch" href="//testnet.mirrornode.hedera.com" />
    </Helmet>
  );
};

export default SEOHead;
