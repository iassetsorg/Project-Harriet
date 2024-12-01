import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Interface representing the structure of analytics data for a topic
 * @interface TopicData
 * @property {number} totalMessages - Total number of messages in the topic
 * @property {number} totalPosts - Total number of posts in the topic
 * @property {number} totalThreads - Total number of threads in the topic
 * @property {number} totalPolls - Total number of polls in the topic
 */
interface TopicData {
  totalMessages: number;
  totalPosts: number;
  totalThreads: number;
  totalPolls: number;
}

/**
 * Decodes a base64 encoded string to UTF-8
 * @param {string} base64String - The base64 encoded string to decode
 * @returns {string} The decoded UTF-8 string, or empty string if decoding fails
 */
const decodeBase64 = (base64String: string) => {
  try {
    // First decode base64 to binary string
    const binaryString = atob(base64String);
    // Convert binary string to UTF-8 string
    return decodeURIComponent(escape(binaryString));
  } catch (error) {
    console.error("Error decoding base64:", error);
    return "";
  }
};

/**
 * Custom React hook to fetch and manage analytics data for a specific topic
 * @param {string} topicId - The unique identifier of the topic to fetch data for
 * @returns {Object} An object containing:
 *   - topicData: The fetched topic data or null if not yet loaded
 *   - loading: Boolean indicating if data is currently being fetched
 *   - error: Error message string or null if no error
 */
const useGetAnalyticsData = (topicId: string) => {
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Asynchronously fetches topic data from the Hedera Mirror Node
     * Makes a GET request to retrieve the latest message for the topic
     * Decodes the base64 message and updates the state accordingly
     */
    const fetchTopicData = async () => {
      if (!topicId) {
        setError("Topic ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://mainnet-public.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?order=desc&limit=1`
        );

        if (
          response.data &&
          response.data.messages &&
          response.data.messages.length > 0
        ) {
          const messageData = response.data.messages[0];
          const decodedMessage = JSON.parse(decodeBase64(messageData.message));
          setTopicData(decodedMessage);
        } else {
          setError("No data found");
        }
      } catch (err: any) {
        console.error("Analytics fetch error:", err);
        setError(
          err.message || "An error occurred while fetching the topic data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTopicData();
  }, [topicId]);

  return { topicData, loading, error };
};

export default useGetAnalyticsData;
