import React from "react";
import Modal from "../../common/modal";
import { useNavigate, useParams } from "react-router-dom";
import useGetPostData from "../../hooks/use_get_post_data";
import ReadPost from "../read message/read_post";
import UserProfile from "../profile/user_profile";

function ReadSharedPost() {
  const sequence_Number = useParams().sequenceNumber;

  const { postData, loading, error } = useGetPostData(sequence_Number);
  const navigate = useNavigate();

  const closeModal = () => {
    navigate("/Explore");
  };

  return (
    <Modal isOpen={true} onClose={closeModal}>
      <div className="bg-background p-4 rounded-lg">
        {error ? (
          <p>{error}</p>
        ) : loading ? (
          <p>Loading...</p>
        ) : (
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
