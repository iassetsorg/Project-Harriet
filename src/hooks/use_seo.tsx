/**
 * Custom hook for dynamic SEO management across iBird components
 * Provides utilities for generating SEO configurations for specific content
 */

import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  SEOConfig,
  generateSEOConfig,
  generateDynamicSEO,
  defaultSEO,
} from "../common/seo.config";

interface UseSEOProps {
  title?: string;
  description?: string;
  image?: string;
  contentType?: "thread" | "post" | "poll" | "profile" | "explore";
  author?: string;
  content?: string;
  timestamp?: string;
}

interface UseSEOReturn {
  seoConfig: SEOConfig;
  updateSEO: (props: Partial<UseSEOProps>) => SEOConfig;
}

export const useSEO = (props: UseSEOProps = {}): UseSEOReturn => {
  const location = useLocation();
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const seoConfig = useMemo(() => {
    const {
      title,
      description,
      image,
      contentType,
      author,
      content,
      timestamp,
    } = props;

    // If we have specific content type, use the predefined configuration
    if (contentType && !title && !description) {
      return generateSEOConfig(contentType, {
        canonical: currentUrl,
      });
    }

    // If we have custom title and description, generate dynamic SEO
    if (title && description) {
      let enhancedDescription = description;

      // Add author context if available
      if (author) {
        enhancedDescription = `By ${author}. ${description}`;
      }

      // Add content preview if available (truncate to reasonable length)
      if (content && content.length > 0) {
        const contentPreview = content.substring(0, 100);
        enhancedDescription = `${enhancedDescription} "${contentPreview}${
          content.length > 100 ? "..." : ""
        }"`;
      }

      // Add timestamp context for time-sensitive content
      if (timestamp) {
        const date = new Date(parseInt(timestamp) * 1000);
        enhancedDescription = `${enhancedDescription} Posted on ${date.toLocaleDateString()}.`;
      }

      return generateDynamicSEO(title, enhancedDescription, image, currentUrl);
    }

    // If we have content type but no specific title/description
    if (contentType) {
      return generateSEOConfig(contentType, {
        canonical: currentUrl,
      });
    }

    // Fallback to default SEO
    return {
      ...defaultSEO,
      canonical: currentUrl,
    };
  }, [props, currentUrl]);

  const updateSEO = (newProps: Partial<UseSEOProps>): SEOConfig => {
    const updatedProps = { ...props, ...newProps };

    if (updatedProps.title && updatedProps.description) {
      return generateDynamicSEO(
        updatedProps.title,
        updatedProps.description,
        updatedProps.image,
        currentUrl
      );
    }

    if (updatedProps.contentType) {
      return generateSEOConfig(updatedProps.contentType, {
        canonical: currentUrl,
      });
    }

    return {
      ...defaultSEO,
      canonical: currentUrl,
    };
  };

  return {
    seoConfig,
    updateSEO,
  };
};

// Specific hooks for common use cases
export const useThreadSEO = (threadData?: {
  title?: string;
  content?: string;
  author?: string;
  timestamp?: string;
  topicId?: string;
}) => {
  const title = threadData?.title
    ? `${threadData.title} - Thread Discussion`
    : "Thread Discussion";

  const description = threadData?.content
    ? `Join the discussion: ${threadData.content.substring(0, 150)}${
        threadData.content.length > 150 ? "..." : ""
      }`
    : "Join this decentralized thread discussion on iBird.";

  return useSEO({
    title,
    description,
    contentType: "thread",
    author: threadData?.author,
    content: threadData?.content,
    timestamp: threadData?.timestamp,
  });
};

export const usePostSEO = (postData?: {
  content?: string;
  author?: string;
  timestamp?: string;
  media?: string;
}) => {
  const title = postData?.author ? `Post by ${postData.author}` : "iBird Post";

  const description = postData?.content
    ? `${postData.content.substring(0, 160)}${
        postData.content.length > 160 ? "..." : ""
      }`
    : "View this post on iBird, the decentralized social media platform.";

  return useSEO({
    title,
    description,
    contentType: "post",
    author: postData?.author,
    content: postData?.content,
    timestamp: postData?.timestamp,
    image: postData?.media,
  });
};

export const usePollSEO = (pollData?: {
  question?: string;
  options?: string[];
  author?: string;
  timestamp?: string;
}) => {
  const title = pollData?.question
    ? `Poll: ${pollData.question}`
    : "Community Poll";

  const description =
    pollData?.question && pollData?.options
      ? `Vote on: ${pollData.question} Options: ${pollData.options.join(", ")}`
      : "Participate in this community poll on iBird.";

  return useSEO({
    title,
    description,
    contentType: "poll",
    author: pollData?.author,
    content: pollData?.question,
    timestamp: pollData?.timestamp,
  });
};
