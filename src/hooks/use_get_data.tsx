import { useState } from "react";
import { toast } from "react-toastify";

// Defining the structure of the Message interface
interface Message {
  Identifier: string;
  message_id: any;
  Message: string;
  message: string;
  sequence_number: number;
  Author: string;
  Reply_to?: string;
  Like_to?: string;
  DisLike_to?: string;
  Thread?: string;
  Status?: string;
  Type?: string;
}

// Function to decode a base64 string
const decodeBase64 = (base64String: string) => atob(base64String);

// Custom React hook for fetching messages based on a topic ID or a link
const useGetData = (
  initialTopicId = "",
  initialNextLink: string | null = null
) => {
  // State variables to store messages, loading state, and the next link for pagination
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [nextLink, setNextLink] = useState<string | null>(initialNextLink);

  // Function to fetch messages from the API
  const fetchMessages = async (topicIdOrLink: string | null) => {
    // setMessages([]);
    setNextLink(null);

    // Setting loading state to true to indicate that a fetch operation is in progress
    setLoading(true);

    // Constructing the API URL based on the provided topic ID or link
    let apiUrl =
      topicIdOrLink && /^\/api\//.test(topicIdOrLink)
        ? `https://mainnet-public.mirrornode.hedera.com${topicIdOrLink}`
        : `https://mainnet-public.mirrornode.hedera.com/api/v1/topics/${
            topicIdOrLink || initialTopicId
          }/messages`;

    try {
      // Fetching data from the API
      const response = await fetch(apiUrl);

      // Checking if the response is successful (status code 200)
      if (response.ok) {
        // Parsing the response JSON
        let data = await response.json();

        // Mapping the raw message data to a more structured format
        const responseData = data.messages.map((message: any) => {
          const decodedMessage = decodeBase64(message.message);
          const {
            Message,
            Identifier,
            Author,
            Like_to,
            DisLike_to,
            Reply_to,
            Thread,
            Status,
            Type,
          } = JSON.parse(decodedMessage);

          return {
            message_id: message.consensus_timestamp,
            Message,
            Identifier,
            Author,
            Like_to,
            DisLike_to,
            Reply_to,
            Thread,
            Status,
            Type,
            sequence_number: message.sequence_number,
            message: decodedMessage,
          };
        });

        // Updating state with the new messages and next link for pagination
        setMessages((prev) => [...responseData]);
        // Holds previous messages:
        // setMessages((prev) => [...prev, ...responseData]);
        setNextLink(data.links?.next || null);
      } else if (response.status === 404) {
        // Handling the case where the requested topic is not found
        toast.error("Topic Not Found");
        setMessages([]);
        setNextLink(null);
      } else {
        // Handling other errors and displaying an error toast
        toast.error("Error fetching messages");
        console.error("Error fetching messages:", response.statusText);
      }
    } catch (error) {
      // Handling network errors and displaying an error toast
      toast.error("Network Error: Failed to fetch messages");
      console.error("Error fetching messages:", error);
    } finally {
      // Setting loading state to false after the fetch operation is complete
      setLoading(false);
    }
  };

  // Returning the state variables and the fetchMessages function for external use
  return {
    messages,
    loading,
    nextLink,
    fetchMessages,
  };
};

// Exporting the custom hook for use in other components
export default useGetData;
