import React, { useEffect, useState } from "react";
import Modal from "../../common/modal";
import { useHashConnectContext } from "../../hashconnect/hashconnect";
import useSendMessage from "../../hooks/use_send_message";
import { FiShare2 } from "react-icons/fi";
import Tip from "../tip/tip";
import { BsCurrencyDollar } from "react-icons/bs";
import Pair from "../../hashconnect/pair";
import {
  AiOutlineLike,
  AiOutlineDislike,
  AiOutlineMessage,
} from "react-icons/ai";
import { FiHash } from "react-icons/fi";
import { toast } from "react-toastify";
interface ReplayProps {
  sequenceNumber: number;
  topicId: string;
  author?: string | null | undefined;
  message_id: string;
  Choice: string;
}

const ReplayPoll: React.FC<ReplayProps> = ({
  sequenceNumber,
  topicId,
  author,
  message_id,
  Choice,
}) => {
  const { send } = useSendMessage();
  const { state, pairingData } = useHashConnectContext();
  useEffect(() => {
    if (state === "Paired") {
      closeModal();
    }
  }, [state]);
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

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const openConnectModal = () => {
    setIsConnectModalOpen(true);
  };
  const closeConnectModal = () => {
    setIsConnectModalOpen(false);
  };

  const handlePoll = async () => {
    if (state !== "Paired") {
      openConnectModal();
      return;
    }
    const VoteMessage = {
      Choice: Choice,
    };

    toast("Sending Vote");
    await send(topicId, VoteMessage, "");
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleReply = async (sequenceNumber: number) => {
    if (state !== "Paired") {
      openConnectModal();
      return;
    }

    const replyMessage = {
      Reply_to: sequenceNumber.toString(),
      Message: replyContent,
    };

    toast("Sending reply");
    await send(topicId, replyMessage, "");
    setReplyContent("");
    setShowReplyForm(null);
  };

  const handleLike = async (sequenceNumber: number) => {
    if (state !== "Paired") {
      openConnectModal();
      return;
    }
    const likeMessage = {
      Author: signingAccount,
      Like_to: sequenceNumber.toString(),
    };

    toast("Sending Like");
    await send(topicId, likeMessage, "");
  };

  const handleDislike = async (sequenceNumber: number) => {
    if (state !== "Paired") {
      openConnectModal();
      return;
    }
    const dislikeMessage = {
      Author: signingAccount,
      DisLike_to: sequenceNumber.toString(),
    };

    toast("Sending DisLike");
    await send(topicId, dislikeMessage, "");
  };
  const generateShareLink = () => {
    return `${window.location.origin}/Polls/${topicId}`;
  };
  const copyShareLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link).then(() => {
      toast("Link copied to clipboard!");
    });
  };

  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const openTipModal = () => {
    setIsTipModalOpen(true);
  };
  const closeTipModal = () => {
    setIsTipModalOpen(false);
  };

  const handleTip = () => {
    if (signingAccount === author) {
      toast("You cannot tip yourself");
      return;
    }
    if (state !== "Paired") {
      openConnectModal();
      return;
    }
    openTipModal();
  };

  useEffect(() => {
    if (state === "Paired") {
      closeModal();
    }
  }, [state]);
  return (
    <>
      <div className="flex">
        <button
          className="bg-secondary hover:bg-background text-text py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => handleLike(sequenceNumber)}
        >
          <AiOutlineLike className="text-text" />
        </button>
        <button
          className="bg-secondary hover:bg-background text-text py-1 px-2 rounded-lg ml-2 mt-2 flex items-center"
          onClick={() => handleDislike(sequenceNumber)}
        >
          <AiOutlineDislike className="text-text" />
        </button>
        <button
          className="bg-secondary hover:bg-background text-text  py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => {
            if (state !== "Paired") {
              openConnectModal();
              return;
            }

            openModal();
            setShowReplyForm(sequenceNumber);
          }}
        >
          <AiOutlineMessage className="text-text" />
        </button>
        <a
          href={`https://hashscan.io/mainnet/transaction/${message_id}`}
          target="blank"
          className="bg-secondary hover:bg-background text-text  py-1 px-1 rounded-lg mt-2 ml-2 flex items-center"
        >
          <FiHash />
        </a>
        <button
          className="bg-secondary hover:bg-background text-text  py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => {
            handleTip();
          }}
        >
          <BsCurrencyDollar className="text-text" />
        </button>
        <button
          className="bg-secondary hover:bg-background text-text  py-1 px-2 rounded-lg mt-2 ml-2 flex items-center"
          onClick={() => {
            copyShareLink();
          }}
        >
          <FiShare2 className="text-text" />
        </button>
        <button
          className={`py-1 px-2 rounded-lg mt-2 ml-2 flex items-center ${
            Choice === ""
              ? " text-text bg-secondary"
              : "text-background bg-primary hover:bg-accent transition duration-300"
          }`}
          onClick={() => {
            if (Choice === "") {
              toast("Please select a choice to vote");
            } else {
              handlePoll();
            }
          }}
        >
          Vote
        </button>
      </div>

      {showReplyForm === sequenceNumber && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="max-w-md mx-auto mt-3 text-center flex flex-col justify-center rounded-lg bg-background p-6 text-text">
            <h3 className="mb-3 font-semibold text-xl">Write a comment</h3>
            <textarea
              className="h-24 w-full border border-background rounded mb-3 p-2 bg-secondary text-text"
              placeholder="Type your reply here"
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
            />
            <button
              className=" text-background bg-primary rounded-full hover:bg-accent transition duration-300 py-2 px-4  w-full"
              onClick={() => handleReply(sequenceNumber)}
            >
              Send
            </button>
          </div>
        </Modal>
      )}
      {isConnectModalOpen && (
        <Modal isOpen={isConnectModalOpen} onClose={closeConnectModal}>
          <Pair />
        </Modal>
      )}

      {/* Display comments in a modal if showComments is set to the current sequence number */}
      {isTipModalOpen && (
        <Modal isOpen={isTipModalOpen} onClose={closeTipModal}>
          <div className="bg-background p-4 rounded-lg">
            <Tip onClose={closeTipModal} author={author} topicId={topicId} />
          </div>
        </Modal>
      )}
    </>
  );
};

export default ReplayPoll;
