import React, { useEffect } from "react";
import useGetData from "../hooks/use_get_data";
import ReadThread from "./read_thread";
import Spinner from "../utils/Spinner";
import useProfileData from "../hooks/use_profile_data";
import { useHashConnectContext } from "../hashconnect/hashconnect";

function Threads() {
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const { profileData } = useProfileData(signingAccount);

  // Adjusted to handle profileData as an object
  const profileId = profileData ? profileData.Threads : "";

  const { messages, loading, fetchMessages, nextLink } = useGetData(
    profileId,
    null,
    true
  );

  useEffect(() => {
    if (profileId) {
      fetchMessages(profileId);
    }
  }, [profileId]);

  const handleLoadMore = () => {
    if (nextLink) fetchMessages(nextLink);
  };

  return (
    <div className="overflow-y-scroll w-full h-screen bg-background shadow-xl p-6 text-text">
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
          className="bg-primary text-text py-2 px-4 rounded focus:outline-none focus:shadow-outline-primary hover:bg-accent"
        >
          Load more
        </button>
      )}
    </div>
  );
}

export default Threads;
