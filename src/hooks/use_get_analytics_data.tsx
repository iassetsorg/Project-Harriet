import { useState, useEffect } from "react";
import axios from "axios";

// Define the structure of the TopicData interface
interface TopicData {
  totalMessages: number;
  totalPosts: number;
  totalThreads: number;
  totalPolls: number;
}

// Function to decode base64 string
const decodeBase64 = (base64String: string) =>
  Buffer.from(base64String, "base64").toString("utf-8");

// Custom hook to fetch the topic data
const useGetAnalyticsData = (topicId: string) => {
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopicData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://mainnet-public.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?order=desc&limit=1`
        );
        if (response.data && response.data.messages) {
          const messageData = response.data.messages[0];
          const decodedMessage = JSON.parse(decodeBase64(messageData.message));
          setTopicData(decodedMessage);
        } else {
          setError("No data found");
        }
      } catch (err: any) {
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
