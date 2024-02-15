import { useState, useCallback } from "react";
import axios from "axios";

const useUploadToIPFS = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);

  let hash = null;

  const uploadToNFTStorage = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      const ipfsKey = localStorage.getItem("ipfsKey");

      if (!ipfsKey) {
        throw new Error(
          "IPFS key not found. Please set the key in local storage."
        );
      }

      const config = {
        headers: {
          Authorization: `Bearer ${ipfsKey}`,
          "Content-Type": file.type, // or you can hardcode to "application/octet-stream"
        },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total || 1
          );
          setProgress(percentCompleted);
        },
      };

      const response = await axios.post(
        "https://api.nft.storage/upload",
        file,
        config
      );

      const nftStorageResult = response.data;
      hash = `ipfs://${nftStorageResult.value.cid}`;
      setIpfsHash(hash);
      setUploading(false);
    } catch (error) {
      setError(
        (error as Error).message ||
          "An error occurred while uploading to NFT.STORAGE"
      );
      setUploading(false);
    }
  }, []);

  return { uploadToNFTStorage, uploading, ipfsHash, error, progress };
};

export default useUploadToIPFS;
