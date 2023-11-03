import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import useSendMessage from "./use_send_message";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import Modal from "../utils/modal";
import {
  AiFillLike,
  AiFillDislike,
  AiOutlineLike,
  AiOutlineDislike,
  AiFillMessage,
} from "react-icons/ai";
interface Message {
  sequence_number: number;
  message: string;
  Author: string;
  Reply_to?: string;
  Like_to?: string;
  DisLike_to?: string;
  Message: string;
}

function ReadMessages() {
  const [topicId, setTopicId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [nextLink, setNextLink] = useState<string | null>(null);
  const { send } = useSendMessage();
  const [replyContent, setReplyContent] = useState<string>("");
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const [showComments, setShowComments] = useState<number | null>(null);

  const [reactionsMap, setReactionsMap] = useState<{
    [sequence_number: number]: {
      likes: number;
      dislikes: number;
      comments: Message[];
    };
  }>({});

  useEffect(() => {
    if (nextLink) {
      loadMoreMessages();
    }
  }, [nextLink]);

  const handleReply = useCallback(
    async (sequenceNumber: number) => {
      const replyMessage = {
        Author: signingAccount,
        Reply_to: sequenceNumber.toString(),
        Message: replyContent,
      };

      await send(topicId, replyMessage, "");
      setReplyContent("");
      setShowReplyForm(null);
    },
    [send, replyContent, topicId, signingAccount]
  );

  const handleReaction = useCallback(
    async (sequenceNumber: number, reactionType: "Like_to" | "DisLike_to") => {
      const reactionMessage = {
        Author: signingAccount,
        [reactionType]: sequenceNumber.toString(),
      };
      await send(topicId, reactionMessage, "");
    },
    [send, topicId, signingAccount]
  );

  const loadMoreMessages = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `https://mainnet-public.mirrornode.hedera.com${nextLink}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, ...data.messages]);
        setNextLink(data.links?.next || null);
      } else {
        console.error("Error fetching messages:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    setMessages([]); // Clear previous messages
    setReactionsMap({}); // Clear previous reactions map

    const topicIdPattern = /^\d+\.\d+\.\d+$/;

    if (!topicIdPattern.test(topicId)) {
      toast.error("Invalid Topic ID");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://mainnet-public.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setNextLink(data.links?.next || null);
      } else if (response.status === 404) {
        toast.error("Topic Not Found");
      } else {
        console.error("Error fetching messages:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const decodeBase64 = (base64String: string) => {
    const decoded = atob(base64String);
    return decoded;
  };

  const updateReactionsMap = (messageData: Message[]) => {
    // TODO: put logic to update the reactions map here
    messageData.forEach((message) => {
      try {
        const decodedMessage = decodeBase64(message.message);
        const parsedMessage = JSON.parse(decodedMessage);

        if (parsedMessage.Reply_to) {
          const replyToSequence = parseInt(parsedMessage.Reply_to, 10);

          setReactionsMap((prevMap) => {
            const prevComments = prevMap[replyToSequence]?.comments || [];

            return {
              ...prevMap,
              [replyToSequence]: {
                ...prevMap[replyToSequence],
                comments: [...prevComments, parsedMessage],
              },
            };
          });
        }
        if (parsedMessage.Like_to) {
          const likedSequence = parseInt(parsedMessage.Like_to, 10);

          setReactionsMap((prevMap) => {
            const prevLikes = prevMap[likedSequence]?.likes || 0;

            return {
              ...prevMap,
              [likedSequence]: {
                ...prevMap[likedSequence],
                likes: prevLikes + 1,
              },
            };
          });
        }
        if (parsedMessage.DisLike_to) {
          const dislikedSequence = parseInt(parsedMessage.DisLike_to, 10);

          setReactionsMap((prevMap) => {
            const prevDislikes = prevMap[dislikedSequence]?.dislikes || 0;

            return {
              ...prevMap,
              [dislikedSequence]: {
                ...prevMap[dislikedSequence],
                dislikes: prevDislikes + 1,
              },
            };
          });
        }
      } catch (error) {
        toast(`Error parsing message: ${decodeBase64(message.message)}`);
      }
    });
  };

  useEffect(() => {
    if (messages) {
      updateReactionsMap(messages);
    }
  }, [messages]);

  return (
    <div className="max-w-md mx-auto  bg-gray-200 rounded-lg shadow-xl p-6">
      <h3 className="text-xl font-semibold text-sky-900 mb-4">Read Messages</h3>
      <form onSubmit={fetchMessages}>
        <input
          type="text"
          className="p-2 border rounded mb-4"
          placeholder="Thread ID"
          name="topicName"
          id="topicName"
          value={topicId}
          onChange={(event) => setTopicId(event.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-3 px-6 rounded-lg focus-ring-4 focus-ring-sky-400 focus-ring-opacity-50"
        >
          Get Messages
        </button>
      </form>

      {loading && <div className="text-center mt-4">Loading...</div>}

      {!loading && (
        <div className="mt-4">
          {messages.map((message, index) => {
            try {
              const decodedMessage = decodeBase64(message.message);
              const parsedMessage = JSON.parse(decodedMessage);

              // Here we check if this message is a reaction or reply. If so, we simply return nothing.
              if (
                parsedMessage.Reply_to ||
                parsedMessage.Like_to ||
                parsedMessage.DisLike_to
              ) {
                return null;
              }

              const metaData = parsedMessage.Identifier
                ? `${parsedMessage.Identifier}, ${parsedMessage.Type}, ${parsedMessage.Author}, ${parsedMessage.Status}`
                : "";
              const reactions = reactionsMap[message.sequence_number];
              const comments = reactionsMap[message.sequence_number]?.comments;

              return (
                <div
                  key={index}
                  className="p-2 h-24 border rounded mb-4 bg-gray-300"
                >
                  {metaData && <p>{metaData}</p>}
                  {/* <p>{message.sequence_number}</p> */}

                  {parsedMessage.Message && <p>{parsedMessage.Message}</p>}

                  <p className="text-gray-600 flex ml-1 items-center text-lg">
                    {reactions?.likes || 0} <AiFillLike className="mr-2" />
                    {reactions?.dislikes || 0}
                    <AiFillDislike className="mr-2" />
                    {comments?.length > 0 && (
                      <button
                        className="text-sky-900 flex items-center text-lg"
                        onClick={() => setShowComments(message.sequence_number)}
                      >
                        {comments.length} <AiFillMessage className="mr-2" />
                      </button>
                    )}
                  </p>

                  {showComments === message.sequence_number && (
                    <Modal setShow={setShowComments}>
                      <h2 className="text-sky-900 text-2xl font-bold mb-4">
                        Comments:
                      </h2>
                      {comments?.map((comment, idx) => (
                        <div
                          key={idx}
                          className="bg-sky-100 border-l-4 rounded border-sky-500 text-sky-700 p-4 mb-3"
                          role="alert"
                        >
                          <p className="font-bold">{comment.Author} said:</p>
                          <p>{comment.Message}</p>
                        </div>
                      ))}
                    </Modal>
                  )}

                  <div className="flex items-center space-x-1">
                    <button
                      className="bg-sky-700 hover:bg-sky-800 text-white py-1 px-1 rounded mt-2"
                      onClick={(event) =>
                        setShowReplyForm(message.sequence_number)
                      }
                    >
                      Replay
                    </button>

                    {showReplyForm === message.sequence_number && (
                      <Modal setShow={setShowReplyForm}>
                        <div className="max-w-md mx-auto text-center flex flex-col justify-center  rounded-lg  p-6">
                          <h3 className="mb-3 font-semibold text-xl text-sky-900">
                            Write a comment
                          </h3>
                          <textarea
                            className="h-24 w-full border rounded mb-3 p-2"
                            placeholder="Type your reply here"
                            value={replyContent}
                            onChange={(event) =>
                              setReplyContent(event.target.value)
                            }
                          />
                          <button
                            className="bg-sky-700 hover:bg-sky-800 text-white  py-2 px-4 rounded w-full"
                            onClick={(event) =>
                              handleReply(message.sequence_number)
                            }
                          >
                            Send
                          </button>
                        </div>
                      </Modal>
                    )}

                    <button
                      className="bg-green-500 hover:bg-green-700  items-center text-white font-bold py-1 px-1 rounded mt-2"
                      onClick={(event) =>
                        handleReaction(message.sequence_number, "Like_to")
                      }
                    >
                      <AiOutlineLike className="text-lg" />
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700  items-center text-white font-bold py-1 px-1 rounded mt-2"
                      onClick={(event) =>
                        handleReaction(message.sequence_number, "DisLike_to")
                      }
                    >
                      <AiOutlineDislike className="text-lg" />
                    </button>
                  </div>
                </div>
              );
            } catch (error) {
              toast(`Error parsing message: ${decodeBase64(message.message)}`);
              return null;
            }
          })}

          {nextLink && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={loadMoreMessages}
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ReadMessages;
