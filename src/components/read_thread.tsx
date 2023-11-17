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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      // Fetch messages directly
      fetchMessages(topicId);
    };
  }, []);

  // Handler for loading more messages
  const handleLoadMore = () => {
    // Fetch more messages if there is a nextLink available
    if (nextLink) {
      fetchMessages(nextLink);
    }
  };

  // Render the Component
  return (
    <div className="max-w-md mx-auto  bg-gray-200 rounded-lg shadow-xl p-6">
      {/* Loading Indicator */}
      {loading && <Spinner />}

      {!loading && (
        <div className="mt-4">
          {/* Iterate over messagesInfo and render each message */}
          {Object.entries(messagesInfo).map(([message_id, details], idx) => {
            const messageDetails = details as MessageDetails;

            try {
              // Render the main message and associated reactions and comments
              return (
                <div
                  key={idx}
                  className="p-2 h-24 border rounded mb-4 bg-gray-300"
                >
                  {/* Display the message text */}
                  <p>{messageDetails.message}</p>

                  {/* Display like, dislike, and comment counts */}
                  <div className="text-gray-600 flex ml-1 items-center text-lg">
                    <span>{messageDetails.likes}</span>{" "}
                    <AiFillLike className="mr-2" />
                    <span>{messageDetails.dislikes}</span>{" "}
                    <AiFillDislike className="mr-2" />
                    {messageDetails.commentsDetails && (
                      <button
                        onClick={() =>
                          handleShowComments(messageDetails.sequence_number)
                        }
                        className="text-sky-900 flex items-center text-lg"
                      >
                        {messageDetails.comments}{" "}
                        <AiFillMessage className="mr-2" />
                      </button>
                    )}
                  </div>

                  {/* Render the Replay component for replies */}
                  <div className="flex items-center space-x-1">
                    <Replay
                      sequenceNumber={messageDetails.sequence_number}
                      topicId={topicId}
                    />
                  </div>

                  {/* Display comments in a modal if showComments is set to the current sequence number */}
                  {showComments === messageDetails.sequence_number && (
                    <Modal setShow={setShowComments}>
                      {messageDetails.commentsDetails.map(
                        (commentDetail, i) => (
                          <div
                            key={idx}
                            className="bg-sky-100 border-l-4 rounded border-sky-500 text-sky-700 p-4 mb-3"
                            role="alert"
                          >
                            <p className="font-bold">
                              {commentDetail.author} said:
                            </p>
                            <p>{commentDetail.message}</p>
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
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
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
