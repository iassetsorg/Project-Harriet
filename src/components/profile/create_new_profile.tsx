/**
 * CreateProfile Component
 *
 * A comprehensive form component that handles user profile creation in the Hedera network.
 * This component manages a multi-step process including:
 * 1. Profile Information Collection
 *    - Name (required)
 *    - Bio
 *    - Website
 *    - Profile Picture
 *
 * 2. Hedera Network Integration
 *    - Creates user messages topic
 *    - Creates profile topic
 *    - Mints profile NFT
 *
 * 3. Media Handling
 *    - Profile picture upload to Arweave
 *    - Image preview
 *    - File validation
 *
 * Features:
 * - Step-by-step progress tracking
 * - Real-time status updates
 * - Error handling with retry capability
 * - Toast notifications for user feedback
 * - Responsive design
 */

import React, { useState, useRef } from "react";
import {
  TransactionReceipt,
  PublicKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  Hbar,
  Signer,
} from "@hashgraph/sdk";
import { toast } from "react-toastify";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdFileDownloadDone, MdOutlinePermMedia } from "react-icons/md";
import { RiDeleteBinLine, RiCheckLine, RiRefreshLine } from "react-icons/ri";
import { Buffer } from "buffer";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import useSendMessage from "../../hooks/use_send_message";
import useCreateTopic from "../../hooks/use_create_topic";
import useUploadToArweave from "../media/use_upload_to_arweave";
import {
  useWallet,
  useAccountId,
  useWatchTransactionReceipt,
} from "@buidlerlabs/hashgraph-react-wallets";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";
import EmojiPickerPopup from "../../common/EmojiPickerPopup";

/**
 * StepStatus Interface
 * Tracks the state of each step in the profile creation process
 * @property {string} status - Current status of the step (idle/loading/success/error)
 * @property {boolean} disabled - Whether the step is currently disabled
 */
interface StepStatus {
  status: "idle" | "loading" | "success" | "error";
  disabled: boolean;
}

/**
 * ProfileStepStatuses Interface
 * Manages the status of all steps in the profile creation process
 * Each step represents a distinct operation in creating the user profile
 */
interface ProfileStepStatuses {
  userMessagesTopic: StepStatus; // Status of creating user messages topic
  uploadPicture?: StepStatus; // Status of uploading profile picture (optional)
  initiateUserMessages: StepStatus; // Status of initializing user messages
  profileTopic: StepStatus; // Status of creating profile topic
  initiateUserProfile: StepStatus; // Status of initializing user profile
  createProfileToken: StepStatus; // Status of creating profile token
  mintProfileNFT: StepStatus; // Status of minting profile NFT
  uploadBanner?: StepStatus; // Status of uploading banner (optional)
}

/**
 * CreateNewProfile Component
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Handler for closing the profile creation modal
 */
