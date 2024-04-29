import React, { FC, useState, useEffect } from "react";
import { useHashConnectContext } from "../../hashconnect/hashconnect";
import Pair from "../../hashconnect/pair";
import { FaPen } from "react-icons/fa";
import CreateThread from "./send_new_thread";
import CreateProfile from "../profile/create_new_profile";
import SendMessageToPlanetModal from "./send_new_post";
import SendNewPoll from "./send_new_poll";
import Modal from "../../common/modal";
import { useLocation } from "react-router-dom";
import useProfileData from "../../hooks/use_profile_data";
import { toast } from "react-toastify";

export const NewMessage: FC = () => {
  const { state, pairingData, disconnect } = useHashConnectContext();

  const [isSendMessageToPlanetModalOpen, setIsSendMessageToPlanetModalOpen] =
    useState(false);
  const [isCreateThreadModalOpen, setIsCreateThreadModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isPostSelectionModalOpen, setIsPostSelectionModalOpen] =
    useState(false);
  const [selectedPostType, setSelectedPostType] = useState("");

  const currentRoute: string = useLocation().pathname;

  const signingAccount = pairingData?.accountIds[0] || "";
  const { profileData, isLoading, error } = useProfileData(signingAccount);
  const userProfileTopicId = profileData ? profileData.ProfileTopic : "";
  const openSendMessageToPlanetModal = () => {
    setIsSendMessageToPlanetModalOpen(true);
  };
  const closeSendMessageToPlanetModal = () => {
    setIsSendMessageToPlanetModalOpen(false);
  };

  const openCreateThreadModal = () => {
    setIsCreateThreadModalOpen(true);
  };
  const closeCreateThreadModal = () => {
    setIsCreateThreadModalOpen(false);
  };

  const openCreatePollModal = () => {
    setIsCreatePollModalOpen(true);
  };
  const closeCreatePollModal = () => {
    setIsCreatePollModalOpen(false);
  };

  //Pair Modal
  const openPairModal = () => {
    setIsPairModalOpen(true);
  };
  const closePairModal = () => {
    setIsPairModalOpen(false);
  };

  const openPostSelectionModal = () => {
    if (!userProfileTopicId) {
      toast.error("Please create a profile first ");
      return;
    }
    setIsPostSelectionModalOpen(true);
  };
  const closePostSelectionModal = () => {
    setIsPostSelectionModalOpen(false);
  };

  const handlePostTypeSelection = (postType: string) => {
    setSelectedPostType(postType);
    closePostSelectionModal();
    if (postType === "post") {
      openSendMessageToPlanetModal();
    } else if (postType === "thread") {
      openCreateThreadModal();
    } else if (postType === "poll") {
      openCreatePollModal();
    }
  };

  useEffect(() => {
    if (state === "Paired") {
      closePairModal();
    }
  }, [state]);

  return (
    <div className="fixed ">
      {state !== "Paired" && (
        <button
          onClick={openPairModal}
          className="NewThreadButton flex items-cen ter p-3 font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300 mt-3"
        >
          <FaPen className="mr-2" />
          <span className=" font-medium">New Message</span>
        </button>
      )}

      {state === "Paired" && (
        <button
          onClick={openPostSelectionModal}
          className="NewThreadButton flex items-cen ter p-3 font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300 mt-3"
        >
          <FaPen className="mr-2" />
          <span className=" font-medium">New Message</span>
        </button>
      )}

      {isPairModalOpen && (
        <Modal isOpen={isPairModalOpen} onClose={closePairModal}>
          <Pair />
        </Modal>
      )}

      {isPostSelectionModalOpen && (
        <Modal
          isOpen={isPostSelectionModalOpen}
          onClose={closePostSelectionModal}
        >
          <div className="space-y-6 p-8 ">
            <div>
              <p className="mt-6  text-text">
                Share your thoughts with the community using a public post. It's
                a simple and cost-effective way to broadcast your message on
                Hedera, with a posting fee of only $0.0001. However, posts do
                not support interactive features like replies or likes.
              </p>
              <button
                onClick={() => handlePostTypeSelection("post")}
                className=" py-3 px-6 w-full bg-primary text-background font-semibold rounded-lg hover:bg-accent transition duration-300 mt-3"
              >
                Post
              </button>
            </div>

            <div>
              <p className="mt-2  text-text ">
                Start a discussion by creating a thread. Threads allow for
                interaction through likes, dislikes, and comments. Creating a
                thread costs $0.0104, which includes fees for creating the
                topic, injecting thread structure information, publishing to the
                explorer, adding the topic to your profile, and sending the
                initial message.
              </p>
              <button
                onClick={() => handlePostTypeSelection("thread")}
                className="py-3 px-6 w-full bg-primary text-background font-semibold rounded-lg hover:bg-accent transition duration-300"
              >
                Thread
              </button>
            </div>

            <div>
              <p className="mt-2 text-sm text-text ">
                Initiate a voting process by creating a poll. Polls allow for
                community participation through voting on specific topics.
                Creating a poll costs $0.0104, which covers fees for creating
                the topic, injecting poll structure information, publishing to
                the explorer, adding the topic to your profile, and sending the
                initial message.
              </p>
              <button
                onClick={() => handlePostTypeSelection("poll")}
                className=" py-3 px-6 w-full bg-primary text-background font-semibold rounded-lg hover:bg-accent transition duration-300 mt-3"
              >
                Poll
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isCreateThreadModalOpen && (
        <Modal
          isOpen={isCreateThreadModalOpen}
          onClose={closeCreateThreadModal}
        >
          <CreateThread onClose={closeCreateThreadModal} />
        </Modal>
      )}

      {isSendMessageToPlanetModalOpen && (
        <Modal
          isOpen={isSendMessageToPlanetModalOpen}
          onClose={closeSendMessageToPlanetModal}
        >
          <SendMessageToPlanetModal onClose={closeSendMessageToPlanetModal} />
        </Modal>
      )}

      {isCreatePollModalOpen && (
        <Modal isOpen={isCreatePollModalOpen} onClose={closeCreatePollModal}>
          <SendNewPoll onClose={closeCreatePollModal} />
        </Modal>
      )}
    </div>
  );
};
