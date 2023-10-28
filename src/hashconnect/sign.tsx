import {
  Client,
  PrivateKey,
  Transaction,
  AccountId,
  TransactionId,
  PublicKey,
} from "@hashgraph/sdk";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

interface SingingContext {
  signAndMakeBytes: Function;
  makeBytes: Function;
  signData: Function;
  verifyData: Function;
  acc: string;
  publicKey: string;
}

export const SigningContext = createContext<SingingContext>({
  signAndMakeBytes: () => {},
  makeBytes: () => {},
  signData: () => {},
  verifyData: () => {},
  acc: "",
  publicKey: "",
});

const SingingProvider = ({ children }: PropsWithChildren) => {
  const [client] = useState<Client>(Client.forMainnet());
  const pk = "024ea9065c5f0ed86837136efa89acae054530bf24ef35afd0b55b359b7cde31";
  const publicKey =
    "afd60888fd0536ae5d1150f92ffe5db53ee7be678924a35f898d920b994f7777";
  const acc = "0.0.3928962";

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    client.setOperator(acc, pk);
  };

  const signAndMakeBytes = async (
    trans: Transaction,
    signingAcctId: string
  ) => {
    const privKey = PrivateKey.fromString(pk);
    const pubKey = privKey.publicKey;
    let nodeId = [new AccountId(5)];
    let transId = TransactionId.generate(signingAcctId);
    trans.setNodeAccountIds(nodeId);
    trans.setTransactionId(transId);
    trans = await trans.freeze();
    let transBytes = trans.toBytes();
    const sig = await privKey.signTransaction(
      Transaction.fromBytes(transBytes) as any
    );
    const out = trans.addSignature(pubKey, sig);
    const outBytes = out.toBytes();
    return outBytes;
  };

  const makeBytes = async (trans: Transaction, signingAcctId: string) => {
    let transId = TransactionId.generate(signingAcctId);
    trans.setTransactionId(transId);
    trans.setNodeAccountIds([new AccountId(3)]);

    await trans.freeze();

    let transBytes = trans.toBytes();

    return transBytes;
  };

  const signData = (
    data: object
  ): { signature: Uint8Array; serverSigningAccount: string } => {
    const privKey = PrivateKey.fromString(pk);
    const pubKey = privKey.publicKey;

    let bytes = new Uint8Array(Buffer.from(JSON.stringify(data)));

    let signature = privKey.sign(bytes);

    let verify = pubKey.verify(bytes, signature);

    return { signature: signature, serverSigningAccount: acc };
  };

  const verifyData = (
    data: object,
    publicKey: string,
    signature: Uint8Array
  ): boolean => {
    const pubKey = PublicKey.fromString(publicKey);

    let bytes = new Uint8Array(Buffer.from(JSON.stringify(data)));

    let verify = pubKey.verify(bytes, signature);

    return verify;
  };

  return (
    <SigningContext.Provider
      value={{
        signAndMakeBytes,
        makeBytes,
        signData,
        verifyData,
        acc,
        publicKey,
      }}
    >
      {children}
    </SigningContext.Provider>
  );
};

export default SingingProvider;
export function useSigningContext() {
  return useContext(SigningContext);
}
