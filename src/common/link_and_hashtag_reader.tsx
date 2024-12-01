import React from "react";

/**
 * LinkAndHashtagReader is a React component that converts URLs, hashtags, and cashtags in text into clickable links.
 * - URLs are linked directly to their destinations
 * - Hashtags (#) are linked to Twitter/X's hashtag search
 * - Cashtags ($) are linked to Twitter/X's stock symbol search
 */

interface LinkAndHashtagReaderProps {
  message: string;
}

const LinkAndHashtagReader: React.FC<LinkAndHashtagReaderProps> = ({
  message,
}) => {
  /**
   * Processes the input message and converts matching patterns into clickable links
   * @param {string} message - The text content to be processed
   * @returns {JSX.Element} React elements with clickable links
   */
  const renderMessageWithLinks = (message: string) => {
    // Regular expressions for matching different patterns
    const urlRegex = /(https?:\/\/[^\s,]+)/g; // Matches URLs starting with http:// or https://
    const hashtagRegex = /#(\w+)/g; // Matches hashtags (#) followed by word characters
    const cashtagRegex = /\$([a-zA-Z]+)/g; // Matches cashtags ($) followed by letters

    // Combine all patterns into a single regex for efficient splitting
    const combinedRegex = new RegExp(
      `(${urlRegex.source}|${hashtagRegex.source}|${cashtagRegex.source})`,
      "g"
    );

    /**
     * Renders individual parts of the message based on their pattern match
     * @param {string} part - The text segment to be rendered
     * @param {number} index - React key for the element
     * @returns {JSX.Element} Appropriate link or text element
     */
    const renderPart = (part: string, index: number) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      } else if (hashtagRegex.test(part)) {
        return (
          <a
            key={index}
            href={`https://x.com/hashtag/${part.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      } else if (cashtagRegex.test(part)) {
        return (
          <a
            key={index}
            href={`https://x.com/search?q=%24${part.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    };

    // Split the message into parts, preserving the matched patterns
    const parts: string[] = [];
    let lastIndex = 0;

    // Use replace as a scanner to find all matches and build the parts array
    message.replace(combinedRegex, (match, ...args) => {
      const index = args[args.length - 2];
      parts.push(message.substring(lastIndex, index)); // Add text before match
      parts.push(match); // Add the matched pattern
      lastIndex = index + match.length;
      return match;
    });

    // Add any remaining text after the last match
    parts.push(message.substring(lastIndex));

    // Render all parts with appropriate linking
    return <>{parts.map((part, index) => renderPart(part, index))}</>;
  };

  return <>{renderMessageWithLinks(message)}</>;
};

export default LinkAndHashtagReader;
