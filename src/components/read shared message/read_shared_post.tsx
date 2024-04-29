import Modal from "../../common/modal";
import React, { useState } from "react";
import ReadPost from "../read message/read_post";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function ReadSharedPost() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();
  const sequenceNumber = useParams().sequence_Number || "";
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const sender = searchParams.get("sender") || "";
  const message = searchParams.get("message") || "";
  const media = searchParams.get("media") || "";
  const messageId = searchParams.get("message_id") || "";

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/Explore");
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <div className="bg-background p-4 rounded-lg">
        <ReadPost
          sender={sender}
          message={decodeURIComponent(message)}
          media={media}
          message_id={messageId}
          sequence_number={sequenceNumber}
        />
      </div>
    </Modal>
  );
}

export default ReadSharedPost;
