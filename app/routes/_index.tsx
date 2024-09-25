import type {
  MetaFunction,
  ActionFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { getSession, signOut } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type LoaderData = {
  user: string | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  return json<LoaderData>({ user });
};

type WalletInfo = {
  balance: number;
  unconfirmed_balance: number;
  confirmed_balance: number;
  inscription_balance: number;
  frozen_balance: number;
  utxo_count: number;
  inscriptions: any[];
  brc20: any[];
};

type ActionData = {
  walletInfo?: WalletInfo;
  error?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (request.method === "DELETE") {
    return redirect("/", {
      headers: {
        "Set-Cookie": await signOut(request),
      },
    });
  }

  if (!user) {
    return json<ActionData>({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `https://turbo.ordinalswallet.com/wallet/${user}`
    );
    const data: WalletInfo = await response.json();
    console.log("Wallet information:", data);

    return json<ActionData>({ walletInfo: data });
  } catch (error) {
    console.error("Error fetching wallet information:", error);
    return json<ActionData>(
      { error: "Failed to fetch wallet information" },
      { status: 500 }
    );
  }
};

export default function Index() {
  const { user } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<ActionData>();

  const handleGetInfo = () => {
    if (user) {
      fetcher.submit(null, { method: "post" });
    }
  };

  const handleSignOut = () => {
    fetcher.submit(null, { method: "delete" });
  };

  return (
    <div className="bg-black p-4 m-4 rounded-xl text-[#aeaeae] text-[calc(10px+1vmin)] flex flex-col items-center justify-center">
      <div className="flex items-center">
        <img
          src="/sats-connect.svg"
          alt="SatsConnect"
          className="w-[200px] p-[10px]"
        />
        <div className="w-[140px]">
          <img src="/logo-dark.png" alt="Remix" className="" />
        </div>{" "}
        <p className="ml-2">Edition by Red Block Labs</p>
      </div>
      {user ? (
        <div className="mt-12">
          <Button onClick={handleGetInfo} className="py-2 px-4 rounded mr-2">
            Get Wallet Information
          </Button>
          <Button onClick={handleSignOut} className="py-2 px-4 rounded">
            Sign Out
          </Button>
          {fetcher.state === "idle" && fetcher.data ? (
            <div className="mt-4">
              <h2>Your Wallet Information from the Server:</h2>
              <pre>{JSON.stringify(fetcher.data.walletInfo, null, 2)}</pre>
            </div>
          ) : fetcher.state === "submitting" ? (
            <p>Loading your wallet information...</p>
          ) : null}
        </div>
      ) : (
        <div className="mt-12">
          <p className="mb-4">
            Please sign in to view your wallet information.
          </p>
          <Link to="/signin" className="mt-4">
            <Button className="py-2 px-4 rounded">Sign In</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
