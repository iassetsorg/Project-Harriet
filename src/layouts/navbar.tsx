import React, { useState, useEffect } from "react";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import { useNavigate } from "react-router-dom";
import Pair from "../hashconnect/pair";
import Modal from "../common/modal";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import DarkModeToggle from "./DarkModeToggle";
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

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const openTradeModal = () => {
    setIsTradeModalOpen(true);
  };
  const closeTradeModal = () => {
    setIsTradeModalOpen(false);
  };

  useEffect(() => {
    if (state === "Paired") {
      closeModal();
    }
  }, [state]);

  return (
    <nav className="py-3 px-6 shadow-lg border-y  bg-background border-secondary">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={process.env.PUBLIC_URL + "/ibird1.png"}
            alt="Logo"
            className="mr-2 w-10 h-auto"
          />
          <h1 className="md:text-lg text-xl mr-3 text-primary font-semibold">
            iBird
          </h1>
          <span className="text-background text-sm bg-gradient-to-r from-primary to-accent rounded p-1">
            v0.0.7
          </span>
        </div>
        <div className="flex items-center">
          <DarkModeToggle />
          <button
            onClick={openTradeModal}
            className="font-semibold  text-background bg-primary rounded-xl hover:bg-accent transition duration-300 ml-2"
          >
            <RiMoneyDollarCircleLine className="text-3xl" />
          </button>

          {state !== "Paired" ? (
            <button
              onClick={openModal}
              className="py-2 px-3 ml-3 font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
            >
              CONNECT
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="py-1 px-3 ml-3 font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
            >
              {pairingData?.accountIds.join(", ")}
            </button>
          )}
        </div>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <Pair />
          </Modal>
        )}

        {isTradeModalOpen && (
          <Modal isOpen={isTradeModalOpen} onClose={closeTradeModal}>
            <div className=" text-text bg-background  text-center  flex flex-col space-y-3 px-12 pb-6 pt-12 rounded-full">
              <a
                href="https://pancakeswap.finance/swap?inputCurrency=BNB&outputCurrency=0x6b471d5ab9f3d92a600e7d49a0b135bf6d4c6a5b"
                className="text-md text-center py-2 px-3   font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get ASSET (BSC)
              </a>
              <a
                href="https://www.saucerswap.finance/swap/HBAR/0.0.1991880"
                className="text-md text-center py-2 px-3   font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get ASSET (HTS)
              </a>
              <a
                href="https://iassets.org/upgrade/"
                className="text-md text-center py-2 px-3   font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Convert BSC to HTS
              </a>
              <a
                href="https://sentx.io/nft-marketplace/0.0.3844404"
                className="text-md text-center py-2 px-3   font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get The First Flight NFTs
              </a>
            </div>
          </Modal>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
