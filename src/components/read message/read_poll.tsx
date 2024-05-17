import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useGetData from "../../hooks/use_get_data";
import Modal from "../../common/modal";
import Spinner from "../../common/Spinner";
import ReadMediaFile from "../media/read_media_file";
import ReplayPoll from "../replay/replay_to_poll";
import UserProfile from "../profile/user_profile";

function ReadPoll({ topicId }: { topicId?: string }) {
  const [showComments, setShowComments] = useState<number | null>(null);
  const { messages, loading, fetchMessages, nextLink } = useGetData(topicId);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string>("");

  useEffect(() => {
    const fetchAllMessages = async () => {
      if (topicId) {
        await fetchMessages(topicId);
      }
    };

    fetchAllMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setShowComments(null);
  };

  const handleChoiceSelect = (choice: string) => {
    setSelectedChoice(choice);
  };

  const getTotalVotes = (message: any) => {
    const totalVotes =
      message.Choice1Votes +
      message.Choice2Votes +
      message.Choice3Votes +
      message.Choice4Votes +
      message.Choice5Votes;
    return totalVotes;
  };

  const getVotePercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  return (
    <div className="bg-background text-text">
      {loading && allMessages.length === 0 && <Spinner />}

      {!loading && (
        <div>
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
              commentsDetails: allMessages
                .filter(
                  (m) => m.Reply_to === message.sequence_number.toString()
                )
                .map((m) => ({
                  author: m.sender,
                  message: m.Message,
                })),
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
            };

            const totalVotes = getTotalVotes(messageDetails);
            const mostVotedChoice = Math.max(
              messageDetails.Choice1Votes,
              messageDetails.Choice2Votes,
              messageDetails.Choice3Votes,
              messageDetails.Choice4Votes,
              messageDetails.Choice5Votes
            );

            try {
              if (messageDetails.message) {
                return (
                  <div
                    key={idx}
                    className="p-4 border border-primary rounded mb-4 bg-secondary overflow-y-auto"
                  >
                    <UserProfile userAccountId={messageDetails.author} />
                    <p className="mb-3 text-text whitespace-pre-line">
                      {messageDetails.message}
                    </p>

                    {/* Choice options */}
                    <div className="mt-4 flex flex-col w-full">
                      {message.Choice1 && (
                        <button
                          className={`mb-2 px-4 py-2 rounded ${
                            selectedChoice === "Choice1"
                              ? "bg-primary text-background"
                              : totalVotes === 0
                              ? "bg-background text-text"
                              : messageDetails.Choice1Votes === mostVotedChoice
                              ? "bg-success text-text"
                              : "bg-background text-text"
                          }`}
                          onClick={() => handleChoiceSelect("Choice1")}
                        >
                          <div className="flex flex-col items-start">
                            <span>{message.Choice1}</span>
                            <span>
                              {getVotePercentage(
                                messageDetails.Choice1Votes,
                                totalVotes
                              )}
                              %
                            </span>
                            <span>{messageDetails.Choice1Votes} Votes</span>
                          </div>
                        </button>
                      )}
                      {message.Choice2 && (
                        <button
                          className={`mb-2 px-4 py-2 rounded ${
                            selectedChoice === "Choice2"
                              ? "bg-primary text-background"
                              : totalVotes === 0
                              ? "bg-background text-text"
                              : messageDetails.Choice2Votes === mostVotedChoice
                              ? "bg-success text-text"
                              : "bg-background text-text"
                          }`}
                          onClick={() => handleChoiceSelect("Choice2")}
                        >
                          <div className="flex flex-col items-start">
                            <span>{message.Choice2}</span>
                            <span>
                              {getVotePercentage(
                                messageDetails.Choice2Votes,
                                totalVotes
                              )}
                              %
                            </span>
                            <span>{messageDetails.Choice2Votes} Votes</span>
                          </div>
                        </button>
                      )}
                      {message.Choice3 && (
                        <button
                          className={`mb-2 px-4 py-2 rounded ${
                            selectedChoice === "Choice3"
                              ? "bg-primary text-background"
                              : totalVotes === 0
                              ? "bg-background text-text"
                              : messageDetails.Choice3Votes === mostVotedChoice
                              ? "bg-success text-text"
                              : "bg-background text-text"
                          }`}
                          onClick={() => handleChoiceSelect("Choice3")}
                        >
                          <div className="flex flex-col items-start">
                            <span>{message.Choice3}</span>
                            <span>
                              {getVotePercentage(
                                messageDetails.Choice3Votes,
                                totalVotes
                              )}
                              %
                            </span>
                            <span>{messageDetails.Choice3Votes} Votes</span>
                          </div>
                        </button>
                      )}
                      {message.Choice4 && (
                        <button
                          className={`mb-2 px-4 py-2 rounded ${
                            selectedChoice === "Choice4"
                              ? "bg-primary text-background"
                              : totalVotes === 0
                              ? "bg-background text-text"
                              : messageDetails.Choice4Votes === mostVotedChoice
                              ? "bg-success text-text"
                              : "bg-background text-text"
                          }`}
                          onClick={() => handleChoiceSelect("Choice4")}
                        >
                          <div className="flex flex-col items-start">
                            <span>{message.Choice4}</span>
                            <span>
                              {getVotePercentage(
                                messageDetails.Choice4Votes,
                                totalVotes
                              )}
                              %
                            </span>
                            <span>{messageDetails.Choice4Votes} Votes</span>
                          </div>
                        </button>
                      )}
                      {message.Choice5 && (
                        <button
                          className={`mb-2 px-4 py-2 rounded ${
                            selectedChoice === "Choice5"
                              ? "bg-primary text-background"
                              : totalVotes === 0
                              ? "bg-background text-text"
                              : messageDetails.Choice5Votes === mostVotedChoice
                              ? "bg-success text-text"
                              : "bg-background text-text"
                          }`}
                          onClick={() => handleChoiceSelect("Choice5")}
                        >
                          <div className="flex flex-col items-start">
                            <span>{message.Choice5}</span>
                            <span>
                              {getVotePercentage(
                                messageDetails.Choice5Votes,
                                totalVotes
                              )}
                              %
                            </span>
                            <span>{messageDetails.Choice5Votes} Votes</span>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center md:w-1/6 md:justify-start w-full">
                      {messageDetails.media && (
                        <ReadMediaFile cid={messageDetails.media} />
                      )}
                    </div>
                    {topicId && (
                      <div className="flex items-center space-x-1">
                        <ReplayPoll
                          sequenceNumber={messageDetails.sequence_number}
                          topicId={topicId}
                          author={messageDetails.author}
                          message_id={message.message_id}
                          Choice={selectedChoice}
                        />
                      </div>
                    )}

                    <div className="text-background flex ml-1 items-center text-sm">
                      <span className="text-text px-2 rounded-lg ml-2 flex items-center">
                        {messageDetails.likes}
                      </span>{" "}
                      <span className="text-text px-2 rounded-lg ml-4 flex items-center">
                        {messageDetails.dislikes}
                      </span>{" "}
                      {messageDetails.commentsDetails && (
                        <button
                          onClick={() => {
                            if (messageDetails.comments > 0) {
                              openModal();
                              setShowComments(messageDetails.sequence_number);
                            }
                          }}
                          className={`${
                            messageDetails.comments > 0
                              ? "bg-background hover:bg-primary hover:text-background"
                              : "text-text px-2 rounded-lg ml-2 flex items-center cursor-default"
                          } text-text px-2 rounded-lg ml-4 flex items-center`}
                        >
                          {messageDetails.comments}{" "}
                        </button>
                      )}
                    </div>

                    {showComments === messageDetails.sequence_number && (
                      <Modal isOpen={isModalOpen} onClose={closeModal}>
                        <div className="mb-2 p-4">Comments: </div>
                        {messageDetails.commentsDetails.map(
                          (commentDetail, i) => (
                            <div
                              key={i}
                              className="bg-background px-4 rounded text-text p-2"
                              role="alert"
                            >
                              <p className="text-sm text-primary">
                                {commentDetail.author}
                              </p>
                              <p className="whitespace-pre-line">
                                {commentDetail.message}
                              </p>
                              <hr className="text-secondary" />
                            </div>
                          )
                        )}
                      </Modal>
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
    </div>
  );
}

export default ReadPoll;
