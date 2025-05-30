/**
 * Social Media Links and Community Configuration for iBird
 * Centralized configuration for all social media and community links
 */

export interface SocialLink {
  name: string;
  url: string;
  username?: string;
  handle?: string;
  description?: string;
}

export const socialLinks = {
  website: {
    name: "iBird",
    url: "https://ibird.io",
    description: "Official iBird Website",
  },

  twitter: {
    name: "Twitter",
    url: "https://twitter.com/iAssetsOrg",
    username: "@iAssetsOrg",
    handle: "iAssetsOrg",
    description: "Follow iBird on Twitter for updates and announcements",
  },

  discord: {
    name: "Discord",
    url: "https://discord.com/invite/xM7SkkTEAG",
    description: "Join the iBird Discord community for discussions and support",
  },

  organization: {
    name: "iAssets",
    url: "https://iassets.org",
    description: "The organization behind iBird",
  },
};

// Social media meta tags helper
export const getSocialMetaTags = () => ({
  twitterSite: socialLinks.twitter.username,
  twitterCreator: socialLinks.twitter.username,
  ogUrl: socialLinks.website.url,
});

// Generate social media structured data
export const getSocialStructuredData = () => ({
  sameAs: [
    socialLinks.twitter.url,
    socialLinks.discord.url,
    socialLinks.organization.url,
  ],
});

// Community links for footer or about sections
export const getCommunityLinks = () => [
  {
    ...socialLinks.twitter,
    icon: "FaTwitter",
  },
  {
    ...socialLinks.discord,
    icon: "FaDiscord",
  },
];

export default socialLinks;
