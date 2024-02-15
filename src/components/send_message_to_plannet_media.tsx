import React, { useState } from "react";
import { toast } from "react-toastify";
import useUploadToIPFS from "../hooks/use_upload_to_ipfs";
import { MdOutlinePermMedia } from "react-icons/md";
import { FiDelete } from "react-icons/fi";

import useSendMessage from "../hooks/use_send_message";
// Corrected the interface name to follow TypeScript conventions
interface SendMessageToPlanetProps {
  onClose: () => void;
}

interface Message {
  Message: string;
  Media?: string | null;
}

const SendMessageToPlanetModal: React.FC<SendMessageToPlanetProps> = ({
  onClose,
}) => {
  const { uploadToNFTStorage, uploading, ipfsHash, error } = useUploadToIPFS();
  const { send } = useSendMessage();

  const [message, setMessage] = useState<string>("");
  const [memo, setMemo] = useState<string>(""); // Uncomment if you plan to use memo
  const [file, setFile] = useState<File | null>(null);
  const maxSize = 100 * 1024 * 1024; // 100 MB

  const handleSend = async () => {
    if (!message) {
      toast("Please enter a message");
      return;
    }
    let messagePayload: Message = {
      Message: message,
    };

    try {
      if (file) {
        if (file.size > maxSize) {
          toast.error("The file exceeds 100MB.");
          return;
        }
        await uploadToNFTStorage(file);
        if (ipfsHash) {
          messagePayload.Media = ipfsHash;
        } else {
          throw new Error("Media upload to IPFS failed. Try again.");
        }
      }

      const topicId = "0.0.4320596";
      const posting = await send(topicId, messagePayload, memo);
      if (posting?.receipt.status.toString() === "SUCCESS") {
        toast("Message posted successfully");
        onClose();
      } else {
        throw new Error("Error posting message and media");
      }
    } catch (err) {
      toast.error((err as Error).message || "An error occurred");
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <div className="modal">
      <div className="modal-content max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl p-3 text-white">
        <h3 className="text-xl py-4 px-8 font-semibold text-indigo-300">
          Post on Planet
        </h3>

        {/* Message Section */}
        <section className="py-4 px-8">
          <label
            htmlFor="messageContent"
            className="block text-sm font-semibold text-gray-300"
          >
            Message:
          </label>
          <textarea
            className="w-full h-48 px-4 py-2 rounded-lg text-base bg-gray-700 text-white"
            id="messageContent"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </section>

        {/* File Upload Section */}
        <section>
          {!file && (
            <label
              htmlFor="fileUpload"
              className="cursor-pointer flex items-center justify-center p-4 border-2 border-dashed"
            >
              <input
                type="file"
                id="fileUpload"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
              <MdOutlinePermMedia className="text-xl" />
              <span>Add Media</span>
            </label>
          )}

          {file && (
            <div className="flex justify-center items-center p-4">
              <img
                src={URL.createObjectURL(file)}
                alt="Selected File"
                className="w-24 h-24 object-cover mr-4"
              />
              <FiDelete
                className="text-2xl hover:cursor-pointer"
                onClick={clearFile}
              />
            </div>
          )}
          {uploading && <p>Uploading Media to IPFS...</p>}
        </section>

        {error && <p className="text-red-500">{error}</p>}

        {/* Send Button */}
        <div className="text-center py-4">
          <button
            onClick={handleSend}
            className="w-full py-3 px-6 font-semibold text-gray-800 bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageToPlanetModal;
