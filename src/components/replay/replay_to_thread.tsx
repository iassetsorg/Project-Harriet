import React, { useEffect, useState } from "react";
import Modal from "../../common/modal";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import { useWalletContext } from "../../wallet/WalletContext";
import useSendMessage from "../../hooks/use_send_message";
import { FiShare2 } from "react-icons/fi";
import Tip from "../tip/tip";
import { BsCurrencyDollar } from "react-icons/bs";
import ConnectModal from "../../wallet/ConnectModal";
import {
  AiOutlineLike,
  AiOutlineDislike,
  AiOutlineMessage,
} from "react-icons/ai";
import { FiHash } from "react-icons/fi";
import { toast } from "react-toastify";
import { RiCheckLine, RiRefreshLine, RiDeleteBinLine } from "react-icons/ri";
import { MdOutlinePermMedia } from "react-icons/md";
import useUploadToArweave from "../media/use_upload_to_arweave";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";

/**
 * Interface for the core properties required by the Replay component
 * @interface ReplayProps
 * @property {number} sequenceNumber - The sequence number of the message being replied to
 * @property {string} topicId - The unique identifier for the topic/thread
 * @property {string | null | undefined} author - The author of the original message
 * @property {string} message_id - Unique identifier for the message
 * @property {string} [className] - Optional CSS class name for styling
 */
interface ReplayProps {
  sequenceNumber: number;
  topicId: string;
  author?: string | null | undefined;
  message_id: string;
  className?: string;
}

/**
 * Interface defining the status of a processing step
 * @interface StepStatus
 * @property {('idle' | 'loading' | 'success' | 'error')} status - Current state of the step
 * @property {boolean} disabled - Whether the step is currently disabled
 */
interface StepStatus {
  status: "idle" | "loading" | "success" | "error";
  disabled: boolean;
}

/**
 * Interface tracking the status of reply-related steps
 * @interface ReplyStepStatuses
 * @property {StepStatus} [arweave] - Status of Arweave media upload (optional)
 * @property {StepStatus} reply - Status of the reply submission
 */
interface ReplyStepStatuses {
  arweave?: StepStatus;
  reply: StepStatus;
}

/**
 * Replay Component - Handles user interactions for replying to messages
 * Provides functionality for:
 * - Liking/Unliking messages
 * - Replying with text and media
 * - Tipping authors
 * - Sharing messages
 *
 * @component
 * @param {ReplayProps} props - Component properties
 */
