import React, { useState } from "react";
import { toast } from "react-toastify";
import { MdOutlinePermMedia } from "react-icons/md";
import { RiDeleteBinLine, RiCheckLine, RiRefreshLine } from "react-icons/ri";
import useSendMessage from "../../hooks/use_send_message";
import useProfileData from "../../hooks/use_profile_data";
import useCreateTopic from "../../hooks/use_create_topic";
import useUploadToArweave from "../media/use_upload_to_arweave";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";
import eventService from "../../services/event_service";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPickerPopup from "../../common/EmojiPickerPopup";

const explorerTopic = process.env.REACT_APP_EXPLORER_TOPIC || "";

/**
 * Represents the status and disabled state of a single step in the thread creation process
 * @interface StepStatus
 */
interface StepStatus {
  status: "idle" | "loading" | "success" | "error";
  disabled: boolean;
}

/**
 * Tracks the status of all steps in the thread creation workflow
 * @interface ThreadStepStatuses
 */
interface ThreadStepStatuses {
  createTopic: StepStatus;
  initThread: StepStatus;
  explorer: StepStatus;
  profile: StepStatus;
  arweave?: StepStatus;
  message: StepStatus;
}

/**
 * Structure for the message payload sent to Hedera
 * @interface MessagePayload
 */
interface MessagePayload {
  Message: string;
  Media?: string | null;
}

/**
 * SendNewThread Component
 * Handles the creation and posting of new threads with optional media attachments.
 * Implements a multi-step process:
 * 1. Create Topic
 * 2. Initialize Thread
 * 3. Publish to Explorer
 * 4. Add to Profile
 * 5. Upload Media (optional)
 * 6. Send Final Message
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Callback function to close the thread creation modal
 */
