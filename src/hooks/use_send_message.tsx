/**
 * useSendMessage custom hook to send a message to a Hedera topic.
 *
 * Returns an object with a send() function and a sendMessageResponse state.
 */
/**
 * Custom hook to send a message to a Hedera topic.
 *
 * Returns an object with a send() function and a sendMessageResponse state.
 *
 * The send() function takes a topicId, message object, and optional memo string.
 * It constructs a TopicMessageSubmitTransaction, signs it, sends it via the HashConnect context,
 * and handles the response.
 *
 * The sendMessageResponse state contains the transaction ID and receipt on success,
 * or an error message on failure.
 */
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

  // Define send function
  const send = useCallback(
    async (topicId: string, message: {}, memo: string) => {
      const signingAccount = pairingData?.accountIds[0] || "";
      const transaction = new TopicMessageSubmitTransaction()
        .setMessage(JSON.stringify(message))
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

        return responseData;
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

  return { send };
};

export default useSendMessage;
