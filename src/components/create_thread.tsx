import { useState, useRef } from "react";
import { FaCheck } from "react-icons/fa";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import useProfileData from "../hooks/use_profile_data";

import { toast } from "react-toastify";
import useSendMessage from "../hooks/use_send_message";
import useCreateTopic from "../hooks/use_create_topic";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdFileDownloadDone } from "react-icons/md";
// Component for Creating a Topic
const CreateThread = ({ onClose }: { onClose: () => void }) => {
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
  const profileId = profileData ? profileData.Threads : "";
  const [isProcess, setIsProcess] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentStepStatus, setCurrentStepStatus] = useState(0);
  const isBreakRef = useRef(false);
  ////////////////////////////////STEPS//////////////////////////////////////
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

  const createThread = async () => {
    setIsProcess(true);
    isBreakRef.current = false;

    while (currentStep < 5) {
      if (isBreak) {
        break;
      }
      // ======================STEP 1======================
      // Creating Thread Topic
      // ======================STEP 1======================
      if (currentStep === 0) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast("Start the process, Step:" + currentStep);
        const topicId = await create("ibird Thread", "", submitKey);

        if (topicId) {
          currentStep++;
          setCurrentStepStatus(1);
          if (topicId) topic = topicId;
        }

        toast("Thread Created, Step:" + currentStep);
      }
      // ======================STEP 2======================
      // Sending Initiating Thread Message
      // ======================STEP 2======================
      if (currentStep === 1) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        const InitiatingMessage = {
          Identifier: "iAssets",
          Type: "Thread",
          Author: signingAccount,
        };

        const initiatingThread = await send(topic, InitiatingMessage, "");
        if (initiatingThread?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(2);
          toast("Thread Initiated, Step:" + currentStep);
        }
      }
      // ======================STEP 3======================
      // Publishing on Explore
      // ======================STEP 3======================
      if (currentStep === 2) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        // Conditional "Publish on Explore" message send
        if (publishExplore) {
          const PublishingOnExplore = {
            Thread: topic,
          };

          const publishingExplore = await send(
            "0.0.3946144",
            PublishingOnExplore,
            ""
          );

          if (publishingExplore?.receipt.status.toString() === "SUCCESS") {
            currentStep++;
            setCurrentStepStatus(3);
            toast("Thread Published On Explorer, Step:" + currentStep);
          }
        }
      }
      // ======================STEP 4======================
      // Adding To Profile
      // ======================STEP 4======================
      if (currentStep === 3) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        if (addToProfile) {
          const addingToProfile = {
            Thread: topic,
          };

          const sentToProfile = await send(profileId, addingToProfile, "");
          if (sentToProfile?.receipt.status.toString() === "SUCCESS") {
            currentStep++;
            setCurrentStepStatus(4);
            toast("Thread Published On Profile, Step:" + currentStep);
          }
        }
      }
      // ======================STEP 5======================
      // Sending Message
      // ======================STEP 5======================
      if (currentStep === 4) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        const Message = {
          Author: signingAccount,
          Message: message,
        };

        const sendingMessage = await send(topic, Message, memo);
        if (sendingMessage?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(5);
          onClose();
          toast("Message Sent to Profile, Step:" + currentStep);
        }
      }
    }
  };
  // Function to retry the current step

  return (
    <div className="max-w-md w-full mx-auto bg-gray-700 rounded-lg shadow-xl p-3 text-white border-2 border-gray-500 ">
      {!isProcess ? (
        <>
          <h3 className="text-xl py-4 px-8 font-semibold text-indigo-300">
            Create a Thread
          </h3>
          <section className="py-4 px-8">
            <label
              htmlFor="messageContent"
              className="block text-sm font-semibold text-gray-300"
            >
              Message:
            </label>
            <div className="mt-2">
              <textarea
                className="w-full px-4 py-2 h-24 rounded-lg border-2 border-gray-500  text-base bg-gray-800"
                name="messageContent"
                id="messageContent"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </section>
          <section className="py-4 px-8">
            <label
              htmlFor="messageMemo"
              className="block text-sm font-semibold text-gray-300"
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
          </section>
          <div className="py-2 px-8 ">
            <label className="flex items-center text-sm font-semibold text-gray-300">
              <input
                type="checkbox"
                checked={submitKey}
                onChange={() => setSubmitKey(!submitKey)}
                className="h-6 w-6 text-gray-400 border-2 border-gray-400 "
              />
              <span className="ml-3">No Reactions</span>
            </label>
          </div>
          <div className="pb-2 px-8">
            <label className="flex items-center text-sm font-semibold text-gray-300">
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
            <label className="flex items-center text-sm font-semibold text-gray-300">
              <input
                type="checkbox"
                checked={publishExplore}
                onChange={() => setPublishExplore(!publishExplore)}
                className="h-6 w-6 "
              />
              <span className="ml-3">Publish on Explorer</span>
            </label>
          </div>
          <button
            onClick={() => createThread()}
            className="w-full p-3  text-gray-800 bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300 py-3 px-6 "
          >
            Create
          </button>
        </>
      ) : (
        <div className="p-4 ">
          <h1 className="text-gray-200 mb-3">Network fees: $0.0104</h1>
          <div className="flex flex-col justify-between mb-2 ">
            <span className="text-sm text-gray-400">$0.01</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mr-3">
                Creating Thread Topic
              </h3>
              <span>
                {currentStepStatus >= 1 ? (
                  <MdFileDownloadDone className="text-xl text-green-500" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-orange-500" />
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between mb-2">
            <span className="text-sm text-gray-400">$0.0001</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold  mr-3">
                Initiating Thread Topic
              </h3>
              <span>
                {currentStepStatus >= 2 ? (
                  <MdFileDownloadDone className="text-xl text-green-500" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-orange-500" />
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between mb-2">
            <span className="text-sm text-gray-400">$0.0001</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold  mr-3">
                Publishing on Explore
              </h3>
              <span>
                {currentStepStatus >= 3 ? (
                  <MdFileDownloadDone className="text-xl text-green-500" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-orange-500" />
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between mb-2">
            <span className="text-sm text-gray-400">$0.0001</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold  mr-3">Adding To Profile</h3>
              <span>
                {currentStepStatus >= 4 ? (
                  <MdFileDownloadDone className="text-xl text-green-500" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-orange-500" />
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between mb-2">
            <span className="text-sm text-gray-400">$0.0001</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold  mr-3">Sending Message</h3>
              <span>
                {currentStepStatus >= 5 ? (
                  <MdFileDownloadDone className="text-xl text-green-500" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-orange-500" />
                )}
              </span>
            </div>
          </div>
          <button
            onClick={breakStep}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 mt-3 px-4 rounded-full"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateThread;
