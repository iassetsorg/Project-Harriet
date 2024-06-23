import { useState, useRef } from "react";
import { FaCheck } from "react-icons/fa";
import { useHashConnectContext } from "../../hashconnect/hashconnect";
import useProfileData from "../../hooks/use_profile_data";

import { toast } from "react-toastify";
import useSendMessage from "../../hooks/use_send_message";
import useCreateTopic from "../../hooks/use_create_topic";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdFileDownloadDone } from "react-icons/md";
import useUploadToArweave from "../media/use_upload_to_arweave";
import { MdOutlinePermMedia } from "react-icons/md";
import { FiDelete } from "react-icons/fi";
const explorerTopic = process.env.REACT_APP_EXPLORER_TOPIC || "";

interface Message {
  Message: string;
  Media?: string | null;
}

// Component for Creating a Topic
const SendNewThread = ({ onClose }: { onClose: () => void }) => {
  const [message, setMessage] = useState("");
  const { sendTransaction, pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const [topicMemo, setTopicMemo] = useState("");
  const [memo, setMemo] = useState("");
  const [submitKey, setSubmitKey] = useState(false);
  const { send } = useSendMessage();
  const { create } = useCreateTopic();
  const [publishExplore, setPublishExplore] = useState(true);
  const [addToProfile, setAddToProfile] = useState(true);
  const { profileData } = useProfileData(signingAccount);
  const profileId = profileData ? profileData.UserMessages : "";
  const [isProcess, setIsProcess] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentStepStatus, setCurrentStepStatus] = useState(0);
  const isBreakRef = useRef(false);

  const [file, setFile] = useState<File | null>(null);
  const maxSize = 100 * 1024 * 1024; // 100 MB
  const { uploadToArweave, uploading, arweaveId, error } = useUploadToArweave();

  // Steps

  let currentStep = 0;
  let topic = "";
  // Function for creating a topic
  /**
   * Creates a new thread by:
   * 1. Creating a thread topic
   * 2. Sending an initiating message to start the thread
   * 3. Optionally publishing the thread on Explore
   * 4. Optionally adding the thread to the user's profile
   * 5. Sending the thread message
   *
   * Steps are tracked through the currentStep variable.
   * Toasts provide user feedback at each step.
   */
  const breakStep = () => {
    isBreakRef.current = true;
    setIsBreak(true);
    onClose(); // Assuming you want to reset the process state as well
    // Additional logic if needed when breaking the process
  };

  const clearFile = () => {
    setFile(null);
  };
  const createThread = async () => {
    if (!message) {
      toast.error("Please enter a message to start the thread.");
      return;
    }

    setIsProcess(true);
    isBreakRef.current = false;

    while (currentStep < 5) {
      if (isBreak) {
        break;
      }

      // Creating Thread Topic
      if (currentStep === 0) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast(`Creating thread topic, Step: ${currentStep + 1}`);
        const topicId = await create("iBird Thread", topicMemo, submitKey);

        if (topicId) {
          currentStep++;
          setCurrentStepStatus(1);
          topic = topicId;
          toast(`Thread topic created, Step: ${currentStep + 1}`);
        }
      }

      // Sending Initiating Thread Message
      if (currentStep === 1) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast(`Sending initiating message, Step: ${currentStep + 1}`);
        const initiatingMessage = {
          Type: "Thread",
          Message: message,
          Media: null,
        };

        const initiatingThread = await send(topic, initiatingMessage, memo);
        if (initiatingThread?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(2);
          toast(`Initiating message sent, Step: ${currentStep + 1}`);
        }
      }

      // Optionally Publishing the Thread on Explore
      if (currentStep === 2 && publishExplore) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast(`Publishing thread on Explore, Step: ${currentStep + 1}`);
        const publishingMessage = {
          Type: "Thread",
          Message: message,
          Media: null,
        };

        const publishedOnExplore = await send(
          explorerTopic,
          publishingMessage,
          ""
        );
        if (publishedOnExplore?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(3);
          toast(`Thread published on Explore, Step: ${currentStep + 1}`);
        }
      }

      // Optionally Adding the Thread to the User's Profile
      if (currentStep === 3 && addToProfile) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast(`Adding thread to profile, Step: ${currentStep + 1}`);
        const profileMessage = {
          Type: "Thread",
          Message: message,
          Media: null,
        };

        const addedToProfile = await send(profileId, profileMessage, "");
        if (addedToProfile?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(4);
          toast(`Thread added to profile, Step: ${currentStep + 1}`);
        }
      }

      // Sending the Final Thread Message
      if (currentStep === 4) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast(`Sending final message, Step: ${currentStep + 1}`);
        const finalMessage = {
          Type: "Thread",
          Message: message,
          Media: null,
        };

        const finalThreadMessage = await send(topic, finalMessage, memo);
        if (finalThreadMessage?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(5);
          toast(`Final message sent, Step: ${currentStep + 1}`);
        }
      }
    }

    setIsProcess(false);
    onClose();
    window.location.reload();
    toast.success("Thread sent successfully!");
  };
  // Function to retry the current step

  return (
    <div className="max-w-md mx-auto bg-background rounded-lg shadow-xl p-3 text-text">
      {!isProcess ? (
        <>
          <h3 className="text-xl pt-4  px-8 font-semibold text-primary">
            NEW THREAD
          </h3>
          <section className="pb-4  px-8 ">
            <label
              htmlFor="messageContent"
              className=" text-sm font-semibold text-text"
            >
              Message:
            </label>
            <div className="mt-2">
              <textarea
                className="w-full h-48 px-4 py-2 rounded-lg text-base bg-secondary text-text"
                name="messageContent"
                id="messageContent"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={850}
              />
              <div className="text-right text-sm text-text mt-1">
                {message.length}/850
              </div>
            </div>
          </section>
          <section>
            {!file && (
              <label
                htmlFor="fileUpload"
                className="cursor-pointer flex items-center justify-center p-4 mx-4 border-2 border-dashed mb-3 border-secondary"
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
          {/* <section className="py-4 px-8">
            <label
              htmlFor="messageMemo"
              className="block text-sm font-semibold text-text"
            >
              Memo:
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-500  text-base bg-gray-800"
                name="messageMemo"
                id="messageMemo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </section> */}
          {/* <div className="py-2 px-8 ">
            <label className="flex items-center text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={submitKey}
                onChange={() => setSubmitKey(!submitKey)}
                className="h-6 w-6 text-secondary border-2 border-secondary "
              />
              <span className="ml-3">No Reactions</span>
            </label>
          </div>
          <div className="pb-2 px-8">
            <label className="flex items-center text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={addToProfile}
                onChange={() => setAddToProfile(!addToProfile)}
                className="h-6 w-6 "
              />
              <span className="ml-3">Add to Profile</span>
            </label>
          </div>
          <div className="pb-4 px-8">
            <label className="flex items-center text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={publishExplore}
                onChange={() => setPublishExplore(!publishExplore)}
                className="h-6 w-6 "
              />
              <span className="ml-3">Publish on Explorer</span>
            </label>
          </div> */}
          <button
            onClick={() => createThread()}
            className="w-full p-3  text-background bg-primary rounded-full hover:bg-accent transition duration-300 py-3 px-6 "
          >
            Send Thread
          </button>
        </>
      ) : (
        <div className="p-4 ">
          <h1 className="text-text mb-3">Network fees: $0.0104</h1>
          <div className="flex flex-col justify-between mb-2 ">
            <span className="text-sm text-secondary">$0.01</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mr-3">
                Creating Thread Topic
              </h3>
              <span>
                {currentStepStatus >= 1 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between mb-2">
            <span className="text-sm text-secondary">$0.0001</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold  mr-3">
                Initiating Thread Topic
              </h3>
              <span>
                {currentStepStatus >= 2 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between mb-2">
            <span className="text-sm text-secondary">$0.0001</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold  mr-3">
                Publishing on Explore
              </h3>
              <span>
                {currentStepStatus >= 3 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between mb-2">
            <span className="text-sm text-secondary">$0.0001</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold  mr-3">Adding To Profile</h3>
              <span>
                {currentStepStatus >= 4 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between mb-2">
            <span className="text-sm text-secondary">$0.0001</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold  mr-3">Sending Message</h3>
              <span>
                {currentStepStatus >= 5 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
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

export default SendNewThread;
