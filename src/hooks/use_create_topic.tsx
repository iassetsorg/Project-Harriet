/**
 * Custom hook for creating Hedera topics with various configurations
 * @module useCreateTopic
 */

import { useState, useCallback } from "react";
import { TopicCreateTransaction, PublicKey, Signer } from "@hashgraph/sdk";
import { toast } from "react-toastify";
import {
  useWallet,
  useAccountId,
  useWatchTransactionReceipt,
} from "@buidlerlabs/hashgraph-react-wallets";

/**
 * Custom hook that manages the creation of Hedera Consensus Service (HCS) topics
 * @returns {Object} Object containing the create function and creation response
 * @property {Function} create - Function to create a new topic
 * @property {Object|null} createTopicResponse - Response data from the topic creation
 */
const useCreateTopic = () => {
  const wallet = useWallet();
  // @ts-ignore
  const signer = wallet.signer as Signer;
  const { data: accountId } = useAccountId();
  const { watch } = useWatchTransactionReceipt();

  /**
   * State to track any errors during topic creation
   * @type {[string | null, Function]}
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * State to store the response data from topic creation
   * @type {[Object | null, Function]}
   */
  const [createTopicResponse, setCreateTopicResponse] = useState<null | {
    transactionId: any;
    receipt: any;
  }>(null);

  /**
   * Creates a new Hedera topic with specified configurations
   * @param {string} topicMemo - Memo to be associated with the topic
   * @param {string} memo - Transaction memo
   * @param {boolean} [submitKey=false] - Whether to set a submit key for the topic
   * @returns {Promise<string|undefined>} The created topic ID if successful
   *
   * @throws Will display a toast notification if an error occurs
   */
  const create = useCallback(
    async (topicMemo: string, memo: string, submitKey: boolean = false) => {
      if (!accountId) {
        toast("Connect your wallet");
        return;
      }

      try {
        // Fetch account information from Hedera Mirror Node
        let accountInfo: any = await fetch(
          `https://mainnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
        );
        console.log("accountInfo:", accountInfo);
        accountInfo = await accountInfo.json();
        let key = PublicKey.fromString(accountInfo.key.key);

        // Initialize topic creation transaction with basic configuration
        let transaction = new TopicCreateTransaction()
          .setAdminKey(key)
          .setAutoRenewAccountId(accountId);

        // Add optional transaction memo if provided
        if (memo && memo.trim() !== "") {
          transaction.setTransactionMemo(memo);
        }

        // Add optional topic memo if provided
        if (topicMemo && topicMemo.trim() !== "") {
          transaction.setTransactionMemo(topicMemo);
        }

        // Set submit key if requested
        if (submitKey) {
          transaction.setSubmitKey(key);
        }

        // Execute the transaction
        const signTx = await transaction.freezeWithSigner(signer);
        const txResponse = await signTx.executeWithSigner(signer);

        // Watch for transaction completion
        const tx = await watch(txResponse.transactionId.toString(), {
          onSuccess: (transaction) => transaction,
          onError: (error) => error,
        });

        // Handle transaction result
        if (tx.result.toString() === "SUCCESS") {
          const responseData = {
            transactionId: txResponse.transactionId.toString(),
            receipt: tx,
          };

          const topicId = tx.entity_id.toString();
          setCreateTopicResponse(responseData);

          return topicId;
        } else {
          toast.error(`Transaction failed: ${tx.result.toString()}`);
        }
      } catch (error: any) {
        toast.error(`Error: ${error.message || "An unknown error occurred."}`);
      }
    },
    [signer, watch, accountId]
  );

  return { create, createTopicResponse };
};

export default useCreateTopic;
