import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import useUploadToIPFS from "../hooks/use_upload_to_ipfs";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";

import ReadIPFSData from "./read_ipfs_data";
import Spinner from "../utils/Spinner";
import { MdOutlinePermMedia } from "react-icons/md";
const UploadToIPFS = () => {
  const { uploadToNFTStorage, uploading, ipfsHash, error, progress } =
    useUploadToIPFS();
  const [file, setFile] = useState<File | null>(null);

  // Handle dropped files
  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1, // Limit the dropzone to accept only a single file
  });

  const maxSize = 100 * 1024 * 1024; // 100 MB

  const fileExceedsSize = file && file.size > maxSize;

  // Handle upload
  const handleUpload = async () => {
    handleClear();
    if (!file) {
      toast("Please select a file to upload");
      return;
    }
    if (fileExceedsSize) {
      toast.error("The file exceeds 100MB.");
      return;
    }
    await uploadToNFTStorage(file);
  };
  // Handle clear
  const handleClear = () => {
    setFile(null);
  };
  // Rest of your component remains the same
  return (
    <div className="flex items-center justify-center bg-gray-700 border border-gray-500 rounded text-white">
      <div className="w-full max-w-md p-6">
        <div className="p-3  rounded   text-center ">
          <p className="text-xl font-semibold ">
            <span>
              <MdOutlinePermMedia className="text-4xl inline-flex mr-3  text-white" />
            </span>
            IPFS Media Storage
          </p>
        </div>
        {!uploading && !file && (
          <div {...getRootProps()} className="space-y-1 text-center">
            <div className="border-4 border-dashed border-gray-500 rounded-md my-6 p-6">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-lg">Drop the files here...</p>
              ) : (
                <p className="text-lg">
                  Drag and drop file <br /> or <br />
                  Click to select file
                </p>
              )}
            </div>
          </div>
        )}
        {!uploading && file && (
          <div className="border-4 border-dashed border-gray-500 rounded-md my-6 p-6">
            <p className="text-lg text-center">{`Selected File: ${file?.name}`}</p>
            {file?.type.startsWith("image/") && (
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="mt-4 max-w-full rounded-md"
              />
            )}
            <button
              onClick={handleClear}
              className=" py-1 px-4 font-semibold text-gray-800 mouse:cursor-confined bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300"
            >
              Clear
            </button>
          </div>
        )}

        {!uploading ? (
          <button
            onClick={handleUpload}
            className="w-full  py-3 px-6 font-semibold text-gray-800 mouse:cursor-confined bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300"
          >
            Upload
          </button>
        ) : (
          <Spinner />
        )}
        {ipfsHash && (
          <div className="mt-4 text-center text-green-500">
            IPFS Hash:
            <br />
            <a
              href={`https://ipfs.io/ipfs/${ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ipfsHash}
            </a>
            File: <br />
            <ReadIPFSData cid={ipfsHash} />
          </div>
        )}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default UploadToIPFS;
