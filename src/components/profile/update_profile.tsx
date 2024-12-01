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

import useProfileData from "../../hooks/use_profile_data";
import useSendMessage from "../../hooks/use_send_message";
import useUploadToArweave from "../media/use_upload_to_arweave";
import ReadMediaFile from "../media/read_media_file";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";
import { useWallet, useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
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
    if (file) {
      if (file.size > maxSize) {
        toast.error("The file exceeds 100MB.");
        return;
      }
      setPicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setStepStatuses((prev) => ({
        ...prev,
        arweave: { status: "idle", disabled: false },
      }));
    }
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
        toast.success("Profile Updated Successfully");
        onClose();
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
      className="p-6 overflow-y-auto max-h-[80vh]
      scrollbar scrollbar-w-2
      scrollbar-thumb-accent hover:scrollbar-thumb-primary
      scrollbar-track-secondary/10
      scrollbar-thumb-rounded-full scrollbar-track-rounded-full
      transition-colors duration-200 ease-in-out
      dark:scrollbar-thumb-accent/50 dark:hover:scrollbar-thumb-primary/70
      dark:scrollbar-track-secondary/5"
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
      <div className="px-6 py-4 border-b border-text/10">
        <h3 className="text-xl font-semibold text-primary">Update Profile</h3>
        <p className="text-sm text-text/60 mt-1">
          Update your profile information
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div
        className="flex-1 overflow-y-auto
        scrollbar scrollbar-w-2
        scrollbar-thumb-accent hover:scrollbar-thumb-primary
        scrollbar-track-secondary/10
        scrollbar-thumb-rounded-full scrollbar-track-rounded-full
        transition-colors duration-200 ease-in-out
        dark:scrollbar-thumb-accent/50 dark:hover:scrollbar-thumb-primary/70
        dark:scrollbar-track-secondary/5"
      >
        <div className="p-6 space-y-6">
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
            <div className="text-right text-xs mt-1 text-text/50">
              {name.length}/50
            </div>
          </div>

          {/* Bio Input */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary text-text 
                focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[120px]
                scrollbar scrollbar-w-2
                scrollbar-thumb-accent hover:scrollbar-thumb-primary
                scrollbar-track-secondary/10
                scrollbar-thumb-rounded-full scrollbar-track-rounded-full
                transition-colors duration-200 ease-in-out
                dark:scrollbar-thumb-accent/50 dark:hover:scrollbar-thumb-primary/70
                dark:scrollbar-track-secondary/5"
              placeholder="Tell us about yourself"
              rows={5}
              maxLength={160}
            />
            <div
              className={`text-right text-xs mt-1 ${
                bio.length > 140 ? "text-primary" : "text-text/50"
              }`}
            >
              {bio.length}/160
            </div>
          </div>

          {/* Profile Picture Section */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-text mb-2">
              Profile Picture
            </label>

            <div className="relative">
              {picturePreview ? (
                // Profile picture container
                <div className="rounded-xl overflow-hidden bg-secondary/20">
                  {/* Image Container */}
                  <div className="relative">
                    {picture ? (
                      // New picture preview
                      <img
                        src={picturePreview}
                        alt="Profile Preview"
                        className="w-full max-h-[300px] object-contain bg-black/5"
                      />
                    ) : (
                      // Existing profile picture
                      <div className="w-full max-h-[300px]">
                        <ReadMediaFile cid={picturePreview} />
                      </div>
                    )}
                  </div>

                  {/* Controls below image */}
                  <div className="p-4 border-t border-text/10">
                    <div className="flex flex-col space-y-2">
                      {/* Image Info */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-text">Profile Picture</p>
                        {picture && (
                          <p className="text-xs text-text/50">
                            {(picture.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {/* Change picture button */}
                        <label
                          htmlFor="pictureUpload"
                          className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg 
                            bg-primary hover:bg-accent text-background cursor-pointer 
                            transition-colors duration-200 font-medium"
                        >
                          <MdOutlinePermMedia className="text-lg mr-2" />
                          Change Picture
                        </label>

                        {/* Remove picture button */}
                        <button
                          onClick={clearPicture}
                          className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg
                            bg-error hover:bg-error/80 text-background 
                            transition-colors duration-200 font-medium"
                        >
                          <RiDeleteBinLine className="text-lg mr-2" />
                          Remove Picture
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Upload new picture
                <label
                  htmlFor="pictureUpload"
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
                      Add Profile Picture
                    </p>
                    <p className="text-xs text-text/50 mt-1">Up to 100MB</p>
                  </div>
                </label>
              )}

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
      <div className="border-t border-text/10 bg-background/95 backdrop-blur-sm">
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

  return (
    <div className="max-w-md mx-auto bg-background rounded-lg shadow-xl p-3 text-text">
      {isEditing ? renderEditForm() : renderProcessingSteps()}
    </div>
  );
};

export default UpdateProfile;
