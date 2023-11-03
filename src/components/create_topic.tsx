import { useState } from "react";
import { useSigningContext } from "../hashconnect/sign";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import {
  TopicCreateTransaction,
  TransactionReceipt,
  PublicKey,
} from "@hashgraph/sdk";
import { toast } from "react-toastify";
import TransactionResponse from "../utils/transaction_response";
import useSendMessage from "./use_send_message";
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
  const { send, response } = useSendMessage();
  // Function for creating a topic
  const create = async () => {
    if (!signingAccount) {
      // Display a message if the user needs to connect their wallet
      toast("Connect your wallet");
      return;
    }
    toast("Creating Thread");
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
      if (!showModal) {
        toast("Initiating Thread");
        const messageObject = {
          Identifier: "iAssets",
          Type: "Thread",
          Author: signingAccount,
          Status: "Public",
        };
        await send(
          responseData.receipt.topicId?.toString() || "",
          messageObject,
          ""
        );
      }
    } else {
      // If the transaction failed, display an error message
      toast.error(`${JSON.stringify(response.error)}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-200 rounded-lg shadow-xl p-6">
      <h3 className="text-2xl py-4 px-8 font-semibold text-sky-900">
        Create a Thread
      </h3>

      <section className="py-4 px-8">
        <label
          htmlFor="topicName"
          className="block text-sm font-semibold text-gray-700"
        >
          Thread Name:
        </label>
        <div className="mt-2">
          <input
            className="w-full px-4 py-2 rounded-lg border-2 border-sky-400 focus:ring-4 focus:ring-sky-300 text-base bg-white backdrop-blur-md"
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
            className="w-full px-4 py-2 rounded-lg border-2 border-sky-400 focus:ring-4 focus:ring-sky-300 text-base bg-white backdrop-blur-md"
            type="text"
            name="transactionMemo"
            id="transactionMemo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
          />
        </div>
      </section>

      {/* to set the submit key and make a topic private to only the creator can write message on it  */}
      {/* <div className="py-4 px-8">
          <label className="flex items-center text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={submitKey}
              onChange={() => setSubmitKey(!submitKey)}
              className="h-6 w-6 text-sky-400 border-2 border-sky-400 focus:ring-4 focus:ring-sky-300"
            />
            <span className="ml-3">Only Writer</span>
          </label>
        </div> */}

      <button
        onClick={() => create()}
        className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-3 px-6 rounded-lg focus-ring-4 focus-ring-sky-400 focus-ring-opacity-50"
      >
        Create
      </button>

      {showModal && responseData && (
        <TransactionResponse
          setShow={setShowModal}
          transactionData={responseData}
          type={"create"}
          message={topicMemo}
          topicId={responseData.receipt.topicId?.toString() || ""}
        />
      )}
    </div>
  );
};

export default CreateTopic;
