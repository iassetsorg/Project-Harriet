import React, { useState } from "react";
import Modal from "../common/modal";
import { useWalletContext } from "./WalletContext";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";

const HashPackLogo = `${process.env.PUBLIC_URL}/HashPack.png`;
const KabilaLogo = `${process.env.PUBLIC_URL}/Kabila.png`;
const WalletConnectLogo = `${process.env.PUBLIC_URL}/WalletConnect.png`;

/**
 * Props interface for the ConnectModal component
 * @interface ConnectModalProps
 * @property {boolean} isOpen - Controls the visibility of the modal
 * @property {() => void} onClose - Callback function to close the modal
 */
interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ConnectModal Component
 * Provides a user interface for connecting different Hedera wallets to the application.
 * Supports HashPack, Kabila, and WalletConnect integration.
 *
 * @component
 * @param {ConnectModalProps} props - Component props
 * @returns {JSX.Element} Rendered modal component
 */
const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const { connect, isLoading, cancelConnection } = useWalletContext();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  /**
   * Handles the wallet connection process
   * @param {string} connectorType - The type of wallet to connect (HashPack/Kabila/WalletConnect)
   * @returns {Promise<void>}
   */
  const handleConnect = async (connectorType: string) => {
    setSelectedWallet(connectorType);
    const success = await connect(connectorType);
    if (success) {
      onClose();
    } else {
      setSelectedWallet(null);
    }
  };

  /**
   * Handles the cancellation of an ongoing wallet connection attempt
   */
  const handleCancel = () => {
    cancelConnection();
    setSelectedWallet(null);
  };

  /**
   * Configuration array for supported wallets
   * Each wallet object contains a name, logo path, and title
   */
  const wallets = [
    { name: "HashPack", logo: HashPackLogo, title: "Desktop" },
    { name: "Kabila", logo: KabilaLogo, title: "Desktop" },
    { name: "WalletConnect", logo: WalletConnectLogo, title: "Mobile" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton={false}
      removeZIndex={true}
    >
      <div className="flex flex-col items-center p-8 bg-background text-text w-full max-w-sm mx-auto">
        {isLoading && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="flex flex-col items-center bg-secondary p-6 rounded-2xl shadow-lg">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
              <p className="text-primary font-medium mb-6">
                Connecting to {selectedWallet}...
              </p>
              <button
                onClick={handleCancel}
                className="group flex items-center gap-2 px-6 py-2.5 bg-background/10 hover:bg-red-500/10 border border-red-500/50 hover:border-red-500 text-red-500 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <svg
                  className="w-5 h-5 group-hover:animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel Connection
              </button>
            </div>
          </div>
        )}
        <h2 className="text-2xl font-semibold mb-2 text-primary">
          Connect Wallet
        </h2>
        <p className="text-sm text-text mb-4">
          You need to connect a Hedera wallet
        </p>

        <div className="w-full space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              className="w-full py-3 px-4 bg-secondary rounded-xl hover:bg-accent hover:text-background transition duration-300 text-text flex items-center disabled:opacity-50 disabled:cursor-not-allowed group relative"
              onClick={() => handleConnect(wallet.name)}
              disabled={isLoading}
            >
              <img
                src={wallet.logo}
                alt={`${wallet.name} logo`}
                className="w-8 mr-2"
              />
              <span className="flex-1 text-left">{wallet.name}</span>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full group-hover:bg-background/20">
                {wallet.title}
              </span>
            </button>
          ))}
        </div>

        <p className="text-sm text-text mt-6">
          By connecting a wallet, you agree to iAssets'{" "}
          <a
            href="https://iassets.org/TermsOfService"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Terms of Service
          </a>
          .
        </p>
      </div>
    </Modal>
  );
};

export default ConnectModal;
