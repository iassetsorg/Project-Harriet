import { useState } from "react";
import useSendMessage from "../../hooks/use_send_message";
import { useWalletContext } from "../../wallet/WalletContext";
import ConnectModal from "../../wallet/ConnectModal";
import { BiRepost } from "react-icons/bi";
import { toast } from "react-toastify";
import { RiCheckLine, RiRefreshLine } from "react-icons/ri";
import useProfileData from "../../hooks/use_profile_data";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import eventService from "../../services/event_service";
import Modal from "../../common/modal";

const explorerTopic = process.env.REACT_APP_EXPLORER_TOPIC || "";

interface RepostProps {
  contentType: string;
  source: string;
}

interface StepStatus {
  status: "idle" | "loading" | "success" | "error";
  disabled: boolean;
}

interface StepStatuses {
  explorer: StepStatus;
  profile: StepStatus;
}

export default function Repost({ contentType, source }: RepostProps) {
  const { send } = useSendMessage();
  const { isConnected } = useWalletContext();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const { data: accountId } = useAccountId();
  const { profileData } = useProfileData(accountId);
  const profileId = profileData ? profileData.UserMessages : "";

  const [stepStatuses, setStepStatuses] = useState<StepStatuses>({
    explorer: { status: "idle", disabled: false },
    profile: { status: "idle", disabled: true },
  });

  const handleExplorerRepost = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      explorer: { status: "loading", disabled: true },
    }));

    try {
      const repostMessage = {
        Type: "Repost",
        ContentType: contentType,
        Source: source,
      };

      const rePost = await send(explorerTopic, repostMessage, "");

      if (rePost?.receipt.result.toString() === "SUCCESS") {
        toast.success(`Repost sent to explorer successfully.`);
        setStepStatuses((prev) => ({
          ...prev,
          explorer: { status: "success", disabled: true },
          profile: { status: "idle", disabled: false },
        }));
      } else {
        throw new Error("Explorer repost failed");
      }
    } catch (e) {
      toast.error("Failed to repost to explorer.");
      setStepStatuses((prev) => ({
        ...prev,
        explorer: { status: "error", disabled: false },
      }));
    }
  };

  const handleProfileRepost = async () => {
    setStepStatuses((prev) => ({
      ...prev,
      profile: { status: "loading", disabled: true },
    }));

    try {
      const repostMessage = {
        Type: "Repost",
        ContentType: contentType,
        Source: source,
      };

      const rePost = await send(profileId, repostMessage, "");

      if (rePost?.receipt.result.toString() === "SUCCESS") {
        toast.success(`Repost sent to your profile successfully.`);
        setStepStatuses((prev) => ({
          ...prev,
          profile: { status: "success", disabled: true },
        }));
        setIsRepostModalOpen(false);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        eventService.emit("refreshExplorer");
      } else {
        throw new Error("Profile repost failed");
      }
    } catch (e) {
      toast.error("Failed to repost to your profile.");
      setStepStatuses((prev) => ({
        ...prev,
        profile: { status: "error", disabled: false },
      }));
    }
  };

  const RepostModal = () => (
    <div className="bg-background w-full max-w-md p-6">
      <h2 className="text-xl font-semibold text-text mb-6">Repost</h2>

      <div className="space-y-4">
        {/* Explorer Step */}
        <div className="flex justify-between items-center p-3 hover:bg-secondary/30 rounded-lg transition-colors">
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
          </div>
          <button
            onClick={handleExplorerRepost}
            disabled={
              stepStatuses.explorer.disabled ||
              stepStatuses.explorer.status === "loading"
            }
            className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium min-w-[120px] 
              flex items-center justify-center ${
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

        {/* Profile Step */}
        <div className="flex justify-between items-center p-3 hover:bg-secondary/30 rounded-lg transition-colors">
          <div className="flex-1">
            <span
              className={`text-base font-medium ${
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
          </div>
          <button
            onClick={handleProfileRepost}
            disabled={
              stepStatuses.profile.disabled ||
              stepStatuses.profile.status === "loading"
            }
            className={`px-6 py-2 ml-3 rounded-lg transition-all duration-200 font-medium min-w-[120px] 
              flex items-center justify-center ${
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
      </div>

      <button
        onClick={() => setIsRepostModalOpen(false)}
        className="w-full bg-secondary hover:bg-error text-text py-2 mt-6 px-4 rounded-full"
      >
        Cancel
      </button>
    </div>
  );

  const handleRepostClick = () => {
    if (!isConnected) {
      setIsConnectModalOpen(true);
      return;
    }
    setIsRepostModalOpen(true);
  };

  return (
    <div>
      <BiRepost
        className="text-5xl hover:text-primary text-text cursor-pointer p-2 transition-colors duration-200"
        onClick={handleRepostClick}
      />
      {isConnectModalOpen && (
        <ConnectModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
        />
      )}
      <Modal
        isOpen={isRepostModalOpen}
        onClose={() => setIsRepostModalOpen(false)}
      >
        <RepostModal />
      </Modal>
    </div>
  );
}
