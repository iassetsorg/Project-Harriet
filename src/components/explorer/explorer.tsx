import React, { useEffect } from "react";
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

  useEffect(() => {
    fetchMessages(explorerTopicID);
  }, []);

  const handleLoadMore = () => {
    if (nextLink) fetchMessages(nextLink);
  };

  return (
    <div className="overflow-y-scroll w-full h-screen bg-background shadow-xl p-6 text-text">
      {loading && <Spinner />}
      {!loading &&
        messages.map((message, idx) => {
          if (message.Type === "Post") {
            return (
              <div key={idx} className="">
                <ReadPost
                  sender={message.sender}
                  message={message.Message}
                  media={message.Media}
                  message_id={message.message_id}
                  sequence_number={message.sequence_number.toString()}
                  consensus_timestamp={
                    message.consensus_timestamp?.toString() || "0"
                  } // Provide a default value
                />
              </div>
            );
          }
          if (message.Type === "Thread") {
            return (
              <div key={idx} className="">
                <ReadThread topicId={message.Thread} />
              </div>
            );
          }
          if (message.Type === "Poll") {
            return (
              <div key={idx} className="">
                <ReadPoll topicId={message.Poll} />
              </div>
            );
          }
          return null;
        })}
      {nextLink && (
        <button
          onClick={handleLoadMore}
          className="py-3 px-6 font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300"
        >
          Load more
        </button>
      )}
    </div>
  );
}

export default Explorer;
