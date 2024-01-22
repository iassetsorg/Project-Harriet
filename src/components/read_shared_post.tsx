import Modal from "../utils/modal";
import React, { useState } from "react";
import ReadPost from "./read_post";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function ReadSharedPost() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();
  const sequenceNumber = useParams().sequenceNumber || "";
  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/Planet");
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <div className="bg-gray-800 p-4 rounded-lg">
        <ReadPost sequenceNumber={sequenceNumber} />
      </div>
    </Modal>
  );
}

export default ReadSharedPost;
