import { useState, useRef } from "react";
import { useSigningContext } from "../../hashconnect/sign";
import { useHashConnectContext } from "../../hashconnect/hashconnect";
import {
  TransactionReceipt,
  PublicKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  Hbar,
} from "@hashgraph/sdk";
import { toast } from "react-toastify";
import useSendMessage from "../../hooks/use_send_message";
import useCreateTopic from "../../hooks/use_create_topic";
import useUploadToIPFS from "../media/use_upload_to_ipfs";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdFileDownloadDone } from "react-icons/md";
import useUploadToArweave from "../media/use_upload_to_arweave";
const CreateNewProfile = ({ onClose }: { onClose: () => void }) => {
  const { send } = useSendMessage();
  const { create } = useCreateTopic();
  const { signAndMakeBytes } = useSigningContext();
  const { sendTransaction, pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const { uploading, uploadToArweave, error } = useUploadToArweave();
  const [memo, setMemo] = useState("");
  const [submitKey, setSubmitKey] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const [isProcess, setIsProcess] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentStepStatus, setCurrentStepStatus] = useState(0);
  const isBreakRef = useRef(false);

  let currentStep = 0;

  const breakStep = () => {
    isBreakRef.current = true;
    setIsBreak(true);
    onClose(); // Assuming you want to reset the process state as well
    // Additional logic if needed when breaking the process
  };

  const createProfile = async () => {
    let UserMessagesTopicId = "";
    let ProfileTopicId = "";
    let profileTokenId = "";
    let accountInfo: any = await fetch(
      `https://mainnet.mirrornode.hedera.com/api/v1/accounts/${signingAccount}`
    );

    accountInfo = await accountInfo.json();
    let key = PublicKey.fromString(accountInfo.key.key);

    let pictureHash = null;
    let bannerHash = null;

    if (picture) {
      try {
        pictureHash = await uploadToArweave(picture);
      } catch (e) {
        toast.error("Picture upload failed. Try again.");
        setIsProcess(false);
        return;
      }
    }

    if (banner) {
      try {
        const bannerResponse = await uploadToArweave(banner);
        bannerHash = await uploadToArweave(banner);
      } catch (e) {
        toast.error("Banner upload failed. Try again.");
        setIsProcess(false);
        return;
      }
    }

    setIsProcess(true);
    isBreakRef.current = false;

    while (currentStep < 6) {
      if (isBreak) {
        break;
      }

      // Step 1: Create User Messages Topic
      toast(`Starting process`);

      if (currentStep === 0) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }

        toast(`Start the process`);
        const createUserMessagesTopicId = await create(
          "ibird UserMessages",
          "",
          submitKey
        );

        if (createUserMessagesTopicId) {
          currentStep++;
          setCurrentStepStatus(1);
          UserMessagesTopicId = createUserMessagesTopicId;
        }
        toast(`UserMessagesTopic Created`);
      }

      // Step 2: Initiating Messages Topic
      if (currentStep === 1) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }

        toast(`Initiating UserMessagesTopic`);
        const InitiatingUserMessagesTopic = {
          Identifier: "iAssets",
          Type: "UserMessages",
          Author: signingAccount,
        };
        const initiatingUserMessages = await send(
          UserMessagesTopicId,
          InitiatingUserMessagesTopic,
          ""
        );

        if (initiatingUserMessages?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(2);
          toast("UserMessages Initiated");
        }
      }

      // Step 3: Creating User Profile Topic
      if (currentStep === 2) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast("Creating user Porfile");
        const userProfileTopicId = await create(
          "ibird UserProfile",
          "",
          submitKey
        );
        if (!userProfileTopicId) {
          toast("Failed to create UserProfile topic");
        }
        if (userProfileTopicId) {
          currentStep++;
          setCurrentStepStatus(3);
          if (userProfileTopicId) ProfileTopicId = userProfileTopicId;
          toast("User Profile Created");
        }
      }

      // Step 4: Initiating User Profile
      if (currentStep === 3) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast("Initiating UserProfile");

        const InitiatingUserProfileMessage = {
          Identifier: "iAssets",
          Type: "Profile",
          Author: signingAccount,
          Name: name,
          Bio: bio,
          Website: website,
          Location: location,
          UserMessages: UserMessagesTopicId,
          Picture: pictureHash,
          Banner: bannerHash,
        };

        const initiatingUserProfile = await send(
          ProfileTopicId,
          InitiatingUserProfileMessage,
          ""
        );
        if (initiatingUserProfile?.receipt.status.toString() === "SUCCESS") {
          currentStep++;
          setCurrentStepStatus(4);
          toast("User Profile Initiated");
        }
      }

      // Step 5: Minting User Profile NFT

      if (currentStep === 4) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast("Creating User Profile NFT");
        // Create Token Transaction
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

        const transactionBytes = await signAndMakeBytes(
          createTokenTransaction,
          signingAccount
        );

        const response = await sendTransaction(
          transactionBytes,
          signingAccount,
          false
        );

        const receiptBytes = response.receipt as Uint8Array;

        if (response.success) {
          const responseData = {
            transactionId: response.response.transactionId,
            receipt: TransactionReceipt.fromBytes(receiptBytes),
          };
          if (responseData.receipt && responseData.receipt.tokenId) {
            profileTokenId = responseData.receipt.tokenId.toString();
            currentStep++;
            setCurrentStepStatus(5);
            toast("Profile Token Created");
          }
        } else {
          if (response.error) {
            toast.error(`${JSON.stringify(response.error)}`);
          } else {
            toast.error(`${JSON.stringify(response.error.status)}`);
          }
        }
      }

      if (currentStep === 5) {
        if (isBreakRef.current) {
          toast("Process Cancelled");
          setIsProcess(false);
          break;
        }
        toast("Minting User Profile NFT");

        let mintTokenTransaction = new TokenMintTransaction()
          .setMetadata([Buffer.from(ProfileTopicId)])
          .setMaxTransactionFee(new Hbar(2))
          .setTokenId(profileTokenId);

        const transactionBytes = await signAndMakeBytes(
          mintTokenTransaction,
          signingAccount
        );

        const response = await sendTransaction(
          transactionBytes,
          signingAccount,
          false
        );

        const receiptBytes = response.receipt as Uint8Array;

        if (response.success) {
          const responseData = {
            transactionId: response.response.transactionId,
            receipt: TransactionReceipt.fromBytes(receiptBytes),
          };

          if (responseData?.receipt.status.toString() === "SUCCESS") {
            currentStep++;
            setCurrentStepStatus(6);
            toast("Profile Token Created");
            onClose();
            window.location.reload();
          } else {
            if (response.error) {
              toast.error(`${JSON.stringify(response.error)}`);
            } else {
              toast.error(`${JSON.stringify(response.error.status)}`);
            }
          }
        }
      }
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-background rounded-lg shadow-xl p-3 text-text">
      {!isProcess ? (
        <>
          <h3 className="text-xl py-4 px-8 font-semibold text-primary">
            Create a Profile
          </h3>

          {/* Form Fields for Profile Creation */}
          {/* Name Input */}
          <section className="py-4 px-8">
            {/* Name Input */}
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-text"
            >
              Name:
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border-2 border-secondary text-base bg-secondary"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </section>

          <section className="py-4 px-8">
            {/* Bio Input */}
            <label
              htmlFor="bio"
              className="block text-sm font-semibold text-text"
            >
              Bio:
            </label>
            <div className="mt-2">
              <textarea
                className="w-full px-4 py-2 rounded-lg border-secondary text-base bg-secondary"
                name="bio"
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </section>

          <section className="py-4 px-8">
            {/* Website Input */}
            <label
              htmlFor="website"
              className="block text-sm font-semibold text-text"
            >
              Website:
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border-secondary text-base bg-secondary"
                name="website"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </section>

          <section className="py-4 px-8">
            {/* Location Input */}
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-text"
            >
              Location:
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border-secondary text-base bg-secondary"
                name="location"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </section>

          <section className="py-4 px-8">
            {/* Profile Picture Input */}
            <label
              htmlFor="picture"
              className="block text-sm font-semibold text-text"
            >
              Profile Picture:
            </label>
            <div className="mt-2">
              <input
                type="file"
                className="w-full px-4 py-2 rounded-lg border-secondary text-base bg-secondary"
                name="picture"
                id="picture"
                onChange={(e) =>
                  e.target.files &&
                  e.target.files[0] &&
                  setPicture(e.target.files[0])
                }
              />
            </div>
          </section>

          {/* <section className="py-4 px-8">
            <label
              htmlFor="banner"
              className="block text-sm font-semibold text-text"
            >
              Banner:
            </label>
            <div className="mt-2">
              <input
                type="file"
                className="w-full px-4 py-2 rounded-lg border-secondary text-base bg-secondary"
                name="banner"
                id="banner"
                onChange={(e) =>
                  e.target.files &&
                  e.target.files[0] &&
                  setBanner(e.target.files[0])
                }
              />
            </div>
          </section> */}

          {uploading && <p>Uploading Media...</p>}
          {error && <p className="text-error">{error}</p>}

          <button
            onClick={() => createProfile()}
            className="w-full py-3 px-6 font-semibold text-background bg-primary rounded-full hover:bg-indigo-400 transition duration-300"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Create"}
          </button>
        </>
      ) : (
        <div className="p-4 ">
          <h1 className="text-secondary mb-3">Network fees: $1.0402</h1>
          {/* Process Steps UI */}
          <div className="flex flex-col justify-between mb-2 ">
            <span className="text-sm text-secondary">$0.01</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mr-3">
                Creating User Threads Topic
              </h3>
              <span>
                {currentStepStatus >= 1 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
          </div>
          {/* Step 2: Initiating User Threads */}
          <div className="flex flex-col justify-between mb-2 ">
            <span className="text-sm text-secondary">$0.0001</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mr-3">
                Initiating User Threads
              </h3>
              <span>
                {currentStepStatus >= 2 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
          </div>
          {/* Step 3: Creating User Profile Topic */}
          <div className="flex flex-col justify-between mb-2 ">
            <span className="text-sm text-secondary">$0.01</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mr-3">
                Creating User Profile Topic
              </h3>
              <span>
                {currentStepStatus >= 3 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
          </div>

          {/* Step 4: Initiating User Profile */}
          <div className="flex flex-col justify-between mb-2 ">
            <span className="text-sm text-secondary">$0.0001</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mr-3">
                Initiating User Profile
              </h3>
              <span>
                {currentStepStatus >= 4 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
          </div>
          {/* Step 5: Minting User Profile NFT */}
          <div className="flex flex-col justify-between mb-2 ">
            <span className="text-sm text-secondary">$1</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mr-3">
                Creating User Profile NFT
              </h3>
              <span>
                {currentStepStatus >= 5 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
          </div>

          {/* Step 6: Finalizing Profile Creation */}
          <div className="flex flex-col justify-between mb-2 ">
            <span className="text-sm text-secondary">$0.02</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mr-3">
                Minting User Profile NFT
              </h3>
              <span>
                {currentStepStatus >= 6 ? (
                  <MdFileDownloadDone className="text-xl text-success" />
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl text-waiting" />
                )}
              </span>
            </div>
          </div>

          <button
            onClick={breakStep}
            className="w-full bg-error hover:bg-secondary text-text py-2 mt-3 px-4 rounded-full"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateNewProfile;
