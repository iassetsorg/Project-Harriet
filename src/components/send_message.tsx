// components/MessageSender.tsx
import React, { useState } from "react";
import useSendMessage from "../hooks/use_send_message";

import { useHashConnectContext } from "../hashconnect/hashconnect";
const SendMessages = () => {
  const [topicId, setTopicId] = useState("");
  const [message, setMessage] = useState("");
  const [memo, setMemo] = useState("");
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";

  // Get the send function and response data from the custom hook
  const { send } = useSendMessage();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleSend = async () => {
    const Message = {
      Author: signingAccount,
      Message: message,
    };
    // Call the send function p rovided by the hook
    await send(topicId, Message, memo);
    openModal();
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl p-6 text-white">
      <h3 className="text-2xl py-4 px-8 font-semibold text-indigo-300">
        Send a Message
      </h3>

      <section className="py-4 px-8">
        <label
          htmlFor="messageContent"
          className="block text-sm font-semibold text-gray-300"
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
            className="w-full px-4 py-2 h-24 rounded-lg border-2 border-indigo-400 focus:ring-4 focus:ring-indigo-500 text-base bg-gray-700 text-white"
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
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
      >
        Send
      </button>
    </div>
  );
};

export default SendMessages;
