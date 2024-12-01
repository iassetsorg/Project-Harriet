import React, { FC, useState, useEffect } from "react";
import { FaPen, FaCommentDots, FaComments, FaPoll } from "react-icons/fa";
import CreateThread from "./send_new_thread";
import ConnectModal from "../../wallet/ConnectModal";
import SendMessageToPlanetModal from "./send_new_post";
import SendNewPoll from "./send_new_poll";
import Modal from "../../common/modal";
import { useLocation } from "react-router-dom";
import useProfileData from "../../hooks/use_profile_data";
import { toast } from "react-toastify";
import { useWalletContext } from "../../wallet/WalletContext";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";

/**
 * NewMessage Component
 * A fixed-position component that provides functionality to create different types of messages
 * (posts, threads, and polls) on the platform.
 */

/**
 * Main component for creating new messages
 * Handles different modal states and message type selections
 */
export const NewMessage: FC = () => {
  const { isConnected } = useWalletContext();
  const { data: accountId } = useAccountId();
  const [isSendMessageToPlanetModalOpen, setIsSendMessageToPlanetModalOpen] =
    useState(false);
  const [isCreateThreadModalOpen, setIsCreateThreadModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isPostSelectionModalOpen, setIsPostSelectionModalOpen] =
    useState(false);
  const [selectedPostType, setSelectedPostType] = useState("");

  const currentRoute: string = useLocation().pathname;

  const { profileData } = useProfileData(accountId);
  const userProfileTopicId = profileData ? profileData.ProfileTopic : "";

  /**
   * Opens a modal if user meets requirements
   * @param modalSetter - State setter function for the target modal
   * @throws {toast.error} If user attempts to post without a profile
   */
  const openModal = (
    modalSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!userProfileTopicId && modalSetter !== setIsConnectModalOpen) {
      toast.error("Please create a profile first.");
      return;
    }
    modalSetter(true);
  };

  /**
   * Closes the specified modal
   * @param modalSetter - State setter function for the modal to close
   */
  const closeModal = (
    modalSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    modalSetter(false);
  };

  /**
   * Handles selection of post type and opens appropriate modal
   * @param postType - Type of post to create ("post", "thread", or "poll")
   */
  const handlePostTypeSelection = (postType: string) => {
    setSelectedPostType(postType);
    closeModal(setIsPostSelectionModalOpen);
    if (postType === "post") {
      openModal(setIsSendMessageToPlanetModalOpen);
    } else if (postType === "thread") {
      openModal(setIsCreateThreadModalOpen);
    } else if (postType === "poll") {
      openModal(setIsCreatePollModalOpen);
    }
  };

  /**
   * Effect hook to close connect modal when user becomes connected
   */
  useEffect(() => {
    if (isConnected) {
      closeModal(setIsConnectModalOpen);
    }
  }, [isConnected]);

  return (
    <div className="fixed">
      <button
        onClick={() => {
          if (!isConnected) {
            openModal(setIsConnectModalOpen);
          } else {
            openModal(setIsPostSelectionModalOpen);
          }
        }}
        className="NewThreadButton flex items-center p-2 sm:p-3 font-semibold text-background bg-primary rounded-full shadow-lg hover:bg-accent hover:shadow-xl transform hover:scale-105 transition duration-300 mt-3"
        aria-label="New Message"
      >
        <FaPen className="text-base sm:text-lg" />
        <span className="hidden sm:inline font-medium tracking-wide ml-3">
          New Message
        </span>
      </button>

      {isConnectModalOpen && (
        <ConnectModal
          isOpen={isConnectModalOpen}
          onClose={() => closeModal(setIsConnectModalOpen)}
        />
      )}

      {isPostSelectionModalOpen && (
        <Modal
          isOpen={isPostSelectionModalOpen}
          onClose={() => closeModal(setIsPostSelectionModalOpen)}
        >
          <div
            className="space-y-8 p-8 max-w-2xl mx-auto overflow-y-auto max-h-[80vh]
            scrollbar scrollbar-w-2
            scrollbar-thumb-accent hover:scrollbar-thumb-primary
            scrollbar-track-secondary/10
            scrollbar-thumb-rounded-full scrollbar-track-rounded-full
            transition-colors duration-200 ease-in-out
            dark:scrollbar-thumb-accent/50 dark:hover:scrollbar-thumb-primary/70
            dark:scrollbar-track-secondary/5"
          >
            <div className="flex justify-center items-center mb-2">
              <div className="relative w-16 h-16 flex items-center justify-center group">
                {/* Outer glowing ring */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-full blur-md animate-pulse"></div>

                {/* Inner gradient background */}
                <div className="absolute inset-2 bg-gradient-to-br from-background via-secondary to-background rounded-full"></div>

                {/* Glass effect overlay */}
                <div className="absolute inset-2 glass-morphism rounded-full"></div>

                {/* The ℏ symbol */}
                <span
                  className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:scale-110 transition-all duration-300 cursor-default select-none z-10"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  ℏ
                </span>

                {/* Animated border */}
                <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping"></div>

                {/* Hover effect ring */}
                <div className="absolute inset-0  rounded-full group-hover:border-primary transition-all duration-500"></div>

                {/* Particle effects */}
                <div className="absolute inset-0 bg-gradient-overlay rounded-full opacity-50"></div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center mt-8 mb-12 text-primary  bg-gradient-to-r from-primary to-accent bg-clip-text  animate-gradient-x transform hover:scale-105 transition-all duration-300">
              Create New Web3 Content
            </h2>
            <div className="space-y-6">
              <div className="flex items-start p-6 bg-background-secondary rounded-xl border border-primary shadow-md hover:shadow-xl hover:border-background-tertiary transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex-shrink-0 mt-1">
                  <FaCommentDots className="text-primary text-2xl" />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-xl font-semibold text-text">Post</h3>
                  <p className="text-text-secondary mt-1">
                    Quick and simple way to share your thoughts. Posts are
                    public but don't support replies or likes.<br></br>
                    Hedera Network Fee: $0.0001
                  </p>
                  <button
                    onClick={() => handlePostTypeSelection("post")}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-background font-semibold rounded-lg hover:bg-accent shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
                  >
                    Create Post
                  </button>
                </div>
              </div>

              <div className="flex items-start p-6 bg-background-secondary rounded-xl border border-primary shadow-md hover:shadow-xl hover:border-text/20 dark:border-text/5 dark:hover:border-text/10 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex-shrink-0 mt-1">
                  <FaComments className="text-primary text-2xl" />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-xl font-semibold text-text">Thread</h3>
                  <p className="text-text-secondary mt-1">
                    Start a discussion with likes, dislikes, and comments
                    enabled.<br></br> Hedera Network Fee: $0.0104
                  </p>
                  <button
                    onClick={() => handlePostTypeSelection("thread")}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-background font-semibold rounded-lg hover:bg-accent shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
                  >
                    Create Thread
                  </button>
                </div>
              </div>

              <div className="flex items-start p-6 bg-background-secondary rounded-xl border border-primary shadow-md hover:shadow-xl hover:border-text/20 dark:border-text/5 dark:hover:border-text/10 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex-shrink-0 mt-1">
                  <FaPoll className="text-primary text-2xl" />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-xl font-semibold text-text">Poll</h3>
                  <p className="text-text-secondary mt-1">
                    Create a poll to gather community votes on a topic.<br></br>
                    Hedera Network Fee: $0.0104
                  </p>
                  <button
                    onClick={() => handlePostTypeSelection("poll")}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-background font-semibold rounded-lg hover:bg-accent shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
                  >
                    Create Poll
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {isCreateThreadModalOpen && (
        <Modal
          isOpen={isCreateThreadModalOpen}
          onClose={() => closeModal(setIsCreateThreadModalOpen)}
        >
          <CreateThread
            onClose={() => closeModal(setIsCreateThreadModalOpen)}
          />
        </Modal>
      )}

      {isSendMessageToPlanetModalOpen && (
        <Modal
          isOpen={isSendMessageToPlanetModalOpen}
          onClose={() => closeModal(setIsSendMessageToPlanetModalOpen)}
        >
          <SendMessageToPlanetModal
            onClose={() => closeModal(setIsSendMessageToPlanetModalOpen)}
          />
        </Modal>
      )}

      {isCreatePollModalOpen && (
        <Modal
          isOpen={isCreatePollModalOpen}
          onClose={() => closeModal(setIsCreatePollModalOpen)}
        >
          <SendNewPoll onClose={() => closeModal(setIsCreatePollModalOpen)} />
        </Modal>
      )}
    </div>
  );
};
