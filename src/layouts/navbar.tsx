import React, { useState } from "react";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import Pair from "../hashconnect/pair";

const Navbar = () => {
  const { state, pairingData, disconnect } = useHashConnectContext();

  const [Modals, setModals] = useState({
    Pair: false,
  });

  const setLoadModal = (modalName: string, value: boolean) => {
    setModals({ ...Modals, [modalName]: value });
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-white text-3xl font-bold">
          Project Harriet <span className="text-blue-200 text-sm">v0.0.1</span>
        </a>
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } md:hidden w-full bg-blue-500 py-4 absolute top-16 left-0 z-10`}
        >
          <a
            href="https://github.com/iassetsorg/Project-Harriet"
            className="block text-white text-xl px-4 py-2 hover:bg-blue-400"
          >
            GitHub
          </a>
          <a
            href="https://ibird.io/"
            className="block text-white text-xl px-4 py-2 hover:bg-blue-400"
          >
            iBird
          </a>
          <a
            href="https://iassets.org/"
            className="block text-white text-xl px-4 py-2 hover:bg-blue-400"
          >
            iAssets
          </a>
          {state !== "Paired" ? (
            <button
              onClick={() => setLoadModal("Pair", true)}
              className="bg-blue-700 text-white ml-3 text-xl p-3 rounded-full hover:bg-blue-400"
            >
              Connect
            </button>
          ) : null}
          {state === "Paired" ? (
            <button
              onClick={() => disconnect()}
              className="bg-blue-700 text-white ml-3 text-xl p-2 rounded-full hover:bg-blue-400"
            >
              {pairingData?.accountIds.join(", ")}
            </button>
          ) : null}
          {Modals.Pair && (
            <Pair
              setModal={(value: boolean) => setLoadModal("Pair", value)}
            ></Pair>
          )}
        </div>
        <div className="md:flex space-x-4 hidden">
          <a
            href="https://github.com/iassetsorg/Project-Harriet"
            target="_blank"
            className="text-white hover:text-blue-200 text-xl"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://ibird.io/"
            target="_blank"
            className="text-white hover:text-blue-200 text-xl"
            rel="noreferrer"
          >
            iBird
          </a>
          <a
            href="https://iassets.org/"
            target="_blank"
            className="text-white hover:text-blue-200 text-xl"
            rel="noreferrer"
          >
            iAssets
          </a>
          {state !== "Paired" ? (
            <button
              onClick={() => setLoadModal("Pair", true)}
              className="bg-blue-700 text-white text-xl p-3 rounded-full hover:bg-blue-400"
            >
              Connect
            </button>
          ) : null}
          {state === "Paired" ? (
            <button
              onClick={() => disconnect()}
              className="bg-blue-700 text-white text-xl p-2 rounded-full hover:bg-blue-400"
            >
              {pairingData?.accountIds.join(", ")}
            </button>
          ) : null}
          {Modals.Pair && (
            <Pair
              setModal={(value: boolean) => setLoadModal("Pair", value)}
            ></Pair>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
