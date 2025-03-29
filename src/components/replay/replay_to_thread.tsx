import React, { useEffect, useState } from "react";
import Modal from "../../common/modal";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import { useWalletContext } from "../../wallet/WalletContext";
import useSendMessage from "../../hooks/use_send_message";
import { FiShare2 } from "react-icons/fi";
import Tip from "../tip/tip";
import { BsCurrencyDollar, BsEmojiSmile } from "react-icons/bs";
import ConnectModal from "../../wallet/ConnectModal";
import {
  AiOutlineLike,
  AiOutlineDislike,
  AiOutlineMessage,
} from "react-icons/ai";
import { FiHash } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  RiCheckLine,
  RiRefreshLine,
  RiDeleteBinLine,
  RiCloseLine,
} from "react-icons/ri";
import { MdOutlinePermMedia } from "react-icons/md";
import useUploadToArweave from "../media/use_upload_to_arweave";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";
import EmojiPickerPopup from "../../common/EmojiPickerPopup";

/**
 * Formats a number to a more readable format (e.g., 1000 -> 1K, 1500 -> 1.5K, 1000000 -> 1M)
 * @param {number} num - The number to format
 * @returns {string} The formatted number as a string
 */
const formatNumber = (num: number): string => {
  if (num === 0) return "0";

  if (num >= 1000000) {
    return (num / 1000000).toFixed(num % 1000000 < 100000 ? 0 : 1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(num % 1000 < 100 ? 0 : 1) + "K";
  }

  return num.toString();
};

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
  likesCount?: number;
  dislikesCount?: number;
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
  likesCount,
  dislikesCount,
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

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
      setShowReplyModal(false);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      triggerRefresh();
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
    return `https://ibird.io/Threads/${topicId}`;
  };
  const copyShareLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link).then(() => {
      toast("Link copied to clipboard!");
    });
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setReplyContent((prevContent) => prevContent + emojiData.emoji);
    setShowEmojiPicker(false);
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
          className={`px-6 py-2 rounded-lg transition-all ml-4 duration-200 font-medium min-w-[120px] 
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
        <div className="px-6 py-4 border-b border-primary flex items-center">
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
        <div className="flex-1 overflow-y-auto">
          {isEditing ? (
            <>
              {/* Compose Area */}
              <div className="p-6">
                <div className="relative mb-4">
                  <textarea
                    className="w-full bg-transparent text-text text-lg border border-primary
                      focus:ring-1 focus:ring-primary outline-none resize-none h-auto
                      placeholder:text-text/40 rounded-xl p-4"
                    placeholder="What's on your mind?"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
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

                  {/* Replace the old emoji picker with EmojiPickerPopup */}
                  {showEmojiPicker && (
                    <EmojiPickerPopup
                      onEmojiClick={onEmojiClick}
                      onClose={() => setShowEmojiPicker(false)}
                      position="bottom"
                    />
                  )}

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
              </div>

              {/* Bottom Controls */}
              <div className="border-t border-primary bg-background/95 backdrop-blur-sm">
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
          className="bg-secondary hover:bg-background text-text py-1 px-3 rounded-lg mt-2 ml-2 flex items-center gap-1"
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
          <span>{formatNumber(likesCount || 0)}</span>
        </button>

        <button
          className="bg-secondary hover:bg-background text-text py-1 px-3 rounded-lg ml-2 mt-2 flex items-center gap-1"
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
          <span>{formatNumber(dislikesCount || 0)}</span>
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
