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
import ReadPost from "../read message/read_post";

/**
 * ReadSharedPost function component
 * @returns {JSX.Element} A modal containing the shared post's content
 */
function ReadSharedPost() {
  // Extract sequence number from URL parameters
  const sequence_Number = useParams().sequenceNumber;
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
        {sequence_Number && <ReadPost sequence_number={sequence_Number} />}
      </div>
    </Modal>
  );
}

export default ReadSharedPost;
