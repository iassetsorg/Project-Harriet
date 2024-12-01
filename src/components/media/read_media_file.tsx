/**
 * ReadMediaFile is a component that handles the display of different media types from IPFS or Arweave.
 * Features:
 * - Supports multiple media types (images, videos, audio)
 * - Handles IPFS and Arweave URLs
 * - Responsive media display
 * - Error handling with fallback UI
 */

import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";

/**
 * Props interface for ReadMediaFile
 * @property {string | null} cid - Content Identifier for IPFS or Arweave
 */
interface Props {
  cid: string | null;
}

/**
 * Utility function to convert CID to accessible URL
 * @param {string} cid - Content Identifier (IPFS or Arweave format)
 * @returns {string | null} - Converted URL or null if format is unsupported
 */
const getMediaURL = (cid: string): string | null => {
  if (cid.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${cid.slice("ipfs://".length)}`;
  } else if (cid.startsWith("ar://")) {
    return `https://akrd.net/${cid.slice("ar://".length)}`;
  }
  console.error("Unsupported CID format:", cid);
  return null;
};

/**
 * Component for displaying media content from IPFS or Arweave
 * Automatically detects and renders appropriate media player based on file type
 */
const ReadMediaFile: React.FC<Props> = ({ cid }) => {
  // State to hold the rendered media element
  const [mediaElement, setMediaElement] = useState<JSX.Element | null>(null);

  useEffect(() => {
    if (!cid) return;

    const url = getMediaURL(cid);
    if (!url) return;

    /**
     * Fetches media content and determines its type for appropriate rendering
     * @param {string} url - The URL of the media content
     */
    const determineMediaTypeAndRender = async (url: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const mimeType = blob.type;

        // Create object URL for media content
        const objectURL = URL.createObjectURL(blob);

        // Render different elements based on media type
        if (mimeType.startsWith("image/")) {
          // Image display with responsive sizing
          setMediaElement(
            <img
              src={objectURL}
              alt="Media Content"
              className="w-full h-full object-contain rounded-lg"
            />
          );
        } else if (mimeType.startsWith("video/")) {
          // Video player with aspect ratio preservation
          setMediaElement(
            <div className="aspect-video rounded-lg overflow-hidden">
              <ReactPlayer
                url={objectURL}
                controls
                width="100%"
                height="100%"
                className="max-w-full"
                playing={false}
                playsinline
              />
            </div>
          );
        } else if (mimeType.startsWith("audio/")) {
          // Audio player with background styling
          setMediaElement(
            <div className="w-full bg-secondary/20 rounded-lg p-4">
              <audio controls className="w-full">
                <source src={objectURL} type={mimeType} />
              </audio>
            </div>
          );
        }
      } catch (error) {
        // Error state with user feedback
        console.error("Error fetching media:", error);
        setMediaElement(
          <div className="text-error p-4 text-center bg-error/10 rounded-lg">
            Failed to load media content
          </div>
        );
      }
    };

    determineMediaTypeAndRender(url);
  }, [cid]);

  // Container with consistent width and media element
  return <div className="media-preview w-full">{mediaElement}</div>;
};

export default ReadMediaFile;
