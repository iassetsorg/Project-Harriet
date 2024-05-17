// useUploadToArweave.ts
import { useState, useCallback } from "react";
import axios from "axios";

const useUploadToArweave = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [arweaveId, setArweaveId] = useState<string | null>(null);

  const uploadToArweave = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);
      const apiKey = "LYzUaEbjLW5Fc2TQCzuq1731UCPIguHwaGQn3MAb";

      const config = {
        headers: {
          Accept: "application/json",
          "Api-Key": apiKey,
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total || 1
          );
          setProgress(percentCompleted);
        },
      };
      const response = await axios.post(
        "https://api.akord.com/files",
        file,
        config
      );
      const arweaveResult = response.data;
      const id = arweaveResult.tx.id;
      setArweaveId(id);
      setUploading(false);
      return `ar://${id}`; // Return the ID directly here
    } catch (error) {
      setError(
        (error as Error).message ||
          "An error occurred while uploading to Arweave"
      );
      setUploading(false);
      throw error; // Rethrow the error to handle it in the caller
    }
  }, []);

  return { uploadToArweave, uploading, arweaveId, error, progress };
};

export default useUploadToArweave;
