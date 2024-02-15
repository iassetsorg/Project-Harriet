import React, { useEffect, useState } from "react";

interface Props {
  cid: string | null;
}

const ReadIPFSData: React.FC<Props> = ({ cid }) => {
  const [fileURL, setFileURL] = useState<string | null>("");
  const [fileElement, setFileElement] = useState<JSX.Element | null>(null);

  useEffect(() => {
    if (cid) {
      const url = `https://ipfs.io/ipfs/${cid.slice("ipfs://".length)}`;
      setFileURL(url);
      getFileTypeAndContent(url);
    }
  }, [cid]);

  async function getFileType(url: string) {
    const response = await fetch(url, {
      method: "HEAD",
    });
    return response.headers.get("Content-Type");
  }

  const getFileTypeAndContent = async (url: string) => {
    let fileType = await getFileType(url);

    if (!fileType) {
      fileType = "application/octet-stream";
    }

    if (fileType.startsWith("image/")) {
      setFileElement(
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt="IPFS Content" className="" />{" "}
        </a>
      );
    } else if (fileType.startsWith("video/")) {
      setFileElement(
        <video controls className="">
          <source src={url} type={fileType} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (fileType.startsWith("audio/")) {
      setFileElement(
        <audio controls className="w-full">
          <source src={url} type={fileType} />
          Your browser does not support the audio tag.
        </audio>
      );
    } else {
      setFileElement(
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600"
        >
          Click to view resource
        </a>
      );
    }
  };

  return <div className="file-preview p-4">{fileElement}</div>;
};

export default ReadIPFSData;
