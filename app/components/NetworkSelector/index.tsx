import { BitcoinNetworkType } from "sats-connect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

interface Props {
  network: BitcoinNetworkType;
  setNetwork: (newNetwork: BitcoinNetworkType) => void;
}

export const NetworkSelector = ({ network, setNetwork }: Props) => {
  return (
    <div className="mb-5">
      <Label>Network</Label>
      <Select
        value={network}
        onValueChange={(value) => setNetwork(value as BitcoinNetworkType)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={BitcoinNetworkType.Mainnet}>Mainnet</SelectItem>
          <SelectItem value={BitcoinNetworkType.Testnet}>Testnet</SelectItem>
          <SelectItem value={BitcoinNetworkType.Signet}>Signet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
