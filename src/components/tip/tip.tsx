import { useState } from "react";

import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import { toast } from "react-toastify";
import {
  useWallet,
  useWatchTransactionReceipt,
} from "@buidlerlabs/hashgraph-react-wallets";

import { AccountId, TransferTransaction, Signer } from "@hashgraph/sdk";

const tokenData = {
  HBAR: { tokenId: null, multiplier: 1 },
  ASSET: { tokenId: "0.0.1991880", multiplier: 1_000_000 },
  USDC: { tokenId: "0.0.456858", multiplier: 1_000_000 },
  SAUCE: { tokenId: "0.0.731861", multiplier: 1_000_000 },
  GRELF: { tokenId: "0.0.1159074", multiplier: 100_000_000 },
  DOVU: { tokenId: "0.0.3716059", multiplier: 100_000_000 },
  JAM: { tokenId: "0.0.127877", multiplier: 100_000_000 },
  HSUITE: { tokenId: "0.0.786931", multiplier: 10_000 },
  BSL: { tokenId: "0.0.4431990", multiplier: 100_000_000 },
  BULLBAR: { tokenId: "0.0.3155326", multiplier: 1_000_000 },
  KARATE: { tokenId: "0.0.2283230", multiplier: 100_000_000 },
  BTCℏ: { tokenId: "0.0.4873177", multiplier: 100_000_000 },
};

const Tip = ({
  onClose,
  author,
  topicId,
}: {
  onClose: () => void;
  author: string | null | undefined;
  topicId: string;
}) => {
  const { data: signingAccount } = useAccountId();
  const senderId = AccountId.fromString(String(signingAccount));
  const receiverId = AccountId.fromString(String(author));
  const [amountToSend, setAmountToSend] = useState<string>("");
  const [selectedToken, setSelectedToken] =
    useState<keyof typeof tokenData>("ASSET");
  const [isSending, setIsSending] = useState<boolean>(false);

  const wallet = useWallet();
  const signer = wallet.signer as Signer;

  const { watch } = useWatchTransactionReceipt();

  const send = async () => {
    const amount = parseFloat(amountToSend);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }

    const tokenInfo = tokenData[selectedToken];
    if (!tokenInfo) {
      toast.error("Invalid token selected.");
      return;
    }

    setIsSending(true);

    try {
      let transaction;
      const feePercentage = 0.01;
      const netAmount = amount * (1 - feePercentage);
      const feeAmount = amount * feePercentage;

      if (selectedToken === "HBAR") {
        transaction = new TransferTransaction()
          .addHbarTransfer(senderId, -amount)
          .addHbarTransfer(receiverId, netAmount)
          .addHbarTransfer("0.0.2278621", feeAmount)
          .setTransactionMemo(
            `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${netAmount.toFixed(
              8
            )} HBAR | For: ${topicId}`
          );
      } else {
        const { tokenId, multiplier } = tokenInfo;
        const amountInTinyUnits = amount * multiplier;
        const netAmountInTinyUnits = netAmount * multiplier;
        const feeAmountInTinyUnits = feeAmount * multiplier;

        transaction = new TransferTransaction()
          .addTokenTransfer(tokenId!, senderId, -amountInTinyUnits)
          .addTokenTransfer(tokenId!, receiverId, netAmountInTinyUnits)
          .addTokenTransfer(tokenId!, "0.0.2278621", feeAmountInTinyUnits)
          .setTransactionMemo(
            `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${netAmount.toFixed(
              8
            )} ${selectedToken} | For: ${topicId}`
          );
      }

      const signTx = await transaction.freezeWithSigner(signer);
      const txResponse = await signTx.executeWithSigner(signer);

      const tx = await watch(txResponse.transactionId.toString(), {
        onSuccess: (transaction) => transaction,
        onError: (error) => error,
      });

      if (tx.result.toString() === "SUCCESS") {
        toast.success("Tip sent successfully!");
        setAmountToSend("");
        onClose();
      } else {
        toast.error(`Transaction failed: ${tx.result.toString()}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || "An unknown error occurred."}`);
    } finally {
      setIsSending(false);
    }
  };

  const TokenOptions = Object.keys(tokenData) as Array<keyof typeof tokenData>;

  return (
    <div className="max-w-md w-full mx-auto bg-background rounded-lg shadow-xl p-6 text-text">
      <h3 className="text-2xl pb-4 font-semibold text-primary text-center">
        Tip {author}
      </h3>

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div>
          <label className="block text-sm font-medium mb-2">
            Amount to Send
          </label>
          <input
            type="number"
            step="any"
            min="0"
            placeholder="Enter amount"
            value={amountToSend}
            onChange={(e) => setAmountToSend(e.target.value)}
            className="w-full p-3 text-sm border border-primary rounded bg-background text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Token</label>
          <div className="grid grid-cols-3 gap-2">
            {TokenOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedToken(option)}
                type="button"
                className={`py-2 px-1 text-sm rounded ${
                  selectedToken === option
                    ? "bg-primary text-background"
                    : "bg-background text-text border border-primary"
                } focus:outline-none focus:ring-2 focus:ring-secondary`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSending}
          className={`w-full py-3 px-6 font-semibold text-background bg-primary rounded-full hover:bg-secondary transition duration-300 ${
            isSending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSending ? "Sending..." : "Send Tip"}
        </button>
      </form>
    </div>
  );
};

export default Tip;
