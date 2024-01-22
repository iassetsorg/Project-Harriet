import React, { useState } from "react";
import Modal from "../utils/modal";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import useSendMessage from "../hooks/use_send_message";
import { FiShare2 } from "react-icons/fi";
import {
  AiOutlineLike,
  AiOutlineDislike,
  AiOutlineMessage,
} from "react-icons/ai";
import { toast } from "react-toastify";
interface ReplayProps {
  sequenceNumber: number;
  topicId: string;
}

const Replay: React.FC<ReplayProps> = ({ sequenceNumber, topicId }) => {
  const { send } = useSendMessage();
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const [replyContent, setReplyContent] = useState<string>("");
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setShowReplyForm(null);
  };

  const handleReply = async (sequenceNumber: number) => {
    const replyMessage = {
      Author: signingAccount,
      Reply_to: sequenceNumber.toString(),
      Message: replyContent,
    };

    toast("Sending reply");
    await send(topicId, replyMessage, "");
    setReplyContent("");
    setShowReplyForm(null);
  };

  const handleLike = async (sequenceNumber: number) => {
    const likeMessage = {
      Author: signingAccount,
      Like_to: sequenceNumber.toString(),
    };

    toast("Sending Like");
    await send(topicId, likeMessage, "");
  };

  const handleDislike = async (sequenceNumber: number) => {
    const dislikeMessage = {
      Author: signingAccount,
      DisLike_to: sequenceNumber.toString(),
    };

    toast("Sending DisLike");
    await send(topicId, dislikeMessage, "");
  };
  const generateShareLink = () => {
    return `${window.location.origin}/Threads/${topicId}`;
  };
  const copyShareLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link).then(() => {
      toast("Link copied to clipboard!");
    });
  };
  return (
    <>
      <div className="flex">
        <button
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => handleLike(sequenceNumber)}
        >
          <AiOutlineLike className="text-green-500" />
        </button>

        <button
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-2 rounded-lg ml-2 mt-2 flex items-center"
          onClick={() => handleDislike(sequenceNumber)}
        >
          <AiOutlineDislike className="text-red-500" />
        </button>

        <button
          className="bg-gray-700 hover:bg-gray-600 text-gray-300  py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => {
            openModal();
            setShowReplyForm(sequenceNumber);
          }}
        >
          <AiOutlineMessage className="text-sky-500" />
        </button>
        <button
          className="bg-gray-700 hover:bg-gray-600 text-gray-300  py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => {
            copyShareLink();
          }}
        >
          <FiShare2 className="text-gray-300" />
        </button>
      </div>

      {showReplyForm === sequenceNumber && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="max-w-md mx-auto mt-3 text-center flex flex-col justify-center rounded-lg bg-gray-800 p-6 text-white">
            <h3 className="mb-3 font-semibold text-xl">Write a comment</h3>
            <textarea
              className="h-24 w-full border border-gray-600 rounded mb-3 p-2 bg-gray-700 text-white"
              placeholder="Type your reply here"
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
            />
            <button
              className=" text-gray-800 bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300 py-2 px-4  w-full"
              onClick={() => handleReply(sequenceNumber)}
            >
              Send
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Replay;