const SendNewThread = ({ onClose }: { onClose: () => void }) => {
  const { data: accountId } = useAccountId();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const { triggerRefresh } = useRefreshTrigger();
  const maxSize = 100 * 1024 * 1024; // 100 MB

  const { send } = useSendMessage();
  const { create } = useCreateTopic();
  const { profileData } = useProfileData(accountId);
  const {
    uploadToArweave,
    arweaveId,
    error: arweaveError,
  } = useUploadToArweave();

  const profileId = profileData ? profileData.UserMessages : "";
  const [topic, setTopic] = useState("");

  // State to manage each step's status
  const [stepStatuses, setStepStatuses] = useState<ThreadStepStatuses>({
    createTopic: { status: "idle", disabled: false },
    initThread: { status: "idle", disabled: true },
    explorer: { status: "idle", disabled: true },
    profile: { status: "idle", disabled: true },
    arweave: file ? { status: "idle", disabled: true } : undefined,
    message: { status: "idle", disabled: true },
  });

  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  /**
   * Clears the selected file and resets related state
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
   * Initiates the thread creation process after validation
   * Validates message content and file size before proceeding
   */
  const handleStartThread = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (file && file.size > maxSize) {
      toast.error("The file exceeds 100MB.");
      return;
    }

    setIsEditing(false);

    // Initialize the stepStatuses for the process
    setStepStatuses({
      createTopic: { status: "idle", disabled: false },
      initThread: { status: "idle", disabled: true },
      explorer: { status: "idle", disabled: true },
      profile: { status: "idle", disabled: true },
      arweave: file ? { status: "idle", disabled: true } : undefined,
      message: { status: "idle", disabled: true },
    });
  };

  /**
   * Creates a new topic on Hedera for the thread
   * Updates step status and handles success/error states
   */
  const handleCreateTopic = async () => {
    // Set loading state
    setStepStatuses((prev) => ({
      ...prev,
      createTopic: { status: "loading", disabled: true },
    }));

    try {
      const topicId = await create("ibird Thread", "", false);

      // Check if topicId exists and update state accordingly
      if (topicId) {
        setTopic(topicId);
        setStepStatuses((prev) => ({
          ...prev,
          createTopic: { status: "success", disabled: true },
          initThread: { status: "idle", disabled: false },
        }));
        toast.success("Thread topic created successfully.");
      } else {
        // If no topicId, treat as error
        setStepStatuses((prev) => ({
          ...prev,
          createTopic: { status: "error", disabled: false },
        }));
        toast.error("Failed to create thread topic.");
      }
    } catch (error) {
      // On error, immediately show retry state
      setStepStatuses((prev) => ({
        ...prev,
        createTopic: { status: "error", disabled: false },
      }));
      toast.error("Failed to create thread topic.");
    }
  };

  const handleInitThread = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      initThread: { status: "loading", disabled: true },
    }));

    try {
      const initiatingMessage = {
        Identifier: "iAssets",
        Type: "Thread",
        Author: accountId,
      };

      const initiatingThread = await send(topic, initiatingMessage, "");
      if (initiatingThread?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          initThread: { status: "success", disabled: true },
          explorer: { status: "idle", disabled: false },
        }));
        toast.success("Thread initialized successfully.");
      } else {
        throw new Error("Thread initialization failed");
      }
    } catch (e) {
      setStepStatuses((prev) => ({
        ...prev,
        initThread: { status: "error", disabled: false },
      }));
      toast.error("Failed to initialize thread.");
    }
  };

  const handleExplorerPost = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      explorer: { status: "loading", disabled: true },
    }));

    try {
      const publishingOnExplorer = {
        Type: "Thread",
        Thread: topic,
      };

      const publishingExplorer = await send(
        explorerTopic,
        publishingOnExplorer,
        ""
      );

      if (publishingExplorer?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          explorer: { status: "success", disabled: true },
          profile: { status: "idle", disabled: false },
        }));
        toast.success("Published to explorer successfully.");
      } else {
        setStepStatuses((prev) => ({
          ...prev,
          explorer: { status: "error", disabled: false },
        }));
        toast.error("Failed to publish to explorer.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        explorer: { status: "error", disabled: false },
      }));
      toast.error("Failed to publish to explorer.");
    }
  };

  const handleProfilePost = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      profile: { status: "loading", disabled: true },
    }));

    try {
      const addingToProfile = {
        Type: "Thread",
        Thread: topic,
      };

      const sentToProfile = await send(profileId, addingToProfile, "");

      if (sentToProfile?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          profile: { status: "success", disabled: true },
          arweave: file ? { status: "idle", disabled: false } : undefined,
          message: !file ? { status: "idle", disabled: false } : prev.message,
        }));
        toast.success("Added to profile successfully.");
      } else {
        setStepStatuses((prev) => ({
          ...prev,
          profile: { status: "error", disabled: false },
        }));
        toast.error("Failed to add to profile.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        profile: { status: "error", disabled: false },
      }));
      toast.error("Failed to add to profile.");
    }
  };

  const handleArweaveUpload = async () => {
    if (!file) return;

    setStepStatuses((prev) => ({
      ...prev,
      arweave: { status: "loading", disabled: true },
    }));

    try {
      const mediaId = await uploadToArweave(file);
      setUploadedMediaId(mediaId); // Store the ID in state

      if (mediaId) {
        setStepStatuses((prev) => ({
          ...prev,
          arweave: { status: "success", disabled: true },
          message: { status: "idle", disabled: false },
        }));
        toast.success("Media uploaded successfully.");
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

  const handleFinalMessage = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      message: { status: "loading", disabled: true },
    }));

    try {
      const messagePayload: MessagePayload = {
        Message: message,
        Media: uploadedMediaId,
      };

      const sendingMessage = await send(topic, messagePayload, "");

      if (sendingMessage?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          message: { status: "success", disabled: true },
        }));
        toast.success("Your thread sent to Hedera successfully!");
        onClose();
        // Add delay before refresh
        await new Promise((resolve) => setTimeout(resolve, 2000));
        eventService.emit("refreshExplorer");
      } else {
        setStepStatuses((prev) => ({
          ...prev,
          message: { status: "error", disabled: false },
        }));
        toast.error("Failed to send message.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        message: { status: "error", disabled: false },
      }));
      toast.error("Failed to send message.");
    }
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  /**
   * Renders a single step button with appropriate status indicators
   * @param {keyof ThreadStepStatuses} step - The step identifier
   * @param {string} label - Display label for the step
   * @param {Function} handler - Click handler for the step
   * @returns {JSX.Element | null}
   */
  const renderStepButton = (
    step: keyof ThreadStepStatuses,
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
   * Renders the processing steps view showing all steps and their current status
   * @returns {JSX.Element}
   */
  const renderProcessingSteps = () => (
    <div className="p-6 overflow-y-auto max-h-[80vh]">
      <h1 className="text-xl font-semibold text-text mb-4">Create Thread</h1>

      {/* Message and Media Preview */}
      <div className="mb-6 p-5 bg-secondary rounded-xl mx-4">
        <p className="text-text break-words text-lg leading-relaxed">
          {message}
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

      {/* Processing Steps */}
      <div className="space-y-2  mx-4">
        {renderStepButton(
          "createTopic",
          "Create Thread Topic",
          handleCreateTopic
        )}
        {renderStepButton("initThread", "Initialize Thread", handleInitThread)}
        {renderStepButton(
          "explorer",
          "Publish to Explorer",
          handleExplorerPost
        )}
        {renderStepButton("profile", "Add to Profile", handleProfilePost)}
        {file &&
          renderStepButton(
            "arweave",
            "Upload Media to Arweave",
            handleArweaveUpload
          )}
        {renderStepButton("message", "Send Message", handleFinalMessage)}
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
   * Renders the initial message composition form
   * Includes media upload and character limit tracking
   * @returns {JSX.Element}
   */
  const renderEditForm = () => (
    <div className="flex flex-col max-h-[80vh] bg-background rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-primary flex items-center">
        <div>
          <h3 className="text-xl font-semibold text-primary">
            Create a Thread
          </h3>
          <p className="text-sm text-text/60 mt-1">
            Start a conversation with the community
          </p>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Compose Area */}
        <div className="p-6">
          <div className="relative mb-4">
            <textarea
              className="w-full bg-transparent text-text text-lg border border-primary
                focus:ring-1 focus:ring-primary outline-none resize-none h-auto
                placeholder:text-text/40 rounded-xl p-4"
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={850}
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

            {/* Replace the old emoji picker with EmojiPickerPopup */}
            {showEmojiPicker && (
              <EmojiPickerPopup
                onEmojiClick={onEmojiClick}
                onClose={() => setShowEmojiPicker(false)}
                position="bottom"
              />
            )}

            {/* Character limit warning */}
            {message.length > 800 && (
              <div
                className="absolute bottom-2 right-2 text-xs text-error/80 
                  bg-error/10 px-2 py-1 rounded-full"
              >
                {850 - message.length} characters left
              </div>
            )}
          </div>

          {/* Media Section - Keep only the preview part */}
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
              message.length > 800
                ? "text-error"
                : message.length > 700
                ? "text-primary"
                : "text-text/50"
            }`}
          >
            {message.length}/850
          </div>

          {/* Create Thread Button */}
          <button
            onClick={handleStartThread}
            disabled={!message.trim()}
            className={`px-8 py-2.5 font-semibold rounded-full transition-all 
                duration-200 hover:shadow-lg active:scale-98 ${
                  !message.trim()
                    ? "bg-primary text-text cursor-not-allowed"
                    : "bg-primary hover:bg-accent text-background"
                }`}
          >
            Create Thread
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

export default SendNewThread;
