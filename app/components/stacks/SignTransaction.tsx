import { BitcoinNetworkType } from "@sats-connect/core";
import {
  PostConditionMode,
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
  uintCV,
} from "@stacks/transactions";
import { useState } from "react";
import { request } from "sats-connect";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";

const codeBody = `
(define-data-var greeting (string-ascii 100) "Hello, World!")

(define-read-only (get-greeting)
  (ok (var-get greeting))
)

(define-public (set-greeting (new-greeting (string-ascii 100)))
  (begin
    (var-set greeting new-greeting)
    (ok new-greeting))
)
`;

function uint8ArrayToHex(uint8Array: Uint8Array) {
  return Array.from(uint8Array, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

const errorMessage = "Error signing transaction. Check console for error logs.";

interface Props {
  network: BitcoinNetworkType; // TODO handle networks
  publicKey: string;
}

export function SignTransaction({ publicKey }: Props) {
  const [broadcast, setBroadcast] = useState(false);
  const [postConditionMode, setPostConditionMode] = useState<PostConditionMode>(
    PostConditionMode.Deny
  );

  const requestSignTransaction = async (transaction: any) => {
    try {
      const response = await request("stx_signTransaction", {
        transaction: uint8ArrayToHex(transaction.serialize()),
        broadcast,
      });
      if (response.status === "success") {
        alert("Success! Check console for result.");
        console.log(response.result.transaction);
      } else {
        alert("Error signing transaction. Check console for error logs");
        console.error(response.error);
      }
    } catch (error) {
      alert(errorMessage);
      console.error(error);
    }
  };

  const handleSignTransactionContractCallClick = async () => {
    const transaction = await makeUnsignedContractCall({
      fee: 3000,
      anchorMode: "onChainOnly",
      contractAddress: "SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP",
      contractName: "pox-fast-pool-v2",
      functionName: "set-stx-buffer",
      functionArgs: [uintCV(1)],
      postConditionMode,
      publicKey,
    });
    requestSignTransaction(transaction);
  };

  const handleSignTransactionSTXTokenTransferClick = async () => {
    const transaction = await makeUnsignedSTXTokenTransfer({
      anchorMode: "any",
      fee: 3000,
      recipient: "SP2FFKDKR122BZWS7GDPFWC0J0FK4WMW5NPQ0Z21M", // account 4
      amount: 1000,
      publicKey,
    });
    requestSignTransaction(transaction);
  };

  const handleSignTransactionContractDeployClick = async () => {
    const transaction = await makeUnsignedContractDeploy({
      anchorMode: "any",
      contractName: "my-contract",
      codeBody,
      fee: 3000,
      postConditionMode,
      publicKey,
    });
    requestSignTransaction(transaction);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign transaction</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="broadcast"
            checked={broadcast}
            onCheckedChange={() => setBroadcast((prev) => !prev)}
          />
          <label htmlFor="broadcast">
            Broadcast: {broadcast ? "True" : "False"}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="postConditionMode"
            checked={postConditionMode === PostConditionMode.Allow}
            onCheckedChange={() =>
              setPostConditionMode((prev) =>
                prev === PostConditionMode.Allow
                  ? PostConditionMode.Deny
                  : PostConditionMode.Allow
              )
            }
          />
          <label htmlFor="postConditionMode">
            Post condition mode:{" "}
            {postConditionMode === PostConditionMode.Allow ? "Allow" : "Deny"}
          </label>
        </div>
        <Button onClick={handleSignTransactionSTXTokenTransferClick}>
          Sign Transaction (token transfer)
        </Button>
        <Button onClick={handleSignTransactionContractCallClick}>
          Sign Transaction (contract call)
        </Button>
        <Button onClick={handleSignTransactionContractDeployClick}>
          Sign Transaction (contract deploy)
        </Button>
      </CardContent>
    </Card>
  );
}
