import Modal from "../../common/modal";
import React, { useState } from "react";
import ReadThread from "../read message/read_thread";
import { useNavigate, useParams } from "react-router-dom";
import SEOHead from "../common/SEOHead";
import { useThreadSEO } from "../../hooks/use_seo";

/**
 * Component for displaying a shared thread in a modal dialog.
 * This component is typically used when accessing a thread through a shared link.
 * @component
 */
function ReadSharedThread() {
  // State to control the visibility of the modal
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Extract topicId from URL parameters, defaulting to empty string if not present
  const topicIdVar = useParams().topicId || "";

  // Generate SEO configuration for thread
  const { seoConfig } = useThreadSEO({
    topicId: topicIdVar,
  });

  /**
   * Handles the modal close action.
   * Closes the modal and navigates user to the Explore page.
   */
  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/Explore");
  };

  /**
   * Renders a modal containing the thread content.
   * Uses the Modal component for the overlay and ReadThread for the content.
   */
  return (
    <>
      <SEOHead seoConfig={seoConfig} />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {/* Container for the thread content with styling */}
        <div className="bg-background p-4 rounded-lg">
          <ReadThread topicId={topicIdVar} />
        </div>
      </Modal>
    </>
  );
}

export default ReadSharedThread;
