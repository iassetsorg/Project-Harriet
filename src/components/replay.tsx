import React, { useState } from "react";
import Modal from "../utils/modal";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import useSendMessage from "../hooks/use_send_message";
import {
  AiOutlineLike,
  AiOutlineDislike,
  AiOutlineMessage,
} from "react-icons/ai";

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

  const handleReply = async (sequenceNumber: number) => {
    const replyMessage = {
      Author: signingAccount,
      Reply_to: sequenceNumber.toString(),
      Message: replyContent,
    };

    await send(topicId, replyMessage, "", "message");
    setReplyContent("");
    setShowReplyForm(null);
  };

  const handleLike = async (sequenceNumber: number) => {
    const likeMessage = {
      Author: signingAccount,
      Like_to: sequenceNumber.toString(),
    };

    await send(topicId, likeMessage, "", "message");
  };

  const handleDislike = async (sequenceNumber: number) => {
    const dislikeMessage = {
      Author: signingAccount,
      DisLike_to: sequenceNumber.toString(),
    };

    await send(topicId, dislikeMessage, "", "message");
  };

  return (
    <>
      <div className="flex">
        <button
          className="bg-sky-700 hover:bg-sky-800 text-white py-2 px-4 rounded-lg mt-2 flex items-center"
          onClick={() => setShowReplyForm(sequenceNumber)}
        >
          <AiOutlineMessage className="mr-2" /> Reply
        </button>

        <button
          className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-lg ml-2 mt-2 flex items-center"
          onClick={() => handleLike(sequenceNumber)}
        >
          <AiOutlineLike className="mr-2" /> Like
        </button>

        <button
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-lg ml-2 mt-2 flex items-center"
          onClick={() => handleDislike(sequenceNumber)}
        >
          <AiOutlineDislike className="mr-2" /> Dislike
        </button>
      </div>

      {showReplyForm === sequenceNumber && (
        <Modal setShow={setShowReplyForm}>
          <div className="max-w-md mx-auto text-center flex flex-col justify-center  rounded-lg  p-6">
            <h3 className="mb-3 font-semibold text-xl text-sky-900">
              Write a comment
            </h3>
            <textarea
              className="h-24 w-full border rounded mb-3 p-2"
              placeholder="Type your reply here"
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
            />
            <button
              className="bg-sky-700 hover:bg-sky-800 text-white py-2 px-4 rounded w-full"
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
