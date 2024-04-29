import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useGetData from "../../hooks/use_get_data";
import Replay from "../replay/replay_to_thread";
import Modal from "../../common/modal";
import Spinner from "../../common/Spinner";
import ReadIPFSData from "../ipfs/read_ipfs_data";
import UserProfile from "../profile/user_profile";

function ReadThread({ topicId }: { topicId?: string }) {
  const [showComments, setShowComments] = useState<number | null>(null);
  const { messages, loading, fetchMessages, nextLink } = useGetData(topicId);
  const [allMessages, setAllMessages] = useState<any[]>([]);

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
              message.Identifier
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
            };

            try {
              return (
                <div
                  key={idx}
                  className="p-4 border border-primary rounded mb-4 bg-secondary overflow-y-auto"
                >
                  <UserProfile userAccountId={messageDetails.author} />
                  <p className="mb-3 text-text whitespace-pre-line">
                    {messageDetails.message}
                  </p>
                  <div className="flex items-center md:w-1/6 md:justify-start w-full">
                    {messageDetails.media && (
                      <ReadIPFSData cid={messageDetails.media} />
                    )}
                  </div>
                  {topicId && (
                    <div className="flex items-center space-x-1">
                      <Replay
                        sequenceNumber={messageDetails.sequence_number}
                        topicId={topicId}
                        author={messageDetails.author}
                        message_id={message.message_id}
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

export default ReadThread;
