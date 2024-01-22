// TransactionModal.tsx
import { TransactionReceipt } from "@hashgraph/sdk";
import React, { FC, useState } from "react";
import Modal from "./modal";
import { toast } from "react-toastify";

interface IProps {
  showResponseModal: boolean;
  transactionData: { transactionId: any; receipt: TransactionReceipt } | null;
  message: string;
  topicId: string;
  type: string;
}

const TransactionResponse: FC<IProps> = ({
  showResponseModal,
  transactionData,
  message,
  topicId,
  type,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
      if (type === "message") {
        toast("Transaction ID downloaded!");
      } else if (type === "create") {
        toast("Topic ID downloaded!");
      }
    }
  };

  return (
    <>
      {transactionData && (
        <Modal isOpen={showResponseModal} onClose={closeModal}>
          <div className="m-3">
            <div className="m-3">
              <h2>
                <span className="text-lg mr-2">Status:</span>
                <span className="text-green-700 text-lg mr-2">
                  {transactionData.receipt.status.toString()}
                </span>
              </h2>
              <h2>
                <span className="text-indigo-900 text-lg">Transaction ID:</span>
                <br /> {transactionData.transactionId}
              </h2>
            </div>
            <div className="m-3">
              {type === "create" ? (
                <button
                  className="bg-indigo-600 hover:bg-indigo-900 text-white font-semibold py-2 px-4 rounded-lg mr-2"
                  onClick={copy}
                >
                  Copy Topic ID
                </button>
              ) : (
                <button
                  className="bg-indigo-600 hover:bg-indigo-900 text-white font-semibold py-2 px-4 rounded-lg mr-2"
                  onClick={copy}
                >
                  Copy
                </button>
              )}

              {type === "create" ? (
                <button
                  className="bg-indigo-600 hover:bg-indigo-900 text-white font-semibold py-2 px-4 rounded-lg"
                  onClick={download}
                >
                  Download Topic ID
                </button>
              ) : (
                <button
                  className="bg-indigo-600 hover:bg-indigo-900 text-white font-semibold py-2 px-4 rounded-lg"
                  onClick={download}
                >
                  Download
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TransactionResponse;
