import React, { useState } from "react";
import { toast } from "react-toastify";
import { MdOutlinePermMedia } from "react-icons/md";
import { FiDelete } from "react-icons/fi";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import { RiCheckLine, RiRefreshLine, RiDeleteBinLine } from "react-icons/ri";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPickerPopup from "../../common/EmojiPickerPopup";

import useProfileData from "../../hooks/use_profile_data";
import useSendMessage from "../../hooks/use_send_message";
import useCreateTopic from "../../hooks/use_create_topic";
import useUploadToArweave from "../media/use_upload_to_arweave";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";
import eventService from "../../services/event_service";
const explorerTopic = process.env.REACT_APP_EXPLORER_TOPIC || "";

/**
 * Represents the status and disabled state of a poll creation step
 * @interface StepStatus
 * @property {('idle' | 'loading' | 'success' | 'error')} status - Current status of the step
 * @property {boolean} disabled - Whether the step is currently disabled
 */
interface StepStatus {
  status: "idle" | "loading" | "success" | "error";
  disabled: boolean;
}

/**
 * Tracks the status of each step in the poll creation process
 * @interface PollStepStatuses
 */
interface PollStepStatuses {
  createTopic: StepStatus;
  initiateMessage: StepStatus;
  publishExplore: StepStatus;
  addToProfile: StepStatus;
  arweave?: StepStatus; // Optional, only if file is uploaded
  sendPoll: StepStatus;
}

/**
 * Represents the structure of a poll message
 * @interface Message
 * @property {string} Message - The poll question
 * @property {string | null} [Media] - Optional Arweave media ID
 * @property {string | null} [Choice1-5] - Poll choices (1-5)
 */
interface Message {
  Message: string;
  Media?: string | null;
  Choice1?: string | null;
  Choice2?: string | null;
  Choice3?: string | null;
  Choice4?: string | null;
  Choice5?: string | null;
}

/**
 * SendNewPoll Component - Handles the creation and submission of new polls
 * @component
 * @param {Object} props - Component props
 * @param {() => void} props.onClose - Function to close the poll creation modal
 */
