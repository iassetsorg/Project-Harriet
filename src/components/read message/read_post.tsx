/**
 * ReadPost Component
 * Displays a single post with user information, message content, media, and interaction buttons.
 * Supports tipping, sharing, and blockchain transaction viewing functionality.
 */

import React, { useEffect, useState } from "react";
import { FiShare2, FiHash } from "react-icons/fi";
import { toast } from "react-toastify";
import { BsCurrencyDollar } from "react-icons/bs";

import Modal from "../../common/modal";
import Tip from "../tip/tip";
import ReadMediaFile from "../media/read_media_file";
import UserProfile from "../profile/user_profile";
import LinkAndHashtagReader from "../../common/link_and_hashtag_reader";
import ConnectModal from "../../wallet/ConnectModal";
import { useWalletContext } from "../../wallet/WalletContext";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";

/**
 * Interface for ReadPost component props
 */
interface ReadPostProps {
  /** Account ID of the post sender */
  sender: string;
  /** Text content of the post */
  message: string;
  /** Optional IPFS CID for attached media */
  media?: string;
  /** Unique sequence number for the post */
  sequence_number: string;
  /** Hedera transaction ID for the post */
  message_id: string;
  /** Timestamp when consensus was reached */
  consensus_timestamp?: string;
}

/**
 * ReadPost component displays a single post with all its associated content and interactions
 */
function ReadPost({
  sender,
  message,
  media,
  sequence_number,
  message_id,
  consensus_timestamp,
}: ReadPostProps) {
  const { isConnected } = useWalletContext();
  const { data: accountId } = useAccountId();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  /**
   * Opens the wallet connection modal
   */
  const openConnectModal = () => {
    setIsConnectModalOpen(true);
  };
  const closeConnectModal = () => {
    setIsConnectModalOpen(false);
  };

  /**
   * Generates a shareable link for the post
   * @param sequence_number - Unique identifier for the post
   * @returns Full URL to the post
   */
  const generateShareLink = (sequence_number: string) => {
    const encodedMessage = encodeURIComponent(message);
    const shareLink = `${window.location.origin}/Posts/${sequence_number}`;
    return shareLink;
  };

  /**
   * Copies the post's share link to clipboard and shows a notification
   * @param sequence_number - Unique identifier for the post
   */
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

  /**
   * Handles the tipping action for a post
   * @param author - Account ID of the post author
   * @param topicId - Topic ID associated with the post
   */
  const handleTip = (author: string, topicId: string) => {
    if (!isConnected) {
      openConnectModal();
      return;
    }
    if (accountId === author) {
      toast("You cannot tip yourself");
      return;
    }
    setSelectedAuthor(author);
    setSelectedTopicId(topicId);
    openTipModal();
  };

  /**
   * Formats a Unix timestamp into a human-readable date and time
   * @param timestamp - Unix timestamp in seconds
   * @returns Formatted date string
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto bg-background text-text pr-2 pl-3 sm:px-6">
      <div className="theme-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 transition-colors hover:opacity-90">
          <UserProfile userAccountId={sender} />
          <span className="text-sm text-gray-500 mt-4 sm:mt-0">
            {formatTimestamp(consensus_timestamp?.toString() || "")}
          </span>
        </div>

        <div className="mb-4">
          <p className="mb-3 text-text whitespace-pre-line text-lg leading-relaxed hover:text-primary transition-colors">
            <LinkAndHashtagReader message={message} />
          </p>

          {media && (
            <div className="mt-4 rounded-xl overflow-hidden">
              <div className="w-full max-w-md mx-auto">
                <ReadMediaFile cid={media} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center mt-4 pt-3 theme-divider">
          <div className="flex items-center gap-4">
            <button
              className="group flex items-center gap-2 hover:text-primary transition-colors"
              onClick={() =>
                handleTip(sender.toString(), sequence_number.toString())
              }
            >
              <BsCurrencyDollar className="w-5 h-5" />
            </button>

            <button
              className="group flex items-center gap-2 hover:text-primary transition-colors"
              onClick={() => copyShareLink(sequence_number.toString())}
            >
              <FiShare2 className="w-5 h-5" />
            </button>

            <a
              href={`https://hashscan.io/mainnet/transaction/${message_id}`}
              target="blank"
              className="group flex items-center gap-2 hover:text-primary transition-colors"
            >
              <FiHash className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {isConnectModalOpen && (
        <ConnectModal isOpen={isConnectModalOpen} onClose={closeConnectModal} />
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
