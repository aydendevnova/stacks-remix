import { useCallback, useState } from "react";
import Wallet, { BitcoinNetworkType } from "sats-connect";
import { Button } from "~/components/ui/button";

import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

interface Props {
  network: BitcoinNetworkType;
}

export const SendStx = ({ network }: Props) => {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [txnId, setTxnId] = useState("");

  const onClick = useCallback(() => {
    (async () => {
      const response = await Wallet.request("stx_transferStx", {
        recipient: address,
        amount: +amount,
        memo: memo === "" ? undefined : memo,
      });

      if (response.status === "error") {
        console.error(response.error);
        alert("Error sending STX. See console for details.");
        return;
      }

      setTxnId(response.result.txid);
      setAmount("");
      setAddress("");
    })().catch(console.error);
  }, [address, amount, memo]);

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://explorer.hiro.so/txid/${txnId}`
      : `https://explorer.hiro.so/txid/${txnId}?chain=testnet`;

  return (
    <Card>
      <CardContent>
        <CardTitle>Send STX</CardTitle>
        {!txnId && (
          <div className="flex flex-col space-y-4">
            <div>
              <div>Amount (uSTX)</div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <div>Address</div>
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <div>Memo</div>
              <Input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
            <Button onClick={onClick} disabled={!amount || !address}>
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
