import React, { useEffect } from "react";
import useGetData from "../hooks/use_get_data";
import ReadThread from "./read_thread";
import Spinner from "../utils/Spinner";

function Explorer() {
  const explorerTopicID = "0.0.3946144";
  const { messages, loading, fetchMessages, nextLink } =
    useGetData(explorerTopicID);

  useEffect(() => {
    const handleLoad = () => {
      fetchMessages(explorerTopicID);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => {
        window.removeEventListener("load", handleLoad);
      };
    }
  }, []);

  const handleLoadMore = () => {
    if (nextLink) fetchMessages(nextLink);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 border rounded-md shadow-md mt-8">
      <h1 className="text-2xl font-semibold mb-4">Explorer</h1>
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
