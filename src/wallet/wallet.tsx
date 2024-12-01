/**
 * @fileoverview Wallet component that handles wallet connection and display
 * Provides a button to connect/disconnect wallet and displays the account ID when connected
 */

import React, { useState } from "react";
import ConnectModal from "./ConnectModal";
import { useWalletContext } from "./WalletContext";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";

/**
 * Wallet component for handling Hedera wallet connections
 * @component
 * @returns {JSX.Element} A button that toggles wallet connection and displays account info
 */
const Wallet = () => {
  // State to control the visibility of the connection modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get wallet connection status and disconnect function from context
  const { isConnected, disconnect } = useWalletContext();

  // Get the connected account ID from the Hashgraph wallet
  const { data: accountId } = useAccountId();

  /**
   * Opens the wallet connection modal
   * @function
   */
  const openConnectModal = () => setIsModalOpen(true);

  /**
   * Closes the wallet connection modal
   * @function
   */
  const closeConnectModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Connection button that changes text and function based on connection status */}
      <button
        className="w-full text-md text-center py-2 px-3 font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
        onClick={isConnected ? disconnect : openConnectModal}
      >
        {isConnected ? accountId ?? "-" : "CONNECT"}
      </button>

      {/* Render the connection modal only when isModalOpen is true */}
      {isModalOpen && (
        <ConnectModal isOpen={isModalOpen} onClose={closeConnectModal} />
      )}
    </>
  );
};

export default Wallet;
