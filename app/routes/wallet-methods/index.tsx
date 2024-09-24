import AddressDisplay from "~/components/AddressDisplay";
import { GetAccounts } from "~/components/bitcoin/GetAccounts";
import { GetAddresses } from "~/components/bitcoin/GetAddresses";
import { WalletType } from "~/components/wallet/WalletType";
import { useConnectionContext } from "~/hooks/app-providers";

export const WalletMethods = () => {
  const { network, btcAddressInfo, stxAddressInfo, onDisconnect } =
    useConnectionContext();
  return (
    <div className="flex flex-col gap-4">
      <h1>Wallet Methods</h1>
      <AddressDisplay
        network={network}
        addresses={[...btcAddressInfo, ...stxAddressInfo]}
        onDisconnect={onDisconnect}
      />
      <GetAddresses />
      <WalletType />
      <GetAccounts />
    </div>
  );
};

export default WalletMethods;
