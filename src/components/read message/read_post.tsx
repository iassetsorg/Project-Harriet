import React, { useEffect, useState } from "react";
import { FiShare2, FiHash } from "react-icons/fi";
import { toast } from "react-toastify";
import { BsCurrencyDollar } from "react-icons/bs";
import { useHashConnectContext } from "../../hashconnect/hashconnect";
import Modal from "../../common/modal";
import Tip from "../tip/tip";
import Pair from "../../hashconnect/pair";
import ReadMediaFile from "../media/read_media_file";
import UserProfile from "../profile/user_profile";
import LinkAndHashtagReader from "../../common/link_and_hashtag_reader";

function ReadPost({
  sender,
  message,
  media,
  sequence_number,
  message_id,
  consensus_timestamp,
}: {
  sender: string;
  message: string;
  media?: string;
  sequence_number: string;
  message_id: string;
  consensus_timestamp?: string; // Add the consensus_timestamp prop
}) {
  const { state, pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const openConnectModal = () => {
    setIsConnectModalOpen(true);
  };
  const closeConnectModal = () => {
    setIsConnectModalOpen(false);
  };

  const generateShareLink = (sequence_number: string) => {
    const encodedMessage = encodeURIComponent(message);
    const shareLink = `${window.location.origin}/Posts/${sequence_number}`;
    return shareLink;
  };

  const copyShareLink = (sequence_number: string) => {
    const link = generateShareLink(sequence_number);
    navigator.clipboard.writeText(link).then(() => {
      toast("Link copied to clipboard!");
    });
  };

  const openTipModal = () => {
    setIsTipModalOpen(true);
  };
  const closeTipModal = () => {
    setIsTipModalOpen(false);
  };

  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const handleTip = (author: string, topicId: string) => {
    if (state !== "Paired") {
      openConnectModal();
      return;
    }
    if (signingAccount === author) {
      toast("You cannot tip yourself");
      return;
    }
    setSelectedAuthor(author);
    setSelectedTopicId(topicId);
    openTipModal();
  };

  // Format the consensus timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000); // Convert to milliseconds
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div>
      <div className="p-4 border border-primary rounded mb-4 bg-secondary overflow-y-auto">
        <UserProfile userAccountId={sender} />
        <p className="mb-1 text-text whitespace-pre-line">
          <LinkAndHashtagReader message={message} />
        </p>
        <h1>{}</h1>
        {media && (
          <div className="flex items-center md:w-1/6 md:justify-start w-full">
            <ReadMediaFile cid={media} />
          </div>
        )}

        <div className="flex items-center">
          <button
            className="bg-secondary hover:bg-background text-text py-1 px-1 rounded-lg mt-2 ml-2 flex items-center"
            onClick={() =>
              handleTip(sender.toString(), sequence_number.toString())
            }
          >
            <BsCurrencyDollar className="text-text" />
          </button>

          <button
            className="bg-secondary hover:bg-background text-text py-1 px-1 rounded-lg mt-2 ml-2 flex items-center"
            onClick={() => {
              copyShareLink(sequence_number.toString());
            }}
          >
            <FiShare2 className="text-text" />
          </button>
          <a
            href={`https://hashscan.io/mainnet/transaction/${message_id}`}
            target="blank"
            className="bg-secondary hover:bg-background text-text py-1 px-1 rounded-lg mt-2 ml-2 flex items-center"
          >
            <FiHash />
          </a>
        </div>
        <p className="text-sm ml-3 text-gray-500">
          {formatTimestamp(consensus_timestamp?.toString() || "")}
        </p>
      </div>
      {isConnectModalOpen && (
        <Modal isOpen={isConnectModalOpen} onClose={closeConnectModal}>
          <Pair />
        </Modal>
      )}
      {isTipModalOpen && (
        <Modal isOpen={isTipModalOpen} onClose={closeTipModal}>
          <div className="bg-background p-4 rounded-lg">
            <Tip
              onClose={closeTipModal}
              author={selectedAuthor}
              topicId={selectedTopicId}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ReadPost;
