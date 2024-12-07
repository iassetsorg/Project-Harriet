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
        className="NewThreadButton group flex items-center justify-center p-1.5 sm:p-2.5 font-semibold text-background 
        bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary
        rounded-full shadow-lg hover:shadow-xl 
        transform hover:scale-105 transition-all duration-300 mt-3
        relative overflow-hidden
        sm:w-auto w-12 h-12 sm:h-auto"
        aria-label="New Message"
      >
        {/* Ripple effect container */}
        <div className="absolute inset-0 bg-white/20 group-hover:animate-ripple"></div>

        {/* Icon container with animation */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative">
            {/* Mobile pulse effect */}
            <div className="absolute inset-0 bg-white/30 rounded-full scale-150 animate-ping sm:hidden"></div>

            <FaPen
              className="text-lg sm:text-base relative z-10 
              group-hover:rotate-12 transition-transform duration-300
              sm:mr-0 mobile-icon-shadow"
            />
          </div>
          <span className="hidden sm:inline font-medium tracking-wide ml-3 group-hover:translate-x-0.5 transition-transform duration-300">
            New Message
          </span>
        </div>

        {/* Glowing effect */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-md"></div>
        </div>
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
          <div className="space-y-8 p-8 max-w-2xl mx-auto overflow-y-auto max-h-[80vh]">
            {/* Enhanced Logo Animation */}
            <div className="flex justify-center items-center mb-2">
              <div className="relative w-12 h-12 flex items-center justify-center group perspective-1000">
                {/* Broadcasting Rings */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 animate-broadcast-ring-1 rounded-full border border-primary"></div>
                  <div className="absolute inset-0 animate-broadcast-ring-2 rounded-full border border-accent"></div>
                  <div className="absolute inset-0 animate-broadcast-ring-3 rounded-full border border-primary"></div>
                </div>

                {/* 3D Transform Container */}
                <div className="relative w-full h-full transition-transform duration-500 transform-style-3d group-hover:rotate-y-180">
                  {/* Front Face */}
                  <div className="absolute w-full h-full backface-hidden">
                    {/* Center Symbol */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent z-10">
                        ℏ
                      </span>
                    </div>

                    {/* Glowing Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-lg group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Back Face */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-accent animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Title with Floating Effect */}
            <div className="relative">
              <h2 className="text-xl font-bold text-center mt-12 mb-12">
                <span className="relative inline-block animate-float">
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-lg"></span>
                  <span className="relative bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Create New Web3 Content
                  </span>
                </span>
              </h2>

              {/* Decorative Elements */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
            </div>

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
