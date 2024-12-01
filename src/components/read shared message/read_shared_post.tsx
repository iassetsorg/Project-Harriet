/**
 * ReadSharedPost Component
 * A modal component that displays a shared post's content using the post's sequence number.
 * It fetches post data and renders it in a modal dialog that can be closed to return to the Explore page.
 *
 * @component
 */

import React from "react";
import Modal from "../../common/modal";
import { useNavigate, useParams } from "react-router-dom";
import useGetPostData from "../../hooks/use_get_post_data";
import ReadPost from "../read message/read_post";
import UserProfile from "../profile/user_profile";

/**
 * ReadSharedPost function component
 * @returns {JSX.Element} A modal containing the shared post's content
 */
function ReadSharedPost() {
  // Extract sequence number from URL parameters
  const sequence_Number = useParams().sequenceNumber;

  // Fetch post data using custom hook
  const { postData, loading, error } = useGetPostData(sequence_Number);
  const navigate = useNavigate();

  /**
   * Handles modal close action
   * Navigates user back to the Explore page
   */
  const closeModal = () => {
    navigate("/Explore");
  };

  return (
    <Modal isOpen={true} onClose={closeModal}>
      <div className="bg-background p-4 rounded-lg">
        {/* Conditional rendering based on fetch status */}
        {error ? (
          // Display error message if fetch failed
          <p>{error}</p>
        ) : loading ? (
          // Display loading state while fetching
          <p>Loading...</p>
        ) : (
          // Render post content if data is available
          postData && (
            <div>
              <ReadPost
                sender={postData.sender || "Unknown Sender"}
                message={postData.Message || "No message content available"}
                media={postData.Media || ""}
                message_id={postData.message_id || ""}
                sequence_number={sequence_Number || ""}
                consensus_timestamp={postData.consensus_timestamp || ""}
              />
            </div>
          )
        )}
      </div>
    </Modal>
  );
}

export default ReadSharedPost;
