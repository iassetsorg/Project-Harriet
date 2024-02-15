import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const IpfsSettings = ({ onClose }: { onClose: () => void }) => {
  const storedIpfsKey = localStorage.getItem("ipfsKey") || "";
  const [ipfsKey, setIpfsKey] = useState(storedIpfsKey);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIpfsKey(e.target.value);
  };

  const saveIpfsKey = () => {
    localStorage.setItem("ipfsKey", ipfsKey);
    toast.success("IPFS Key saved successfully");
  };

  useEffect(() => {
    // Check local storage for the IPFS key and update the state
    const storedIpfsKey = localStorage.getItem("ipfsKey") || "";
    setIpfsKey(storedIpfsKey);
  }, []);

  return (
    <div className="max-w-md w-full mx-auto bg-gray-800 rounded-lg shadow-xl p-4 text-white">
      <h3 className="text-xl py-4 font-semibold text-indigo-300">
        Upload Media
      </h3>

      <p className="text-gray-300 mb-4">
        Your Media is stored on IPFS. IPFS is a decentralized storage network.
        To upload media on iBird, you need to have an IPFS key. Follow the steps
        below to get an API Token:
      </p>

      <ol className="list-decimal text-gray-300 mb-4 ml-6">
        <li>
          Click API Keys to go to your{" "}
          <a
            href="https://nft.storage/manage/"
            target="_blank"
            className="text-indigo-300"
          >
            NFT.Storage
          </a>{" "}
          account page.
        </li>
        <li>Click Create an API token.</li>
        <li>Enter a descriptive name for your API token and click Create.</li>
        <li>Make a note of the Token field somewhere secure.</li>
        <li>
          You can click Copy to copy your new API token to your clipboard.
        </li>
      </ol>

      <div className="mb-3">
        <label className="text-gray-300 ml-1">Enter your IPFS Key:</label>
        <input
          type="text"
          value={ipfsKey}
          onChange={handleKeyChange}
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
        />
      </div>

      <button
        onClick={saveIpfsKey}
        className="w-full py-3 px-6 font-semibold text-gray-800 bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300 "
      >
        Save IPFS Key
      </button>

      <button
        onClick={onClose}
        className="mt-4 w-full py-3 px-6 font-semibold text-gray-800 bg-red-500 rounded-full hover:bg-red-600 transition duration-300 "
      >
        Close
      </button>
    </div>
  );
};

export default IpfsSettings;
