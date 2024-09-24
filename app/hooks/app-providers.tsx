import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Wallet, {
  AddressPurpose,
  BitcoinNetworkType,
  type Address,
} from "sats-connect";

import { NetworkSelector } from "~/components/NetworkSelector";
import useLocalStorage from "./useLocalStorage";
import { Button } from "~/components/ui/button";

const ConnectionContext = createContext<{
  network: BitcoinNetworkType;
  btcAddressInfo: Address[];
  stxAddressInfo: Address[];
  onDisconnect: () => void;
}>({
  network: BitcoinNetworkType.Mainnet,
  btcAddressInfo: [],
  stxAddressInfo: [],
  onDisconnect: () => {
    console.log("onDisconnect not implemented");
  },
});

export const useConnectionContext = () => useContext(ConnectionContext);

export function AppWithProviders({ children }: React.PropsWithChildren<{}>) {
  const queryClient = useQueryClient();
  const [network, setNetwork] = useLocalStorage<BitcoinNetworkType>(
    "network",
    BitcoinNetworkType.Mainnet
  );
  const [btcAddressInfo, setBtcAddressInfo] = useLocalStorage<Address[]>(
    "btc-addresses",
    []
  );
  const [stxAddressInfo, setStxAddressInfo] = useLocalStorage<Address[]>(
    "stx-addresses",
    []
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isConnected = btcAddressInfo.length + stxAddressInfo.length > 0;

  const clearAppData = useCallback(() => {
    setBtcAddressInfo([]);
    setStxAddressInfo([]);
    queryClient.clear();
  }, [queryClient, setBtcAddressInfo, setStxAddressInfo]);

  const onDisconnect = useCallback(() => {
    (async () => {
      await Wallet.disconnect();
      clearAppData();
    })().catch(console.error);
  }, [clearAppData]);

  useEffect(() => {
    if (btcAddressInfo.length < 1) return;

    const removeListenerAccountChange = Wallet.addListener(
      "accountChange",
      (ev) => {
        console.log("The account has changed.", ev);
      }
    );

    const removeListenerDisconnect = Wallet.addListener(
      "accountChange",
      (ev) => {
        console.log("The wallet has been disconnected. Event:", ev);
        clearAppData();
      }
    );

    return () => {
      removeListenerAccountChange();
      removeListenerDisconnect();
    };
  }, [btcAddressInfo, clearAppData]);

  const onConnectLegacy = useCallback(() => {
    (async () => {
      const response = await Wallet.request("getAccounts", {
        purposes: [
          AddressPurpose.Payment,
          AddressPurpose.Ordinals,
          AddressPurpose.Stacks,
        ],
        message: "Cool app wants to know your addresses!",
      });
      if (response.status === "success") {
        setBtcAddressInfo([response.result[0], response.result[1]]);
        if (response.result[2]) setStxAddressInfo([response.result[2]]);
      }
    })().catch(console.error);
  }, [setBtcAddressInfo, setStxAddressInfo]);

  const onConnect = useCallback(() => {
    (async () => {
      const res = await Wallet.request("wallet_requestPermissions", undefined);
      if (res.status === "error") {
        console.error("Error connecting to wallet, details in terminal.");
        console.error(res);
        return;
      }
      const res2 = await Wallet.request("getAddresses", {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
      });
      if (res2.status === "error") {
        console.error(
          "Error retrieving bitcoin addresses after having requested permissions."
        );
        console.error(res2);
        return;
      }
      setBtcAddressInfo(res2.result.addresses);
      const res3 = await Wallet.request("stx_getAddresses", null);
      if (res3.status === "error") {
        alert(
          "Error retrieving stacks addresses after having requested permissions. Details in terminal."
        );
        console.error(res3);
        return;
      }
      setStxAddressInfo(res3.result.addresses);
    })().catch(console.error);
  }, [setBtcAddressInfo, setStxAddressInfo]);

  const connectionContextValue = useMemo(
    () => ({ network, btcAddressInfo, stxAddressInfo, onDisconnect }),
    [network, btcAddressInfo, stxAddressInfo, onDisconnect]
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/sats-connect.svg"
              alt="SatsConnect"
              className="w-48 mb-4 bg-black p-2"
            />
            <div className="flex items-center">
              <img src="/logo-dark.png" alt="Remix" className="w-24 mr-2" />
              <p className="text-gray-600 text-sm">Edition by Red Block Labs</p>
            </div>
          </div>

          <NetworkSelector network={network} setNetwork={setNetwork} />

          <p className="text-center text-gray-700 mb-6">
            Connect your wallet to get started
          </p>

          <div className="space-y-4">
            <Button
              onClick={onConnect}
              className="w-full  text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
              Connect Wallet
            </Button>
            <Button
              onClick={onConnectLegacy}
              variant="outline"
              className="w-full border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-100 transition duration-300"
            >
              Connect Legacy Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ConnectionContext.Provider value={connectionContextValue}>
      {children}
    </ConnectionContext.Provider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function AppProviders({ children }: React.PropsWithChildren<{}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithProviders>{children}</AppWithProviders>
    </QueryClientProvider>
  );
}
