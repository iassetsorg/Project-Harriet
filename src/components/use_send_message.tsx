// hooks/useSendMessage.tsx
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  TopicMessageSubmitTransaction,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { useSigningContext } from "../hashconnect/sign";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import { checkIfTopicHasMessages } from "../utils/check_if_topic_has_messages";

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
    async (topicId: string, message: {}, memo: string) => {
      const signingAccount = pairingData?.accountIds[0] || "";

      if (!signingAccount) {
        toast("Connect your wallet");
        return;
      }

      if (!topicId) {
        toast("Please enter a Thread ID");
        return;
      }

      const hasMessages = await checkIfTopicHasMessages(topicId);
      let messageObject;

      if (!hasMessages) {
        messageObject = {
          Identifier: "iAssets",
          Type: "Thread",
          Author: signingAccount,
          Status: "Public",
        };
      } else {
        messageObject = message;
      }

      const transaction = new TopicMessageSubmitTransaction()
        .setMessage(JSON.stringify(messageObject))
        .setTopicId(topicId)
        .setTransactionMemo(memo);

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
        toast.error(`${JSON.stringify(response.error)}`);
      }
    },
    [makeBytes, sendTransaction, pairingData]
  );

  return { send, response };
};

export default useSendMessage;
