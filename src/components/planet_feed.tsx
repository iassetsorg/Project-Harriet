import React, { useEffect, useState } from "react";
import useGetData from "../hooks/use_get_data";
import Spinner from "../utils/Spinner";
import { FiShare2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { BsCurrencyDollar } from "react-icons/bs";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import Modal from "../utils/modal";
import Tip from "./tip";
import Pair from "../hashconnect/pair";
import ReadIPFSData from "./read_ipfs_data";
import { FiHash } from "react-icons/fi";
function Planet() {
  const { state, pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";

  const planetTopicID = "0.0.4320596";

  const { messages, loading, fetchMessages, nextLink } = useGetData(
    planetTopicID,
    null,
    true
  );

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const openConnectModal = () => {
    setIsConnectModalOpen(true);
  };
  const closeConnectModal = () => {
    setIsConnectModalOpen(false);
  };

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
    if (state !== "Paired") {
      openConnectModal();
      return;
    }
    if (signingAccount === author) {
      toast("You cannot tip yourself");
      return;
    }
    setSelectedAuthor(author);
    setSelectedTopicId(topicId);
    openTipModal();
  };

  return (
    <div className="overflow-y-scroll w-full h-screen bg-background shadow-xl p-6 text-text ">
      {loading && <Spinner />}
      {!loading &&
        messages.map((message, idx) => {
          if (message.Message) {
            return (
              <div
                key={idx}
                className="p-4 border border-primary rounded mb-4 bg-secondary overflow-y-auto "
              >
                <p className="text-sm mb-1 text-primary">{message.sender}</p>
                <p className="mb-3 text-text textspace-pre-line">
                  {message.Message}
                </p>
                <div className="flex items-center md:w-1/6 md:justify-start w-full">
                  {message.Media && <ReadIPFSData cid={message.Media} />}
                </div>

                <div className="flex items-center">
                  <button
                    className="bg-secondary hover:bg-background text-text  py-1 px-1 rounded-lg mt-2 ml-2 flex items-center"
                    onClick={() =>
                      handleTip(
                        message.sender.toString(),
                        message.sequence_number.toString()
                      )
                    }
                  >
                    <BsCurrencyDollar className="text-text" />
                  </button>

                  <button
                    className="bg-secondary hover:bg-background text-text  py-1 px-1 rounded-lg mt-2 ml-2 flex items-center"
                    onClick={() => {
                      copyShareLink(message.sequence_number.toString());
                    }}
                  >
                    <FiShare2 className="text-text" />
                  </button>
                  <a
                    href={`https://hashscan.io/mainnet/transaction/${message.message_id}`}
                    target="blank"
                    className="bg-secondary hover:bg-background text-text  py-1 px-1 rounded-lg mt-2 ml-2 flex items-center"
                  >
                    <FiHash />
                  </a>
                </div>
              </div>
            );
          }
          return null;
        })}
      {isConnectModalOpen && (
        <Modal isOpen={isConnectModalOpen} onClose={closeConnectModal}>
          <Pair />
        </Modal>
      )}

      {isTipModalOpen && (
        <Modal isOpen={isTipModalOpen} onClose={closeTipModal}>
          <div className="bg-background p-4 rounded-lg">
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
          className="py-3 px-6 font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300"
        >
          Load more
        </button>
      )}
    </div>
  );
}

export default Planet;
