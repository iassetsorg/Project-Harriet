import React, { useState } from "react";
import { toast } from "react-toastify";
import useReadMessages, { MessageDetails } from "../hooks/use_read_messages";
import Replay from "./replay";
import Modal from "../utils/modal";
import { AiFillLike, AiFillDislike, AiFillMessage } from "react-icons/ai";
import Spinner from "../utils/Spinner";
// Main component to read and display messages
function ReadMessagesManually() {
  // State variables to manage the topic ID
  const [topicId, setTopicId] = useState<string>("");
  const [showComments, setShowComments] = useState<number | null>(null);
  const { messagesInfo, loading, fetchMessages, nextLink } =
    useReadMessages(topicId);

  const handleShowComments = (sequence_number: number) => {
    setShowComments(sequence_number);
  };

  // Handler for initial messages load
  const handleLoad = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    fetchMessages(topicId);
  };

  // Handler for loading more messages
  const handleLoadMore = () => {
    if (nextLink) {
      fetchMessages(nextLink);
    }
  };

  // Render the Component
  return (
    <div className="max-w-md mx-auto  bg-gray-200 rounded-lg shadow-xl p-6">
      {/* Header */}
      <h3 className="text-xl font-semibold text-sky-900 mb-4">Read Messages</h3>
      {/* Form for submitting theme ID */}
      <form onSubmit={handleLoad}>
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

      {/* Loading Indicator */}
      {loading && <Spinner />}

      {!loading && (
        <div className="mt-4">
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

export default ReadMessagesManually;
