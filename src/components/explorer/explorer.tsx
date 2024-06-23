import React, { useEffect, useRef, useCallback, useState } from "react";
import useGetData from "../../hooks/use_get_data";
import Spinner from "../../common/Spinner";
import ReadThread from "../read message/read_thread";
import ReadPost from "../read message/read_post";
import ReadPoll from "../read message/read_poll";

function Explorer() {
  const explorerTopicID = process.env.REACT_APP_EXPLORER_TOPIC || "";
  const { messages, loading, fetchMessages, nextLink } = useGetData(
    explorerTopicID,
    null,
    true
  );
  const [allMessages, setAllMessages] = useState<typeof messages>([]);
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchMessages(explorerTopicID);
  }, []);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && nextLink) {
        setIsLoading(true);
        fetchMessages(nextLink);
      }
    },
    [nextLink, fetchMessages]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "0px",
      threshold: 0.8, // Trigger when 80% of the page is visible
    };

    const observer = new IntersectionObserver(handleObserver, option);
    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [handleObserver]);

  useEffect(() => {
    if (messages.length > 0) {
      setAllMessages((prevMessages) => {
        const newMessages = messages.filter(
          (message) =>
            !prevMessages.some(
              (prevMessage) => prevMessage.message_id === message.message_id
            )
        );
        return [...prevMessages, ...newMessages];
      });
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="overflow-y-scroll w-full h-screen bg-background shadow-xl p-6 text-text">
      {loading && allMessages.length === 0 && <Spinner />}
      {allMessages.map((message, idx) => {
        if (message.Type === "Post") {
          return (
            <div key={message.message_id} className="">
              <ReadPost
                sender={message.sender}
                message={message.Message}
                media={message.Media}
                message_id={message.message_id}
                sequence_number={message.sequence_number.toString()}
                consensus_timestamp={
                  message.consensus_timestamp?.toString() || "0"
                }
              />
            </div>
          );
        }
        if (message.Type === "Thread") {
          return (
            <div key={message.message_id} className="">
              <ReadThread topicId={message.Thread} />
            </div>
          );
        }
        if (message.Type === "Poll") {
          return (
            <div key={message.message_id} className="">
              <ReadPoll topicId={message.Poll} />
            </div>
          );
        }
        return null;
      })}
      <div ref={observerRef}></div>
      {isLoading && (
        <div className="flex justify-center mt-4">
          <Spinner />
        </div>
      )}
    </div>
  );
}

export default Explorer;
