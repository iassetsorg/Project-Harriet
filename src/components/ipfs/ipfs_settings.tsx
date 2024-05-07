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
    <div className="max-w-md w-full mx-auto bg-background rounded-lg shadow-xl p-4 text-text">
      <h3 className="text-xl py-4 font-semibold text-primary">Upload Media</h3>

      <p className="text-text mb-4">
        Your Media is stored on IPFS. IPFS is a decentralized storage network.
        To upload media on iBird, you need to have an IPFS key. Follow the steps
        below to get an API Token:
      </p>

      <ol className="list-decimal text-text mb-4 ml-6">
        <li>
          Click API Keys to go to your{" "}
          <a
            href="https://app.nft.storage/v1/docs/how-to/api-key"
            target="_blank"
            className="text-primary"
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
        <label className="text-text ml-1">Enter your IPFS Key:</label>
        <input
          type="text"
          value={ipfsKey}
          onChange={handleKeyChange}
          className="w-full px-4 py-2 rounded-lg bg-secondary text-text"
        />
      </div>

      <button
        onClick={saveIpfsKey}
        className="w-full py-3 px-6 font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300 "
      >
        Save IPFS Key
      </button>

      <button
        onClick={onClose}
        className="mt-4 w-full py-3 px-6 font-semibold text-background bg-error hover:bg-secondary hover:text-text rounded-full  transition duration-300 "
      >
        Close
      </button>
    </div>
  );
};

export default IpfsSettings;
