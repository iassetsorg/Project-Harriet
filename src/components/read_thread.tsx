import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useReadMessages, { MessageDetails } from "../hooks/use_read_messages";
import Replay from "./replay";
import Modal from "../utils/modal";
import { AiFillLike, AiFillDislike, AiFillMessage } from "react-icons/ai";
import Spinner from "../utils/Spinner";
import ReadIPFSData from "./read_ipfs_data";
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
    <div className="bg-background text-text">
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
                  className="p-4 border  border-primary rounded mb-4 bg-secondary overflow-y-auto"
                >
                  {/* Display the message text */}
                  <p className="text-sm mb-1 text-primary">
                    {messageDetails.author}
                  </p>
                  <p className="mb-3 text-text whitespace-pre-line">
                    {messageDetails.message}
                  </p>
                  <div className="flex items-center md:w-1/6 md:justify-start w-full">
                    {messageDetails.media && (
                      <ReadIPFSData cid={messageDetails.media} />
                    )}
                  </div>
                  {/* Render the Replay component for replies */}
                  <div className="flex items-center space-x-1">
                    <Replay
                      sequenceNumber={messageDetails.sequence_number}
                      topicId={topicId}
                      author={messageDetails.author}
                      message_id={message_id}
                    />
                  </div>

                  {/* Display like, dislike, and comment counts */}
                  <div className="text-background flex ml-1 items-center text-sm ">
                    <span className=" text-text  px-2 rounded-lg ml-2 flex items-center">
                      {messageDetails.likes}
                    </span>{" "}
                    <span className=" text-text  px-2 rounded-lg ml-4 flex items-center">
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
                            ? "bg-background hover:bg-primary hover:text-background"
                            : "text-text  px-2 rounded-lg ml-2 flex items-center cursor-default"
                        } text-text px-2 rounded-lg ml-4 flex items-center`}
                      >
                        {messageDetails.comments}{" "}
                      </button>
                    )}
                  </div>

                  {/* Display comments in a modal if showComments is set to the current sequence number */}
                  {showComments === messageDetails.sequence_number && (
                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                      <div className="mb-2 p-4">Comments: </div>
                      {messageDetails.commentsDetails.map(
                        (commentDetail, i) => (
                          <div
                            key={i}
                            className="bg-background  px-4 rounded  text-text p-2 "
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
              // Display a toast message for errors in parsing messages
              toast(`Error : ${error}`);
              return null;
            }
          })}

          {/* Render a button to load more messages if available */}
          {nextLink && (
            <button
              className="bg-primary hover:bg-accent text-text font-bold py-2 px-4 rounded mt-4"
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
