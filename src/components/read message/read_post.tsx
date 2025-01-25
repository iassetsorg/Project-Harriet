/**
 * ReadPost Component
 * Displays a single post with user information, message content, media, and interaction buttons.
 * Supports tipping, sharing, and blockchain transaction viewing functionality.
 */

import React, { useState } from "react";
import { FiShare2, FiHash } from "react-icons/fi";
import { toast } from "react-toastify";
import { BsCurrencyDollar } from "react-icons/bs";
import Repost from "../replay/repost";

import Modal from "../../common/modal";
import Tip from "../tip/tip";
import ReadMediaFile from "../media/read_media_file";
import UserProfile from "../profile/user_profile";
import LinkAndHashtagReader from "../../common/link_and_hashtag_reader";
import ConnectModal from "../../wallet/ConnectModal";
import { useWalletContext } from "../../wallet/WalletContext";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import { formatTimestamp } from "../../common/formatTimestamp";
import useGetPostData from "../../hooks/use_get_post_data";

/**
 * Interface for ReadPost component props
 */
interface ReadPostProps {
  /** Unique sequence number for the post */
  sequence_number: string;
}

/**
 * ReadPost component displays a single post with all its associated content and interactions
 */
function ReadPost({ sequence_number }: ReadPostProps) {
  const { postData, loading, error } = useGetPostData(sequence_number);
  const { isConnected } = useWalletContext();
  const { data: accountId } = useAccountId();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  // Return loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-background text-text pr-2 pl-3 sm:px-6">
        <div className="theme-card animate-pulse">
          <div className="h-20 bg-gray-300/20 rounded"></div>
        </div>
      </div>
    );
  }

  // Return error state
  if (error || !postData) {
    return (
      <div className="max-w-4xl mx-auto bg-background text-text pr-2 pl-3 sm:px-6">
        <div className="theme-card">
          <div className="text-red-500">Failed to load post</div>
        </div>
      </div>
    );
  }

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
    const encodedMessage = encodeURIComponent(postData?.Message || "");
    const shareLink = `https://ibird.io/Posts/${sequence_number}`;
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

  return (
    <div className="max-w-4xl mx-auto bg-background text-text pr-2 pl-3 sm:px-6">
      <div className="theme-card">
        <div className="flex items-center justify-between mb-4 transition-colors hover:opacity-90">
          <UserProfile userAccountId={postData?.sender || ""} />
          <span className="text-sm text-gray-500">
            {formatTimestamp(postData?.consensus_timestamp?.toString() || "")}
          </span>
        </div>

        <div className="mb-4">
          <p className="mb-3 text-text whitespace-pre-line text-lg leading-relaxed hover:text-primary transition-colors">
            <LinkAndHashtagReader message={postData?.Message || ""} />
          </p>

          {postData?.Media && (
            <div className="mt-4 rounded-xl overflow-hidden">
              <div className="w-full max-w-md mx-auto">
                <ReadMediaFile cid={postData?.Media} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center mt-4 pt-3 theme-divider">
          <div className="flex items-center gap-4">
            <Repost contentType={"Post"} source={sequence_number} />

            <button
              className="group flex items-center gap-2 hover:text-primary transition-colors"
              onClick={() =>
                handleTip(postData?.sender?.toString() || "", sequence_number)
              }
            >
              <BsCurrencyDollar className="w-5 h-5" />
            </button>

            <button
              className="group flex items-center gap-2 hover:text-primary transition-colors"
              onClick={() => copyShareLink(sequence_number)}
            >
              <FiShare2 className="w-5 h-5" />
            </button>

            <a
              href={`https://hashscan.io/mainnet/transaction/${postData?.message_id}`}
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
