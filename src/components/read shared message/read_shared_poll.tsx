import Modal from "../../common/modal";
import React, { useState } from "react";
import ReadPoll from "../read message/read_poll";
import { useNavigate, useParams } from "react-router-dom";

function ReadSharedPoll() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();
  const topicIdVar = useParams().topicId || "";

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/Explore");
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <div className="bg-background p-4 rounded-lg">
        <ReadPoll topicId={topicIdVar} />
      </div>
    </Modal>
  );
}

export default ReadSharedPoll;
