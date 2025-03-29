import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useGetData from "../../hooks/use_get_data";
import Replay from "../replay/replay_to_thread";
import Spinner from "../../common/Spinner";
import UserProfile from "../profile/user_profile";
import ReadMediaFile from "../media/read_media_file";
import LinkAndHashtagReader from "../../common/link_and_hashtag_reader";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";
import Repost from "../replay/repost";
import { formatTimestamp } from "../../common/formatTimestamp";

/**
 * Interface representing a reply/comment structure in the thread
 */
interface Reply {
  sequence_number: number; // Unique identifier for the message
  sender: string; // Account ID of the sender
  likes: number; // Number of likes on the message
  dislikes: number; // Number of dislikes on the message
  comments: number; // Number of comments/replies
  Message: string; // Content of the message
  Media?: string; // Optional media attachment CID
  consensus_timestamp?: string; // Timestamp when message was confirmed
  replies: Reply[]; // Nested replies to this message
}

/**
 * ReadThread Component - Displays a thread of messages with nested replies
 * @param {Object} props - Component props
 * @param {string} props.topicId - Optional ID of the topic to display messages for
 */
function ReadThread({ topicId }: { topicId?: string }) {
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set()
  );
  const { messages, loading, fetchMessages, nextLink } = useGetData(topicId);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const { refreshTrigger } = useRefreshTrigger();
  useEffect(() => {
    const fetchAllMessages = async () => {
      if (topicId) {
        await fetchMessages(topicId);
      }
    };

    fetchAllMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, refreshTrigger]);

  useEffect(() => {
    setAllMessages((prevMessages) => {
      const newMessages = messages.filter(
        (message) =>
          !prevMessages.some(
            (prevMessage) => prevMessage.message_id === message.message_id
          )
      );
      return [...prevMessages, ...newMessages];
    });

    const fetchNextMessages = async () => {
      if (nextLink) {
        await fetchMessages(nextLink);
      }
    };

    fetchNextMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  /**
   * Recursively builds a tree structure of replies for a given parent message
   * @param {string} parentSequenceNumber - Sequence number of the parent message
   * @returns {Array} Array of reply objects with nested replies
   */
  const buildNestedReplies = (parentSequenceNumber: string): any[] => {
    const replies = allMessages
      .filter((message) => message.Reply_to === parentSequenceNumber)
      .map((reply) => {
        const repliesCount = allMessages.filter(
          (m) => m.Reply_to === reply.sequence_number.toString()
        ).length;
        return {
          ...reply,
          likes: allMessages.filter(
            (m) => m.Like_to === reply.sequence_number.toString()
          ).length,
          dislikes: allMessages.filter(
            (m) => m.DisLike_to === reply.sequence_number.toString()
          ).length,
          comments: repliesCount,
          replies: buildNestedReplies(reply.sequence_number.toString()),
        };
      });
    return replies;
  };

  /**
   * Toggles the visibility of comments for a given message
   * @param {number} sequenceNumber - Sequence number of the message
   */
  const toggleComments = (sequenceNumber: number) => {
    setExpandedComments((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(sequenceNumber)) {
        newSet.delete(sequenceNumber);
      } else {
        newSet.add(sequenceNumber);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-background text-text pr-2 pl-3 sm:px-6">
      {loading && allMessages.length === 0 && (
        <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
          <Spinner />
          <p className="text-primary/60 animate-pulse">Loading messages...</p>
        </div>
      )}

      {!loading && allMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <svg
            className="w-16 h-16 text-primary/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg text-primary/60">
            No messages yet. Be the first to post!
          </p>
        </div>
      )}

      {!loading && (
        <div className="space-y-8">
          {allMessages.map((message, idx) => {
            // Only render top-level messages (without Reply_to, Like_to, DisLike_to, and Identifier)
            if (
              message.Reply_to ||
              message.Like_to ||
              message.DisLike_to ||
              message.Identifier
            )
              return null;

            const messageDetails: Reply = {
              ...message,
              likes: allMessages.filter(
                (m) => m.Like_to === message.sequence_number.toString()
              ).length,
              dislikes: allMessages.filter(
                (m) => m.DisLike_to === message.sequence_number.toString()
              ).length,
              comments: allMessages.filter(
                (m) => m.Reply_to === message.sequence_number.toString()
              ).length,
              replies: buildNestedReplies(message.sequence_number.toString()),
            };

            try {
              return (
                <div key={idx} className="theme-card">
                  <div className="flex items-center justify-between mb-4 transition-colors hover:opacity-90">
                    <UserProfile userAccountId={messageDetails.sender} />
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(
                        messageDetails.consensus_timestamp || ""
                      )}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="mb-3 text-text whitespace-pre-line text-lg leading-relaxed hover:text-primary transition-colors">
                      <LinkAndHashtagReader message={messageDetails.Message} />
                    </p>

                    {messageDetails.Media && (
                      <div className="mt-4 rounded-xl overflow-hidden">
                        <div className="w-full max-w-md mx-auto">
                          <ReadMediaFile cid={messageDetails.Media} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center mt-4 pt-3 theme-divider">
                    {topicId && (
                      <div className="w-full">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-4">
                            <Repost contentType={"Thread"} source={topicId} />
                            {/* Removing the separate like/dislike indicators and letting the Replay component handle it */}

                            <button
                              onClick={() =>
                                toggleComments(messageDetails.sequence_number)
                              }
                              className={`
                                group flex items-center gap-2 px-3 py-1.5 rounded-full
                                transition-all duration-200
                                ${
                                  messageDetails.comments > 0
                                    ? "bg-blue-100/10 hover:bg-blue-100/20"
                                    : "opacity-50 cursor-not-allowed"
                                }
                                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                              `}
                              title={
                                messageDetails.comments > 0
                                  ? `View ${messageDetails.comments} comments`
                                  : "No comments yet"
                              }
                            >
                              <svg
                                className={`w-4 h-4 ${
                                  messageDetails.comments > 0
                                    ? "text-blue-400 group-hover:text-blue-500"
                                    : "text-blue-500"
                                }`}
                                fill={
                                  messageDetails.comments > 0
                                    ? "currentColor"
                                    : "none"
                                }
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              <span
                                className={`text-sm font-medium ${
                                  messageDetails.comments > 0
                                    ? "text-blue-400 group-hover:text-blue-500"
                                    : "text-blue-500"
                                }`}
                              >
                                {messageDetails.comments > 0
                                  ? `${messageDetails.comments.toLocaleString()} Comments`
                                  : "No Comments"}
                              </span>
                            </button>
                          </div>

                          <div className="ml-auto">
                            <Replay
                              sequenceNumber={messageDetails.sequence_number}
                              topicId={topicId}
                              author={messageDetails.sender}
                              message_id={message.message_id}
                              likesCount={messageDetails.likes}
                              dislikesCount={messageDetails.dislikes}
                              className="inline-flex items-center px-4 py-2 mt-2 sm:mt-0 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors duration-200 font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {expandedComments.has(messageDetails.sequence_number) && (
                    <div className="mt-6 space-y-4">
                      {messageDetails.replies.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            No comments yet. Be the first to comment!
                          </p>
                        </div>
                      ) : (
                        messageDetails.replies.map(
                          (reply: Reply, i: number) => (
                            <CommentItem
                              key={i}
                              reply={reply}
                              topicId={topicId}
                              allMessages={allMessages}
                              formatTimestamp={formatTimestamp}
                              level={1}
                            />
                          )
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            } catch (error) {
              toast(`Error : ${error}`);
              return null;
            }
          })}
        </div>
      )}

      {nextLink && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 text-primary/40">
            <Spinner />
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadThread;

/**
 * CommentItem Component - Renders an individual comment/reply with nested replies
 * @param {Object} props - Component props
 * @param {Reply} props.reply - Reply object containing message details
 * @param {string} props.topicId - Optional topic ID
 * @param {Array} props.allMessages - Array of all messages in the thread
 * @param {Function} props.formatTimestamp - Function to format timestamps
 * @param {number} props.level - Nesting level of the comment (for indentation)
 */
function CommentItem({
  reply,
  topicId,
  allMessages,
  formatTimestamp,
  level,
}: {
  reply: Reply;
  topicId?: string;
  allMessages: any[];
  formatTimestamp: (timestamp: string) => string;
  level: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const indentation = level * 4; // Adjust as needed for indentation

  return (
    <div
      className={`theme-comment ${level > 1 ? "theme-comment-nested" : ""}`}
      style={{ marginLeft: `${indentation}px` }}
    >
      <div className="flex items-center justify-between mb-2">
        <UserProfile userAccountId={reply.sender} />
        <span className="text-sm text-gray-500">
          {formatTimestamp(reply.consensus_timestamp || "")}
        </span>
      </div>

      <div className="ml-2">
        <p className="whitespace-pre-line text-base mb-3">
          <LinkAndHashtagReader message={reply.Message} />
        </p>
        {reply.Media && (
          <div className="mt-4 rounded-xl overflow-hidden">
            <div className="w-full max-w-md mx-auto">
              <ReadMediaFile cid={reply.Media} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        {/* Replies indicator - Always display the reply count and button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm font-medium">
            {reply.comments || 0} {reply.comments === 1 ? "Reply" : "Replies"}
          </span>
        </button>

        {/* Reply button with like/dislike counts */}
        <Replay
          sequenceNumber={reply.sequence_number}
          topicId={topicId || ""}
          author={reply.sender}
          message_id={reply.sequence_number.toString()}
          likesCount={reply.likes}
          dislikesCount={reply.dislikes}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
        />
      </div>

      {/* Render nested replies */}
      {expanded && reply.replies && reply.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {reply.replies.map((nestedReply: Reply, idx: number) => (
            <CommentItem
              key={idx}
              reply={nestedReply}
              topicId={topicId}
              allMessages={allMessages}
              formatTimestamp={formatTimestamp}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
