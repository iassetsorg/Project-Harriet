/**
 * useUploadToArweave is a custom React hook that handles file uploads to Arweave storage.
 * Features:
 * - Progress tracking
 * - Error handling
 * - Upload status management
 * - Arweave ID retrieval
 */

/**
 * Custom hook for managing file uploads to Arweave storage
 * Returns an object containing:
 * - uploadToArweave: Function to handle file upload
 * - uploading: Boolean indicating upload status
 * - progress: Number indicating upload progress (0-100)
 * - error: String containing error message if any
 * - arweaveId: String containing the Arweave transaction ID after successful upload
 */

import { useState, useCallback } from "react";
import axios from "axios";

const useUploadToArweave = () => {
  // State management for upload process
  const [uploading, setUploading] = useState(false); // Track upload status
  const [progress, setProgress] = useState(0); // Track upload progress
  const [error, setError] = useState<string | null>(null); // Store error messages
  const [arweaveId, setArweaveId] = useState<string | null>(null); // Store Arweave ID

  /**
   * Main upload function that handles the file upload process
   * @param {File} file - The file to be uploaded to Arweave
   * @returns {Promise<string>} - Returns the Arweave URL in format "ar://{id}"
   * @throws {Error} - Throws error if upload fails
   */
  const uploadToArweave = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);
      const apiKey = "LYzUaEbjLW5Fc2TQCzuq1731UCPIguHwaGQn3MAb";

      // Configure axios request with headers and progress tracking
      const config = {
        headers: {
          Accept: "application/json",
          "Api-Key": apiKey,
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent: any) => {
          // Calculate and update upload progress percentage
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total || 1
          );
          setProgress(percentCompleted);
        },
      };

      // Make POST request to Akord API
      const response = await axios.post(
        "https://api.akord.com/files",
        file,
        config
      );

      // Extract and store Arweave transaction ID
      const arweaveResult = response.data;
      const id = arweaveResult.tx.id;
      setArweaveId(id);
      setUploading(false);
      return `ar://${id}`; // Return the Arweave URL
    } catch (error) {
      // Handle and store error state
      setError(
        (error as Error).message ||
          "An error occurred while uploading to Arweave"
      );
      setUploading(false);
      throw error; // Rethrow for caller handling
    }
  }, []);

  // Return hook interface
  return { uploadToArweave, uploading, arweaveId, error, progress };
};

export default useUploadToArweave;
