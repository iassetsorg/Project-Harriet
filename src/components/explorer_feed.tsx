import React, { useEffect } from "react";
import useGetData from "../hooks/use_get_data";
import ReadThread from "./read_thread";
import Spinner from "../utils/Spinner";

function Explorer() {
  const explorerTopicID = "0.0.3946144";
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
    <div className="overflow-y-scroll w-full h-screen bg-gray-800 shadow-xl p-6 text-white">
      {loading && <Spinner />}
      {!loading &&
        messages.map((message, idx) => {
          if (message.Thread) {
            return (
              <div key={idx} className="">
                <ReadThread topicId={message.Thread} />
              </div>
            );
          }
          return null;
        })}
      {nextLink && (
        <button
          onClick={handleLoadMore}
          className="bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue hover:bg-blue-700"
        >
          Load more
        </button>
      )}
    </div>
  );
}

export default Explorer;