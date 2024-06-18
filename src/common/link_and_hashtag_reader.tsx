import React from "react";

interface LinkAndHashtagReaderProps {
  message: string;
}

const LinkAndHashtagReader: React.FC<LinkAndHashtagReaderProps> = ({
  message,
}) => {
  const renderMessageWithLinks = (message: string) => {
    const urlRegex = /(https?:\/\/[^\s,]+)/g;
    const hashtagRegex = /#(\w+)/g;
    const cashtagRegex = /\$([a-zA-Z]+)/g;

    const combinedRegex = new RegExp(
      `(${urlRegex.source}|${hashtagRegex.source}|${cashtagRegex.source})`,
      "g"
    );

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

    const parts: string[] = [];
    let lastIndex = 0;

    message.replace(combinedRegex, (match, ...args) => {
      const index = args[args.length - 2];
      parts.push(message.substring(lastIndex, index));
      parts.push(match);
      lastIndex = index + match.length;
      return match; // Required by the replace callback
    });

    parts.push(message.substring(lastIndex));

    return <>{parts.map((part, index) => renderPart(part, index))}</>;
  };

  return <>{renderMessageWithLinks(message)}</>;
};

export default LinkAndHashtagReader;
