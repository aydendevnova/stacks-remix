import {
  cvToString,
  noneCV,
  standardPrincipalCV,
  uintCV,
} from "@stacks/transactions";
import { ChangeEventHandler, useState } from "react";
import Wallet, { Address, BitcoinNetworkType } from "sats-connect";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

// TODO use emptry strings once done testing
const formInitialState = {
  amount: "100000000", // 100LEO
  contract: "SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token", // LEO token contract
  address: "SP313FW47A0XR7HCBFQ0ZZHS47Q265AEBMPK1GD4N", // account 2
  memo: "",
};

const formInputs: {
  field: keyof typeof formInitialState;
  label: string;
  type: "text" | "number";
}[] = [
  {
    field: "contract",
    label: "Contract",
    type: "text",
  },
  {
    field: "amount",
    label: "Amount",
    type: "number",
  },
  {
    field: "address",
    label: "Address",
    type: "text",
  },
  {
    field: "memo",
    label: "Memo (optional)",
    type: "text",
  },
];

export const SendSip10 = ({
  network,
  stxAddressInfo,
}: {
  network: BitcoinNetworkType;
  stxAddressInfo: Address[];
}) => {
  const [form, setForm] = useState(formInitialState);
  const [txnId, setTxnId] = useState("");

  const canSubmit = form.amount && form.address && form.contract;

  const getChangeFormHandler =
    (
      fieldName: keyof typeof formInitialState
    ): ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      setForm((prevForm) => ({ ...prevForm, [fieldName]: e.target.value }));
    };

  const onClick = () => {
    (async () => {
      const response = await Wallet.request("stx_callContract", {
        contract: form.contract,
        functionName: "transfer",
        arguments: [
          uintCV(+form.amount),
          standardPrincipalCV(stxAddressInfo?.[0].address),
          standardPrincipalCV(form.address),
          noneCV(),
        ].map((arg) => cvToString(arg)),
      });

      if (response.status === "error") {
        console.error(response.error);
        alert("Error sending. See console for details.");
        return;
      }

      setTxnId(response.result.txid);
      setForm(formInitialState);
    })().catch(console.error);
  };

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://explorer.hiro.so/txid/${txnId}`
      : `https://explorer.hiro.so/txid/${txnId}?chain=testnet`;

  return (
    <Card>
      <CardContent>
        <CardTitle>Send SIP-10</CardTitle>
        {!txnId && (
          <div className="flex flex-col space-y-4">
            {formInputs.map(({ field, label, type }) => (
              <Input
                key={field}
                // label={label}
                type={type}
                value={form[field]}
                onChange={getChangeFormHandler(field)}
              />
            ))}
            <Button onClick={onClick} disabled={!canSubmit}>
              Send
            </Button>
          </div>
        )}
        {txnId && (
          <div className="text-green-500">
            Success! Click{" "}
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              here
            </a>{" "}
            to see your transaction
          </div>
        )}
      </CardContent>
    </Card>
  );
};
