import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useGetData from "../../hooks/use_get_data";
import Modal from "../../common/modal";
import Spinner from "../../common/Spinner";
import ReadMediaFile from "../media/read_media_file";
import ReplayPoll from "../replay/replay_to_poll";
import UserProfile from "../profile/user_profile";
import LinkAndHashtagReader from "../../common/link_and_hashtag_reader";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";

/**
 * Interface representing a reply message structure
 * @interface Reply
 * @property {number} sequence_number - Unique identifier for the reply
 * @property {string} sender - Account ID of the message sender
 * @property {number} likes - Number of likes on the reply
 * @property {number} dislikes - Number of dislikes on the reply
 * @property {number} comments - Number of comments on the reply
 * @property {string} Message - Content of the reply
 * @property {string} [Media] - Optional media CID attached to the reply
 * @property {string} [consensus_timestamp] - Optional timestamp of consensus
 * @property {Reply[]} replies - Nested replies to this reply
 */
interface Reply {
  sequence_number: number;
  sender: string;
  likes: number;
  dislikes: number;
  comments: number;
  Message: string;
  Media?: string;
  consensus_timestamp?: string;
  replies: Reply[];
}

/**
 * ReadPoll Component - Displays a poll with voting options and handles user interactions
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.topicId] - Optional topic ID to fetch poll data
 * @returns {JSX.Element} Rendered poll component
 */
