/**
 * @fileoverview Provides wallet connection context and management for the application.
 * Supports multiple wallet types including Kabila, HashPack, and HWC (Hedera Wallet Connect).
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  KabilaConnector,
  HashpackConnector,
  HWCConnector,
} from "@buidlerlabs/hashgraph-react-wallets/connectors";
import { useWallet } from "@buidlerlabs/hashgraph-react-wallets";

/**
 * @interface WalletContextType
 * @description Defines the shape of the wallet context data and methods
 * @property {boolean} isConnected - Indicates if any wallet is currently connected
 * @property {boolean} isLoading - Indicates if a wallet connection is in progress
 * @property {function} connect - Initiates a wallet connection
 * @property {function} disconnect - Disconnects the currently connected wallet
 * @property {function} cancelConnection - Cancels an ongoing connection attempt
 */
const WalletContext = createContext<{
  isConnected: boolean;
  isLoading: boolean;
  connect: (connectorType: string) => Promise<boolean>;
  disconnect: () => void;
  cancelConnection: () => void;
}>({
  isConnected: false,
  isLoading: false,
  connect: async () => false,
  disconnect: () => {},
  cancelConnection: () => {},
});

/**
 * @function useWalletContext
 * @description Custom hook to access the wallet context
 * @returns {WalletContextType} The wallet context object
 */
export const useWalletContext = () => useContext(WalletContext);

/**
 * @component WalletProvider
 * @description Provider component that manages wallet connections and state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 */
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State management for wallet connection status
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionCancelled, setConnectionCancelled] = useState(false);

  // Initialize wallet connectors
  const kabilaWallet = useWallet(KabilaConnector);
  const hashpackWallet = useWallet(HashpackConnector);
  const hwcWallet = useWallet(HWCConnector);

  /**
   * @effect
   * @description Updates the connected state whenever any wallet's connection status changes
   */
  useEffect(() => {
    setIsConnected(
      kabilaWallet.isConnected ||
        hashpackWallet.isConnected ||
        hwcWallet.isConnected
    );
  }, [
    kabilaWallet.isConnected,
    hashpackWallet.isConnected,
    hwcWallet.isConnected,
  ]);

  /**
   * @async
   * @function connect
   * @description Initiates a connection to the specified wallet type
   * @param {string} connectorType - The type of wallet to connect ("Kabila", "HashPack", or "WalletConnect")
   * @returns {Promise<boolean>} Success status of the connection attempt
   */
  const connect = async (connectorType: string) => {
    setIsLoading(true);
    setConnectionCancelled(false);
    try {
      if (connectionCancelled) {
        return false;
      }
      switch (connectorType) {
        case "Kabila":
          await kabilaWallet.connect();
          break;
        case "HashPack":
          await hashpackWallet.connect();
          break;
        case "WalletConnect":
          await hwcWallet.connect();
          break;
      }
      return !connectionCancelled;
    } catch (error) {
      console.error("Connection error:", error);
      return false;
    } finally {
      setIsLoading(false);
      setConnectionCancelled(false);
    }
  };

  /**
   * @function disconnect
   * @description Disconnects all currently connected wallets
   */
  const disconnect = () => {
    if (kabilaWallet.isConnected) kabilaWallet.disconnect();
    if (hashpackWallet.isConnected) hashpackWallet.disconnect();
    if (hwcWallet.isConnected) hwcWallet.disconnect();
  };

  /**
   * @function cancelConnection
   * @description Cancels an ongoing wallet connection attempt
   */
  const cancelConnection = () => {
    setConnectionCancelled(true);
    setIsLoading(false);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isLoading,
        connect,
        disconnect,
        cancelConnection,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
