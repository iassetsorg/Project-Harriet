import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { MdOutlinePermMedia } from "react-icons/md";
import { FiDelete } from "react-icons/fi";
import useSendMessage from "../../hooks/use_send_message";
import { useHashConnectContext } from "../../hashconnect/hashconnect";
import useProfileData from "../../hooks/use_profile_data";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdFileDownloadDone } from "react-icons/md";
import useUploadToArweave from "../media/use_upload_to_arweave";

const explorerTopic = process.env.REACT_APP_EXPLORER_TOPIC || "";

const SendNewPost = ({ onClose }: { onClose: () => void }) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { uploadToArweave, uploading, arweaveId, error } = useUploadToArweave();
  const { send } = useSendMessage();
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const { profileData } = useProfileData(signingAccount);
  const profileId = profileData ? profileData.UserMessages : "";
  const maxSize = 100 * 1024 * 1024; // 100 MB
  const [memo, setMemo] = useState(""); // Reintroduce memo for completeness

  const [isProcess, setIsProcess] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentStepStatus, setCurrentStepStatus] = useState(0);
  const isBreakRef = useRef(false);

  const breakStep = () => {
    isBreakRef.current = true;
    setIsBreak(true);
    onClose();
  };

  const clearFile = () => {
    setFile(null);
  };

  const handleSend = async () => {
    if (!message) {
      toast.error("Please enter a message");
      return;
    }

    let currentStep = 0;

    if (file && file.size > maxSize) {
      toast.error("The file exceeds 100MB.");
      setIsProcess(false);
      return;
    }

    let uploadedMediaId = null;

    setIsProcess(true);
    isBreakRef.current = false;

    while (currentStep < 2) {
      if (isBreak) {
        break;
      }

      if (currentStep === 0) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }

        if (file) {
          try {
            setIsProcess(true);
            uploadedMediaId = await uploadToArweave(file);
          } catch (e) {
            toast.error("Media upload failed. Try again.");
            setIsProcess(false);
            return;
          }
        }

        toast(`Posting on explorer, Step: ${currentStep + 1}`);
        const postPayload = {
          Type: "Post",
          Message: message,
          Media: uploadedMediaId || null,
        };

        const postExplorer = await send(explorerTopic, postPayload, memo);
        if (postExplorer?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(1);
          toast(`Posted on explorer, Step: ${currentStep + 1}`);
        }
      }

      if (currentStep === 1) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast(`Adding to Profile, Step: ${currentStep + 1}`);
        const postPayload = {
          Type: "Post",
          Message: message,
          Media: uploadedMediaId || null,
        };

        const postUserMessages = await send(profileId, postPayload, memo);
        if (postUserMessages?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(2);
          toast(`Posted on profile, Step: ${currentStep + 1}`);
        }
      }
    }

    setIsProcess(false);
    onClose();
    window.location.reload();
    toast.success("Post sent successfully!");
  };

  return (
    <div className="max-w-md mx-auto bg-background rounded-lg shadow-xl p-3 text-text">
      {!isProcess ? (
        <>
          <h3 className="text-xl pt-4 px-8 font-semibold text-primary">
            NEW POST
          </h3>

          <section className="mb-2 px-8">
            <label
              htmlFor="messageContent"
              className="block text-sm font-semibold text-text"
            >
              Message:
            </label>
            <textarea
              className="w-full h-48 mt-2 px-4 py-2 rounded-lg text-base bg-secondary text-text"
              id="messageContent"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={850}
            />
            <div className="text-right text-sm text-text mt-1">
              {message.length}/850
            </div>
          </section>

          <section>
            {!file && (
              <label
                htmlFor="fileUpload"
                className="cursor-pointer flex items-center justify-center mx-4 p-4 border-2 border-dashed mb-3 border-secondary"
              >
                <input
                  type="file"
                  id="fileUpload"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    e.target.files &&
                    e.target.files[0] &&
                    setFile(e.target.files[0])
                  }
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
            {error && <p className="text-error">{error}</p>}
          </section>

          <button
            onClick={handleSend}
            className="w-full py-3 px-6 font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300"
          >
            Send Post
          </button>
        </>
      ) : (
        <div className="p-4">
          <h1 className="text-text mb-3">Processing Post...</h1>
          <div className="mb-2">
            <span>Publishing to Explorer</span>
            <span>
              {currentStepStatus >= 1 ? (
                <MdFileDownloadDone className="text-xl text-success" />
              ) : (
                <HiOutlineDotsHorizontal className="text-xl text-waiting" />
              )}
            </span>
          </div>
          <div className="mb-2">
            <span>Posting to User Messages</span>
            <span>
              {currentStepStatus >= 2 ? (
                <MdFileDownloadDone className="text-xl text-success" />
              ) : (
                <HiOutlineDotsHorizontal className="text-xl text-waiting" />
              )}
            </span>
          </div>
          <button
            onClick={breakStep}
            className="w-full bg-error hover:bg-secondary text-text py-2 mt-3 px-4 rounded-full"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default SendNewPost;
