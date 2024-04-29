import { useState, useEffect } from "react";
import { useHashConnectContext } from "../../hashconnect/hashconnect";
import useProfileData from "../../hooks/use_profile_data";
import { toast } from "react-toastify";
import useSendMessage from "../../hooks/use_send_message";
import {
  TransactionReceipt,
  PublicKey,
  AccountId,
  TransferTransaction,
  Hbar,
} from "@hashgraph/sdk";
import { useSigningContext } from "../../hashconnect/sign";
const Tip = ({
  onClose,
  author,
  topicId,
}: {
  onClose: () => void;
  author: string | null | undefined;
  topicId: string;
}) => {
  const { signAndMakeBytes } = useSigningContext();
  const { sendTransaction, pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const senderId = AccountId.fromString(String(signingAccount));
  const receiverId = AccountId.fromString(String(author));
  const [amountToSend, setAmountToSend] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("ASSET");

  const send = async () => {
    const amount = parseFloat(amountToSend);

    if (isNaN(amount)) {
      toast.error("Invalid amount");
      return;
    }

    let transaction;

    if (selectedToken === "HBAR") {
      transaction = new TransferTransaction()
        .addHbarTransfer(senderId, -(amount * 0.99))
        .addHbarTransfer(receiverId, amount * 0.99)
        .addHbarTransfer(senderId, -(amount * 0.01))
        .addHbarTransfer("0.0.2278621", amount * 0.01)
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } HBAR | For: ${topicId}`
        );
    }
    if (selectedToken === "ASSET") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.1991880", senderId, -(amount * 1000000) * 0.99)
        .addTokenTransfer("0.0.1991880", receiverId, amount * 1000000 * 0.99)
        .addTokenTransfer("0.0.1991880", senderId, -(amount * 1000000) * 0.01)
        .addTokenTransfer("0.0.1991880", "0.0.2278621", amount * 1000000 * 0.01)
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } ASSET | For: ${topicId}`
        );
    }

    if (selectedToken === "SAUCE") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.731861", senderId, -(amount * 1000000) * 0.99)
        .addTokenTransfer("0.0.731861", receiverId, amount * 1000000 * 0.99)
        .addTokenTransfer("0.0.731861", senderId, -(amount * 1000000) * 0.01)
        .addTokenTransfer("0.0.731861", "0.0.2278621", amount * 1000000 * 0.01)
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } SAUCE | For: ${topicId}`
        );
    }

    if (selectedToken === "USDC") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.456858", senderId, -(amount * 1000000) * 0.99)
        .addTokenTransfer("0.0.456858", receiverId, amount * 1000000 * 0.99)
        .addTokenTransfer("0.0.456858", senderId, -(amount * 1000000) * 0.01)
        .addTokenTransfer("0.0.456858", "0.0.2278621", amount * 1000000 * 0.01)
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } USDC | For: ${topicId}`
        );
    }
    if (selectedToken === "XPH") {
      transaction = new TransferTransaction()
        .addTokenTransfer(
          "0.0.4351436",
          senderId,
          -(amount * 100000000000000000) * 0.99
        )
        .addTokenTransfer(
          "0.0.4351436",
          receiverId,
          amount * 100000000000000000 * 0.99
        )
        .addTokenTransfer(
          "0.0.4351436",
          senderId,
          -(amount * 100000000000000000) * 0.01
        )
        .addTokenTransfer(
          "0.0.4351436",
          "0.0.2278621",
          amount * 100000000000000000 * 0.01
        )
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } XPH | For: ${topicId}`
        );
    }

    if (selectedToken === "GRELF") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.1159074", senderId, -(amount * 100000000) * 0.99)
        .addTokenTransfer("0.0.1159074", receiverId, amount * 100000000 * 0.99)
        .addTokenTransfer("0.0.1159074", senderId, -(amount * 100000000) * 0.01)
        .addTokenTransfer(
          "0.0.1159074",
          "0.0.2278621",
          amount * 100000000 * 0.01
        )
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } GRELF | For: ${topicId}`
        );
    }

    if (selectedToken === "DOVU") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.3716059", senderId, -(amount * 100000000) * 0.99)
        .addTokenTransfer("0.0.3716059", receiverId, amount * 100000000 * 0.99)
        .addTokenTransfer("0.0.3716059", senderId, -(amount * 100000000) * 0.01)
        .addTokenTransfer(
          "0.0.3716059",
          "0.0.2278621",
          amount * 100000000 * 0.01
        )
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } DOVU | For: ${topicId}`
        );
    }

    if (selectedToken === "SAUCEINU") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.2964435", senderId, -(amount * 10000000) * 0.99)
        .addTokenTransfer("0.0.2964435", receiverId, amount * 10000000 * 0.99)
        .addTokenTransfer("0.0.2964435", senderId, -(amount * 10000000) * 0.01)
        .addTokenTransfer(
          "0.0.2964435",
          "0.0.2278621",
          amount * 10000000 * 0.01
        )
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } SAUCEINU | For: ${topicId}`
        );
    }

    if (selectedToken === "JAM") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.127877", senderId, -(amount * 100000000) * 0.99)
        .addTokenTransfer("0.0.127877", receiverId, amount * 1000000_00 * 0.99)
        .addTokenTransfer(
          "0.0.127877",
          senderId,
          -(amount * 1_000_000_00) * 0.01
        )
        .addTokenTransfer(
          "0.0.127877",
          "0.0.2278621",
          amount * 1_000_000_00 * 0.01
        )
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } JAM | For: ${topicId}`
        );
    }

    if (selectedToken === "HSUITE") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.786931", senderId, -(amount * 10_000) * 0.99)
        .addTokenTransfer("0.0.786931", receiverId, amount * 10_000 * 0.99)
        .addTokenTransfer("0.0.786931", senderId, -(amount * 10_000) * 0.01)
        .addTokenTransfer("0.0.786931", "0.0.2278621", amount * 10_000 * 0.01)
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } HSUITE | For: ${topicId}`
        );
    }

    if (selectedToken === "BSL") {
      transaction = new TransferTransaction()
        .addTokenTransfer(
          "0.0.4431990",
          senderId,
          -(amount * 1_000_00000) * 0.99
        )
        .addTokenTransfer("0.0.4431990", receiverId, amount * 100000000 * 0.99)
        .addTokenTransfer("0.0.4431990", senderId, -(amount * 100000000) * 0.01)
        .addTokenTransfer(
          "0.0.4431990",
          "0.0.2278621",
          amount * 100000000 * 0.01
        )
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } BSL | For: ${topicId}`
        );
    }

    if (selectedToken === "BULLBAR") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.3155326", senderId, -(amount * 1000000) * 0.99)
        .addTokenTransfer("0.0.3155326", receiverId, amount * 1000000 * 0.99)
        .addTokenTransfer("0.0.3155326", senderId, -(amount * 1000000) * 0.01)
        .addTokenTransfer("0.0.3155326", "0.0.2278621", amount * 1000000 * 0.01)
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } BULLBAR | For: ${topicId}`
        );
    }

    if (selectedToken === "MFM") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.4599983", senderId, -(amount * 100000000) * 0.99)
        .addTokenTransfer("0.0.4599983", receiverId, amount * 100000000 * 0.99)
        .addTokenTransfer("0.0.4599983", senderId, -(amount * 100000000) * 0.01)
        .addTokenTransfer(
          "0.0.4599983",
          "0.0.2278621",
          amount * 100000000 * 0.01
        )
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } MFM | For: ${topicId}`
        );
    }

    if (selectedToken === "NARDOGE") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.4562198", senderId, -(amount * 100000000) * 0.99)
        .addTokenTransfer("0.0.4562198", receiverId, amount * 100000000 * 0.99)
        .addTokenTransfer("0.0.4562198", senderId, -(amount * 100000000) * 0.01)
        .addTokenTransfer(
          "0.0.4562198",
          "0.0.2278621",
          amount * 100000000 * 0.01
        )
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } NARDOGE | For: ${topicId}`
        );
    }

    if (selectedToken === "KARATE") {
      transaction = new TransferTransaction()
        .addTokenTransfer("0.0.2283230", senderId, -(amount * 100000000) * 0.99)
        .addTokenTransfer("0.0.2283230", receiverId, amount * 100000000 * 0.99)
        .addTokenTransfer("0.0.2283230", senderId, -(amount * 100000000) * 0.01)
        .addTokenTransfer(
          "0.0.2283230",
          "0.0.2278621",
          amount * 100000000 * 0.01
        )
        .setTransactionMemo(
          `iBird Tip | ${senderId} >> ${receiverId} | Amount: ${
            amount * 0.99
          } KARATE | For: ${topicId}`
        );
    }

    const transactionBytes = await signAndMakeBytes(
      transaction,
      signingAccount
    );
    const response = await sendTransaction(
      transactionBytes,
      signingAccount,
      false
    );
    const receiptBytes = response.receipt as Uint8Array;

    if (response.success) {
      const responseData = {
        transactionId: response.response.transactionId,
        receipt: TransactionReceipt.fromBytes(receiptBytes),
      };
      toast(String(responseData.receipt.status));
    }
    if (response.error) {
      toast.error(`${JSON.stringify(response.error.status)}`);
    }
  };
  const TokenOptions = [
    "HBAR",
    "ASSET",
    "USDC",
    "SAUCE",
    "GRELF",
    "XPH",
    "DOVU",
    "SAUCEINU",
    "JAM",
    "HSUITE",
    "BSL",
    "BULLBAR",
    "MFM",
    "NARDOGE",
    "KARATE",
  ];

  return (
    <div className="max-w-md w-full mx-auto bg-background rounded-lg shadow-xl p-4 text-text">
      <h3 className="text-xl py-4 font-semibold text-primary">
        You are Tipping {author}
      </h3>

      {/* a form to get sending amount and select Token */}
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault(); // Prevent form submission (and page refresh)
          send();
        }}
      >
        <input
          type="text"
          placeholder="Amount"
          value={amountToSend}
          onChange={(e) => setAmountToSend(e.target.value)}
          className="w-full p-2 text-sm border border-primary rounded bg-background text-text"
        />

        <div className="grid grid-cols-3 gap-4">
          {TokenOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedToken(option)}
              type="button" // Specify the button type
              className={`p-2  text-sm rounded ${
                selectedToken === option
                  ? "bg-primary text-background"
                  : "bg-background text-text border border-primary"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-3 px-6 font-semibold text-background bg-primary rounded-full hover:bg-secondary transition duration-300 "
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Tip;
