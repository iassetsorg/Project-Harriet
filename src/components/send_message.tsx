// components/MessageSender.tsx
import React, { useState } from "react";
import useSendMessage from "../hooks/use_send_message";
import TransactionResponse from "../utils/transaction_response";
import { useHashConnectContext } from "../hashconnect/hashconnect";
const SendMessages = () => {
  const [topicId, setTopicId] = useState("");
  const [message, setMessage] = useState("");
  const [memo, setMemo] = useState("");
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const [showModal, setShowModal] = useState(false); // Modal display state
  // Get the send function and response data from the custom hook
  const { send, response } = useSendMessage();

  const handleSend = async () => {
    const Message = {
      Author: signingAccount,
      Message: message,
    };
    // Call the send function p rovided by the hook
    await send(topicId, Message, memo, "message");
    setShowModal(true);
  };

  return (
    <div className="max-w-md mx-auto  bg-gray-200 rounded-lg shadow-xl p-6">
      <h3 className="text-2xl py-4 px-8 font-semibold text-sky-900">
        Send a Message
      </h3>

      <section className="py-4 px-8">
        <label
          htmlFor="topicID"
          className="block text-sm font-semibold text-gray-700"
        >
          Thread ID:
        </label>
        <div className="mt-2">
          <input
            className="w-full px-4 py-2 rounded-lg border-2 border-sky-400 focus:ring-4 focus:ring-sky-300 text-base bg-white backdrop-blur-md"
            type="text"
            name="topicID"
            id="topicID"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
          />
        </div>
      </section>

      <section className="py-4 px-8">
        <label
          htmlFor="messageContent"
          className="block text-sm font-semibold text-gray-700"
        >
          Message:
        </label>
        <div className="mt-2">
          <textarea
            className="w-full px-4 py-2 h-24 rounded-lg border-2 border-sky-400 focus:ring-4 focus:ring-sky-300 text-base bg-white backdrop-blur-md"
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
          className="block text-sm font-semibold text-gray-700"
        >
          Memo:
        </label>
        <div className="mt-2">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border-2 border-sky-400 focus:ring-4 focus:ring-sky-300 text-base bg-white backdrop-blur-md"
            name="messageMemo"
            id="messageMemo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </section>

      <button
        onClick={handleSend}
        className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-3 px-6 rounded-lg focus-ring-4 focus-ring-sky-400 focus-ring-opacity-50"
      >
        Send
      </button>

      {showModal && response && (
        <TransactionResponse
          setShow={setShowModal}
          transactionData={response}
          type={"message"}
          message={message}
          topicId={topicId}
        />
      )}
    </div>
  );
};

export default SendMessages;
