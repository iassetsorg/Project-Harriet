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
    <nav className="bg-sky-600 py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-white text-3xl ">
          Project Harriet <span className="text-blue-200 text-sm">v0.0.3</span>
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
          } md:hidden w-full bg-sky-600 py-4 absolute top-16 left-0 z-10`}
        >
          <a
            href="https://github.com/iassetsorg/Project-Harriet"
            className="block text-white text-lg px-4 py-2 hover:text-sky-300"
          >
            GitHub
          </a>
          <a
            href="https://ibird.io/"
            className="block text-white text-lg px-4 py-2 hover:text-sky-300"
          >
            iBird
          </a>
          <a
            href="https://iassets.org/"
            className="block text-white text-lg px-4 py-2 hover:text-sky-300"
          >
            iAssets
          </a>
          {state !== "Paired" ? (
            <button
              onClick={() => setLoadModal("Pair", true)}
              className="bg-sky-700 text-white ml-3 text-lg p-3 rounded-full hover:bg-sky-800"
            >
              CONNECT
            </button>
          ) : null}
          {state === "Paired" ? (
            <button
              onClick={() => disconnect()}
              className="bg-sky-700 text-white ml-3 text-lg p-2 rounded-full hover:bg-blue-800"
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
        <div className="md:flex space-x-4  text-center hidden items-center">
          <a
            href="https://github.com/iassetsorg/Project-Harriet"
            target="_blank"
            className="text-white hover:text-sky-300 text-xl"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://ibird.io/"
            target="_blank"
            className="text-white hover:text-sky-300 text-xl"
            rel="noreferrer"
          >
            iBird
          </a>
          <a
            href="https://iassets.org/"
            target="_blank"
            className="text-white hover:text-sky-300 text-xl"
            rel="noreferrer"
          >
            iAssets
          </a>
          {state !== "Paired" ? (
            <button
              onClick={() => setLoadModal("Pair", true)}
              className="bg-sky-700 text-white ml-3 text-lg p-3 rounded-full hover:bg-sky-800"
            >
              CONNECT
            </button>
          ) : null}
          {state === "Paired" ? (
            <button
              onClick={() => disconnect()}
              className="bg-sky-700 text-white ml-3 text-lg p-3 rounded-full hover:bg-sky-800"
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
