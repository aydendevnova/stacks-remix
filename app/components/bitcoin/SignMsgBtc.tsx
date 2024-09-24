import { Verifier } from "bip322-js";
import { verify } from "bitcoinjs-message";
import { useState } from "react";
import Wallet, {
  Address,
  MessageSigningProtocols,
  RpcErrorCode,
} from "sats-connect";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface Props {
  addresses: Address[];
}

type Result = {
  address: string;
  protocol: MessageSigningProtocols;
  signature: string;
  messageHash: string;
};
export const SignMsgBTC = ({ addresses }: Props) => {
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState(addresses[0]?.address);
  const [protocol, setProtocol] = useState(MessageSigningProtocols.BIP322);

  const [signedMessage, setSignedMessage] = useState<Result>();

  const onClick = async () => {
    const response = await Wallet.request("signMessage", {
      message,
      address,
      protocol: protocol
        ? (protocol as MessageSigningProtocols)
        : MessageSigningProtocols.ECDSA,
    });
    if (response.status === "success") {
      setSignedMessage(response.result);
      if (protocol === MessageSigningProtocols.ECDSA) {
        const verified = verify(
          message,
          address,
          response.result.signature,
          undefined,
          true
        );
        if (!verified) {
          alert("Signature verification failed");
          return;
        }
        console.log(`verified: ${verified}`);
      }
      if (protocol === MessageSigningProtocols.BIP322) {
        const verified = Verifier.verifySignature(
          address,
          message,
          response.result.signature
        );
        if (!verified) {
          alert("Signature verification failed");
          return;
        }
        console.log(`verified: ${verified}`);
      }
    } else if (response.error.code === RpcErrorCode.USER_REJECTION) {
      alert("User cancelled the request");
    } else {
      console.error(response.error);
      alert("Error sending BTC. See console for details.");
    }
  };

  return (
    <Card>
      <CardContent>
        <CardTitle>Sign Message</CardTitle>

        <>
          <div>
            <div>Message</div>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 15 }}>
            <div>Address</div>
            <Select value={address} onValueChange={setAddress}>
              <SelectTrigger>
                <SelectValue placeholder="Select an address" />
              </SelectTrigger>
              <SelectContent>
                {addresses.map((addr) => (
                  <SelectItem key={addr.address} value={addr.address}>
                    {addr.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div style={{ marginTop: 15 }}>
            <div>Protocol</div>
            <Select
              value={protocol}
              onValueChange={(value) =>
                setProtocol(value as MessageSigningProtocols)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MessageSigningProtocols.ECDSA}>
                  {MessageSigningProtocols.ECDSA}
                </SelectItem>
                <SelectItem value={MessageSigningProtocols.BIP322}>
                  {MessageSigningProtocols.BIP322}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={onClick}
            disabled={!message}
            style={{ marginTop: 15 }}
          >
            Sign Message
          </Button>
          {signedMessage && (
            <div>
              <h3>Message signed!</h3>
              <pre>
                <span>Address: {signedMessage.address}</span>
                <br />
                <span>Protocol: {signedMessage.protocol}</span>
                <br />
                <span>Signature: {signedMessage.signature}</span>
                <br />
                <span>Message Hash: {signedMessage.messageHash}</span>
              </pre>
            </div>
          )}
        </>
      </CardContent>
    </Card>
  );
};