const SendNewPoll = ({ onClose }: { onClose: () => void }) => {
  const { data: accountId } = useAccountId();
  const { profileData } = useProfileData(accountId);
  const profileId = profileData ? profileData.UserMessages : "";

  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState<string[]>(["", ""]);
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [topicId, setTopicId] = useState("");
  const { triggerRefresh } = useRefreshTrigger();
  const maxSize = 100 * 1024 * 1024; // 100 MB

  const { send } = useSendMessage();
  const { create } = useCreateTopic();
  const {
    uploadToArweave,
    uploading,
    arweaveId,
    error: arweaveError,
  } = useUploadToArweave();

  // Initialize step statuses
  const [stepStatuses, setStepStatuses] = useState<PollStepStatuses>({
    createTopic: { status: "idle", disabled: false },
    initiateMessage: { status: "idle", disabled: true },
    publishExplore: { status: "idle", disabled: true },
    addToProfile: { status: "idle", disabled: true },
    arweave: file ? { status: "idle", disabled: true } : undefined,
    sendPoll: { status: "idle", disabled: true },
  });

  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  /**
   * Clears the uploaded file and resets related state
   */
  const clearFile = () => {
    setFile(null);
    setStepStatuses((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses.arweave;
      return newStatuses;
    });
  };

  /**
   * Validates poll inputs and initiates the poll creation process
   * Checks for:
   * - Valid question
   * - At least 2 choices
   * - File size limits
   */
  const handleStartPoll = () => {
    if (!question.trim()) {
      toast.error("Please enter a question for the poll.");
      return;
    }

    if (!choices[0].trim() || !choices[1].trim()) {
      toast.error("The first two choices are required.");
      return;
    }

    if (choices.length < 2) {
      toast.error("A minimum of two choices are required to create a poll.");
      return;
    }

    if (file && file.size > maxSize) {
      toast.error("The file exceeds 100MB.");
      return;
    }

    setIsEditing(false);

    setStepStatuses({
      createTopic: { status: "idle", disabled: false },
      initiateMessage: { status: "idle", disabled: true },
      publishExplore: { status: "idle", disabled: true },
      addToProfile: { status: "idle", disabled: true },
      arweave: file ? { status: "idle", disabled: true } : undefined,
      sendPoll: { status: "idle", disabled: true },
    });
  };

  /**
   * Creates a new HCS topic for the poll
   * @returns {Promise<void>}
   */
  const handleCreateTopic = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      createTopic: { status: "loading", disabled: true },
    }));

    try {
      const topic = await create("ibird Poll", "", false);
      if (topic) {
        setTopicId(topic);
        setStepStatuses((prev) => ({
          ...prev,
          createTopic: { status: "success", disabled: true },
          initiateMessage: { status: "idle", disabled: false },
        }));
        toast.success("Poll topic created successfully.");
      } else {
        throw new Error("Failed to create poll topic.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        createTopic: { status: "error", disabled: false },
        initiateMessage: { status: "idle", disabled: true },
      }));
      toast.error("Failed to create poll topic.");
    }
  };

  /**
   * Initiates the poll by sending the first message to the topic
   * @returns {Promise<void>}
   */
  const handleInitiatePollMessage = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      initiateMessage: { status: "loading", disabled: true },
    }));

    try {
      const initiatingMessage = {
        Identifier: "iAssets",
        Type: "Poll",
        Author: accountId,
      };

      const initiatingPoll = await send(topicId, initiatingMessage, "");
      if (initiatingPoll?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          initiateMessage: { status: "success", disabled: true },
          publishExplore: { status: "idle", disabled: false },
        }));
        toast.success("Poll initiated successfully.");
      } else {
        throw new Error("Failed to initiate poll.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        initiateMessage: { status: "error", disabled: false },
      }));
      toast.error("Failed to initiate poll.");
    }
  };

  const handlePublishExplore = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      publishExplore: { status: "loading", disabled: true },
    }));

    try {
      const publishingOnExplore = {
        Type: "Poll",
        Poll: topicId,
      };

      const publishingExplore = await send(
        explorerTopic,
        publishingOnExplore,
        ""
      );
      if (publishingExplore?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          publishExplore: { status: "success", disabled: true },
          addToProfile: { status: "idle", disabled: false },
        }));
        toast.success("Poll published on Explore successfully.");
      } else {
        throw new Error("Failed to publish on Explore.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        publishExplore: { status: "error", disabled: false },
      }));
      toast.error("Failed to publish on Explore.");
    }
  };

  const handleAddToProfile = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      addToProfile: { status: "loading", disabled: true },
    }));

    try {
      const addingToProfile = {
        Type: "Poll",
        Poll: topicId,
      };

      const sentToProfile = await send(profileId, addingToProfile, "");
      if (sentToProfile?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          addToProfile: { status: "success", disabled: true },
          arweave: file ? { status: "idle", disabled: false } : undefined,
          sendPoll: !file ? { status: "idle", disabled: false } : prev.sendPoll,
        }));
        toast.success("Poll added to profile successfully.");
      } else {
        throw new Error("Failed to add poll to profile.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        addToProfile: { status: "error", disabled: false },
      }));
      toast.error("Failed to add poll to profile.");
    }
  };

  const handleUploadToArweave = async () => {
    if (!file) return;

    setStepStatuses((prev) => ({
      ...prev,
      arweave: { status: "loading", disabled: true },
    }));

    try {
      const mediaId = await uploadToArweave(file);
      setUploadedMediaId(mediaId);

      if (mediaId) {
        setStepStatuses((prev) => ({
          ...prev,
          arweave: { status: "success", disabled: true },
          sendPoll: { status: "idle", disabled: false },
        }));
        toast.success("Media uploaded to Arweave successfully.");
      } else {
        throw new Error("Failed to upload media.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        arweave: { status: "error", disabled: false },
      }));
      toast.error("Failed to upload media.");
    }
  };

  const handleSendPoll = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      sendPoll: { status: "loading", disabled: true },
    }));

    try {
      let Message: Message = {
        Message: question,
        Media: uploadedMediaId || null,
        Choice1: choices[0] || null,
        Choice2: choices[1] || null,
        Choice3: choices[2] || null,
        Choice4: choices[3] || null,
        Choice5: choices[4] || null,
      };

      const sendingMessage = await send(topicId, Message, "");
      if (sendingMessage?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          sendPoll: { status: "success", disabled: true },
        }));

        toast.success("Your poll sent to Hedera successfully!");
        onClose();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        eventService.emit("refreshExplorer");
      } else {
        throw new Error("Failed to send poll.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        sendPoll: { status: "error", disabled: false },
      }));
      toast.error("Failed to send poll.");
    }
  };

  /**
   * Adds or removes poll choices
   * - Maximum 5 choices allowed
   * - Minimum 2 choices required
   * - First two choices cannot be removed
   */
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
    if (choices.length <= 2) return;

    if (index < 2) return;

    const updatedChoices = [...choices];
    updatedChoices.splice(index, 1);
    setChoices(updatedChoices);
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setQuestion((prevQuestion) => prevQuestion + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  /**
   * Renders the step-by-step poll creation process
   * Shows:
   * - Question preview
   * - Media preview (if any)
   * - Choices preview
   * - Processing steps with status indicators
   */
  const renderProcessingSteps = () => (
    <div className="p-6 overflow-y-auto max-h-[80vh]">
      <h1 className="text-xl font-semibold text-text mb-4">Create Poll</h1>

      {/* Question and Media Preview */}
      <div className="mb-6 p-5 bg-secondary rounded-xl mx-4">
        <p className="text-text break-words text-lg leading-relaxed">
          {question}
        </p>
        {file && (
          <div className="mt-4">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-full max-h-[300px] object-contain bg-black/5"
              />
            </div>
          </div>
        )}
      </div>

      {/* Choices Preview */}
      <div className="mb-6 p-5 bg-secondary rounded-xl mx-4">
        <h3 className="text-lg font-semibold mb-3">Choices:</h3>
        <ul className="list-decimal list-inside space-y-1">
          {choices.map((choice, index) => (
            <li key={index} className="text-text">
              {choice}
            </li>
          ))}
        </ul>
      </div>

      {/* Processing Steps */}
      <div className="space-y-4 mx-4">
        {renderStepButton(
          "createTopic",
          "Create Poll Topic",
          handleCreateTopic
        )}
        {renderStepButton(
          "initiateMessage",
          "Initiate Poll",
          handleInitiatePollMessage
        )}
        {renderStepButton(
          "publishExplore",
          "Publish to Explore",
          handlePublishExplore
        )}
        {renderStepButton("addToProfile", "Add to Profile", handleAddToProfile)}
        {file &&
          renderStepButton(
            "arweave",
            "Upload Media to Arweave",
            handleUploadToArweave
          )}
        {renderStepButton("sendPoll", "Send Poll", handleSendPoll)}
        <button
          onClick={onClose}
          className="w-full bg-secondary hover:bg-error text-text py-2 mt-3 px-4 rounded-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  /**
   * Renders a single step button with appropriate status styling
   * @param {keyof PollStepStatuses} step - The step identifier
   * @param {string} label - Display label for the step
   * @param {() => void} handler - Click handler for the step
   */
  const renderStepButton = (
    step: keyof PollStepStatuses,
    label: string,
    handler: () => void
  ) => {
    const status = stepStatuses[step];
    if (!status) return null;

    return (
      <div
        className="flex justify-between items-center p-3 hover:bg-secondary/30 rounded-lg transition-colors"
        key={step}
      >
        <div className="flex-1">
          <span
            className={`text-base font-medium ${
              status.status === "success"
                ? "text-success"
                : status.status === "error"
                ? "text-error"
                : status.disabled
                ? "text-gray-500"
                : "text-text"
            }`}
          >
            {label}
          </span>
          {status.status === "error" && (
            <p className="text-sm text-error/80 mt-1">
              Failed. Please try again.
            </p>
          )}
        </div>
        <button
          onClick={handler}
          disabled={status.disabled || status.status === "loading"}
          className={`px-6 py-2 ml-3 rounded-lg transition-all duration-200 font-medium min-w-[120px] 
                  flex items-center justify-center ${
                    status.status === "success"
                      ? "bg-success text-white"
                      : status.status === "loading"
                      ? "bg-secondary text-text animate-pulse cursor-not-allowed"
                      : status.status === "error"
                      ? "bg-error hover:bg-error/80 text-white"
                      : status.disabled
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-primary hover:bg-accent text-background"
                  }`}
        >
          {status.status === "loading" ? (
            "Processing..."
          ) : status.status === "success" ? (
            <>
              <RiCheckLine className="mr-1.5" />
              Done
            </>
          ) : status.status === "error" ? (
            <>
              <RiRefreshLine className="mr-1.5" />
              Retry
            </>
          ) : (
            "Start"
          )}
        </button>
      </div>
    );
  };

  /**
   * Renders the poll creation form
   * Features:
   * - Question input with character limit
   * - Choice management
   * - Media upload
   * - Input validation
   */
  const renderEditForm = () => (
    <div className="flex flex-col max-h-[80vh] bg-background rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-primary flex items-center">
        <div>
          <h3 className="text-xl font-semibold text-primary">Create a Poll</h3>
          <p className="text-sm text-text/60 mt-1">
            Ask a question and let the community vote
          </p>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Compose Area */}
        <div className="p-6">
          {/* Question Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-text mb-2">
              Question:
            </label>
            <div className="relative">
              <textarea
                className="w-full bg-transparent text-text text-lg border border-primary
                  focus:ring-1 focus:ring-primary outline-none resize-none h-auto 
                  placeholder:text-text/40 rounded-xl p-4"
                placeholder="What's your poll question?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={650}
                rows={5}
                style={{
                  minHeight: "160px",
                  maxHeight: "400px",
                  overflow: "auto",
                }}
              />

              {/* Emoji and Media buttons */}
              <div className="absolute bottom-3 left-3 flex gap-2">
                {/* Emoji Button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-primary/10 rounded-full transition-colors group"
                >
                  <BsEmojiSmile className="text-xl text-primary group-hover:text-accent" />
                </button>

                {/* Media Upload */}
                <label
                  htmlFor="fileUpload"
                  className="p-2 hover:bg-primary/10 rounded-full transition-colors group cursor-pointer"
                >
                  <MdOutlinePermMedia className="text-xl text-primary group-hover:text-accent" />
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0]);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>

              {/* Emoji Picker Popup */}
              {showEmojiPicker && (
                <EmojiPickerPopup
                  onEmojiClick={onEmojiClick}
                  onClose={() => setShowEmojiPicker(false)}
                  position="bottom"
                />
              )}
            </div>
            <div className="text-right text-sm text-text mt-1">
              {question.length}/650
            </div>
          </div>

          {/* Choices Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-text mb-2">
              Choices:
            </label>
            {choices.map((choice, index) => (
              <div key={index} className="flex flex-col mb-3">
                <div className="flex items-center">
                  <input
                    type="text"
                    className={`flex-1 px-4 py-2 rounded-lg text-base ${
                      index < 2
                        ? "bg-secondary text-text cursor-default"
                        : "bg-secondary text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    }`}
                    value={choice}
                    onChange={(e) => updateChoice(index, e.target.value)}
                    maxLength={50}
                    placeholder={`Choice ${index + 1}`}
                  />
                  {index >= 2 && (
                    <button
                      className="ml-2 text-error hover:text-error-dark transition duration-200"
                      onClick={() => removeChoice(index)}
                      title="Remove choice"
                    >
                      <RiDeleteBinLine className="text-xl" />
                    </button>
                  )}
                </div>
                {/* Add character counter */}
                <div
                  className={`text-right text-xs mt-1 ${
                    choice.length > 40
                      ? "text-error"
                      : choice.length > 30
                      ? "text-primary"
                      : "text-text/50"
                  }`}
                >
                  {choice.length}/50
                </div>
              </div>
            ))}
            {choices.length < 5 && (
              <button
                className="mt-2 px-4 py-2 bg-primary text-background rounded-full hover:bg-accent transition duration-300"
                onClick={addChoice}
              >
                Add Choice
              </button>
            )}
          </div>

          {/* Media Section */}
          <div className="space-y-4">
            {/* Media Preview */}
            {file && (
              <div className="rounded-xl overflow-hidden border border-primary">
                {/* Image Preview */}
                <div className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full max-h-[300px] object-contain bg-black/5"
                  />
                </div>

                {/* File Info and Remove Button */}
                <div className="p-3 border-t border-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <p
                        className="text-sm text-text truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-text/50 mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      onClick={clearFile}
                      className="flex items-center px-3 py-1.5 rounded-lg
                        bg-error/10 hover:bg-error/20 text-error/80 hover:text-error 
                        transition-all duration-200"
                      title="Remove media"
                    >
                      <RiDeleteBinLine className="text-lg mr-1.5" />
                      <span className="text-sm font-medium">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-primary bg-background/95 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Character Count */}
          <div
            className={`text-sm font-medium ${
              question.length > 600
                ? "text-error"
                : question.length > 500
                ? "text-primary"
                : "text-text/50"
            }`}
          >
            {question.length}/650
          </div>

          {/* Create Poll Button */}
          <button
            onClick={handleStartPoll}
            disabled={
              !question.trim() ||
              !choices[0].trim() ||
              !choices[1].trim() ||
              choices.length < 2
            }
            className={`px-8 py-2.5 font-semibold rounded-full transition-all 
                    duration-200 hover:shadow-lg active:scale-98 ${
                      !question.trim() ||
                      !choices[0].trim() ||
                      !choices[1].trim() ||
                      choices.length < 2
                        ? "bg-primary/30 text-text/30 cursor-not-allowed"
                        : "bg-primary hover:bg-accent text-background"
                    }`}
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-background rounded-lg shadow-xl p-3 text-text">
      {isEditing ? renderEditForm() : renderProcessingSteps()}
    </div>
  );
};

export default SendNewPoll;
