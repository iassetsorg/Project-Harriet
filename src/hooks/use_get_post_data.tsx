import { useState, useEffect } from "react";
import { toast } from "react-toastify";

/**
 * Interface representing the structure of a post's data
 * @interface PostData
 * @property {string} sender - The account ID of the message sender
 * @property {string} Message - The main content of the post
 * @property {string} [Media] - Optional URL to attached media
 * @property {string} [Identifier] - Optional unique identifier
 * @property {string} [Author] - Optional author of the post
 * @property {string} [Like_to] - Optional account ID of users who liked the post
 * @property {string} [DisLike_to] - Optional account ID of users who disliked the post
 * @property {string} [Reply_to] - Optional account ID of users who replied to the post
 * @property {string} [Thread] - Optional thread ID of the post
 * @property {string} [Status] - Optional status of the post
 * @property {string} [Type] - Optional type of the post
 * @property {string} [Name] - Optional name of the post author
 * @property {string} [Bio] - Optional bio of the post author
 * @property {string} [Website] - Optional website of the post author
 * @property {string} [Location] - Optional location of the post author
 * @property {string} [UserMessages] - Optional user messages related to the post
 * @property {string} [Followings] - Optional followings related to the post
 * @property {string} [Picture] - Optional picture URL of the post author
 * @property {string} [Banner] - Optional banner URL of the post author
 * @property {string} [Post] - Optional post URL of the post author
 * @property {string} [Poll] - Optional poll URL of the post author
 * @property {string} [Choice] - Optional choice URL of the post author
 * @property {string} [Choice1] - Optional choice URL of the post author
 * @property {string} [Choice2] - Optional choice URL of the post author
 * @property {string} [Choice3] - Optional choice URL of the post author
 * @property {string} [Choice4] - Optional choice URL of the post author
 * @property {string} [Choice5] - Optional choice URL of the post author
 * @property {string} [message_id] - Hedera network consensus timestamp
 * @property {string} [sequence_number] - Hedera network sequence number
 * @property {string} [consensus_timestamp] - Hedera network consensus timestamp
 */
interface PostData {
  sender: string;
  Message: string;
  Media?: string;
  Identifier?: string;
  Author?: string;
  Like_to?: string;
  DisLike_to?: string;
  Reply_to?: string;
  Thread?: string;
  Status?: string;
  Type?: string;
  Name?: string;
  Bio?: string;
  Website?: string;
  Location?: string;
  UserMessages?: string;
  Followings?: string;
  Picture?: string;
  Banner?: string;
  Post?: string;
  Poll?: string;
  Choice?: string;
  Choice1?: string;
  Choice2?: string;
  Choice3?: string;
  Choice4?: string;
  Choice5?: string;
  message_id?: string;
  sequence_number?: string;
  consensus_timestamp?: string;
}

/**
 * Custom hook to fetch and decode post data from Hedera's Mirror Node
 * @param {string | undefined} sequenceNumber - The sequence number of the post to fetch
 * @returns {Object} An object containing:
 *   - postData: The fetched and decoded post data
 *   - loading: Boolean indicating if the fetch is in progress
 *   - error: Error message if the fetch failed
 */
const useGetPostData = (sequenceNumber: string | undefined) => {
  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetches post data from Hedera Mirror Node and decodes the message
     * @async
     * @function fetchData
     * @throws {Error} When the API request fails or data parsing fails
     */
    const fetchData = async () => {
      if (!sequenceNumber) {
        setError("Sequence number is undefined");
        return;
      }

      setLoading(true);
      try {
        /**
         * Fetch data from Hedera Mirror Node API
         * @async
         * @function fetchData
         * @throws {Error} When the API request fails or data parsing fails
         */
        const response = await fetch(
          `https://mainnet.mirrornode.hedera.com/api/v1/topics/${process.env.REACT_APP_EXPLORER_TOPIC}/messages/${sequenceNumber}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        /**
         * Decode the base64 message and parse the JSON content
         * The message is expected to contain a Message and optional Media field
         */
        const decodedMessage = new TextDecoder("utf-8").decode(
          Uint8Array.from(atob(data.message), (c) => c.charCodeAt(0))
        );
        const { Message, Media } = JSON.parse(decodedMessage);

        /**
         * Extract relevant fields and create a cleaned version of the post data
         * @type {PostData}
         */
        const cleanedData = {
          sender: data.payer_account_id,
          Message,
          Media,
          message_id: data.consensus_timestamp,
          sequence_number: data.sequence_number,
          consensus_timestamp: data.consensus_timestamp,
        };
        setPostData(cleanedData);
      } catch (error: any) {
        setError("Failed to fetch post data");
        toast.error(`Failed to fetch the post data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sequenceNumber]);

  return { postData, loading, error };
};

export default useGetPostData;
