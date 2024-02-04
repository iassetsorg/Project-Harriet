import React, { useEffect, useState } from "react";
import useGetData from "../hooks/use_get_data";
import Spinner from "../utils/Spinner";
import { FiShare2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { BsCurrencyDollar } from "react-icons/bs";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import Modal from "../utils/modal";
import Tip from "./tip";

function Planet() {
  const { state, pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";

  const planetTopicID = "0.0.4320596";

  const { messages, loading, fetchMessages, nextLink } = useGetData(
    planetTopicID,
    null,
    true
  );

  const [authers, setAuthors] = useState("");
  const [topicId, setTopicId] = useState("");
  useEffect(() => {
    fetchMessages(planetTopicID);
  }, []);

  const handleLoadMore = () => {
    if (nextLink) fetchMessages(nextLink);
  };

  const generateShareLink = (sequence_number: string) => {
    return `${window.location.origin}/Posts/${sequence_number}`;
  };
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

  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const handleTip = (author: string, topicId: string) => {
    if (signingAccount === author) {
      toast("You cannot tip yourself");
      return;
    }
    setSelectedAuthor(author);
    setSelectedTopicId(topicId);
    openTipModal();
  };

  return (
    <div className="overflow-y-scroll w-full h-screen bg-gray-800 shadow-xl p-6 text-white ">
      {loading && <Spinner />}
      {!loading &&
        messages.map((message, idx) => {
          if (message.Message) {
            return (
              <div
                key={idx}
                className="p-4 border border-indigo-300 rounded mb-4 bg-gray-700 overflow-y-auto "
              >
                <p className="text-sm mb-1 text-gray-400">{message.sender}</p>
                <p className="mb-3 text-gray-300 whitespace-pre-line">
                  {message.Message}
                </p>
                <div className="flex items-center">
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300  py-1 px-1 rounded-lg mt-2 ml-2 flex items-center"
                    onClick={() =>
                      handleTip(
                        message.sender.toString(),
                        message.sequence_number.toString()
                      )
                    }
                  >
                    <BsCurrencyDollar className="text-gray-300" />
                  </button>

                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300  py-1 px-1 rounded-lg mt-2 ml-2 flex items-center"
                    onClick={() => {
                      copyShareLink(message.sequence_number.toString());
                    }}
                  >
                    <FiShare2 className="text-gray-300" />
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })}
      {isTipModalOpen && (
        <Modal isOpen={isTipModalOpen} onClose={closeTipModal}>
          <div className="bg-gray-800 p-4 rounded-lg">
            <Tip
              onClose={closeTipModal}
              author={selectedAuthor}
              topicId={selectedTopicId}
            />
          </div>
        </Modal>
      )}
      {nextLink && (
        <button
          onClick={handleLoadMore}
          className="bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue hover:bg-blue-700"
        >
          Load more
        </button>
      )}
    </div>
  );
}

export default Planet;
