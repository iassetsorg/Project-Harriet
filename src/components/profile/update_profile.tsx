/**
 * UpdateProfile is a React component that provides a form interface for users to update their profile information.
 * It handles:
 * - Profile picture upload to Arweave
 * - Basic profile information (name, bio, website)
 * - Two-step update process (upload picture, then update profile)
 * - Real-time status updates and error handling
 */

import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { MdOutlinePermMedia } from "react-icons/md";
import { RiDeleteBinLine, RiCheckLine, RiRefreshLine } from "react-icons/ri";
import { BsEmojiSmile } from "react-icons/bs";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import useProfileData from "../../hooks/use_profile_data";
import useSendMessage from "../../hooks/use_send_message";
import useUploadToArweave from "../media/use_upload_to_arweave";
import ReadMediaFile from "../media/read_media_file";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import EmojiPickerPopup from "../../common/EmojiPickerPopup";
const REFRESH_DELAY = Number(process.env.REACT_APP_REFRESH_DELAY_MS);
interface StepStatus {
  status: "idle" | "loading" | "success" | "error";
  disabled: boolean;
}

interface ProfileUpdateSteps {
  arweave?: StepStatus;
  updateProfile: StepStatus;
}

const UpdateProfile = ({ onClose }: { onClose: () => void }) => {
  const { data: accountId } = useAccountId();

  const signingAccount = accountId;
  const { send } = useSendMessage();
  const { profileData } = useProfileData(signingAccount);
  const userProfileTopicId = profileData ? profileData.ProfileTopic : "";
  const userMessagesTopicId = profileData ? profileData.UserMessages : "";
  const { uploadToArweave, uploading, error } = useUploadToArweave();
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const { triggerRefresh } = useRefreshTrigger();
  // Form states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSize = 100 * 1024 * 1024; // 100 MB

  // Step statuses
  const [stepStatuses, setStepStatuses] = useState<ProfileUpdateSteps>({
    arweave: picture ? { status: "idle", disabled: false } : undefined,
    updateProfile: { status: "idle", disabled: true },
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Add emoji handler with proper type
  const onEmojiClick = (emojiData: { emoji: string }) => {
    setBio((prevBio) => prevBio + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Add trim state
  const [showTrim, setShowTrim] = useState(false);

  // Add trim function
  const handleTrim = () => {
    // Trim name
    const trimmedName = name.trim();
    setName(trimmedName);

    // Trim bio
    const trimmedBio = bio.trim();
    setBio(trimmedBio);

    // Trim website
    const trimmedWebsite = website.trim();
    setWebsite(trimmedWebsite);

    setShowTrim(false);
    toast.success("Text fields trimmed successfully!");
  };

  /**
   * Initializes form data with existing profile information when available
   * Populates name, bio, website, and profile picture from profileData
   */
  useEffect(() => {
    if (signingAccount && profileData) {
      setName(profileData.Name || "");
      setBio(profileData.Bio || "");
      setWebsite(profileData.Website || "");
      if (profileData.Picture) {
        setPicturePreview(profileData.Picture);
      }
    }
  }, [signingAccount, profileData]);

  /**
   * Clears the current profile picture selection and resets related states
   * Also removes the file from the file input and updates step statuses
   */
  const clearPicture = () => {
    setPicture(null);
    setPicturePreview(null);
    setTempImage(null);
    resetCrop();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setStepStatuses((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses.arweave;
      return newStatuses;
    });
  };

  /**
   * Handles file selection for profile picture
   * Validates file size, creates preview, and updates step statuses
   * @param {React.ChangeEvent<HTMLInputElement>} event - File input change event
   */
  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input if no file selected
      }
      return;
    }

    if (file.size > maxSize) {
      toast.error("The file exceeds 100MB.");
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input on error
      }
      return;
    }

    resetCrop();
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Initiates the profile update process
   * Validates required fields and sets up the appropriate update steps
   * based on whether a new profile picture needs to be uploaded
   */
  const handleStartUpdate = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (picture && picture.size > maxSize) {
      toast.error("The file exceeds 100MB.");
      return;
    }

    setIsEditing(false);

    // If no picture to upload, enable profile update directly
    if (!picture) {
      setStepStatuses({
        updateProfile: { status: "idle", disabled: false },
      });
    } else {
      setStepStatuses({
        arweave: { status: "idle", disabled: false },
        updateProfile: { status: "idle", disabled: true },
      });
    }
  };

  /**
   * Handles the upload of profile picture to Arweave
   * Updates step statuses during the process and handles success/error states
   * @returns {Promise<void>}
   */
  const handleArweaveUpload = async () => {
    if (!picture) return;

    setStepStatuses((prev) => ({
      ...prev,
      arweave: { status: "loading", disabled: true },
    }));

    try {
      toast.info("Uploading your profile picture to Arweave...");
      const mediaId = await uploadToArweave(picture);
      setUploadedMediaId(`${mediaId}`);
      toast.success("Profile picture uploaded to Arweave successfully.");

      setStepStatuses((prev) => ({
        ...prev,
        arweave: { status: "success", disabled: true },
        updateProfile: { status: "idle", disabled: false },
      }));
    } catch (e) {
      toast.error("Profile picture upload failed.");
      setStepStatuses((prev) => ({
        ...prev,
        arweave: { status: "error", disabled: false },
        updateProfile: { status: "idle", disabled: true },
      }));
    }
  };

  /**
   * Performs the final profile update by sending the update message
   * Updates step statuses and handles success/error states
   * @returns {Promise<void>}
   */
  const handleUpdateProfile = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      updateProfile: { status: "loading", disabled: true },
    }));

    try {
      const updateMessage = {
        Identifier: "iAssets",
        Type: "Profile",
        Author: signingAccount,
        Name: name,
        Bio: bio,
        Website: website,
        ...(userMessagesTopicId && { UserMessages: userMessagesTopicId }),
        Picture: uploadedMediaId ? `${uploadedMediaId}` : picturePreview,
      };

      const updateProfile = await send(userProfileTopicId, updateMessage, "");

      if (updateProfile?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          updateProfile: { status: "success", disabled: true },
        }));
        onClose();
        toast.success("Profile Updated Successfully");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        triggerRefresh();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        updateProfile: { status: "error", disabled: false },
      }));
      toast.error("Failed to Update Profile");
    }
  };

  /**
   * Renders a step button with appropriate styling based on its current status
   * @param {keyof ProfileUpdateSteps} step - The step identifier
   * @param {string} label - Button label text
   * @param {() => void} handler - Click handler function
   * @returns {JSX.Element | null} The rendered button or null if step doesn't exist
   */
  const renderStepButton = (
    step: keyof ProfileUpdateSteps,
    label: string,
    handler: () => void
  ) => {
    const status = stepStatuses[step];
    if (!status) return null;

    return (
      <div className="flex justify-between items-center p-3 hover:bg-secondary/30 rounded-lg transition-colors">
        <div className="flex-1">
          <span
            className={`text-base font-medium ${
              status.status === "success"
                ? "text-success"
                : status.status === "error"
                ? "text-error"
                : status.disabled
                ? "text-text/50"
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
                ? "bg-success text-white"
                : status.status === "loading"
                ? "bg-secondary text-text animate-pulse cursor-not-allowed"
                : status.status === "error"
                ? "bg-error hover:bg-error/80 text-white"
                : status.disabled
                ? "bg-text/10 text-text/50 cursor-not-allowed"
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
   * Renders the processing steps view showing update progress
   * Displays preview of changes and step-by-step update buttons
   * @returns {JSX.Element} The processing steps interface
   */
  const renderProcessingSteps = () => (
    <div
      className="p-6 overflow-y-auto max-h-[80vh]         scrollbar scrollbar-w-1
        scrollbar-thumb-accent hover:scrollbar-thumb-primary
        scrollbar-track-secondary/10
        scrollbar-thumb-rounded-full scrollbar-track-rounded-full
        transition-colors duration-200 ease-in-out"
    >
      <h1 className="text-xl font-semibold text-text mb-4">Update Profile</h1>

      {/* Preview Section */}
      <div className="mb-6 p-5 bg-secondary rounded-xl mx-4">
        <div className="space-y-3">
          <div>
            <span className="text-text/60">Name:</span>
            <p className="text-text text-lg">{name}</p>
          </div>
          {bio && (
            <div>
              <span className="text-text/60">Bio:</span>
              <p className="text-text">{bio}</p>
            </div>
          )}
          {website && (
            <div>
              <span className="text-text/60">Website:</span>
              <p className="text-text">{website}</p>
            </div>
          )}
        </div>

        {/* Picture Preview with Upload Progress */}
        {picture && (
          <div className="mt-4">
            <div className="rounded-xl overflow-hidden bg-secondary/20">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={URL.createObjectURL(picture)}
                  alt="Preview"
                  className="w-full max-h-[300px] object-contain bg-black/5"
                />
              </div>

              {/* File Info and Upload Status */}
              <div className="p-3 border-t border-text/5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm text-text">Profile Picture</p>
                    <p className="text-xs text-text/50 mt-0.5">
                      {(picture.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Steps */}
      <div className="space-y-4 mx-4">
        {/* Upload Profile Picture Step */}
        {renderStepButton(
          "arweave",
          "Upload Profile Picture",
          handleArweaveUpload
        )}

        {/* Update Profile Step */}
        {renderStepButton(
          "updateProfile",
          "Update Profile",
          handleUpdateProfile
        )}

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full bg-secondary hover:bg-error text-text py-2.5 mt-3 px-4 rounded-full transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  /**
   * Renders the edit form view for updating profile information
   * Includes inputs for name, bio, website, and profile picture
   * @returns {JSX.Element} The edit form interface
   */
  const renderEditForm = () => (
    <div className="flex flex-col max-h-[80vh] bg-background rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-primary">
        <h3 className="text-xl font-semibold text-primary">Update Profile</h3>
        <p className="text-sm text-text/60 mt-1">
          Update your profile information
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Profile Picture Section - Moved to top */}
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              {picturePreview ? (
                <>
                  {/* Image Preview - Centered */}
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary mb-4">
                    {picture ? (
                      <img
                        src={picturePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full">
                        <ReadMediaFile cid={picturePreview} />
                      </div>
                    )}
                  </div>

                  {/* Controls - Below image */}
                  <div className="flex gap-2 justify-center mt-4">
                    <label
                      htmlFor="pictureUpload"
                      className="w-10 h-10 flex items-center justify-center rounded-full 
                        bg-primary hover:bg-accent text-background cursor-pointer 
                        transition-all duration-200"
                      title="Change Picture"
                    >
                      <MdOutlinePermMedia className="text-xl" />
                    </label>
                    <button
                      onClick={clearPicture}
                      className="w-10 h-10 flex items-center justify-center rounded-full
                        bg-error/10 hover:bg-error text-error hover:text-background 
                        transition-all duration-200"
                      title="Remove Picture"
                    >
                      <RiDeleteBinLine className="text-xl" />
                    </button>
                  </div>
                </>
              ) : (
                // Upload new picture button - Centered
                <label
                  htmlFor="pictureUpload"
                  className="flex flex-col items-center gap-3 p-6 cursor-pointer rounded-xl
                    border-2 border-dashed border-primary/50 hover:border-primary
                    transition-all duration-200 w-full max-w-xs"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <MdOutlinePermMedia className="text-4xl text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-text">Add Profile Picture</p>
                    <p className="text-sm text-text/50">Up to 100MB</p>
                  </div>
                </label>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              id="pictureUpload"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePictureChange}
            />
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
              maxLength={50}
            />
          </div>

          {/* Bio Input with Emoji Picker */}
          <div className="relative">
            <label className="block text-sm font-semibold text-text mb-2">
              Bio
            </label>
            <div className="relative">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary text-text 
                  focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[120px]
                 scrollbar scrollbar-w-1
        scrollbar-thumb-accent hover:scrollbar-thumb-primary
        scrollbar-track-secondary/10
        scrollbar-thumb-rounded-full scrollbar-track-rounded-full
        transition-colors duration-200 ease-in-out"
                placeholder="About yourself"
                rows={5}
                maxLength={160}
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute bottom-3 left-3 p-2 hover:bg-primary/10 rounded-full transition-colors group"
                type="button"
              >
                <BsEmojiSmile className="text-xl text-primary group-hover:text-accent" />
              </button>
            </div>

            {/* Emoji Picker Popup */}
            {showEmojiPicker && (
              <EmojiPickerPopup
                onEmojiClick={onEmojiClick}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>

          {/* Website Input */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Website
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your website URL"
              maxLength={100}
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-primary bg-background/95 backdrop-blur-sm">
        <div className="px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-semibold rounded-full bg-secondary hover:bg-error text-text transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleStartUpdate}
            disabled={!name.trim()}
            className={`px-8 py-2.5 font-semibold rounded-full transition-all 
            duration-200 hover:shadow-lg active:scale-98 ${
              !name.trim()
                ? "bg-primary/30 text-text/30 cursor-not-allowed"
                : "bg-primary hover:bg-accent text-background"
            }`}
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );

  // Add these new states after other state declarations
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    x: 25,
    y: 25,
    height: 50,
  });
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  // Add new function to handle crop completion
  const handleCropComplete = async () => {
    if (!cropImageRef.current || !crop || !tempImage) return;

    const canvas = document.createElement("canvas");
    const scaleX =
      cropImageRef.current.naturalWidth / cropImageRef.current.width;
    const scaleY =
      cropImageRef.current.naturalHeight / cropImageRef.current.height;

    // Set canvas size to match crop size exactly
    canvas.width = crop.width || 0;
    canvas.height = crop.height || 0;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Draw image directly without padding
    ctx.drawImage(
      cropImageRef.current,
      (crop.x || 0) * scaleX,
      (crop.y || 0) * scaleY,
      (crop.width || 0) * scaleX,
      (crop.height || 0) * scaleY,
      0,
      0,
      crop.width || 0,
      crop.height || 0
    );

    // Convert the canvas to a blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped-profile.jpg", {
            type: "image/jpeg",
          });
          setPicture(croppedFile);
          setPicturePreview(URL.createObjectURL(croppedFile));
          setStepStatuses((prev) => ({
            ...prev,
            arweave: { status: "idle", disabled: false },
          }));
        }
      },
      "image/jpeg",
      1 // Maximum quality
    );

    setShowCropper(false);
    setTempImage(null);
  };

  // Add resetCrop function
  const resetCrop = () => {
    setCrop({
      unit: "%",
      width: 50,
      x: 25,
      y: 25,
      height: 50,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-background rounded-lg shadow-xl p-3 text-text">
      {isEditing ? renderEditForm() : renderProcessingSteps()}
      {showTrim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-text mb-2">
              Trim Text Fields
            </h3>
            <p className="text-text/70 mb-4">
              This will remove leading and trailing spaces from all text fields.
              Continue?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTrim(false)}
                className="px-4 py-2 rounded-lg bg-secondary text-text hover:bg-error transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTrim}
                className="px-4 py-2 rounded-lg bg-primary text-background hover:bg-accent transition-colors"
              >
                Trim
              </button>
            </div>
          </div>
        </div>
      )}
      {showCropper && tempImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-xl max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-text mb-4">
              Crop Profile Picture
            </h3>
            <div className="relative max-h-[60vh] overflow-hidden">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                circularCrop
                className="rounded-xl"
                style={
                  {
                    "--ReactCrop-crop-border": "3px solid #fff",
                    "--ReactCrop-crop-outline": "1px solid rgba(0,0,0,0.5)",
                    "--ReactCrop-crop-handles-border-color": "#fff",
                    "--ReactCrop-crop-handles-background-color": "#2563eb",
                    "--ReactCrop-crop-area-border-color": "#fff",
                  } as React.CSSProperties
                }
              >
                <img
                  ref={cropImageRef}
                  src={tempImage}
                  alt="Crop preview"
                  className="max-w-full max-h-[50vh] object-contain"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowCropper(false);
                  setTempImage(null);
                  resetCrop();
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Reset file input
                  }
                }}
                className="px-4 py-2 rounded-lg bg-secondary text-text hover:bg-error transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                className="px-4 py-2 rounded-lg bg-primary text-background hover:bg-accent transition-colors"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProfile;
