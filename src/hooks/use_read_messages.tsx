/**
 * useReadMessages is a React custom hook that processes raw message data
 * fetched from an API into a more usable format.
 *
 * It takes in an initial topic ID and boolean isNew to control fetching behavior.
 *
 * Returns an object with processed message info mapped by ID, loading state,
 * a fetchMessages function, and next link for pagination.
 *
 * Internally it calls useGetData to fetch the raw messages. It processes the messages
 * into MessageDetails objects containing useful metadata like comments, likes, etc.
 *
 * The processed MessageDetails are stored in state and updated when raw messages change.
 */
import { useState, useEffect, useCallback } from "react";
import useGetData from "./use_get_data";

// Define an interface for MessageInfo object
export interface MessageDetails {
  media: string;
  author: string;
  sequence_number: number;
  message: string;
  likes: number;
  dislikes: number;
  comments: number;
  commentsDetails: CommentInfo[];
}

interface CommentInfo {
  author: string;
  message: string;
}

// Define an interface for data returned by our custom hook
interface MessageInfo {
  [message_id: string]: MessageDetails;
}

const useReadMessages = (initialTopicId = "", isNew = false) => {
  // Destructure values from the custom hook useGetMessages
  const { messages, loading, fetchMessages, nextLink } = useGetData(
    initialTopicId,
    null,
    isNew
  );

  // State to store processed message information
  const [messagesInfo, setMessagesInfo] = useState<MessageInfo>({});

  // Function to process raw messages and update state
  const processMessages = useCallback(() => {
    // Create a new object to store processed message information
    const newMessagesInfo: MessageInfo = {};

    // Iterate through each message
    messages.forEach((message) => {
      // Skip messages with 'Reply_to', 'Like_to', 'DisLike_to', 'Identifier'
      if (
        message.Reply_to ||
        message.Like_to ||
        message.DisLike_to ||
        message.Identifier
      )
        return;

      // Prepare the 'MessageDetails' data structure
      let messageDetails: MessageDetails = {
        author: message.Author,
        sequence_number: message.sequence_number,
        message: message.Message,
        media: message.Media,
        likes: 0,
        dislikes: 0,
        comments: 0,
        commentsDetails: [],
      };

      // Convert sequence number to a string
      const sequenceNumberStr = message.sequence_number.toString();

      // Iterate through messages to find related comments, likes, and dislikes
      messages.forEach((m) => {
        if (m.Reply_to === sequenceNumberStr) {
          messageDetails.comments++;

          // Push new comment info to the commentsDetails
          messageDetails.commentsDetails.push({
            author: m.Author,
            message: m.Message,
          });
        }

        if (m.Like_to === sequenceNumberStr) messageDetails.likes++;
        if (m.DisLike_to === sequenceNumberStr) messageDetails.dislikes++;
      });

      // Update newMessagesInfo with processed messageDetails
      newMessagesInfo[message.message_id.toString()] = messageDetails;
    });

    // Update state with the processed message information
    setMessagesInfo(newMessagesInfo);
  }, [messages]);

  // Call processMessages when messages or processMessages function changes
  useEffect(() => {
    processMessages();
  }, [messages, processMessages]);

  // Return the fetched data, loading state, fetchMessages function, and nextLink
  return {
    messagesInfo,
    loading,
    fetchMessages,
    nextLink,
  };
};

export default useReadMessages;