const CreateNewProfile = ({ onClose }: { onClose: () => void }) => {
  // Wallet and account management
  const wallet = useWallet();
  const signer = wallet.signer as Signer;
  const { data: accountId } = useAccountId();
  const { watch } = useWatchTransactionReceipt();

  // Hedera network interactions
  const { send } = useSendMessage();
  const { create } = useCreateTopic();
  const signingAccount = accountId;

  // Media upload handling
  const { uploadToArweave } = useUploadToArweave();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * State Management
   * Handles all form inputs and process statuses
   */
  const [name, setName] = useState(""); // User's name
  const [bio, setBio] = useState(""); // User's bio
  const [website, setWebsite] = useState(""); // User's website
  const [picture, setPicture] = useState<File | null>(null); // Profile picture file
  const [banner, setBanner] = useState<File | null>(null); // Banner image file
  const [isEditing, setIsEditing] = useState(true); // Edit mode flag
  const [picturePreview, setPicturePreview] = useState<string | null>(null); // Picture preview URL

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [stepStatuses, setStepStatuses] = useState<ProfileStepStatuses>({
    userMessagesTopic: { status: "idle", disabled: false },
    uploadPicture: picture ? { status: "idle", disabled: true } : undefined,
    initiateUserMessages: { status: "idle", disabled: true },
    profileTopic: { status: "idle", disabled: true },
    initiateUserProfile: { status: "idle", disabled: true },
    createProfileToken: { status: "idle", disabled: true },
    mintProfileNFT: { status: "idle", disabled: true },
    uploadBanner: banner ? { status: "idle", disabled: true } : undefined,
  });

  const [userMessagesTopicId, setUserMessagesTopicId] = useState("");
  const [profileTopicId, setProfileTopicId] = useState("");
  const [profileTokenId, setProfileTokenId] = useState("");
  const [pictureHash, setPictureHash] = useState<string | null>(null);
  const [bannerHash, setBannerHash] = useState<string | null>(null);

  const { triggerRefresh } = useRefreshTrigger();

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

  /**
   * Clears the selected profile picture
   * Resets related states and input
   */
  const clearPicture = () => {
    setPicture(null);
    setPicturePreview(null);
    setTempImage(null);
    resetCrop();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setStepStatuses((prev) => ({
      ...prev,
      uploadPicture: undefined,
    }));
  };

  /**
   * Handles the change of profile picture
   * Updates preview and related states
   */
  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error("The file exceeds 100MB.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
   * Handles the start of profile creation process
   * Validates required fields and initializes the step statuses
   */
  const handleStartProfileCreation = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setIsEditing(false);
    setStepStatuses({
      userMessagesTopic: { status: "idle", disabled: false },
      uploadPicture: picture ? { status: "idle", disabled: true } : undefined,
      initiateUserMessages: { status: "idle", disabled: true },
      profileTopic: { status: "idle", disabled: true },
      initiateUserProfile: { status: "idle", disabled: true },
      createProfileToken: { status: "idle", disabled: true },
      mintProfileNFT: { status: "idle", disabled: true },
      uploadBanner: banner ? { status: "idle", disabled: true } : undefined,
    });
  };

  /**
   * Handles the creation of user messages topic
   * Creates a new topic on Hedera for user messages
   */
  const handleCreateUserMessagesTopic = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      userMessagesTopic: { status: "loading", disabled: true },
    }));
    try {
      const createdTopicId = await create("ibird UserMessages", "", false);
      if (createdTopicId) {
        setUserMessagesTopicId(createdTopicId);
        setStepStatuses((prev) => ({
          ...prev,
          userMessagesTopic: { status: "success", disabled: true },
          uploadPicture: picture
            ? { status: "idle", disabled: false }
            : undefined,
        }));
        toast.success("User Messages Topic created successfully.");
      } else {
        throw new Error("Failed to create User Messages Topic");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        userMessagesTopic: { status: "error", disabled: false },
      }));
      toast.error("Failed to create User Messages Topic.");
    }
  };

  /**
   * Initializes user messages topic
   * Sends initial configuration message to the topic
   */
  const handleInitiateUserMessages = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      initiateUserMessages: { status: "loading", disabled: true },
    }));
    try {
      const InitiatingUserMessagesTopic = {
        Identifier: "iAssets",
        Type: "UserMessages",
        Author: signingAccount,
      };
      const initiatingUserMessages = await send(
        userMessagesTopicId,
        InitiatingUserMessagesTopic,
        ""
      );
      if (initiatingUserMessages?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          initiateUserMessages: { status: "success", disabled: true },
          profileTopic: { status: "idle", disabled: false },
        }));
        toast.success("User Messages Topic initiated successfully.");
      } else {
        throw new Error("Failed to initiate User Messages Topic");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        initiateUserMessages: { status: "error", disabled: false },
      }));
      toast.error("Failed to initiate User Messages Topic.");
    }
  };

  /**
   * Creates user profile topic
   * Sets up a dedicated topic for the user's profile
   */
  const handleCreateUserProfileTopic = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      profileTopic: { status: "loading", disabled: true },
    }));
    try {
      const createdProfileTopicId = await create(
        "ibird UserProfile",
        "",
        false
      );
      if (createdProfileTopicId) {
        setProfileTopicId(createdProfileTopicId);
        setStepStatuses((prev) => ({
          ...prev,
          profileTopic: { status: "success", disabled: true },
          initiateUserProfile: { status: "idle", disabled: false },
        }));
        toast.success("User Profile Topic created successfully.");
      } else {
        throw new Error("Failed to create User Profile Topic");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        profileTopic: { status: "error", disabled: false },
      }));
      toast.error("Failed to create User Profile Topic.");
    }
  };

  /**
   * Initializes user profile
   * Sends initial profile data to the profile topic
   */
  const handleInitiateUserProfile = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      initiateUserProfile: { status: "loading", disabled: true },
    }));
    try {
      const InitiatingUserProfileMessage = {
        Identifier: "iAssets",
        Type: "Profile",
        Author: signingAccount,
        Name: name,
        Bio: bio,
        Website: website,
        UserMessages: userMessagesTopicId,
        Picture: pictureHash,
        Banner: bannerHash,
      };
      const initiatingUserProfile = await send(
        profileTopicId,
        InitiatingUserProfileMessage,
        ""
      );
      if (initiatingUserProfile?.receipt.result.toString() === "SUCCESS") {
        setStepStatuses((prev) => ({
          ...prev,
          initiateUserProfile: { status: "success", disabled: true },
          createProfileToken: { status: "idle", disabled: false },
        }));
        toast.success("User Profile initiated successfully.");
      } else {
        throw new Error("Failed to initiate User Profile");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        initiateUserProfile: { status: "error", disabled: false },
      }));
      toast.error("Failed to initiate User Profile.");
    }
  };

  /**
   * Creates profile token
   * Mints an NFT representing the user's profile
   */
  const handleCreateProfileToken = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      createProfileToken: { status: "loading", disabled: true },
    }));
    try {
      let accountInfo: any = await fetch(
        `https://mainnet.mirrornode.hedera.com/api/v1/accounts/${signingAccount}`
      );
      accountInfo = await accountInfo.json();
      let key = PublicKey.fromString(accountInfo.key.key);

      let createTokenTransaction = new TokenCreateTransaction()
        .setTokenName("iAssets Profile")
        .setTokenSymbol("ASSET")
        .setTokenMemo("Profile NFT")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(0)
        .setMaxSupply(1)
        .setTreasuryAccountId(signingAccount)
        .setSupplyKey(key)
        .setAutoRenewAccountId(signingAccount)
        .setAutoRenewPeriod(7890000);

      const signTx = await createTokenTransaction.freezeWithSigner(signer);
      const txResponse = await signTx.executeWithSigner(signer);

      const tx = await watch(txResponse.transactionId.toString(), {
        onSuccess: (transaction) => transaction,
        onError: (error) => error,
      });

      if (tx.result.toString() === "SUCCESS") {
        const responseData = {
          transactionId: txResponse.transactionId.toString(),
          receipt: tx,
        };

        const tokenId = tx.entity_id.toString();
        setProfileTokenId(tokenId);
        setStepStatuses((prev) => ({
          ...prev,
          createProfileToken: { status: "success", disabled: true },
          mintProfileNFT: { status: "idle", disabled: false },
        }));
        toast.success("Profile Token created successfully.");
      } else {
        toast.error(`Transaction failed: ${tx.result.toString()}`);
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        createProfileToken: { status: "error", disabled: false },
      }));
      toast.error(`Failed to create Profile Token.`);
    }
  };

  /**
   * Mints profile NFT
   * Final step in profile creation process
   */
  const handleMintProfileNFT = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      mintProfileNFT: { status: "loading", disabled: true },
    }));

    try {
      // Check if wallet and signer are available
      if (!wallet || !signer) {
        throw new Error("Wallet not connected");
      }

      let mintTokenTransaction = await new TokenMintTransaction()
        .setMetadata([Uint8Array.from(Buffer.from(profileTopicId))])
        .setMaxTransactionFee(new Hbar(2))
        .setTokenId(profileTokenId);

      // Add transaction freeze check
      const signTx = await mintTokenTransaction.freezeWithSigner(signer);
      if (!signTx) {
        throw new Error("Failed to freeze transaction");
      }

      const txResponse = await signTx.executeWithSigner(signer);
      if (!txResponse) {
        throw new Error("Failed to execute transaction");
      }

      const tx = await watch(txResponse.transactionId.toString(), {
        onSuccess: (transaction) => transaction,
        onError: (error) => {
          throw error;
        },
      });

      if (tx.result.toString() === "SUCCESS") {
        const responseData = {
          transactionId: txResponse.transactionId.toString(),
          receipt: tx,
        };
        setStepStatuses((prev) => ({
          ...prev,
          mintProfileNFT: { status: "success", disabled: true },
        }));
        toast.success("Profile NFT minted successfully!");
        onClose();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        triggerRefresh();
      } else {
        toast.error(`Transaction failed: ${tx.result.toString()}`);
      }
    } catch (error: any) {
      console.error("Mint NFT Error:", error);
      setStepStatuses((prev) => ({
        ...prev,
        mintProfileNFT: { status: "error", disabled: false },
      }));
      toast.error(
        `Failed to mint Profile NFT: ${error.message || "Unknown error"}`
      );
    }
  };

  /**
   * Handles profile picture upload to Arweave
   * Updates status and provides user feedback
   */
  const handleUploadPicture = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      uploadPicture: { status: "loading", disabled: true },
    }));
    try {
      if (picture) {
        const uploadedHash = await uploadToArweave(picture);
        setPictureHash(uploadedHash);
        setStepStatuses((prev) => ({
          ...prev,
          uploadPicture: { status: "success", disabled: true },
          initiateUserMessages: { status: "idle", disabled: false },
        }));
        toast.success("Profile picture uploaded successfully.");
      } else {
        throw new Error("No picture file found");
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        uploadPicture: { status: "error", disabled: false },
      }));
      toast.error("Failed to upload profile picture.");
    }
  };

  // Similar function for handleUploadBanner if you have banner upload

  const renderStepButton = (
    step: keyof ProfileStepStatuses,
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
   * Renders the processing steps view
   * Shows progress of profile creation steps
   */
  const renderProcessingSteps = () => (
    <div className="p-6 overflow-y-auto max-h-[80vh]">
      <h1 className="text-xl font-semibold text-text mb-4">
        Creating Your Profile
      </h1>

      {/* Profile Information Preview */}
      <div className="mb-6 p-5 bg-secondary rounded-xl mx-4">
        <div className="flex items-center gap-4 mb-3">
          {picturePreview && (
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={picturePreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-primary truncate">{name}</h2>
          </div>
        </div>
        {bio && (
          <p className="text-text break-words text-base leading-relaxed">
            {bio}
          </p>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm mt-2 block"
          >
            {website}
          </a>
        )}
      </div>

      {/* Processing Steps */}
      <div className="space-y-4 mx-4">
        {renderStepButton(
          "userMessagesTopic",
          "Create User Messages Topic",
          handleCreateUserMessagesTopic
        )}
        {picture &&
          renderStepButton(
            "uploadPicture",
            "Upload Profile Picture",
            handleUploadPicture
          )}
        {renderStepButton(
          "initiateUserMessages",
          "Initiate User Messages",
          handleInitiateUserMessages
        )}
        {renderStepButton(
          "profileTopic",
          "Create User Profile Topic",
          handleCreateUserProfileTopic
        )}
        {renderStepButton(
          "initiateUserProfile",
          "Initiate User Profile",
          handleInitiateUserProfile
        )}
        {renderStepButton(
          "createProfileToken",
          "Create Profile Token",
          handleCreateProfileToken
        )}
        {renderStepButton(
          "mintProfileNFT",
          "Mint Profile NFT",
          handleMintProfileNFT
        )}
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
   * Renders the edit form view
   * Initial form for collecting user information
   */
  const renderEditForm = () => (
    <div className="flex flex-col max-h-[80vh] bg-background rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-primary">
        <h3 className="text-xl font-semibold text-primary">Create Profile</h3>
        <p className="text-sm text-text/60 mt-1">
          Fill in your profile details to get started
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              {picturePreview ? (
                <>
                  {/* Image Preview - Centered */}
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary mb-4">
                    <img
                      src={picturePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
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

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-text/80 mb-1.5">
                Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary text-text
                  border-2 border-transparent focus:border-primary transition-colors
                  duration-200 outline-none"
                placeholder="Your display name"
              />
            </div>

            {/* Bio Input - Updated with emoji picker */}
            <div>
              <label className="block text-sm font-medium text-text/80 mb-1.5">
                Bio
              </label>
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary text-text
                    border-2 border-transparent focus:border-primary transition-colors
                    duration-200 outline-none resize-none min-h-[120px]"
                  placeholder="About yourself"
                  rows={5}
                />
                <button
                  onClick={() => setShowEmojiPicker(true)}
                  className="absolute right-2 bottom-2 p-2 rounded-full
                    hover:bg-primary/10 text-text/60 hover:text-primary
                    transition-colors duration-200"
                >
                  😊
                </button>
              </div>
            </div>

            {/* Website Input */}
            <div>
              <label className="block text-sm font-medium text-text/80 mb-1.5">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary text-text
                  border-2 border-transparent focus:border-primary transition-colors
                  duration-200 outline-none"
                placeholder="Your website URL"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Image Cropper Modal */}
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
                    fileInputRef.current.value = "";
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

      {/* Bottom Controls */}
      <div className="border-t border-primary bg-background/95 backdrop-blur-sm">
        <div className="px-6 py-4 flex justify-end">
          <button
            onClick={handleStartProfileCreation}
            disabled={!name.trim()}
            className={`px-8 py-2.5 font-semibold rounded-full transition-all 
              duration-200 hover:shadow-lg active:scale-98 ${
                !name.trim()
                  ? "bg-primary/30 text-text/30 cursor-not-allowed"
                  : "bg-primary hover:bg-accent text-background"
              }`}
          >
            Create Profile
          </button>
        </div>
      </div>

      {/* Add EmojiPickerPopup */}
      {showEmojiPicker && (
        <EmojiPickerPopup
          onEmojiClick={(emojiData) => onEmojiClick(emojiData)}
          onClose={() => setShowEmojiPicker(false)}
          position="bottom"
        />
      )}
    </div>
  );

  // Add emoji handler
  const onEmojiClick = (emojiData: { emoji: string }) => {
    setBio((prevBio) => prevBio + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const resetCrop = () => {
    setCrop({
      unit: "%",
      width: 50,
      x: 25,
      y: 25,
      height: 50,
    });
  };

  const handleCropComplete = async () => {
    if (!cropImageRef.current || !crop || !tempImage) return;

    const canvas = document.createElement("canvas");
    const scaleX =
      cropImageRef.current.naturalWidth / cropImageRef.current.width;
    const scaleY =
      cropImageRef.current.naturalHeight / cropImageRef.current.height;

    canvas.width = crop.width || 0;
    canvas.height = crop.height || 0;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

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

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped-profile.jpg", {
            type: "image/jpeg",
          });
          setPicture(croppedFile);
          setPicturePreview(URL.createObjectURL(croppedFile));
        }
      },
      "image/jpeg",
      1
    );

    setShowCropper(false);
    setTempImage(null);
  };

  return (
    <div className="max-w-md w-full mx-auto bg-background rounded-lg shadow-xl p-3 text-text">
      {isEditing ? renderEditForm() : renderProcessingSteps()}
    </div>
  );
};

export default CreateNewProfile;
