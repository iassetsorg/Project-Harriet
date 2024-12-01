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
        className="NewThreadButton flex items-center p-3 font-semibold text-background bg-primary rounded-full shadow-lg hover:bg-accent hover:shadow-xl transform hover:scale-105 transition duration-300 mt-3"
        aria-label="New Message"
      >
        <FaPen className="mr-3 text-lg" />
        <span className="font-medium tracking-wide">New Message</span>
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
          <div className="space-y-8 p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-text">
              Create New Content
            </h2>
            <div className="space-y-6">
              <div className="flex items-start p-6 bg-background-secondary rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300">
                <div className="flex-shrink-0 mt-1">
                  <FaCommentDots className="text-primary text-2xl" />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-xl font-semibold text-text">Post</h3>
                  <p className="text-text-secondary mt-1">
                    Share your thoughts with the community using a public post.
                    It's a simple and cost-effective way to broadcast your
                    message on Hedera, with a posting fee of only $0.0001.
                    However, posts do not support interactive features like
                    replies or likes.
                  </p>
                  <button
                    onClick={() => handlePostTypeSelection("post")}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-background font-semibold rounded-lg hover:bg-accent hover:shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Create Post
                  </button>
                </div>
              </div>

              <div className="flex items-start p-6 bg-background-secondary rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300">
                <div className="flex-shrink-0 mt-1">
                  <FaComments className="text-primary text-2xl" />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-xl font-semibold text-text">Thread</h3>
                  <p className="text-text-secondary mt-1">
                    Start a discussion by creating a thread. Threads allow for
                    interaction through likes, dislikes, and comments. Creating
                    a thread costs $0.0104, which includes fees for creating the
                    topic, injecting thread structure information, publishing to
                    the explorer, adding the topic to your profile, and sending
                    the initial message.
                  </p>
                  <button
                    onClick={() => handlePostTypeSelection("thread")}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-background font-semibold rounded-lg hover:bg-accent hover:shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Create Thread
                  </button>
                </div>
              </div>

              <div className="flex items-start p-6 bg-background-secondary rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300">
                <div className="flex-shrink-0 mt-1">
                  <FaPoll className="text-primary text-2xl" />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-xl font-semibold text-text">Poll</h3>
                  <p className="text-text-secondary mt-1">
                    Initiate a voting process by creating a poll. Polls allow
                    for community participation through voting on specific
                    topics. Creating a poll costs $0.0104, which covers fees for
                    creating the topic, injecting poll structure information,
                    publishing to the explorer, adding the topic to your
                    profile, and sending the initial message.
                  </p>
                  <button
                    onClick={() => handlePostTypeSelection("poll")}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-background font-semibold rounded-lg hover:bg-accent hover:shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
