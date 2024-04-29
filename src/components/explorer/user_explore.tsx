import React, { useEffect, useRef, RefObject } from "react";
import useGetData from "../../hooks/use_get_data";
import Spinner from "../../common/Spinner";
import ReadThread from "../read message/read_thread";
import ReadPost from "../read message/read_post";
import ReadPoll from "../read message/read_poll";
import useProfileData from "../../hooks/use_profile_data";
import { useHashConnectContext } from "../../hashconnect/hashconnect";

function UserExplorer() {
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const { profileData, isLoading, error } = useProfileData(signingAccount);
  const explorerTopicID = profileData?.UserMessages;
  const { messages, loading, fetchMessages, nextLink } = useGetData(
    explorerTopicID,
    null,
    true
  );
  const contentRef: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    if (explorerTopicID) {
      fetchMessages(explorerTopicID);
    }
  }, [explorerTopicID]);

  const handleLoadMore = () => {
    if (nextLink) fetchMessages(nextLink);
  };

  return (
    <div className="">
      <h1 className="text-2xl mt-5 ml-5 font-semibold text-text mb-4">
        Messages
      </h1>

      <div className="overflow-y-auto w-full h-screen bg-background shadow-xl p-6 text-text">
        {loading && <Spinner />}

        {!loading &&
          messages.map((message) => {
            if (message.Type === "Post") {
              return (
                <div key={message.message_id} className="">
                  <ReadPost
                    sender={message.sender}
                    message={message.Message}
                    media={message.Media}
                    message_id={message.message_id}
                    sequence_number={message.sequence_number.toString()}
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
        {nextLink && (
          <button
            onClick={handleLoadMore}
            className="py-3 px-6 font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}

export default UserExplorer;