function ReadPoll({ topicId }: { topicId?: string }) {
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set()
  );
  const { messages, loading, fetchMessages, nextLink } = useGetData(topicId);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string>("");
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
   * Formats a consensus timestamp into a human-readable date string
   * @param {string} timestamp - Unix timestamp in seconds
   * @returns {string} Formatted date string
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000); // Convert to milliseconds
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  /**
   * Builds a nested structure of replies for a given parent message
   * @param {string} parentSequenceNumber - Sequence number of parent message
   * @returns {any[]} Array of nested reply objects
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
   * Toggles the visibility of comments for a specific message
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

  // Calculate total votes
  const getTotalVotes = (messageDetails: any) => {
    const totalVotes =
      messageDetails.Choice1Votes +
      messageDetails.Choice2Votes +
      messageDetails.Choice3Votes +
      messageDetails.Choice4Votes +
      messageDetails.Choice5Votes;
    return totalVotes;
  };

  // Get vote percentage
  const getVotePercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return (votes / totalVotes) * 100;
  };

  // Handle choice selection
  const handleChoiceSelect = (choice: string) => {
    setSelectedChoice(choice);
    // Implement vote submission logic here
  };

  // Add function to check if choice is a winner
  const isWinningChoice = (votes: number, mostVotedChoice: number) => {
    return votes === mostVotedChoice && mostVotedChoice > 0;
  };

  return (
    <div className="max-w-4xl mx-auto bg-background text-text px-4 sm:px-6">
      {loading && allMessages.length === 0 && (
        <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
          <Spinner />
          <p className="text-primary/60 animate-pulse">Loading messages...</p>
        </div>
      )}

      {!loading && allMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <svg
            className="w-16 h-16 text-primary/40 animate-pulse"
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
            if (
              message.Reply_to ||
              message.Like_to ||
              message.DisLike_to ||
              message.Identifier ||
              message.Choice
            )
              return null;

            const messageDetails = {
              author: message.sender,
              sequence_number: message.sequence_number,
              message: message.Message,
              media: message.Media,
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
              Choice1: message.Choice1,
              Choice2: message.Choice2,
              Choice3: message.Choice3,
              Choice4: message.Choice4,
              Choice5: message.Choice5,
              Choice1Votes: allMessages.filter((m) => m.Choice === "Choice1")
                .length,
              Choice2Votes: allMessages.filter((m) => m.Choice === "Choice2")
                .length,
              Choice3Votes: allMessages.filter((m) => m.Choice === "Choice3")
                .length,
              Choice4Votes: allMessages.filter((m) => m.Choice === "Choice4")
                .length,
              Choice5Votes: allMessages.filter((m) => m.Choice === "Choice5")
                .length,
              consensus_timestamp: message.consensus_timestamp?.toString(),
            };

            const totalVotes = getTotalVotes(messageDetails);

            try {
              if (messageDetails.message) {
                const mostVotedChoice = Math.max(
                  messageDetails.Choice1Votes,
                  messageDetails.Choice2Votes,
                  messageDetails.Choice3Votes,
                  messageDetails.Choice4Votes,
                  messageDetails.Choice5Votes
                );

                return (
                  <div key={idx} className="theme-card backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 transition-colors hover:opacity-90">
                      <UserProfile userAccountId={messageDetails.author} />
                      <span className="text-sm text-primary/60 mt-2 sm:mt-0">
                        {formatTimestamp(
                          messageDetails.consensus_timestamp || ""
                        )}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="mb-6 text-text whitespace-pre-line text-lg leading-relaxed hover:text-primary transition-colors">
                        <LinkAndHashtagReader
                          message={messageDetails.message}
                        />
                      </p>

                      {/* Enhanced Choice options with multiple winners support */}
                      <div className="space-y-4 w-full max-w-2xl mx-auto">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const choiceKey =
                            `Choice${num}` as keyof typeof messageDetails;
                          const votesKey =
                            `Choice${num}Votes` as keyof typeof messageDetails;

                          if (!messageDetails[choiceKey]) return null;

                          const votes = messageDetails[votesKey] as number;
                          const percentage = getVotePercentage(
                            votes,
                            totalVotes
                          );
                          const isSelected = selectedChoice === `Choice${num}`;
                          const isWinner = isWinningChoice(
                            votes,
                            mostVotedChoice
                          );

                          return (
                            <button
                              key={num}
                              className={`
                                relative w-full flex items-center transition-all duration-300 transform
                                ${
                                  isSelected
                                    ? "scale-[1.02] shadow-lg"
                                    : "hover:scale-[1.01]"
                                }
                                ${
                                  isSelected
                                    ? "ring-2 ring-primary"
                                    : "ring-1 ring-primary/10"
                                }
                                ${
                                  isWinner
                                    ? "bg-gradient-to-r from-success/20 via-success/10 to-transparent"
                                    : "bg-secondary/5"
                                }
                                hover:bg-secondary/10 rounded-xl overflow-hidden
                                group cursor-pointer
                              `}
                              onClick={() => handleChoiceSelect(`Choice${num}`)}
                            >
                              {/* Enhanced Progress Bar */}
                              <div
                                className={`
                                  absolute left-0 top-0 h-full transition-all duration-700 ease-out
                                  ${
                                    isWinner
                                      ? "bg-gradient-to-r from-success/30 via-success/20 to-transparent"
                                      : "bg-gradient-to-r from-primary/20 to-primary/10"
                                  }
                                `}
                                style={{
                                  width: `${percentage}%`,
                                  transform: isSelected
                                    ? "scaleX(1.02)"
                                    : "scaleX(1)",
                                }}
                              />

                              {/* Choice Content with Enhanced Visibility */}
                              <div className="relative flex items-center w-full px-6 py-4">
                                {/* Winner Trophy Icon - Different for tied winners */}
                                {isWinner && (
                                  <div
                                    className={`
                                    absolute -left-1 -top-1 p-1.5 rounded-br-lg shadow-lg transform -rotate-12
                                    ${
                                      isWinner
                                        ? "bg-success text-white animate-bounce-subtle"
                                        : ""
                                    }
                                  `}
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M10 1l2.928 6.377 6.072.556-4.5 4.5 1.072 6.567L10 16l-5.572 3-1.072-6.567-4.5-4.5 6.072-.556L10 1z" />
                                    </svg>
                                  </div>
                                )}

                                <div className="flex-1">
                                  <span
                                    className={`
                                    font-medium text-base
                                    ${
                                      isWinner
                                        ? "text-success font-semibold"
                                        : isSelected
                                        ? "text-primary"
                                        : "text-text"
                                    }
                                    group-hover:text-primary transition-colors duration-200
                                  `}
                                  >
                                    {messageDetails[choiceKey]}
                                  </span>
                                </div>

                                {/* Enhanced Vote Stats */}
                                <div className="flex items-center gap-3">
                                  {/* Percentage Badge */}
                                  <div
                                    className={`
                                    px-3 py-1.5 rounded-full text-sm font-semibold
                                    ${
                                      isWinner
                                        ? "bg-success text-white scale-110"
                                        : isSelected
                                        ? "bg-primary text-white"
                                        : "bg-primary/10 text-primary/80"
                                    }
                                    group-hover:bg-primary group-hover:text-white
                                    transition-all duration-200 transform
                                    ${isWinner ? "animate-pulse-subtle" : ""}
                                  `}
                                  >
                                    {percentage.toFixed(1)}%
                                  </div>

                                  {/* Vote Count */}
                                  <span
                                    className={`
                                    text-sm font-medium min-w-[60px] text-right
                                    ${
                                      isWinner
                                        ? "text-success"
                                        : "text-primary/80"
                                    }
                                  `}
                                  >
                                    {votes.toLocaleString()} votes
                                  </span>

                                  {/* Status Indicator */}
                                  {(isSelected || isWinner) && (
                                    <div
                                      className={`
                                      ml-2 flex items-center justify-center w-6 h-6
                                      rounded-full transition-all duration-200
                                      ${
                                        isWinner
                                          ? "bg-success text-white"
                                          : "bg-primary text-white"
                                      }
                                      ${isSelected ? "animate-pulse" : ""}
                                    `}
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        {/* Simplified Total Votes Display */}
                        <div className="pt-6 flex justify-center">
                          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-all duration-200">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-5 h-5 text-primary/60"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                />
                              </svg>
                              <span className="text-lg font-semibold text-primary">
                                {totalVotes.toLocaleString()}
                              </span>
                              <span className="text-sm text-primary/60 font-medium">
                                votes
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {messageDetails.media && (
                        <div className="mt-4 rounded-xl overflow-hidden">
                          <div className="w-full max-w-md mx-auto">
                            <ReadMediaFile cid={messageDetails.media} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Interaction Bar */}
                    <div className="flex flex-wrap items-center mt-4 pt-3 theme-divider">
                      {topicId && (
                        <div className="w-full">
                          <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-4">
                              {/* Enhanced Like Button */}
                              <div className="flex items-center gap-2 transition-transform hover:scale-110">
                                <svg
                                  className={`w-5 h-5 ${
                                    messageDetails.likes > 0
                                      ? "text-emerald-400"
                                      : "text-emerald-500"
                                  } transition-colors duration-200`}
                                  viewBox="0 0 24 24"
                                  fill={
                                    messageDetails.likes > 0
                                      ? "currentColor"
                                      : "none"
                                  }
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                <span
                                  className={`text-sm font-medium ${
                                    messageDetails.likes > 0
                                      ? "text-emerald-400"
                                      : "text-emerald-500"
                                  }`}
                                >
                                  {messageDetails.likes > 0
                                    ? messageDetails.likes.toLocaleString()
                                    : "0"}
                                </span>
                              </div>

                              {/* Enhanced Dislike Button */}
                              <div className="flex items-center gap-2 transition-transform hover:scale-110">
                                <svg
                                  className={`w-5 h-5 ${
                                    messageDetails.dislikes > 0
                                      ? "text-rose-400"
                                      : "text-rose-500"
                                  } transition-colors duration-200`}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                >
                                  <path d="M10.88 21.94l5.53-5.54c.37-.37.58-.88.58-1.41V5c0-1.1-.9-2-2-2H6c-.8 0-1.52.48-1.83 1.21L.91 11.82C.06 13.8 1.51 16 3.66 16h5.65l-.95 4.58c-.1.5.05 1.01.41 1.37.59.58 1.53.58 2.11-.01zM21 3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                                </svg>
                                <span
                                  className={`text-sm font-medium ${
                                    messageDetails.dislikes > 0
                                      ? "text-rose-400"
                                      : "text-rose-500"
                                  }`}
                                >
                                  {messageDetails.dislikes > 0
                                    ? messageDetails.dislikes.toLocaleString()
                                    : "0"}
                                </span>
                              </div>

                              {/* Enhanced Comments Button */}
                              <button
                                onClick={() =>
                                  toggleComments(messageDetails.sequence_number)
                                }
                                className={`
                                  group flex items-center gap-2 px-4 py-2 rounded-full
                                  transition-all duration-200
                                  ${
                                    messageDetails.comments > 0
                                      ? "bg-blue-100/10 hover:bg-blue-100/20"
                                      : "opacity-70 hover:opacity-100"
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
                                  } transition-colors duration-200`}
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
                                  } transition-colors duration-200`}
                                >
                                  {messageDetails.comments > 0
                                    ? `${messageDetails.comments.toLocaleString()} Comments`
                                    : "No Comments"}
                                </span>
                              </button>
                            </div>

                            {/* Enhanced Reply Button */}
                            <div className="ml-auto">
                              <ReplayPoll
                                sequenceNumber={messageDetails.sequence_number}
                                topicId={topicId}
                                author={messageDetails.author}
                                message_id={message.message_id}
                                Choice={selectedChoice}
                                className="inline-flex items-center px-4 py-2 mt-2 sm:mt-0 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200 font-medium transform hover:scale-105"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Comments Section */}
                    {expandedComments.has(messageDetails.sequence_number) && (
                      <div className="mt-6 space-y-4 animate-fadeIn">
                        {messageDetails.replies.length === 0 ? (
                          <div className="text-center py-6 bg-secondary/5 rounded-lg">
                            <p className="text-primary/60">
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
              }
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

/**
 * CommentItem Component - Renders an individual comment with nested replies
 * @component
 * @param {Object} props - Component props
 * @param {Reply} props.reply - Reply object containing comment data
 * @param {string} [props.topicId] - Optional topic ID
 * @param {any[]} props.allMessages - Array of all messages
 * @param {Function} props.formatTimestamp - Timestamp formatting function
 * @param {number} props.level - Nesting level of the comment
 * @returns {JSX.Element} Rendered comment component
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
        <UserProfile userAccountId={reply.sender} />
        <span className="text-sm text-gray-500 mt-2 sm:mt-0">
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
        {/* Like indicator */}
        <div className="flex items-center gap-2">
          <svg
            className={`w-5 h-5 ${
              reply.likes > 0 ? "text-emerald-400" : "text-emerald-500"
            }`}
            viewBox="0 0 24 24"
            fill={reply.likes > 0 ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span
            className={`text-sm font-medium ${
              reply.likes > 0 ? "text-emerald-400" : "text-emerald-500"
            }`}
          >
            {reply.likes || 0}
          </span>
        </div>

        {/* Dislike indicator */}
        <div className="flex items-center gap-2">
          <svg
            className={`w-5 h-5 ${
              reply.dislikes > 0 ? "text-rose-400" : "text-rose-500"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M10.88 21.94l5.53-5.54c.37-.37.58-.88.58-1.41V5c0-1.1-.9-2-2-2H6c-.8 0-1.52.48-1.83 1.21L.91 11.82C.06 13.8 1.51 16 3.66 16h5.65l-.95 4.58c-.1.5.05 1.01.41 1.37.59.58 1.53.58 2.11-.01zM21 3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          </svg>
          <span
            className={`text-sm font-medium ${
              reply.dislikes > 0 ? "text-rose-400" : "text-rose-500"
            }`}
          >
            {reply.dislikes || 0}
          </span>
        </div>

        {/* Replies indicator */}
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

        {/* Reply button */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
          <ReplayPoll
            sequenceNumber={reply.sequence_number}
            topicId={topicId || ""}
            author={reply.sender}
            message_id={reply.sequence_number.toString()}
            showVoteButton={false}
          />
        </div>
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

export default ReadPoll;
