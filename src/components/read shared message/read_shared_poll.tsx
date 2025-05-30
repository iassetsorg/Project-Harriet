/**
 * ReadSharedPoll Component
 * A modal component that displays a shared poll and handles navigation.
 * This component is typically used when users access a poll through a shared link.
 */

import Modal from "../../common/modal";
import React, { useState } from "react";
import ReadPoll from "../read message/read_poll";
import { useNavigate, useParams } from "react-router-dom";
import SEOHead from "../common/SEOHead";
import { usePollSEO } from "../../hooks/use_seo";

/**
 * ReadSharedPoll is a functional component that manages the display of a shared poll in a modal.
 * It handles the modal's open state and navigation after closing.
 * @returns {JSX.Element} A modal containing the shared poll content
 */
function ReadSharedPoll() {
  // State to control the visibility of the modal
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Extract topicId from URL parameters, defaulting to empty string if not present
  const topicIdVar = useParams().topicId || "";

  // Generate SEO configuration for poll
  const { seoConfig } = usePollSEO();

  /**
   * Handles the modal close action
   * Closes the modal and navigates user to the Explore page
   */
  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/Explore");
  };

  return (
    <>
      <SEOHead seoConfig={seoConfig} />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {/* Container for the poll content with styling */}
        <div className="bg-background p-4 rounded-lg">
          <ReadPoll topicId={topicIdVar} />
        </div>
      </Modal>
    </>
  );
}

export default ReadSharedPoll;
