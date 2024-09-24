import AddressDisplay from "~/components/AddressDisplay";
import { GetBtcBalance } from "~/components/bitcoin/GetBtcBalance";
import { SendBtc } from "~/components/bitcoin/SendBtc";
import { SignMsgBTC } from "~/components/bitcoin/SignMsgBtc";
import EtchRunes from "~/components/EtchRunes";
import { GetInscriptions } from "~/components/GetInscriptions";
import { GetRunesBalance } from "~/components/GetRunesBalance";
import MintRunes from "~/components/MintRunes";
import { SendInscription } from "~/components/sendInscriptions";
import TransferRunes from "~/components/transferRunes";
import { useConnectionContext } from "~/hooks/app-providers";
import { ClientOnly } from "remix-utils/client-only";

const BtcMethods = () => {
  const { network, btcAddressInfo, onDisconnect } = useConnectionContext();
  return (
    <div className="flex flex-col gap-4">
      <h1>Bitcoin Methods</h1>
      <AddressDisplay
        network={network}
        addresses={[...btcAddressInfo]}
        onDisconnect={onDisconnect}
      />
      <SignMsgBTC addresses={[...btcAddressInfo]} />
      <SendBtc network={network} />
      <SendInscription network={network} />
      <TransferRunes network={network} />
      <GetBtcBalance />
      <GetRunesBalance />
      <GetInscriptions />
      <MintRunes network={network} addresses={[...btcAddressInfo]} />
      <EtchRunes network={network} addresses={[...btcAddressInfo]} />
    </div>
  );
};

export default BtcMethods;