const Replay: React.FC<ReplayProps> = ({
  sequenceNumber,
  topicId,
  author,
  message_id,
}) => {
  const { send } = useSendMessage();
  const { isConnected } = useWalletContext();
  const { data: accountId } = useAccountId();

  const [replyContent, setReplyContent] = useState<string>("");
  const [showReplyModal, setShowReplyModal] = useState<boolean>(false);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const { uploadToArweave } = useUploadToArweave();
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const { triggerRefresh } = useRefreshTrigger();
  // State for step statuses
  const [stepStatuses, setStepStatuses] = useState<ReplyStepStatuses>({
    arweave: file ? { status: "idle", disabled: false } : undefined,
    reply: { status: "idle", disabled: file ? true : false },
  });

  useEffect(() => {
    if (isConnected) {
      setIsConnectModalOpen(false);
    }
  }, [isConnected]);

  const openConnectModal = () => {
    setIsConnectModalOpen(true);
  };

  const closeConnectModal = () => {
    setIsConnectModalOpen(false);
  };

  const openTipModal = () => {
    setIsTipModalOpen(true);
  };
  const closeTipModal = () => {
    setIsTipModalOpen(false);
  };

  /**
   * Handles the like action for a message
   * - Validates user connection status
   * - Updates step status during processing
   * - Sends like transaction to the blockchain
   * - Handles success/error states with toast notifications
   */
  const handleLike = async () => {
    if (!isConnected) {
      openConnectModal();
      return;
    }

    // Initialize step status for like
    setStepStatuses((prev) => ({
      ...prev,
      like: { status: "loading", disabled: true },
    }));

    const likeMessage = {
      Author: accountId,
      Like_to: sequenceNumber.toString(),
    };

    try {
      const result = await send(topicId, likeMessage, "");
      if (result?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          like: { status: "success", disabled: true },
        }));
        toast.success("Like sent successfully.");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        triggerRefresh();
      } else {
        throw new Error("Failed to send like.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        like: { status: "error", disabled: false },
      }));
      toast.error("Failed to send like.");
    }
  };

  const handleUnlike = async () => {
    if (!isConnected) {
      openConnectModal();
      return;
    }

    // Initialize step status for unlike
    setStepStatuses((prev) => ({
      ...prev,
      unlike: { status: "loading", disabled: true },
    }));

    const unlikeMessage = {
      Author: accountId,
      DisLike_to: sequenceNumber.toString(),
    };

    try {
      const result = await send(topicId, unlikeMessage, "");
      if (result?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          unlike: { status: "success", disabled: true },
        }));
        toast.success("Unlike sent successfully.");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        triggerRefresh();
      } else {
        throw new Error("Failed to send unlike.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        unlike: { status: "error", disabled: false },
      }));
      toast.error("Failed to send unlike.");
    }
  };

  /**
   * Initiates the reply process
   * - Validates reply content and media
   * - Sets up processing steps based on content type
   * - Transitions the UI to processing mode
   */
  const handleStartReply = () => {
    if (!replyContent.trim() && !file) {
      toast.error("Please enter a comment or add media.");
      return;
    }

    if (file && file.size > 100 * 1024 * 1024) {
      toast.error("The file exceeds 100MB.");
      return;
    }

    if (file) {
      setStepStatuses({
        arweave: { status: "idle", disabled: false },
        reply: { status: "idle", disabled: true },
      });
    } else {
      setStepStatuses({
        reply: { status: "idle", disabled: false },
      });
    }

    setIsEditing(false);
  };

  /**
   * Handles media upload to Arweave
   * - Updates step status during upload
   * - Manages success/error states
   * - Enables reply step upon successful upload
   */
  const handleArweaveUpload = async () => {
    if (!file) return;

    setStepStatuses((prev) => ({
      ...prev,
      arweave: { status: "loading", disabled: true },
    }));

    try {
      toast.info("Uploading your media to Arweave...");
      const mediaId = await uploadToArweave(file);
      setUploadedMediaId(mediaId);
      toast.success("Media uploaded to Arweave successfully.");

      setStepStatuses((prev) => ({
        ...prev,
        arweave: { status: "success", disabled: true },
        reply: { status: "idle", disabled: false },
      }));
    } catch (e) {
      toast.error("Media upload failed.");
      setStepStatuses((prev) => ({
        ...prev,
        arweave: { status: "error", disabled: false },
      }));
    }
  };

  const handleReply = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      reply: { status: "loading", disabled: true },
    }));

    try {
      const payload = {
        Author: accountId || "",
        Reply_to: sequenceNumber.toString(),
        Message: replyContent,
        Media: uploadedMediaId,
      };

      await send(topicId, payload);

      setStepStatuses((prev) => ({
        ...prev,
        reply: { status: "success", disabled: true },
      }));
      toast.success("Your comment has been sent successfully.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      triggerRefresh();
      setShowReplyModal(false);
    } catch (error) {
      toast.error("Failed to send comment.");
      setStepStatuses((prev) => ({
        ...prev,
        reply: { status: "error", disabled: false },
      }));
    }
  };

  const handleTip = () => {
    if (accountId === author) {
      toast("You cannot tip yourself");
      return;
    }
    if (!isConnected) {
      openConnectModal();
      return;
    }
    openTipModal();
  };

  const generateShareLink = () => {
    return `${window.location.origin}/Threads/${topicId}`;
  };
  const copyShareLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link).then(() => {
      toast("Link copied to clipboard!");
    });
  };

  /**
   * Renders a step button with appropriate status indicators
   * @param {keyof ReplyStepStatuses} step - The step identifier
   * @param {string} label - Display label for the step
   * @param {() => void} handler - Click handler for the step
   */
  const renderStepButton = (
    step: keyof ReplyStepStatuses,
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
          className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium min-w-[120px] 
                flex items-center justify-center ${
                  status.status === "success"
                    ? "bg-success text-white cursor-not-allowed"
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

  const renderProcessingSteps = () => (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-text mb-4">Send Comment</h1>

      {/* Comment and Media Preview */}
      <div className="mb-6 p-5 bg-secondary rounded-xl mx-4">
        <p className="text-text break-words text-lg leading-relaxed">
          {replyContent}
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
      <div className="space-y-4 mx-4">
        {file &&
          renderStepButton(
            "arweave",
            "Upload Media to Arweave",
            handleArweaveUpload
          )}
        {renderStepButton("reply", "Send Comment", handleReply)}
        <button
          onClick={() => {
            setIsEditing(true);
          }}
          className="w-full bg-secondary hover:bg-error text-text py-2 mt-3 px-4 rounded-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderReplyForm = () => (
    <Modal isOpen={showReplyModal} onClose={() => setShowReplyModal(false)}>
      <div className="flex flex-col max-h-[80vh] bg-background rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-text/10 flex items-center">
          <div>
            <h3 className="text-xl font-semibold text-primary">
              Write a Comment
            </h3>
            <p className="text-sm text-text/60 mt-1">
              Share your thoughts with the community
            </p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isEditing ? (
            <>
              {/* Compose Area */}
              <div className="p-6">
                <div className="relative mb-4">
                  <textarea
                    className="w-full bg-transparent text-text text-lg border-none
                      focus:ring-0 outline-none resize-none h-auto custom-scrollbar
                      placeholder:text-text/40"
                    placeholder="What's on your mind?"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    maxLength={850}
                    rows={3}
                    style={{
                      minHeight: "120px",
                      maxHeight: "300px",
                      overflow: "auto",
                    }}
                  />
                  {/* Character limit warning */}
                  {replyContent.length > 800 && (
                    <div
                      className="absolute bottom-2 right-2 text-xs text-error/80 
                        bg-error/10 px-2 py-1 rounded-full"
                    >
                      {850 - replyContent.length} characters left
                    </div>
                  )}
                </div>
                {/* Media Section */}
                <div className="space-y-4">
                  {/* Media Preview */}
                  {file && (
                    <div className="rounded-xl overflow-hidden bg-secondary/20">
                      {/* Image Preview */}
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full max-h-[300px] object-contain bg-black/5"
                        />
                      </div>

                      {/* File Info and Remove Button */}
                      <div className="p-3 border-t border-text/5">
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
                            onClick={() => {
                              setFile(null);
                              setStepStatuses((prev) => {
                                const newStatuses = { ...prev };
                                delete newStatuses.arweave;
                                return {
                                  ...newStatuses,
                                  reply: { status: "idle", disabled: false },
                                };
                              });
                            }}
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

                  {/* Media Upload Button (only show if no file) */}
                  {!file && (
                    <div className="mt-4">
                      <label
                        htmlFor="fileUpload"
                        className="group cursor-pointer block w-full border-2 border-dashed 
                            border-text/10 rounded-xl hover:border-primary/50 
                            transition-all duration-200"
                      >
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                          <div
                            className="w-12 h-12 rounded-full bg-primary/10 flex items-center 
                              justify-center group-hover:scale-110 transition-transform duration-200"
                          >
                            <MdOutlinePermMedia className="text-2xl text-primary" />
                          </div>
                          <p className="mt-2 text-sm font-medium text-text">
                            Add Media
                          </p>
                          <p className="text-xs text-text/50 mt-1">
                            Up to 100MB
                          </p>
                        </div>
                        <input
                          type="file"
                          id="fileUpload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setFile(e.target.files[0]);
                              e.target.value = "";
                              setStepStatuses((prev) => ({
                                ...prev,
                                arweave: { status: "idle", disabled: false },
                                reply: { status: "idle", disabled: true },
                              }));
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="border-t border-text/10 bg-background/95 backdrop-blur-sm">
                <div className="px-6 py-4 flex items-center justify-between">
                  {/* Character Count */}
                  <div
                    className={`text-sm font-medium ${
                      replyContent.length > 800
                        ? "text-error"
                        : replyContent.length > 700
                        ? "text-primary"
                        : "text-text/50"
                    }`}
                  >
                    {replyContent.length}/850
                  </div>

                  {/* Start Reply Button */}
                  <button
                    onClick={handleStartReply}
                    disabled={!replyContent.trim() && !file}
                    className={`px-8 py-2.5 font-semibold rounded-full transition-all 
                      duration-200 hover:shadow-lg active:scale-98 ${
                        !replyContent.trim() && !file
                          ? "bg-primary/30 text-text/30 cursor-not-allowed"
                          : "bg-primary hover:bg-accent text-background"
                      }`}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </>
          ) : (
            renderProcessingSteps()
          )}
        </div>
      </div>
    </Modal>
  );

  return (
    <>
      <div className="flex">
        <button
          className="bg-secondary hover:bg-background text-text py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => {
            // Initialize step status for like
            setStepStatuses((prev) => ({
              ...prev,
              like: { status: "idle", disabled: false },
            }));
            handleLike();
          }}
        >
          <AiOutlineLike className="text-text" />
        </button>

        <button
          className="bg-secondary hover:bg-background text-text py-1 px-2 rounded-lg ml-2 mt-2 flex items-center"
          onClick={() => {
            // Initialize step status for unlike
            setStepStatuses((prev) => ({
              ...prev,
              unlike: { status: "idle", disabled: false },
            }));
            handleUnlike();
          }}
        >
          <AiOutlineDislike className="text-text" />
        </button>

        <button
          className="bg-secondary hover:bg-background text-text  py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => {
            if (!isConnected) {
              openConnectModal();
              return;
            }
            setShowReplyModal(true);
          }}
        >
          <AiOutlineMessage className="text-text" />
        </button>
        <a
          href={`https://hashscan.io/mainnet/transaction/${message_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-secondary hover:bg-background text-text  py-1 px-1 rounded-lg mt-2 ml-2 flex items-center"
        >
          <FiHash />
        </a>

        <button
          className="bg-secondary hover:bg-background text-text  py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => {
            handleTip();
          }}
        >
          <BsCurrencyDollar className="text-text" />
        </button>

        <button
          className="bg-secondary hover:bg-background text-text  py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => {
            copyShareLink();
          }}
        >
          <FiShare2 className="text-text" />
        </button>
      </div>

      {/* Process Modals */}
      {showReplyModal && renderReplyForm()}

      {isConnectModalOpen && (
        <ConnectModal isOpen={isConnectModalOpen} onClose={closeConnectModal} />
      )}

      {isTipModalOpen && (
        <Modal isOpen={isTipModalOpen} onClose={closeTipModal}>
          <div className="bg-background p-4 rounded-lg">
            <Tip onClose={closeTipModal} author={author} topicId={topicId} />
          </div>
        </Modal>
      )}
    </>
  );
};

export default Replay;
