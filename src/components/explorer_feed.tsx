import React, { useEffect } from "react";
import useGetData from "../hooks/use_get_data";
import ReadThread from "./read_thread";
import Spinner from "../utils/Spinner";

function Explorer() {
  const explorerTopicID = "0.0.3946144";
  const { messages, loading, fetchMessages, nextLink } =
    useGetData(explorerTopicID);

  useEffect(() => {
    fetchMessages(explorerTopicID);
  }, []);

  const handleLoadMore = () => {
    if (nextLink) fetchMessages(nextLink);
  };

  return (
    <div className="max-w-md mx-auto  bg-gray-100 rounded-lg shadow-xl p-6">
      <h1 className="text-xl font-semibold text-sky-900 mb-4">Explorer</h1>
      {loading && <Spinner />}
      {!loading &&
        messages.map((message, idx) => {
          if (message.Thread) {
            return (
              <div key={idx} className="mb-4">
                <ReadThread topicId={message.Thread} />
              </div>
            );
          }
          return null;
        })}
      {nextLink && (
        <button
          onClick={handleLoadMore}
          className="bg-blue-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue hover:bg-blue-600"
        >
          Load more
        </button>
      )}
    </div>
  );
}

export default Explorer;
