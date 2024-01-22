import React, { useState, useEffect } from "react";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import { useNavigate } from "react-router-dom";
import Pair from "../hashconnect/pair";
import Modal from "../utils/modal";

const Navbar = () => {
  const navigate = useNavigate();
  const { state, pairingData, disconnect } = useHashConnectContext();

  const handleDisconnect = () => {
    disconnect();
    navigate("/explore"); // Replace '/explore' with your desired path
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (state === "Paired") {
      closeModal();
    }
  }, [state]);

  return (
    <nav className="py-1 px-6 shadow-lg border bg-gray-800 border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={process.env.PUBLIC_URL + "/ibird1.png"}
            alt="Logo"
            className="mr-2 w-10 h-auto"
          />
          <h1 className="md:text-lg text-xl mr-3 text-indigo-300 font-semibold">
            iBird
          </h1>
          <span className="text-white text-sm bg-gradient-to-r from-sky-500 to-indigo-600 rounded p-1">
            v0.0.4
          </span>
        </div>
        {state !== "Paired" && (
          <button
            onClick={openModal}
            className="py-2 px-3 font-semibold text-gray-800 bg-indigo-300 rounded-xl hover:bg-indigo-400 transition duration-300"
          >
            CONNECT
          </button>
        )}
        {state === "Paired" && (
          <button
            onClick={() => handleDisconnect}
            className="py-1 px-3 font-semibold text-gray-800 bg-indigo-300 rounded-xl hover:bg-indigo-400 transition duration-300"
          >
            {pairingData?.accountIds.join(", ")}
          </button>
        )}
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <Pair />
          </Modal>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
