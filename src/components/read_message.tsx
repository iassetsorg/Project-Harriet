import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Define an interface for the expected message structure
interface Message {
  sequence_number: number;
  message: string;
  // Add any other properties as needed
}

function ReadMessages() {
  const [topicId, setTopicId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextLink, setNextLink] = useState<string | null>(null);

  useEffect(() => {
    if (nextLink) {
      loadMoreMessages();
    }
  }, [nextLink]);

  const loadMoreMessages = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `https://mainnet-public.mirrornode.hedera.com${nextLink}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, ...data.messages]);
        setNextLink(data.links?.next || null);
      } else {
        console.error("Error fetching messages:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Define a regular expression to match the expected topic ID format
    const topicIdPattern = /^\d+\.\d+\.\d+$/;

    if (!topicIdPattern.test(topicId)) {
      // Invalid topic ID format, show an error toast
      toast.error("Topic Not Found");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://mainnet-public.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setNextLink(data.links?.next || null);
      } else if (response.status === 404) {
        // Topic not found, show an error toast
        toast.error("Topic not found");
      } else {
        console.error("Error fetching messages:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const decodeBase64 = (base64String: string) => {
    const decoded = atob(base64String);
    return decoded;
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-semibold text-blue-800 text-center">
        Read Messages
      </h1>
      <form onSubmit={fetchMessages} className="mt-4">
        <div className="bg-blue-300 rounded-lg shadow-xl p-6">
          <label
            htmlFor="topicName"
            className="block text-sm font-semibold text-gray-700"
          >
            Thread Id:
          </label>
          <div className="mt-2">
            <input
              className="w-full px-4 py-2 rounded-lg border-2 border-blue-400 focus:ring-4 focus:ring-blue-300 text-base bg-white backdrop-blur-md"
              type="text"
              name="topicName"
              id="topicName"
              value={topicId}
              onChange={(event) => setTopicId(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover-bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50 mt-4"
          >
            Get Messages
          </button>
        </div>
      </form>

      {loading && <div className="text-center mt-4">Loading...</div>}

      {!loading && (
        <div className="mt-4">
          {messages.map((message, index) => {
            try {
              const decodedMessage = decodeBase64(message.message);
              const parsedMessage = JSON.parse(decodedMessage);
              return (
                <div
                  key={index}
                  className={`p-4 mt-2 ${
                    index % 2 === 0 ? "bg-blue-300" : "bg-blue-400"
                  } rounded-md shadow-md`}
                >
                  <p className="text-white">{message.sequence_number}</p>

                  {/* Check if parsed message contains an "Identifier" key */}
                  {parsedMessage.Identifier && (
                    <p className="text-white">{`${parsedMessage.Identifier}, ${parsedMessage.Type}, ${parsedMessage.Author}, ${parsedMessage.Status}`}</p>
                  )}

                  {/* Check if parsed message contains a "Message" key */}
                  {parsedMessage.Message && (
                    <p className="text-white">{parsedMessage.Message}</p>
                  )}
                </div>
              );
            } catch (error) {
              toast(`Error parsing message: ${decodeBase64(message.message)}`);
            }
          })}
        </div>
      )}
    </div>
  );
}

export default ReadMessages;
