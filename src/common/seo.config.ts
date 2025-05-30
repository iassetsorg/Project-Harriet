/**
 * SEO Configuration for iBird - Decentralized Social Media Platform
 * Contains meta tags, Open Graph data, Twitter cards, and structured data
 */

import { socialLinks, getSocialStructuredData } from "./social-links.config";

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  author?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  structuredData?: any;
}

export const defaultSEO: SEOConfig = {
  title: "iBird | Web3 Social Media Platform",
  description:
    "Join iBird - the decentralized social media platform built on Hedera Hashgraph. Connect, share, and engage in a Web3 community-driven experience.",
  keywords: [
    "iBird",
    "web3",
    "social media",
    "Hedera",
    "HBAR",
    "ASSET",
    "blockchain",
    "decentralized",
    "crypto",
    "community",
    "iAssets",
    "NFT profiles",
    "censorship resistant",
    "creator economy",
    "tipping",
    "Arweave",
  ],
  author: "iAssets",
  canonical: "https://ibird.io",
  ogType: "website",
  ogImage: "/banner.png",
  ogImageAlt: "iBird - Web3 Social Media Platform",
  twitterCard: "summary_large_image",
  twitterSite: socialLinks.twitter.username,
  twitterCreator: socialLinks.twitter.username,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iBird",
    description:
      "Decentralized social media platform built on Hedera Hashgraph",
    url: socialLinks.website.url,
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "iAssets",
      url: socialLinks.organization.url,
    },
    featureList: [
      "Decentralized social media",
      "NFT profiles",
      "Creator tipping",
      "Censorship resistance",
      "Blockchain-based content",
    ],
    ...getSocialStructuredData(),
  },
};

export const pageSEO = {
  explore: {
    title: "Explore | iBird - Discover Web3 Content",
    description:
      "Discover and explore the latest posts, threads, and polls on iBird. Join the conversation in the decentralized social media revolution.",
    keywords: [
      ...defaultSEO.keywords,
      "explore",
      "discover",
      "posts",
      "threads",
      "polls",
      "content feed",
    ],
    ogType: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Explore iBird",
      description: "Discover and explore decentralized social media content",
      isPartOf: {
        "@type": "WebSite",
        name: "iBird",
        url: "https://ibird.io",
      },
    },
  },

  profile: {
    title: "Profile | iBird - Manage Your Web3 Identity",
    description:
      "Create and manage your decentralized profile on iBird. Your profile is an NFT that you truly own and control.",
    keywords: [
      ...defaultSEO.keywords,
      "profile",
      "NFT profile",
      "web3 identity",
      "decentralized identity",
      "user profile",
    ],
    ogType: "profile",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: "User Profile",
      description: "Decentralized user profile page",
      isPartOf: {
        "@type": "WebSite",
        name: "iBird",
        url: "https://ibird.io",
      },
    },
  },

  thread: {
    title: "Thread | iBird - Join the Conversation",
    description:
      "Participate in decentralized discussions and threads on iBird. Every message is permanently stored on the blockchain.",
    keywords: [
      ...defaultSEO.keywords,
      "thread",
      "discussion",
      "conversation",
      "blockchain messages",
      "decentralized chat",
    ],
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "DiscussionForumPosting",
      isPartOf: {
        "@type": "WebSite",
        name: "iBird",
        url: "https://ibird.io",
      },
    },
  },

  post: {
    title: "Post | iBird - Web3 Social Content",
    description:
      "View and interact with decentralized social media posts on iBird. Support creators with direct tipping.",
    keywords: [
      ...defaultSEO.keywords,
      "post",
      "social media post",
      "creator content",
      "tipping",
      "engagement",
    ],
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SocialMediaPosting",
      isPartOf: {
        "@type": "WebSite",
        name: "iBird",
        url: "https://ibird.io",
      },
    },
  },

  poll: {
    title: "Poll | iBird - Community Voting",
    description:
      "Participate in community polls and voting on iBird. Your vote is recorded transparently on the blockchain.",
    keywords: [
      ...defaultSEO.keywords,
      "poll",
      "voting",
      "community poll",
      "blockchain voting",
      "transparency",
    ],
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Question",
      isPartOf: {
        "@type": "WebSite",
        name: "iBird",
        url: "https://ibird.io",
      },
    },
  },
};

export const generateSEOConfig = (
  page: keyof typeof pageSEO,
  customData?: Partial<SEOConfig>
): SEOConfig => {
  const baseConfig = pageSEO[page];
  return {
    ...defaultSEO,
    ...baseConfig,
    ...customData,
  };
};

export const generateDynamicSEO = (
  title: string,
  description: string,
  image?: string,
  url?: string
): SEOConfig => {
  return {
    ...defaultSEO,
    title: `${title} | iBird`,
    description,
    ogImage: image || defaultSEO.ogImage,
    canonical: url,
    structuredData: {
      ...defaultSEO.structuredData,
      url: url,
    },
  };
};
