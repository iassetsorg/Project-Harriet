import React from "react";

const Banner = () => {
  return (
    <div className="bg-indigo-400 text-sm font-normal text-white p-1 shadow-md sm:p-1 text-center flex justify-center space-x-1">
      <a
        href="https://pancakeswap.finance/swap?inputCurrency=BNB&outputCurrency=0x6b471d5ab9f3d92a600e7d49a0b135bf6d4c6a5b"
        className="py-2 px-3   font-semibold text-gray-800 bg-indigo-300 rounded-xl hover:bg-indigo-400 transition duration-300"
        target="blank"
      >
        ASSET (BSC)
      </a>
      <a
        href="https://www.saucerswap.finance/swap/HBAR/0.0.1991880"
        className="font-semibold py-1 px-2  text-gray-800 bg-indigo-300 rounded-xl hover:bg-indigo-400 transition duration-300"
        target="blank"
      >
        ASSET (HTS)
      </a>
      <a
        href="https://iassets.org/upgrade/"
        className="font-semibold py-1 px-2 items-center  text-gray-800 bg-indigo-300 rounded-xl hover:bg-indigo-400 transition duration-300"
        target="blank"
      >
        BSC{">>"}HTS
      </a>
      <a
        href="https://sentx.io/nft-marketplace/0.0.3844404"
        className="font-semibold py-1 px-2  text-gray-800 bg-indigo-300 rounded-xl hover:bg-indigo-400 transition duration-300"
        target="blank"
      >
        The First Flight
      </a>
    </div>
  );
};

export default Banner;
