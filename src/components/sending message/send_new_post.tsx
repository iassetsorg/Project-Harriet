import React, { useState } from "react";
import { toast } from "react-toastify";
import { MdOutlinePermMedia } from "react-icons/md";
import { FiDelete } from "react-icons/fi";
import useSendMessage from "../../hooks/use_send_message";
import useProfileData from "../../hooks/use_profile_data";
import useUploadToArweave from "../media/use_upload_to_arweave";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import {
  RiDeleteBinLine,
  RiCloseLine,
  RiCheckLine,
  RiRefreshLine,
} from "react-icons/ri";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";
import eventService from "../../services/event_service";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPickerPopup from "../../common/EmojiPickerPopup";

const explorerTopic = process.env.REACT_APP_EXPLORER_TOPIC || "";

/**
 * SendNewPost Component
 * A complex form component that handles creating and sending new posts with media attachments.
 * The component manages a multi-step posting process:
 * 1. Edit Mode: Compose message and attach media
 * 2. Processing Mode: Handle media upload and message posting to different destinations
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Callback function to close the post form
 */

/**
 * Maximum allowed file size for media uploads (100MB)
 */
const maxSize = 100 * 1024 * 1024;

/**
 * Step status type definition for tracking the state of each posting step
 * @typedef {Object} StepStatus
 * @property {string} status - Current status ('idle' | 'loading' | 'success' | 'error')
 * @property {boolean} disabled - Whether the step is currently disabled
 */

