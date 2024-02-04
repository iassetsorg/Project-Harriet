import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useReadMessages, { MessageDetails } from "../hooks/use_read_messages";
import Replay from "./replay";
import Modal from "../utils/modal";
import { AiFillLike, AiFillDislike, AiFillMessage } from "react-icons/ai";
import Spinner from "../utils/Spinner";

// Main component to read and display messages
function ReadThread({ topicId }: { topicId: string }) {
  // State variables to manage the topic ID and control showing comments
  const [showComments, setShowComments] = useState<number | null>(null);
  const { messagesInfo, loading, fetchMessages, nextLink } =
    useReadMessages(topicId);

  // Handler to set the selected message's sequence number for displaying comments
  const handleShowComments = (sequence_number: number) => {
    setShowComments(sequence_number);
  };

  useEffect(() => {
    fetchMessages(topicId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler for loading more messages
  const handleLoadMore = () => {
    // Fetch more messages if there is a nextLink available
    if (nextLink) {
      fetchMessages(nextLink);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setShowComments(null);
  };

  // Render the Component
  return (
    <div className="bg-gray-800 text-white">
      {/* Loading Indicator */}
      {loading && <Spinner />}

      {!loading && (
        <div>
          {/* Iterate over messagesInfo and render each message */}
          {Object.entries(messagesInfo).map(([message_id, details], idx) => {
            const messageDetails = details as MessageDetails;

            try {
              // Render the main message and associated reactions and comments
              return (
                <div
                  key={idx}
                  className="p-4 border  border-indigo-300 rounded mb-4 bg-gray-700 overflow-y-auto"
                >
                  {/* Display the message text */}
                  <p className="text-sm mb-1 text-gray-400">
                    {messageDetails.author}
                  </p>
                  <p className="mb-3 text-gray-300 whitespace-pre-line">
                    {messageDetails.message}
                  </p>

                  {/* Render the Replay component for replies */}
                  <div className="flex items-center space-x-1">
                    <Replay
                      sequenceNumber={messageDetails.sequence_number}
                      topicId={topicId}
                      author={messageDetails.author}
                    />
                  </div>

                  {/* Display like, dislike, and comment counts */}
                  <div className="text-gray-600 flex ml-1 items-center text-sm ">
                    <span className=" text-gray-300  px-2 rounded-lg ml-2 flex items-center">
                      {messageDetails.likes}
                    </span>{" "}
                    <span className=" text-gray-300  px-2 rounded-lg ml-4 flex items-center">
                      {messageDetails.dislikes}
                    </span>{" "}
                    {messageDetails.commentsDetails && (
                      <button
                        onClick={() => {
                          if (messageDetails.comments > 0) {
                            openModal();
                            handleShowComments(messageDetails.sequence_number);
                          }
                        }}
                        className={`${
                          messageDetails.comments > 0
                            ? "bg-gray-600 hover:bg-gray-500"
                            : "text-gray-300  px-2 rounded-lg ml-2 flex items-center cursor-default"
                        } text-gray-300 px-2 rounded-lg ml-4 flex items-center`}
                      >
                        {messageDetails.comments}{" "}
                      </button>
                    )}
                  </div>

                  {/* Display comments in a modal if showComments is set to the current sequence number */}
                  {showComments === messageDetails.sequence_number && (
                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                      {messageDetails.commentsDetails.map(
                        (commentDetail, i) => (
                          <div
                            key={i}
                            className="bg-gray-600 border-l-4 rounded border-gray-500 text-gray-300 p-4 mb-3"
                            role="alert"
                          >
                            <p className="font-bold">
                              {commentDetail.author} said:
                            </p>
                            <p className="whitespace-pre-line">
                              {commentDetail.message}
                            </p>
                          </div>
                        )
                      )}
                    </Modal>
                  )}
                </div>
              );
            } catch (error) {
              // Display a toast message for errors in parsing messages
              toast(`Error : ${error}`);
              return null;
            }
          })}

          {/* Render a button to load more messages if available */}
          {nextLink && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={handleLoadMore}
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ReadThread;
