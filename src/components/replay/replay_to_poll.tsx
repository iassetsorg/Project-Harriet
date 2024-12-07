import React, { useEffect, useState } from "react";
import Modal from "../../common/modal";
import useSendMessage from "../../hooks/use_send_message";
import { FiShare2 } from "react-icons/fi";
import Tip from "../tip/tip";
import { BsCurrencyDollar } from "react-icons/bs";
import {
  AiOutlineLike,
  AiOutlineDislike,
  AiOutlineMessage,
} from "react-icons/ai";
import { FiHash } from "react-icons/fi";
import { toast } from "react-toastify";
import ConnectModal from "../../wallet/ConnectModal";
import { useWalletContext } from "../../wallet/WalletContext";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
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
import { BsEmojiSmile } from "react-icons/bs";
/**
 * Interface for the props required by the ReplayPoll component
 */
interface ReplayProps {
  sequenceNumber: number; // Unique identifier for the poll sequence
  topicId: string; // Hedera topic ID
  author?: string | null | undefined; // Author of the poll
  message_id: string; // Unique message identifier
  Choice?: string; // Selected poll choice
  showVoteButton?: boolean; // Whether to display the vote button
  className?: string; // Optional CSS classes
}

/**
 * Interface defining the status of a processing step
 */
interface StepStatus {
  status: "idle" | "loading" | "success" | "error"; // Current processing state
  disabled: boolean; // Whether the step is currently disabled
}

/**
 * Interface tracking the status of reply-related steps
 */
interface ReplyStepStatuses {
  arweave?: StepStatus; // Status of Arweave media upload
  reply: StepStatus; // Status of the reply submission
}

/**
 * ReplayPoll Component
 * Handles user interactions with polls including voting, replying, liking/disliking,
 * and sharing functionality.
 *
 * @component
 * @param {ReplayProps} props - Component props
 */
const ReplayPoll: React.FC<ReplayProps> = ({
  sequenceNumber,
  topicId,
  author,
  message_id,
  Choice,
  showVoteButton = true,
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
  const [stepStatuses, setStepStatuses] = useState<ReplyStepStatuses>({
    arweave: file ? { status: "idle", disabled: false } : undefined,
    reply: { status: "idle", disabled: file ? true : false },
  });
  const { triggerRefresh } = useRefreshTrigger();
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
   * Handles the like action for a poll
   * Validates connection status and sends like transaction to Hedera
   */
  const handleLike = async () => {
    if (!isConnected) {
      openConnectModal();
      return;
    }

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

  const handleDislike = async () => {
    if (!isConnected) {
      openConnectModal();
      return;
    }

    setStepStatuses((prev) => ({
      ...prev,
      dislike: { status: "loading", disabled: true },
    }));

    const dislikeMessage = {
      Author: accountId,
      DisLike_to: sequenceNumber.toString(),
    };

    try {
      const result = await send(topicId, dislikeMessage, "");
      if (result?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          dislike: { status: "success", disabled: true },
        }));
        toast.success("Dislike sent successfully.");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        triggerRefresh();
      } else {
        throw new Error("Failed to send dislike.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        dislike: { status: "error", disabled: false },
      }));
      toast.error("Failed to send dislike.");
    }
  };

  /**
   * Initiates the reply process
   * Validates content and file requirements before proceeding
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
   * Manages upload status and updates UI accordingly
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
    if (!isConnected) {
      openConnectModal();
      return;
    }

    if (!replyContent.trim() && !uploadedMediaId) {
      toast.error("Please enter your comment or wait for media upload.");
      return;
    }

    setStepStatuses((prev) => ({
      ...prev,
      reply: { status: "loading", disabled: true },
    }));

    const replyMessage = {
      Author: accountId,
      Reply_to: sequenceNumber.toString(),
      Message: replyContent,
      Media: uploadedMediaId,
    };

    try {
      const result = await send(topicId, replyMessage, "");
      if (result?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          reply: { status: "success", disabled: true },
        }));
        toast.success("Your comment has been sent successfully");
        setShowReplyModal(false);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        triggerRefresh();
        setReplyContent("");
        setIsEditing(true);
        setStepStatuses({
          arweave: file ? { status: "idle", disabled: false } : undefined,
          reply: { status: "idle", disabled: file ? true : false },
        });
      } else {
        throw new Error("Failed to send reply.");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        reply: { status: "error", disabled: false },
      }));
      toast.error("Failed to send reply.");
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
    return `${window.location.origin}/Polls/${topicId}`;
  };

  const copyShareLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link).then(() => {
      toast("Link copied to clipboard!");
    });
  };

  const handlePoll = async () => {
    if (!isConnected) {
      openConnectModal();
      return;
    }
    if (Choice === "") {
      toast("Please select a choice to vote");
      return;
    }
    const VoteMessage = {
      Choice: Choice,
    };

    toast("Sending Vote");
    try {
      const result = await send(topicId, VoteMessage, "");
      if (result?.receipt.result.toString() === "SUCCESS") {
        toast.success("Your vote has been submitted successfully!");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        triggerRefresh();
      } else {
        throw new Error("Vote transaction failed.");
      }
    } catch (error) {
      toast.error("Failed to submit your vote. Please try again.");
    }
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setReplyContent((prevContent) => prevContent + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  /**
   * Renders a step button with appropriate status indicators
   * @param {keyof ReplyStepStatuses} step - The step to render
   * @param {string} label - Button label
   * @param {Function} handler - Click handler
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

  /**
   * Renders the reply form modal with editing and processing states
   */
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
          className="bg-secondary hover:bg-background text-text py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => {
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
            setStepStatuses((prev) => ({
              ...prev,
              dislike: { status: "idle", disabled: false },
            }));
            handleDislike();
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
        {showVoteButton && (
          <button
            className={`py-1 px-2 rounded-lg mt-2 ml-2 flex items-center ${
              Choice === ""
                ? " text-text bg-secondary"
                : "text-background bg-primary hover:bg-accent transition duration-300"
            }`}
            onClick={handlePoll}
          >
            Vote
          </button>
        )}
      </div>

      {/* Render Modals */}
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

export default ReplayPoll;
