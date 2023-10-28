import { useState } from "react";
import { useSigningContext } from "../hashconnect/sign";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import {
  TopicCreateTransaction,
  TransactionReceipt,
  PublicKey,
} from "@hashgraph/sdk";
import { toast } from "react-toastify";
import Modal from "./modal";

// Component for Creating a Topic
const CreateTopic = () => {
  // Use state to manage component-specific variables
  const { makeBytes } = useSigningContext();
  const { sendTransaction, pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const [topicMemo, setTopicMemo] = useState("");
  const [memo, setMemo] = useState("");
  const [submitKey, setSubmitKey] = useState(false);
  const [responseData, setResponseData] = useState<null | {
    transactionId: any;
    receipt: TransactionReceipt;
  }>(null);
  const [showModal, setShowModal] = useState(false);

  // Function for creating a topic
  const create = async () => {
    if (!signingAccount) {
      // Display a message if the user needs to connect their wallet
      toast("Connect your wallet");
      return;
    }

    // Fetch account information
    let accountInfo: any = await fetch(
      `https://mainnet.mirrornode.hedera.com/api/v1/accounts/${signingAccount}`
    );
    accountInfo = await accountInfo.json();
    let key = PublicKey.fromString(accountInfo.key.key);

    // Create a TopicCreateTransaction
    let transaction = new TopicCreateTransaction()
      .setTopicMemo(topicMemo)
      .setTransactionMemo(memo)
      .setAdminKey(key)
      .setAutoRenewAccountId(signingAccount);
    if (submitKey) {
      transaction.setSubmitKey(key);
    }
    const transactionBytes = await makeBytes(transaction, signingAccount);

    // Send the transaction and handle the response
    const response = await sendTransaction(
      transactionBytes,
      signingAccount,
      false
    );
    const receiptBytes = response.receipt as Uint8Array;

    if (response.success) {
      // If the transaction was successful, display a modal with transaction information
      const responseData = {
        transactionId: response.response.transactionId,
        receipt: TransactionReceipt.fromBytes(receiptBytes),
      };
      setResponseData(responseData);
      setShowModal(true);
      toast(responseData.receipt.status.toString());
    } else {
      // If the transaction failed, display an error message
      toast.error(`${response.error}`);
    }
  };

  // Function to download the transaction ID
  function downloadTransactionId(): void {
    if (responseData && responseData.transactionId) {
      // Create a data URI to download the transaction ID as a text file
      const dataUri = `data:text/plain;charset=utf-8,Topic Name: ${topicMemo}\nTopic Id: ${responseData.receipt.topicId}\nTransaction Id: ${responseData.transactionId}\n`;
      const downloadLink = document.createElement("a");
      downloadLink.href = dataUri;
      downloadLink.download = `${topicMemo}.txt`;
      downloadLink.click();
      toast("Topic ID downloaded!");
    }
  }

  // Function to copy text to clipboard
  function copyToClipboard(text: any): void {
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    toast("Copied to clipboard!");
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-blue-300 rounded-lg shadow-xl p-6">
        <div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-t-lg p-4 sm:p-6 text-center">
          <h3 className="text-3xl font-semibold text-blue-800">
            Create a Thread
          </h3>
        </div>

        <section className="py-4 px-8">
          <label
            htmlFor="topicName"
            className="block text-sm font-semibold text-gray-700"
          >
            Thread Name:
          </label>
          <div className="mt-2">
            <input
              className="w-full px-4 py-2 rounded-lg border-2 border-blue-400 focus:ring-4 focus:ring-blue-300 text-base bg-white backdrop-blur-md"
              type="text"
              name="topicName"
              id="topicName"
              value={topicMemo}
              onChange={(event) => setTopicMemo(event.target.value)}
            />
          </div>
        </section>

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

        <div className="py-4 px-8">
          <label className="flex items-center text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={submitKey}
              onChange={() => setSubmitKey(!submitKey)}
              className="h-6 w-6 text-blue-400 border-2 border-blue-400 focus:ring-4 focus:ring-blue-300"
            />
            <span className="ml-3">Only Writer</span>
          </label>
        </div>

        <button
          onClick={() => create()}
          className="w-full bg-blue-500 hover-bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg focus-ring-4 focus-ring-blue-400 focus-ring-opacity-50"
        >
          Create
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
              onClick={() =>
                copyToClipboard(String(responseData.receipt.topicId))
              }
            >
              Copy Topic ID
            </button>
            <button
              className="bg-green-500 hover-bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
              onClick={downloadTransactionId}
            >
              Download Topic ID
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CreateTopic;