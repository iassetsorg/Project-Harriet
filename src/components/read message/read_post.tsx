// ReadPost.tsx
import React, { useEffect, useState } from "react";
import { FiShare2, FiHash } from "react-icons/fi";
import { toast } from "react-toastify";
import { BsCurrencyDollar } from "react-icons/bs";
import { useHashConnectContext } from "../../hashconnect/hashconnect";
import Modal from "../../common/modal";
import Tip from "../tip/tip";
import Pair from "../../hashconnect/pair";
import ReadIPFSData from "../ipfs/read_ipfs_data";
import UserProfile from "../profile/user_profile";

function ReadPost({
  sender,
  message,
  media,
  sequence_number,
  message_id,
}: {
  sender: string;
  message: string;
  media?: string;
  sequence_number: string;
  message_id: string;
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

  const generateShareLink = (
    sender: string,
    message: string,
    media: string,
    sequence_number: string,
    message_id: string
  ) => {
    const encodedMessage = encodeURIComponent(message);
    const shareLink = `${window.location.origin}/Posts/${sequence_number}?sender=${sender}&message=${encodedMessage}&media=${media}&message_id=${message_id}`;
    return shareLink;
  };
  const copyShareLink = (
    sender: string,
    message: string,
    media: string,
    sequence_number: string,
    message_id: string
  ) => {
    const link = generateShareLink(
      sender,
      message,
      media,
      sequence_number,
      message_id
    );
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

  return (
    <div>
      <div className="p-4 border border-primary rounded mb-4 bg-secondary overflow-y-auto">
        <UserProfile userAccountId={sender} />
        <p className="mb-3 text-text whitespace-pre-line">{message}</p>
        {media && (
          <div className="flex items-center md:w-1/6 md:justify-start w-full">
            <ReadIPFSData cid={media} />
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
              copyShareLink(
                sender.toString(),
                message.toString(),
                media || "",
                sequence_number.toString(),
                message_id.toString()
              );
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
