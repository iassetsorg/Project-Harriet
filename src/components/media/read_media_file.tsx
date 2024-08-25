import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
interface Props {
  cid: string | null;
}

// This utility fetches the media URL based on its CID
const getMediaURL = (cid: string): string | null => {
  if (cid.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${cid.slice("ipfs://".length)}`;
  } else if (cid.startsWith("ar://")) {
    return `https://akrd.net/${cid.slice("ar://".length)}`;
  }
  console.error("Unsupported CID format:", cid);
  return null;
};

const ReadMediaFile: React.FC<Props> = ({ cid }) => {
  const [mediaElement, setMediaElement] = useState<JSX.Element | null>(null);

  useEffect(() => {
    if (!cid) return;

    const url = getMediaURL(cid);
    if (!url) return;

    const determineMediaTypeAndRender = async (url: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const mimeType = blob.type;

        const objectURL = URL.createObjectURL(blob);
        if (mimeType.startsWith("image/")) {
          // For images: wrap the <img> tag in an <a> tag
          setMediaElement(
            <a href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={objectURL}
                alt="Media Content"
                style={{ maxWidth: "100%", cursor: "pointer" }}
              />
            </a>
          );
        } else if (mimeType.startsWith("video/")) {
          setMediaElement(
            <ReactPlayer
              url={objectURL}
              controls
              width="100%"
              height="100%"
              className="max-w-full md:w-4xl"
            />
          );
        } else if (mimeType.startsWith("audio/")) {
          setMediaElement(
            <audio controls>
              <source src={objectURL} type={mimeType} />
            </audio>
          );
        }
        // Add more conditions as necessary
      } catch (error) {
        console.error("Error fetching media:", error);
      }
    };

    determineMediaTypeAndRender(url);
  }, [cid]);

  return <div className="media-preview">{mediaElement}</div>;
};

export default ReadMediaFile;
