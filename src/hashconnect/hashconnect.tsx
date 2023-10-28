import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import { HashConnectConnectionState } from "hashconnect/dist/types";

// Define the shape of the context data
interface HashConnectContent {
  hcData: object;
  topic: string;
  setTopic: Function;
  clearPairings: Function;
  pairingString: string;
  pairingData: HashConnectTypes.SavedPairingData | null;
  availableExtension: HashConnectTypes.WalletMetadata | null;
  state: HashConnectConnectionState;
  hashconnect: HashConnect | null;
  connectToExtension: Function;
  disconnect: Function;
  sendTransaction: Function;
}

// Create a context with default values
const HashConnectContext = createContext<HashConnectContent>({
  hcData: {},
  topic: "",
  setTopic: () => {},
  clearPairings: () => {},
  pairingString: "",
  pairingData: null,
  availableExtension: null,
  hashconnect: null,
  state: HashConnectConnectionState.Disconnected,
  sendTransaction: () => {},
  connectToExtension: () => {},
  disconnect: () => {},
});

// Initialize the HashConnect instance
const hashconnect = new HashConnect(true);

export default function HashConnectProvider({ children }: PropsWithChildren) {
  // State variables to hold various data
  const [hcData, setHcData] = useState<object>(hashconnect.hcData);
  const [topic, setTopic] = useState("");
  const [pairingString, setPairingString] = useState("");
  const [pairingData, setPairingData] =
    useState<HashConnectTypes.SavedPairingData | null>(null);
  const [availableExtension, setAvailableExtension] =
    useState<HashConnectTypes.WalletMetadata>({
      name: "",
      description: "",
      icon: "",
    });

  // Define app metadata
  const appMetadata: HashConnectTypes.AppMetadata = {
    name: "iAssets",
    description: "Decentralize The Power on Earth",
    icon: "",
    url: "http://localhost:3000",
  };

  // State variable to hold the connection state
  const [state, setState] = useState(HashConnectConnectionState.Disconnected);

  // Initialize the HashConnect instance and set up event listeners
  useEffect(() => {
    init();
  }, []);

  hashconnect.connectionStatusChangeEvent.on((data: any) => {
    setState(data);
    setHcData(hashconnect.hcData);
  });

  const init = async () => {
    // Register events and initialize HashConnect
    setUpHashConnectEvents();
    let initData = await hashconnect.init(appMetadata, "mainnet", false);
    setTopic(initData.topic);
    setPairingString(initData.pairingString);
    setPairingData(initData.savedPairings[0]);
  };

  const setUpHashConnectEvents = () => {
    // Event listener for finding extensions
    hashconnect.foundExtensionEvent.on((data) => {
      setAvailableExtension(data);
    });

    // Event listener for pairing
    hashconnect.pairingEvent.on((data) => {
      setPairingData(data.pairingData!);
    });

    // Event listener for connection status changes
    hashconnect.connectionStatusChangeEvent.on((state) => {
      setState(state);
    });
  };

  // Function to connect to a wallet extension
  const connectToExtension = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    hashconnect.connectToLocalWallet();
  };

  // Function to send a transaction
  const sendTransaction = async (
    trans: Uint8Array,
    acctToSign: string,
    return_trans: boolean = false,
    hideNfts: boolean = false
  ) => {
    const transaction: MessageTypes.Transaction = {
      topic: topic,
      byteArray: trans,
      metadata: {
        accountToSign: acctToSign,
        returnTransaction: return_trans,
        hideNft: hideNfts,
      },
    };
    return await hashconnect.sendTransaction(topic, transaction);
  };

  // Function to disconnect from the wallet extension
  const disconnect = () => {
    hashconnect.disconnect(pairingData!.topic);
    setPairingData(null);
  };

  // Function to clear pairings and connections
  const clearPairings = () => {
    hashconnect.clearConnectionsAndData();
    setPairingData(null);
  };

  return (
    // Provide the HashConnect context to child components
    <HashConnectContext.Provider
      value={{
        hcData,
        hashconnect,
        topic,
        setTopic,
        pairingString,
        pairingData,
        availableExtension,
        state,
        connectToExtension,
        clearPairings,
        disconnect,
        sendTransaction,
      }}
    >
      {children}
    </HashConnectContext.Provider>
  );
}

// A custom hook to access the HashConnect context
export function useHashConnectContext() {
  return useContext(HashConnectContext);
}
