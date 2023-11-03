// TransactionModal.tsx
import { TransactionReceipt } from "@hashgraph/sdk";
import React, { FC } from "react";
import Modal from "./modal";
import { toast } from "react-toastify";

interface IProps {
  setShow: (showModal: boolean) => void;
  transactionData: { transactionId: any; receipt: TransactionReceipt } | null;
  message: string;
  topicId: string;
  type: string;
}

const TransactionResponse: FC<IProps> = ({
  setShow,
  transactionData,
  message,
  topicId,
  type,
}) => {
  // Function to copy the transaction ID to the clipboard
  const copy = () => {
    if (transactionData) {
      let text = "";
      if (type === "create") text = topicId;
      else if (type === "message") text = transactionData.transactionId;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          if (type === "create") toast("Topic ID copied to clipboard");
          else if (type === "message")
            toast("TransactionId copied to clipboard");
        })
        .catch((error) => {
          console.error("Copy to clipboard failed:", error);
        });
    }
  };

  // Function to download the transaction ID as a text file
  const download = () => {
    if (transactionData) {
      const transactionId = transactionData.transactionId;
      const receiptStatus = transactionData.receipt.status;
      let content = "";
      const fileName =
        message.length > 10 ? message.substring(0, 10) + "..." : message;

      if (type === "message") {
        content = `Transaction ID: ${transactionId}\nMessage: ${message}\nStatus: ${receiptStatus}\nTopic Id: ${topicId}`;
      } else if (type === "create") {
        content = `Topic Id: ${topicId}\nTransaction Id: ${transactionId}\n`;
      }

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Transaction ID downloaded!");
    }
  };

  return (
    <>
      {transactionData && (
        <Modal setShow={setShow}>
          <div>
            <div className="my-3">
              <h2>
                <span className="text-sky-900 text-lg">Status:</span>
                <br /> {transactionData.receipt.status.toString()}
              </h2>
              <h2>
                <span className="text-sky-900 text-lg">Transaction ID:</span>
                <br /> {transactionData.transactionId}
              </h2>
            </div>
            <div className="my-3">
              <button
                className="bg-sky-600 hover:bg-sky-900 text-white font-semibold py-2 px-4 rounded-lg mr-2"
                onClick={copy}
              >
                Copy
              </button>
              <button
                className="bg-sky-600 hover:bg-sky-900 text-white font-semibold py-2 px-4 rounded-lg"
                onClick={download}
              >
                Download
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TransactionResponse;
