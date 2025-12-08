// components/SEO/SEO.tsx
// Reusable SEO component for per-page meta tags
import { FC, useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  canonicalUrl?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "Phoenix VC | Shaping Tomorrow's Technology";
const DEFAULT_DESCRIPTION =
  "Strategic investments and partnerships empowering innovation across the globe. Phoenix VC invests in visionary founders building transformative technology.";
const DEFAULT_OG_IMAGE = "https://phoenixvc.tech/og-image.png";
const SITE_URL = "https://phoenixvc.tech";

/**
 * SEO component for managing page-level meta tags
 * Updates document head with page-specific metadata
 */
const SEO: FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  canonicalUrl,
  noIndex = false,
}) => {
  const fullTitle = title ? `${title} | Phoenix VC` : DEFAULT_TITLE;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMeta = (
      name: string,
      content: string,
      isProperty = false,
    ): void => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(
        `meta[${attr}="${name}"]`,
      ) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Update description
    updateMeta("description", description);

    // Update keywords if provided
    if (keywords) {
      updateMeta("keywords", keywords);
    }

    // Update robots
    updateMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    // Open Graph tags
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:image", ogImage, true);
    updateMeta("og:url", canonicalUrl || window.location.href, true);
    updateMeta("og:site_name", "Phoenix VC", true);

    // Twitter Card tags
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", ogImage);

    // Canonical URL
    let canonical = document.querySelector(
      "link[rel=\"canonical\"]",
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl || `${SITE_URL}${window.location.pathname}`;

    // Cleanup function to reset to defaults when component unmounts
    return (): void => {
      document.title = DEFAULT_TITLE;
    };
  }, [
    fullTitle,
    description,
    keywords,
    ogImage,
    ogType,
    canonicalUrl,
    noIndex,
  ]);

  return null; // This component doesn't render anything
};

export { SEO };
export default SEO;
