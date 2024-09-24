import { Address, BitcoinNetworkType } from "sats-connect";
import { Button } from "../ui/button";
import { Card, CardContent, CardTitle } from "../ui/card";

interface Props {
  network: BitcoinNetworkType;
  addresses: Address[];
  onDisconnect: () => void;
}

export const AddressDisplay = ({ network, addresses, onDisconnect }: Props) => {
  return (
    <Card>
      <CardContent>
        <CardTitle>Connected Addresses - ({network})</CardTitle>

        {addresses.map((address) => (
          <div key={address.purpose} className="mb-4">
            <h4 className="text-md font-medium mb-2">{address.purpose}</h4>
            <div className="mb-1">Address: {address.address}</div>
            <div>Public key: {address.publicKey}</div>
          </div>
        ))}
        <div className="mt-4">
          <Button onClick={onDisconnect}>Disconnect</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressDisplay;
