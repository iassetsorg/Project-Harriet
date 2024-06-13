import { useState } from "react";
import { toast } from "react-toastify";

// Defining the structure of the Message interface
interface Message {
  filter(arg0: (m: any) => boolean): unknown;
  Choice: string;
  Media: string;
  Identifier: string;
  message_id: any;
  sender: string;
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
  Choice1?: string;
  Choice2?: string;
  Choice3?: string;
  Choice4?: string;
  Choice5?: string;
}

// Function to decode a base64 string
const decodeBase64 = (base64String: string) => atob(base64String);

// Custom React hook for fetching messages based on a topic ID or a link
const useGetData = (
  initialTopicId = "",
  initialNextLink: string | null = null,
  isNew = false
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [nextLink, setNextLink] = useState<string | null>(initialNextLink);

  const fetchMessages = async (topicIdOrLink: string | null) => {
    setMessages([]);
    setNextLink(null);
    setLoading(true);

    let apiUrl =
      topicIdOrLink && /^\/api\//.test(topicIdOrLink)
        ? `https://mainnet-public.mirrornode.hedera.com${topicIdOrLink}`
        : `https://mainnet-public.mirrornode.hedera.com/api/v1/topics/${
            topicIdOrLink || initialTopicId
          }/messages${isNew ? "?order=desc" : ""}`;

    console.log("Fetching from URL:", apiUrl);

    try {
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();

        const responseData = data.messages
          .map((message: any) => {
            const decodedMessage = new TextDecoder("utf-8").decode(
              Uint8Array.from(atob(message.message), (c) => c.charCodeAt(0))
            );

            try {
              const {
                Message,
                Media,
                Identifier,
                Author,
                Like_to,
                DisLike_to,
                Reply_to,
                Thread,
                Status,
                Type,
                Name,
                Bio,
                Website,
                Location,
                UserMessages,
                Followings,
                Picture,
                Banner,
                Post,
                Poll,
                Choice,
                Choice1,
                Choice2,
                Choice3,
                Choice4,
                Choice5,
              } = JSON.parse(decodedMessage);

              return {
                message_id: message.consensus_timestamp,
                sender: message.payer_account_id,
                Message,
                Media,
                Identifier,
                Author,
                Like_to,
                DisLike_to,
                Reply_to,
                Thread,
                Status,
                Type,
                Name,
                Bio,
                Website,
                Location,
                UserMessages,
                Followings,
                Picture,
                Banner,
                Post,
                Poll,
                Choice,
                Choice1,
                Choice2,
                Choice3,
                Choice4,
                Choice5,
                sequence_number: message.sequence_number,
                message: decodedMessage,
              };
            } catch (error) {
              console.warn("Invalid message format:", decodedMessage);
              return null;
            }
          })
          .filter((message: any): message is Message => message !== null);

        setMessages(responseData);
        setNextLink(data.links?.next || null);
      } else if (response.status === 404) {
        toast.error("Topic Not Found");
        setMessages([]);
        setNextLink(null);
      } else {
        toast.error(`Error fetching messages: ${response.statusText}`);
        console.error("Error fetching messages:", response.statusText);
      }
    } catch (error: any) {
      toast.error(
        `Network Error: ${error.message || "Failed to fetch messages"}`
      );
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    nextLink,
    fetchMessages,
  };
};

export default useGetData;
