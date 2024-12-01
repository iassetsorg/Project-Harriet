/**
 * Custom hook for sending messages to Hedera topics using HashConnect.
 *
 * @module useSendMessage
 * @returns {Object} An object containing the send function
 * @property {Function} send - Function to submit messages to a Hedera topic
 */

import { useCallback } from "react";
import { TopicMessageSubmitTransaction, Signer } from "@hashgraph/sdk";
import { toast } from "react-toastify";

import {
  useWallet,
  useWatchTransactionReceipt,
} from "@buidlerlabs/hashgraph-react-wallets";

/**
 * Hook that provides functionality to send messages to Hedera topics.
 * Handles wallet connection, transaction signing, and execution.
 */
const useSendMessage = () => {
  // Get wallet instance and signer from HashConnect context
  const wallet = useWallet();
  // @ts-ignore
  const signer = wallet.signer as Signer;
  const { watch } = useWatchTransactionReceipt();

  /**
   * Sends a message to a specified Hedera topic.
   *
   * @param {string} topicId - The ID of the Hedera topic to send the message to
   * @param {any} message - The message object to be sent (will be stringified)
   * @param {string} [memo] - Optional transaction memo
   * @returns {Promise<{transactionId: string, receipt: any} | undefined>} Transaction details on success
   *
   * @throws Will show a toast error if:
   * - Wallet is not connected
   * - Transaction fails
   * - Any other error occurs during execution
   */
  const send = useCallback(
    async (
      topicId: string,
      message: any,
      memo?: string
    ): Promise<{ transactionId: string; receipt: any } | undefined> => {
      // Verify wallet connection
      if (!signer) {
        toast.error("Please connect your wallet.");
        return;
      }

      // Create and configure the transaction
      const transaction = new TopicMessageSubmitTransaction()
        .setMessage(JSON.stringify(message))
        .setTopicId(topicId);

      // Add memo if provided and not empty
      if (memo && memo.trim() !== "") {
        transaction.setTransactionMemo(memo);
      }

      try {
        // Freeze and sign the transaction
        const signTx = await transaction.freezeWithSigner(signer);
        // Execute the signed transaction
        const txResponse = await signTx.executeWithSigner(signer);

        // Watch for transaction completion
        const tx = await watch(txResponse.transactionId.toString(), {
          onSuccess: (transaction) => transaction,
          onError: (error) => error,
        });

        // Handle transaction result
        if (tx.result.toString() === "SUCCESS") {
          return {
            transactionId: txResponse.transactionId.toString(),
            receipt: tx,
          };
        } else {
          toast.error(`Transaction failed: ${tx.result.toString()}`);
        }
      } catch (error: any) {
        toast.error(`Error: ${error.message || "An unknown error occurred."}`);
      }
    },
    [signer, watch]
  );

  return { send };
};

export default useSendMessage;
