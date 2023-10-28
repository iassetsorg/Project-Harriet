import { useState, useEffect } from "react";
import { useSigningContext } from "../hashconnect/sign";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import { toast } from "react-toastify";
import {
  TopicMessageSubmitTransaction,
  TransactionReceipt,
} from "@hashgraph/sdk";
import Modal from "./modal";

// Define a functional component named MessageTopic
const MessageTopic = () => {
  // Destructure values from custom hooks and libraries
  const { makeBytes } = useSigningContext(); // Context for signing
  const { sendTransaction, pairingData } = useHashConnectContext(); // Context for Hashgraph connection

  // Extract the first account ID from pairingData or set to an empty string
  const signingAccount = pairingData?.accountIds[0] || "";

  // Define and initialize component state using React Hooks
  const [topicId, setTopicId] = useState(""); // Topic ID input
  const [message, setMessage] = useState<string>(""); // Message input
  const [memo, setMemo] = useState(""); // Memo input
  const [responseData, setResponseData] = useState<null | {
    transactionId: any;
    receipt: TransactionReceipt;
  }>(null); // Data for response modal
  const [showModal, setShowModal] = useState(false); // Modal display state
  const [hasMessages, setHasMessages] = useState(false); // Flag for checking if the topic has messages

  // Function for sending a message to the topic
  const send = async () => {
    if (!signingAccount) {
      toast("Connect your wallet");
      return;
    }

    if (!topicId) {
      toast("Please enter a Thread ID");
      return;
    }

    // Create a message object based on whether the topic has existing messages
    let messageObject;
    if (!hasMessages) {
      messageObject = {
        Identifier: "iAssets",
        Type: "Thread",
        Author: signingAccount,
      };
    } else {
      messageObject = { Message: message };
    }

    // Create a new transaction for submitting the message
    const transaction = new TopicMessageSubmitTransaction()
      .setMessage(JSON.stringify(messageObject))
      .setTopicId(topicId)
      .setTransactionMemo(memo);

    // Serialize the transaction and send it
    const transactionBytes = await makeBytes(transaction, signingAccount);
    const response = await sendTransaction(
      transactionBytes,
      signingAccount,
      false
    );
    const receiptBytes = response.receipt as Uint8Array;

    if (response.success) {
      const responseData = {
        transactionId: response.response.transactionId,
        receipt: TransactionReceipt.fromBytes(receiptBytes),
      };

      // Set response data and show the modal
      setResponseData(responseData);
      setShowModal(true);
      toast(responseData.receipt.status.toString());
    } else {
      toast.error(`${response.error}`);
    }
  };

  // Function to fetch topic data asynchronously
  const fetchTopicData = async (topicId: string) => {
    try {
      const response = await fetch(
        `https://mainnet-public.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`
      );

      if (response.ok) {
        const data = await response.json();
        // Set hasMessages flag based on the presence of messages
        setHasMessages(data.messages.length > 0);
      } else {
        toast("Topic Not Found");
      }
    } catch (error) {
      console.error("Error fetching topic data:", error);
      toast("An error occurred while fetching topic data");
    }
  };

  // Trigger the topic data fetch when the topicId changes
  useEffect(() => {
    if (topicId) {
      fetchTopicData(topicId);
    }
  }, [topicId]);

  // Function to copy the transaction ID to the clipboard
  const copyToClipboard = () => {
    if (responseData) {
      const transactionId = responseData.transactionId;
      navigator.clipboard
        .writeText(transactionId)
        .then(() => {
          toast("Transaction ID copied to clipboard");
        })
        .catch((error) => {
          console.error("Copy to clipboard failed:", error);
        });
    }
  };

  // Function to download the transaction ID as a text file
  const downloadTransactionId = () => {
    if (responseData) {
      const transactionId = responseData.transactionId;
      const truncatedMessage =
        message.length > 5 ? message.substring(0, 5) + "..." : message;
      const receiptStatus = responseData.receipt.status;

      const content = `Transaction ID: ${transactionId}\nMessage: ${truncatedMessage}\nStatus: ${receiptStatus}\nTopic Id${topicId}`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${truncatedMessage}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Transaction ID downloaded!");
    }
  };

  // Render the component's UI
  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-blue-300 rounded-lg shadow-xl p-6">
        <div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-t-lg p-4 sm:p-6 text-center">
          <h3 className="text-3xl font-semibold text-blue-800">
            Message a Thread
          </h3>
        </div>

        <section className="py-4 px-8">
          <label
            htmlFor="topicName"
            className="block text-sm font-semibold text-gray-700"
          >
            Thread Id:
          </label>
          <div className="mt-2">
            <input
              className="w-full px-4 py-2 rounded-lg border-2 border-blue-400 focus:ring-4 focus:ring-blue-300 text-base bg-white backdrop-blur-md"
              type="text"
              name="topicName"
              id="topicName"
              value={topicId}
              onChange={(event) => setTopicId(event.target.value)}
            />
          </div>
        </section>

        {hasMessages || topicId === "" ? (
          <section className="py-4 px-8">
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-gray-700"
            >
              Message:
            </label>
            <div className="mt-2">
              <textarea
                className="w-full px-4 py-2 rounded-lg border-2 border-blue-400 focus:ring-4 focus:ring-blue-300 text-base bg-white backdrop-blur-md"
                name="message"
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={!hasMessages}
              />
            </div>
          </section>
        ) : (
          <div className="text-center mt-4">
            Click On Send to initiate the Thread
          </div>
        )}

        <section className="py-4 px-8">
          <label
            htmlFor="transactionMemo"
            className="block text-sm font-semibold text-gray-700"
          >
            Memo:
          </label>
          <div className="mt-2">
            <input
              className="w-full px-4 py-2 rounded-lg border-2 border-blue-400 focus:ring-4 focus:ring-blue-300 text-base bg-white backdrop-blur-md"
              type="text"
              name="transactionMemo"
              id="transactionMemo"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
            />
          </div>
        </section>

        <button
          onClick={() => send()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50"
        >
          Send
        </button>
      </div>

      {showModal && responseData && (
        <Modal setShow={setShowModal}>
          <div>
            <h2>
              Transaction ID: <br /> {responseData.transactionId}
            </h2>
            <h2>
              Status: <br /> {responseData.receipt.status.toString()}
            </h2>

            <button
              className="bg-blue-500 hover-bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mr-2"
              onClick={copyToClipboard}
            >
              Copy Transaction ID
            </button>
            <button
              className="bg-green-500 hover-bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
              onClick={downloadTransactionId}
            >
              Download Transaction ID
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MessageTopic;
