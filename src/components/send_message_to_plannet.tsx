// components/SendMessagesModal.tsx
import React, { useState } from "react";
import useSendMessage from "../hooks/use_send_message";
import TransactionResponse from "../utils/transaction_response";
import { toast } from "react-toastify";

interface SendMessageToPlanetProps {
  onClose: () => void; // Explicitly define the type for onClose
}

const SendMessageToPlanetModal: React.FC<SendMessageToPlanetProps> = ({
  onClose,
}) => {
  const [message, setMessage] = useState("");
  const [memo, setMemo] = useState("");

  const { send } = useSendMessage();

  const topicId = "0.0.4320596";
  const handleSend = async () => {
    const Message = {
      Message: message,
    };
    const posting = await send(topicId, Message, memo);
    if (posting?.receipt.status.toString() === "SUCCESS") {
      toast("Message posted on Planet");
      onClose();
      window.location.reload();
    } else {
      toast("Error posting message on Planet");
    }
  };

  return (
    <div className="modal ">
      <div className="modal-content max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl p-3 text-white">
        <h3 className="text-xl py-4 px-8 font-semibold text-indigo-300">
          Post on Planet
        </h3>

        <section className="py-4 px-8">
          <label
            htmlFor="messageContent"
            className="block text-sm font-semibold text-gray-300"
          >
            Message:
          </label>
          <div className="mt-2">
            <textarea
              className="w-full px-4 py-2 rounded-lg text-base bg-gray-700 text-white"
              name="messageContent"
              id="messageContent"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </section>

        <section className="py-4 px-8">
          <label
            htmlFor="messageMemo"
            className="block text-sm font-semibold text-gray-300"
          >
            Memo:
          </label>
          <div className="mt-2">
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg text-base bg-gray-700 text-white"
              name="messageMemo"
              id="messageMemo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </section>

        <button
          onClick={handleSend}
          className="w-full  py-3 px-6 font-semibold text-gray-800 bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300 "
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SendMessageToPlanetModal;
