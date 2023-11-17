// hooks/useSendMessage.tsx
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  TopicMessageSubmitTransaction,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { useSigningContext } from "../hashconnect/sign";
import { useHashConnectContext } from "../hashconnect/hashconnect";

const useSendMessage = () => {
  // Get the state and functions from context hooks
  const { makeBytes } = useSigningContext();
  const { sendTransaction, pairingData } = useHashConnectContext();

  // Define state for response data
  const [response, setResponse] = useState<null | {
    transactionId: any;
    receipt: TransactionReceipt;
  }>(null);

  // Define send function
  const send = useCallback(
    async (topicId: string, message: {}, memo: string, type: string) => {
      const signingAccount = pairingData?.accountIds[0] || "";

      if (!signingAccount) {
        toast("Connect your wallet");
        return;
      }

      if (!topicId) {
        toast("Please enter a Thread ID");
        return;
      }

      let messageObject;

      if (type === "explore") {
        // If type is explore
        messageObject = {
          Thread: message, // Set your desired explore message
        };
      } else {
        messageObject = message;
      }

      const transaction = new TopicMessageSubmitTransaction()
        .setMessage(JSON.stringify(messageObject))
        .setTopicId(topicId);

      if (memo && memo.trim() !== "") {
        transaction.setTransactionMemo(memo);
      }

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

        setResponse(responseData);
        toast(responseData.receipt.status.toString());
      } else {
        if (response.error) {
          toast.error(`${JSON.stringify(response.error)}`);
        } else {
          toast.error(`${JSON.stringify(response.error.status)}`);
        }
      }
    },
    [makeBytes, sendTransaction, pairingData]
  );

  return { send, response };
};

export default useSendMessage;
