import AddressDisplay from "~/components/AddressDisplay";
import { SendSip10 } from "~/components/stacks/SendSip10";
import { SendStx } from "~/components/stacks/SendStx";
import { SignTransaction } from "~/components/stacks/SignTransaction";
import { useConnectionContext } from "~/hooks/app-providers";

const StacksMethods = () => {
  const { network, stxAddressInfo, onDisconnect } = useConnectionContext();
  return (
    <div className="flex flex-col gap-4">
      <h1>Stacks Methods</h1>
      <AddressDisplay
        network={network}
        addresses={[...stxAddressInfo]}
        onDisconnect={onDisconnect}
      />
      <SendStx network={network} />
      <SendSip10 network={network} stxAddressInfo={stxAddressInfo} />
      {stxAddressInfo?.[0]?.publicKey ? (
        <SignTransaction
          network={network}
          publicKey={stxAddressInfo?.[0].publicKey}
        />
      ) : null}
    </div>
  );
};

export default StacksMethods;
