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
        // Await the hash directly from the upload function
        const uploadedHash = await uploadToNFTStorage(file);
        if (uploadedHash) {
          messagePayload.Media = uploadedHash;
        } else {
          throw new Error("Media upload to IPFS failed. Try again.");
        }
      }

      const topicId = "0.0.4320596";
      const posting = await send(topicId, messagePayload, memo);
      if (posting?.receipt.status.toString() === "SUCCESS") {
        toast("Message posted successfully");
        onClose();
        window.location.reload();
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
      <div className="modal-content max-w-md mx-auto bg-background rounded-lg shadow-xl p-3 text-text">
        <h3 className="text-xl py-4 px-8 font-semibold text-primary">
          Post on Planet
        </h3>

        <ul className="text-sm px-8">
          <li className="mb-2">
            The Planet is a publicly accessible forum functioning as an open
            bulletin board where everyone is welcome to post messages. However,
            it does not support interactive features like replies or likes.
          </li>
          <li className="mb-2">
            It provides a one-way communication channel for users to share
            announcements, updates, or general information with the entire
            community.
          </li>
          <li className="mb-2">
            Posting a message on the Planet costs only $0.0001, making it a
            cost-effective way to broadcast information on Hedera.
          </li>
        </ul>

        {/* Message Section */}
        <section className="py-4 px-8">
          <label
            htmlFor="messageContent"
            className="block mb-1 text-sm font-semibold text-text"
          >
            Message:
          </label>
          <textarea
            className="w-full h-48 px-4 py-2 rounded-lg text-base bg-secondary text-text"
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
              className="cursor-pointer flex items-center justify-center mx-4 p-4 border-2 border-dashed border-secondary"
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

        {error && <p className="text-error">{error}</p>}

        {/* Send Button */}
        <div className="text-center py-4">
          <button
            onClick={handleSend}
            className="w-full py-3 px-6 font-semibold text-background bg-primary rounded-full hover:accent transition duration-300"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageToPlanetModal;
