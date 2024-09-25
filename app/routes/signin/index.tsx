import { useState, useEffect } from "react";
import { useLoaderData, redirect, useFetcher } from "@remix-run/react";
import { getSession, commitSession } from "~/utils/session.server";
import { verify } from "bitcoinjs-message"; // For ECDSA signature verification
import { Verifier } from "bip322-js";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import Wallet, {
  Address,
  AddressPurpose,
  MessageSigningProtocols,
} from "sats-connect";

import { Button } from "~/components/ui/button";
import { useConnectionContext } from "~/hooks/app-providers";

export const loader = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (user) return redirect("/");

  // Generate a random nonce for the message
  const nonce = Math.random().toString(36).substring(2, 15);

  return { nonce };
};

export const action = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();

  const signedMessage = formData.get("signedMessage");
  const address = formData.get("address");
  const nonce = formData.get("nonce");
  const protocol = formData.get("protocol");

  if (!signedMessage || !address || !nonce || !protocol) {
    return { error: "Missing required fields" };
  }

  const message = `Sign this message to prove ownership of the address. Nonce: ${nonce}`;

  let isValid = false;

  if (protocol === MessageSigningProtocols.ECDSA) {
    // ECDSA verification using bitcoinjs-message
    isValid = verify(
      message,
      address.toString(),
      signedMessage.toString(),
      undefined,
      true
    );
  } else if (protocol === MessageSigningProtocols.BIP322) {
    // BIP322 verification
    isValid = Verifier.verifySignature(
      address.toString(),
      message,
      signedMessage.toString()
    );
  }

  if (isValid) {
    // If valid, set the session and redirect to the dashboard
    session.set("user", address);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    // If not valid, return an error
    return { error: "Signature verification failed" };
  }
};

const SignInWithBitcoin = ({
  addresses,
  nonce,
}: {
  addresses: Address[];
  nonce: string;
}) => {
  const fetcher = useFetcher<{ error: string }>();
  const [address, setAddress] = useState(addresses[0]?.address);
  const [protocol, setProtocol] = useState(MessageSigningProtocols.ECDSA);

  useEffect(() => {
    if (addresses.length > 0) {
      setAddress(addresses[0]?.address);
      setProtocol(MessageSigningProtocols.BIP322);
    }
  }, [addresses]);

  const message = `Sign this message to prove ownership of the address. Nonce: ${nonce}`;

  const handleSignIn = async () => {
    const response = await Wallet.request("signMessage", {
      message,
      address,
      protocol: protocol ? protocol : MessageSigningProtocols.ECDSA,
    });

    if (response.status === "success") {
      // Submit the signed message to the server via a POST request
      const formData = new FormData();
      formData.append("signedMessage", response.result.signature);
      formData.append("address", address);
      formData.append("nonce", nonce);
      formData.append("protocol", protocol);

      fetcher.submit(formData, { method: "post" });
    } else {
      alert("Message signing failed.");
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h1>Sign in with Bitcoin</h1>

        <p>Message to sign:</p>
        <span>
          <pre className="bg-gray-200 p-1 rounded-md"> {message}</pre>
        </span>
        <h3>Your Address</h3>
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

        <Select
          value={protocol}
          onValueChange={(value) =>
            setProtocol(value as MessageSigningProtocols)
          }
          disabled
        >
          <p>Protocol: </p>
          <SelectTrigger>
            <SelectValue placeholder="Select a protocol" />
          </SelectTrigger>

          <SelectContent>
            {/* <SelectItem value={MessageSigningProtocols.ECDSA}>
              {MessageSigningProtocols.ECDSA}
            </SelectItem> */}
            <SelectItem value={MessageSigningProtocols.BIP322}>
              {MessageSigningProtocols.BIP322}
            </SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSignIn}>Sign Message</Button>

        {fetcher.data?.error && <p>{fetcher.data.error}</p>}
      </CardContent>
    </Card>
  );
};

export default function SignIn() {
  const { nonce } = useLoaderData<{ nonce: string }>();
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const getAddresses = async () => {
      try {
        const response = await Wallet.request("getAddresses", {
          purposes: [AddressPurpose.Payment],
        });
        if (response.status === "success") {
          setAddresses(response.result.addresses);
        } else {
          console.error("Failed to get addresses:", response.error);
        }
      } catch (error) {
        console.error("Error getting addresses:", error);
      }
    };

    getAddresses();
  }, []);

  return <SignInWithBitcoin addresses={addresses} nonce={nonce} />;
}
