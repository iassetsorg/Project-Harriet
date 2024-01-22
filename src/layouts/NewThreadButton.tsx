import React, { FC, useState, useEffect } from "react";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import Pair from "../hashconnect/pair";
import { FaPen } from "react-icons/fa";
import CreateThread from "../components/create_thread";
import CreateProfile from "../components/create_profile";
import SendMessageToPlanetModal from "../components/send_message_to_plannet";
import Modal from "../utils/modal";
import { useLocation } from "react-router-dom";

export const NewThreadButton: FC = () => {
  const { state } = useHashConnectContext();

  const [isSendMessageToPlanetModalOpen, setIsSendMessageToPlanetModalOpen] =
    useState(false);
  const [isCreateThreadModalOpen, setIsCreateThreadModalOpen] = useState(false);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);

  const currentRoute: string = useLocation().pathname;

  const openSendMessageToPlanetModal = () => {
    setIsSendMessageToPlanetModalOpen(true);
  };
  const closeSendMessageToPlanetModal = () => {
    setIsSendMessageToPlanetModalOpen(false);
  };

  const openCreateThreadModal = () => {
    setIsCreateThreadModalOpen(true);
  };
  const closeCreateThreadModal = () => {
    setIsCreateThreadModalOpen(false);
  };
  //Pair Modal
  const openPairModal = () => {
    setIsPairModalOpen(true);
  };
  const closePairModal = () => {
    setIsPairModalOpen(false);
  };

  useEffect(() => {
    if (state === "Paired") {
      closePairModal();
    }
  }, [state]);

  return (
    <div className="fixed">
      {state !== "Paired" && (
        <button
          onClick={openPairModal}
          className="NewThreadButton flex items-center  p-3 font-semibold text-gray-800 bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300 "
        >
          <FaPen className="mr-2" />
          <span className="text-sm font-medium">
            {currentRoute === "/Planet" ? "New Post" : "New Thread"}
          </span>
        </button>
      )}

      {state === "Paired" && currentRoute === "/Planet" && (
        <button
          onClick={openSendMessageToPlanetModal}
          className="NewThreadButton flex items-center p-3 font-semibold text-gray-800 bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300"
        >
          <FaPen className="mr-2" />
          <span className="text-sm font-medium">New Post</span>
        </button>
      )}

      {state === "Paired" && currentRoute === "/Explore" && (
        <button
          onClick={openCreateThreadModal}
          className="NewThreadButton flex items-center p-3 font-semibold text-gray-800 bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300"
        >
          <FaPen className="mr-2" />
          <span className="text-sm font-medium">New Thread</span>
        </button>
      )}

      {isPairModalOpen && (
        <Modal isOpen={isPairModalOpen} onClose={closePairModal}>
          <Pair />
        </Modal>
      )}

      {isCreateThreadModalOpen && (
        <Modal
          isOpen={isCreateThreadModalOpen}
          onClose={closeCreateThreadModal}
        >
          <CreateThread onClose={closeCreateThreadModal} />
        </Modal>
      )}

      {isSendMessageToPlanetModalOpen && (
        <Modal
          isOpen={isSendMessageToPlanetModalOpen}
          onClose={closeSendMessageToPlanetModal}
        >
          <SendMessageToPlanetModal onClose={closeSendMessageToPlanetModal} />
        </Modal>
      )}
    </div>
  );
};