const SendNewPost = ({ onClose }: { onClose: () => void }) => {
  const { data: accountId } = useAccountId();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { uploadToArweave, uploading, arweaveId, error } = useUploadToArweave();
  const { send } = useSendMessage();
  const { profileData } = useProfileData(accountId);
  const profileId = profileData ? profileData.UserMessages : "";
  const [memo, setMemo] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const { triggerRefresh } = useRefreshTrigger();

  // New state for step statuses
  const [stepStatuses, setStepStatuses] = useState({
    arweave: { status: "idle", disabled: false },
    explorer: { status: "idle", disabled: true },
    profile: { status: "idle", disabled: true },
  });

  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Add emoji handler
  const onEmojiClick = (emojiData: { emoji: string }) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const clearFile = () => {
    setFile(null);
  };

  /**
   * Initiates the posting process by validating inputs and transitioning to processing mode
   * Performs checks for:
   * - Message content presence
   * - File size limits
   * - Sets appropriate initial step statuses
   */
  const handleStartPosting = () => {
    if (!message) {
      toast.error("Please enter a message");
      return;
    }

    if (file && file.size > maxSize) {
      toast.error("The file exceeds 100MB.");
      return;
    }

    if (!file) {
      setStepStatuses({
        arweave: { status: "idle", disabled: true },
        explorer: { status: "idle", disabled: false },
        profile: { status: "idle", disabled: true },
      });
    }

    setIsEditing(false);
  };

  /**
   * Handles the media upload process to Arweave
   * - Updates step status during upload
   * - Manages success/error states
   * - Enables the next step (Explorer) on success
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
        explorer: { status: "idle", disabled: false },
      }));
    } catch (e) {
      toast.error("Media upload failed.");
      setStepStatuses((prev) => ({
        ...prev,
        arweave: { status: "error", disabled: false },
      }));
    }
  };

  /**
   * Handles posting the message to the Explorer topic
   * - Updates step status during posting
   * - Manages success/error states
   * - Enables the next step (Profile) on success
   */
  const handleExplorerPost = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      explorer: { status: "loading", disabled: true },
    }));

    try {
      const postPayload = {
        Type: "Post",
        Message: message,
        Media: uploadedMediaId,
      };

      const postExplorer = await send(explorerTopic, postPayload, memo);

      if (postExplorer?.receipt.result.toString() === "SUCCESS") {
        toast.success(`Your post sent to explorer successfully.`);
        setStepStatuses((prev) => ({
          ...prev,
          explorer: { status: "success", disabled: true },
          profile: { status: "idle", disabled: false },
        }));
      } else {
        throw new Error("Explorer post failed");
      }
    } catch (e) {
      toast.error("Failed to send post to explorer.");
      setStepStatuses((prev) => ({
        ...prev,
        explorer: { status: "error", disabled: false },
      }));
    }
  };

  /**
   * Handles posting the message to the user's profile
   * - Final step in the posting process
   * - Triggers refresh and closes form on success
   * - Manages success/error states
   */
  const handleProfilePost = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      profile: { status: "loading", disabled: true },
    }));

    try {
      const postPayload = {
        Type: "Post",
        Message: message,
        Media: uploadedMediaId,
      };

      const postUserMessages = await send(profileId, postPayload, memo);

      if (postUserMessages?.receipt.result.toString() === "SUCCESS") {
        toast.success(`Your post sent to your profile successfully.`);
        setStepStatuses((prev) => ({
          ...prev,
          profile: { status: "success", disabled: true },
        }));
        toast.success("Your post sent to Hedera successfully!");
        onClose();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        eventService.emit("refreshExplorer");
      } else {
        throw new Error("Profile post failed");
      }
    } catch (e) {
      toast.error("Failed to send post to your profile.");
      setStepStatuses((prev) => ({
        ...prev,
        profile: { status: "error", disabled: false },
      }));
    }
  };

  /**
   * Renders the processing steps interface
   * Shows:
   * - Message preview
   * - Media preview (if present)
   * - Step-by-step progress indicators
   * - Action buttons for each step
   */
  const renderProcessingSteps = () => (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-text mb-4">
        Post your message
      </h1>

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
              <div
                className="absolute bottom-0 left-0 right-0 px-3 py-2
                bg-gradient-to-t from-black/50 to-transparent"
              >
                <div className="flex items-center text-white/90">
                  <MdOutlinePermMedia className="text-lg mr-2" />
                  <span className="text-sm">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Steps */}
      <div className="space-y-4 mx-4">
        {file && (
          <div
            className="flex justify-between items-center p-3 
            hover:bg-secondary/30 rounded-lg transition-colors"
          >
            <div className="flex-1">
              <span
                className={`text-base font-medium ${
                  stepStatuses.arweave.status === "success"
                    ? "text-success"
                    : stepStatuses.arweave.status === "error"
                    ? "text-error"
                    : stepStatuses.arweave.disabled
                    ? "text-gray-500"
                    : "text-text"
                }`}
              >
                Upload Media To Arweave
              </span>
              {stepStatuses.arweave.status === "error" && (
                <p className="text-sm text-error/80 mt-1">
                  Failed to upload. Please try again.
                </p>
              )}
            </div>
            <button
              onClick={handleArweaveUpload}
              disabled={
                stepStatuses.arweave.disabled ||
                stepStatuses.arweave.status === "loading"
              }
              className={`px-6 py-2 rounded-lg transition-all duration-200 
                font-medium min-w-[120px] flex items-center justify-center
                ${
                  stepStatuses.arweave.status === "success"
                    ? "bg-success text-white"
                    : stepStatuses.arweave.status === "loading"
                    ? "bg-secondary text-text animate-pulse cursor-not-allowed"
                    : stepStatuses.arweave.status === "error"
                    ? "bg-error hover:bg-error/80 text-white"
                    : stepStatuses.arweave.disabled
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-primary hover:bg-accent text-background"
                }`}
            >
              {stepStatuses.arweave.status === "loading" ? (
                "Processing..."
              ) : stepStatuses.arweave.status === "success" ? (
                <>
                  <RiCheckLine className="mr-1.5" />
                  Done
                </>
              ) : stepStatuses.arweave.status === "error" ? (
                <>
                  <RiRefreshLine className="mr-1.5" />
                  Retry
                </>
              ) : (
                "Start"
              )}
            </button>
          </div>
        )}

        {/* Explorer Step */}
        <div
          className="flex justify-between items-center p-3 
          hover:bg-secondary/30 rounded-lg transition-colors"
        >
          <div className="flex-1">
            <span
              className={`text-base font-medium ${
                stepStatuses.explorer.status === "success"
                  ? "text-success"
                  : stepStatuses.explorer.status === "error"
                  ? "text-error"
                  : stepStatuses.explorer.disabled
                  ? "text-gray-500"
                  : "text-text"
              }`}
            >
              Send To Explorer
            </span>
            {stepStatuses.explorer.status === "error" && (
              <p className="text-sm text-error/80 mt-1">
                Transaction failed. Please try again.
              </p>
            )}
          </div>
          <button
            onClick={handleExplorerPost}
            disabled={
              stepStatuses.explorer.disabled ||
              stepStatuses.explorer.status === "loading"
            }
            className={`px-6 py-2 ml-3 rounded-lg transition-all duration-200 
              font-medium min-w-[120px] flex items-center justify-center
              ${
                stepStatuses.explorer.status === "success"
                  ? "bg-success text-white"
                  : stepStatuses.explorer.status === "loading"
                  ? "bg-secondary text-text animate-pulse cursor-not-allowed"
                  : stepStatuses.explorer.status === "error"
                  ? "bg-error hover:bg-error/80 text-white"
                  : stepStatuses.explorer.disabled
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-primary hover:bg-accent text-background"
              }`}
          >
            {stepStatuses.explorer.status === "loading" ? (
              "Processing..."
            ) : stepStatuses.explorer.status === "success" ? (
              <>
                <RiCheckLine className="mr-1.5" />
                Done
              </>
            ) : stepStatuses.explorer.status === "error" ? (
              <>
                <RiRefreshLine className="mr-1.5" />
                Retry
              </>
            ) : (
              "Start"
            )}
          </button>
        </div>

        {/* Profile Step - Similar pattern */}
        <div
          className="flex justify-between items-center p-3 
          hover:bg-secondary/30 rounded-lg transition-colors"
        >
          <div className="flex-1">
            <span
              className={`text-base  font-medium ${
                stepStatuses.profile.status === "success"
                  ? "text-success"
                  : stepStatuses.profile.status === "error"
                  ? "text-error"
                  : stepStatuses.profile.disabled
                  ? "text-gray-500"
                  : "text-text"
              }`}
            >
              Send To Your Profile
            </span>
            {stepStatuses.profile.status === "error" && (
              <p className="text-sm text-error/80 mt-1">
                Transaction failed. Please try again.
              </p>
            )}
          </div>
          <button
            onClick={handleProfilePost}
            disabled={
              stepStatuses.profile.disabled ||
              stepStatuses.profile.status === "loading"
            }
            className={`px-6 py-2 ml-3 rounded-lg transition-all duration-200 
              font-medium min-w-[120px] flex items-center justify-center
              ${
                stepStatuses.profile.status === "success"
                  ? "bg-success text-white"
                  : stepStatuses.profile.status === "loading"
                  ? "bg-secondary text-text animate-pulse cursor-not-allowed"
                  : stepStatuses.profile.status === "error"
                  ? "bg-error hover:bg-error/80 text-white"
                  : stepStatuses.profile.disabled
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-primary hover:bg-accent text-background"
              }`}
          >
            {stepStatuses.profile.status === "loading" ? (
              "Processing..."
            ) : stepStatuses.profile.status === "success" ? (
              <>
                <RiCheckLine className="mr-1.5" />
                Done
              </>
            ) : stepStatuses.profile.status === "error" ? (
              <>
                <RiRefreshLine className="mr-1.5" />
                Retry
              </>
            ) : (
              "Start"
            )}
          </button>
        </div>
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
   * Renders the message composition form
   * Features:
   * - Message input with character limit
   * - Media upload/preview
   * - File size validation
   * - Post button with validation
   */
  const renderEditForm = () => (
    <div className="flex flex-col max-h-[80vh] bg-background rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-primary flex items-center">
        <div>
          <h3 className="text-xl font-semibold text-primary">Create a Post</h3>
          <p className="text-sm text-text/60 mt-1">
            Share your thoughts with the community
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

            {/* Media, Emoji, and GIF buttons */}
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

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="h-1.5 w-full bg-text/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full animate-progress" />
                          </div>
                        </div>
                        <span className="text-sm text-text/70 animate-pulse">
                          Uploading...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div
                      className="mt-3 flex items-center text-sm text-error 
                      bg-error/10 px-4 py-2.5 rounded-lg"
                    >
                      <span className="mr-2">⚠️</span>
                      <span className="flex-1">{error}</span>
                    </div>
                  )}
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

          {/* Post Button */}
          <button
            onClick={handleStartPosting}
            disabled={!message.trim() && !file}
            className={`px-8 py-2.5 font-semibold rounded-full transition-all 
              duration-200 hover:shadow-lg active:scale-98 ${
                !message.trim() && !file
                  ? "bg-primary text-text cursor-not-allowed"
                  : "bg-primary hover:bg-accent text-background"
              }`}
          >
            Post
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

export default SendNewPost;
