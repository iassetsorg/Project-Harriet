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
  Choice1?: string | null;
  Choice2?: string | null;
  Choice3?: string | null;
  Choice4?: string | null;
  Choice5?: string | null;
}

// Component for Creating a Poll
const SendNewPoll = ({ onClose }: { onClose: () => void }) => {
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState<string[]>([]);
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
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

  //Steps
  let currentStep = 0;
  let topic = "";
  // Function for creating a poll
  /**
   * Creates a new poll by:
   * 1. Creating a poll topic
   * 2. Sending an initiating message to start the poll
   * 3. Optionally publishing the poll on Explore
   * 4. Optionally adding the poll to the user's profile
   * 5. Sending the poll message
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

  const createPoll = async () => {
    if (!question) {
      toast("Please enter a question");
      setIsBreak(true);
      return;
    }

    if (choices.length < 2) {
      toast("Please add at least 2 choices");
      setIsBreak(true);
      return;
    }

    setIsProcess(true);
    isBreakRef.current = false;

    while (currentStep < 5) {
      if (isBreak) {
        break;
      }

      // Creating Poll Topic
      if (currentStep === 0) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast("Start the process, Step:" + currentStep);
        const topicId = await create("ibird Poll", "", false);

        if (topicId) {
          currentStep++;
          setCurrentStepStatus(1);
          if (topicId) topic = topicId;
        }

        toast("Poll Created, Step:" + currentStep);
      }

      // Sending Initiating Poll Message
      if (currentStep === 1) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        const InitiatingMessage = {
          Identifier: "iAssets",
          Type: "Poll",
          Author: signingAccount,
        };

        const initiatingPoll = await send(topic, InitiatingMessage, "");
        if (initiatingPoll?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(2);
          toast("Poll Initiated, Step:" + currentStep);
        }
      }

      // Publishing on Explore
      if (currentStep === 2) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        // Conditional "Publish on Explore" message send
        if (publishExplore) {
          const PublishingOnExplore = {
            Type: "Poll",
            Poll: topic,
          };

          const publishingExplore = await send(
            explorerTopic,
            PublishingOnExplore,
            ""
          );

          if (publishingExplore?.receipt.status.toString() === "SUCCESS") {
            currentStep++;
            setCurrentStepStatus(3);
            toast("Poll Published On Explorer, Step:" + currentStep);
          }
        }
      }

      // Adding To Profile
      if (currentStep === 3) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        if (addToProfile) {
          const addingToProfile = {
            Type: "Poll",
            Poll: topic,
          };

          const sentToProfile = await send(profileId, addingToProfile, "");
          if (sentToProfile?.receipt.status.toString() === "SUCCESS") {
            currentStep++;
            setCurrentStepStatus(4);
            toast("Poll Published On Profile, Step:" + currentStep);
          }
        }
      }

      // Sending Message
      if (currentStep === 4) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        // Check if there is a file to upload
        if (file && file.size > maxSize) {
          toast.error("The file exceeds 100MB.");
          setIsProcess(false);
          return;
        }

        let uploadedMediaId = null;
        // Proceed with file upload if a file is selected
        if (file) {
          try {
            setIsProcess(true); // Indicate uploading process
            uploadedMediaId = await uploadToArweave(file);
            if (!uploadedMediaId) {
              throw new Error("Failed to upload media to IPFS.");
            }
            setIsProcess(false); // End uploading indication
          } catch (error) {
            toast.error("Media upload failed. Try again.");
            setIsProcess(false);
            return;
          }
        }

        let Message: Message = {
          Message: question,
          Media: uploadedMediaId || null,
          Choice1: choices[0] || null,
          Choice2: choices[1] || null,
          Choice3: choices[2] || null,
          Choice4: choices[3] || null,
          Choice5: choices[4] || null,
        };

        const sendingMessage = await send(topic, Message, "");
        if (sendingMessage?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(5);
          onClose();
          window.location.reload();
          toast("Poll Sent, Step:" + currentStep);
        }
      }
    }
  };

  const addChoice = () => {
    if (choices.length < 5) {
      setChoices([...choices, ""]);
    }
  };

  const updateChoice = (index: number, value: string) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = value;
    setChoices(updatedChoices);
  };

  const removeChoice = (index: number) => {
    const updatedChoices = [...choices];
    updatedChoices.splice(index, 1);
    setChoices(updatedChoices);
  };

  return (
    <div className="modal-content max-w-md mx-auto bg-background rounded-lg shadow-xl p-3 text-text">
      {!isProcess ? (
        <>
          <h3 className="text-xl py-4 px-8 font-semibold text-primary">
            New Poll
          </h3>
          <section className="py-4 px-8">
            <label
              htmlFor="question"
              className="block text-sm font-semibold text-text"
            >
              Question:
            </label>{" "}
            <div className="mt-2">
              <textarea
                className="w-full h-48 mt-2 px-4 py-2 rounded-lg text-base bg-secondary text-text"
                name="question"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={650}
              />
              <div className="text-right text-sm text-text mt-1">
                {question.length}/650
              </div>
            </div>
          </section>
          <section className="pb-4  px-8">
            <label className="block text-sm font-semibold text-text">
              Choices:
            </label>
            <div className="mt-2">
              {choices.map((choice, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg text-base bg-secondary text-text"
                    value={choice}
                    onChange={(e) => updateChoice(index, e.target.value)}
                    maxLength={50}
                  />
                  <div className="text-right text-sm text-text mt-1 ml-2">
                    {choice.length}/50
                  </div>
                  <button
                    className="ml-2 text-error"
                    onClick={() => removeChoice(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {choices.length < 5 && (
                <button
                  className="mt-2 px-4 py-2 bg-primary text-background rounded-full"
                  onClick={addChoice}
                >
                  Add Choice
                </button>
              )}
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
          <button
            onClick={createPoll}
            className="w-full p-3 text-background bg-primary rounded-full hover:bg-accent transition duration-300 py-3 px-6"
          >
            Send Poll
          </button>
        </>
      ) : (
        <div className="p-4">
          <h1 className="text-text mb-3">Network fees: $0.0104</h1>
          <div className="flex flex-col justify-between mb-2">
            <span className="text-sm text-secondary">$0.01</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mr-3">
                Creating Poll Topic
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
              <h3 className="text-lg font-semibold mr-3">
                Initiating Poll Topic
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
              <h3 className="text-lg font-semibold mr-3">
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
              <h3 className="text-lg font-semibold mr-3">Adding To Profile</h3>
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
              <h3 className="text-lg font-semibold mr-3">Sending Message</h3>
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

export default SendNewPoll;
