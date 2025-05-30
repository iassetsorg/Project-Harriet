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
import SEOHead from "../common/SEOHead";
import { usePostSEO } from "../../hooks/use_seo";
import useGetPostData from "../../hooks/use_get_post_data";

/**
 * ReadSharedPost function component
 * @returns {JSX.Element} A modal containing the shared post's content
 */
function ReadSharedPost() {
  // Extract sequence number from URL parameters
  const sequence_Number = useParams().sequenceNumber;
  const navigate = useNavigate();

  // Fetch post data for SEO
  const { postData, loading } = useGetPostData(sequence_Number || "");

  // Generate SEO configuration
  const { seoConfig } = usePostSEO({
    content: postData?.Message,
    author: postData?.sender,
    timestamp: postData?.consensus_timestamp?.toString(),
    media: postData?.Media,
  });

  /**
   * Handles modal close action
   * Navigates user back to the Explore page
   */
  const closeModal = () => {
    navigate("/Explore");
  };

  return (
    <>
      {!loading && postData && <SEOHead seoConfig={seoConfig} />}
      <Modal isOpen={true} onClose={closeModal}>
        <div className="bg-background p-4 rounded-lg">
          {sequence_Number && <ReadPost sequence_number={sequence_Number} />}
        </div>
      </Modal>
    </>
  );
}

export default ReadSharedPost;
