import { useState, useCallback } from "react";
import { useSigningContext } from "../hashconnect/sign";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import {
  TopicCreateTransaction,
  TransactionReceipt,
  PublicKey,
} from "@hashgraph/sdk";
import { toast } from "react-toastify";

// Component for Creating a Topic
const useCreateTopic = () => {
  // Use state to manage component-specific variables
  const { makeBytes } = useSigningContext();
  const { sendTransaction, pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";

  // Define state for response data
  const [createTopicResponse, setCreateTopicResponse] = useState<null | {
    transactionId: any;
    receipt: TransactionReceipt;
  }>(null);

  // Function for creating a topic
  const create = useCallback(
    async (topicMemo: string, memo: string, submitKey: boolean = false) => {
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
        .setAdminKey(key)
        .setAutoRenewAccountId(signingAccount);

      if (memo && memo.trim() !== "") {
        transaction.setTransactionMemo(memo);
      }

      if (topicMemo && topicMemo.trim() !== "") {
        transaction.setTransactionMemo(topicMemo);
      }
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
        const topicId = responseData.receipt.topicId?.toString() || "";
        setCreateTopicResponse(responseData);

        toast(responseData.receipt.status.toString());

        return topicId;
      } else {
        // If the transaction failed, display an error message
        toast.error(`${JSON.stringify(response.error)}`);
      }
    },
    [makeBytes, sendTransaction, pairingData]
  );

  return { create, createTopicResponse };
};

export default useCreateTopic;
