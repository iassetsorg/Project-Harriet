import React, { FC, useEffect, useState } from "react";
import QRCode from "qrcode.react";

import { useHashConnectContext } from "./hashconnect";
import { IoCopyOutline } from "react-icons/io5";
import { toast } from "react-toastify";

const Pair: FC = () => {
  const { state, pairingString, connectToExtension } = useHashConnectContext();
  const [copySuccess, setCopySuccess] = useState("");

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(pairingString);
    toast("Copied to Clipboard");
  };

  return (
    <div className="m-4 space-y-3 text-center text-white bg-background p-6 rounded-lg">
      <a
        href="https://www.hashpack.app/"
        target="blank"
        className="text-lg font-semibold mb-2 hover:underline text-primary"
      >
        HashPack
      </a>
      <button
        onClick={(event) => connectToExtension(event)}
        className=" w-full text-lg text-center py-2 px-3   font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
      >
        Connect
      </button>

      {/* <h2 className="text-lg text-center mb-4">Code</h2> */}
      <div className="flex justify-between items-center border border-gray-600 rounded bg-gray-700">
        <input
          type="text"
          className="w-full p-2 mr-2 text-sm rounded bg-gray-700 text-white"
          value={pairingString}
          readOnly
        />
        <button className="  " onClick={copyToClipboard}>
          <IoCopyOutline className="text-3xl mr-2 hover:text-primary rounded p-1" />
        </button>
      </div>
      <span className="text-green-500">{copySuccess}</span>

      {/* <h2 className="text-lg text-center  mb-4">QR Code</h2> */}
      <div className="flex justify-center">
        {pairingString ? (
          <QRCode
            value={pairingString}
            size={200}
            level={"M"}
            className="shadow-2xl"
          />
        ) : (
          <div className="flex items-center justify-center w-64 h-64 border border-gray-500 rounded-full">
            <span className="text-gray-400">No QR code</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pair;
