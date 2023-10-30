import { toast } from "react-toastify";

export const checkIfTopicHasMessages = async (topicId: string) => {
  try {
    const response = await fetch(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`
    );

    if (response.ok) {
      const data = await response.json();
      // If the topic has messages, return true; otherwise, return false
      return data.messages.length > 0;
    } else {
      toast("Topic Not Found");
      return false;
    }
  } catch (error) {
    console.error("Error fetching topic data:", error);
    toast("An error occurred while fetching topic data");
    return false;
  }
};
