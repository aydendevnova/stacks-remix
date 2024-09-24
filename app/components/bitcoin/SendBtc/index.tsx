import { useCallback, useState } from "react";
import Wallet, { BitcoinNetworkType } from "sats-connect";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

interface Props {
  network: BitcoinNetworkType;
}

interface Recipient {
  address: string;
  amount: string;
}

export const SendBtc = ({ network }: Props) => {
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: "", amount: "" },
  ]);
  const [txnId, setTxnId] = useState("");

  const addRecipient = () => {
    setRecipients([...recipients, { address: "", amount: "" }]);
  };

  const updateRecipient = (
    index: number,
    field: keyof Recipient,
    value: string
  ) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index][field] = value;
    setRecipients(updatedRecipients);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      const updatedRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(updatedRecipients);
    }
  };

  const onClick = useCallback(() => {
    (async () => {
      const response = await Wallet.request("sendTransfer", {
        recipients: recipients.map((r) => ({
          address: r.address,
          amount: +r.amount,
        })),
      });

      if (response.status === "error") {
        console.error(response.error);
        alert("Error sending BTC. See console for details.");
        return;
      }

      setTxnId(response.result.txid);
      setRecipients([{ address: "", amount: "" }]);
    })().catch(console.error);
  }, [recipients]);

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://mempool.space/tx/${txnId}`
      : `https://mempool.space/testnet/tx/${txnId}`;

  return (
    <Card className="bg-white p-4 rounded-lg shadow-md">
      <CardContent>
        <CardTitle>Send BTC</CardTitle>

        {!txnId && (
          <>
            {recipients.map((recipient, index) => (
              <div key={index} className="mb-4">
                {index > 0 && <hr className="my-4" />}
                <h4 className="text-lg font-semibold mb-2">
                  Recipient {index + 1}
                </h4>
                <div className="mb-2">
                  <div className="mb-1">Amount (sats)</div>
                  <Input
                    type="number"
                    value={recipient.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateRecipient(index, "amount", e.target.value)
                    }
                  />
                </div>
                <div>
                  <div className="mb-1">Address</div>
                  <Input
                    type="text"
                    value={recipient.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateRecipient(index, "address", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-4 mb-4">
              <Button onClick={addRecipient} variant="outline" color="blue">
                Add Recipient
              </Button>
              {recipients.length > 1 && (
                <Button
                  onClick={() => removeRecipient(recipients.length - 1)}
                  variant="outline"
                  color="red"
                >
                  Remove Recipient
                </Button>
              )}
            </div>
            <Button
              onClick={onClick}
              disabled={recipients.some((r) => !r.amount || !r.address)}
            >
              Send
            </Button>
          </>
        )}
        {txnId && (
          <div className="text-green-500">
            Success! Click{" "}
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline"
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
