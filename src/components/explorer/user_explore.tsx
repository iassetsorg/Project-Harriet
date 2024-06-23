import React, { useEffect, useRef, useState } from "react";
import useGetData from "../../hooks/use_get_data";
import Spinner from "../../common/Spinner";
import ReadThread from "../read message/read_thread";
import ReadPost from "../read message/read_post";
import ReadPoll from "../read message/read_poll";
import useProfileData from "../../hooks/use_profile_data";
import { useHashConnectContext } from "../../hashconnect/hashconnect";

interface UserExplorerProps {
  userAddress: string;
}

function UserExplorer({ userAddress }: UserExplorerProps) {
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const { profileData, isLoading, error } = useProfileData(userAddress);
  const explorerTopicID = profileData?.UserMessages;
  const { messages, loading, fetchMessages, nextLink } = useGetData(
    explorerTopicID,
    null,
    true
  );
  const [allMessages, setAllMessages] = useState<typeof messages>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (explorerTopicID) {
      fetchMessages(explorerTopicID);
    }
  }, [explorerTopicID]);

  const handleObserver = (entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && nextLink) {
      setIsLoadingMore(true);
      fetchMessages(nextLink);
    }
  };

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
  }, [nextLink]);

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
      setIsLoadingMore(false);
    }
  }, [messages]);

  return (
    <div className="">
      <h1 className="text-2xl mt-5 ml-5 font-semibold text-text mb-4">
        Messages
      </h1>

      <div className="overflow-y-auto w-full h-screen bg-background shadow-xl p-6 text-text">
        {loading && allMessages.length === 0 && <Spinner />}

        {allMessages.map((message) => {
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
          } else if (message.Type === "Thread") {
            return (
              <div key={message.message_id} className="">
                <ReadThread topicId={message.Thread} />
              </div>
            );
          } else if (message.Type === "Poll") {
            return (
              <div key={message.message_id} className="">
                <ReadPoll topicId={message.Poll} />
              </div>
            );
          }
          return null;
        })}
        <div ref={observerRef}></div>
        {isLoadingMore && (
          <div className="flex justify-center mt-4">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserExplorer;
