import { useCallback, useMemo, useState } from "react";
import Wallet, {
  Address,
  AddressPurpose,
  BitcoinNetworkType,
} from "sats-connect";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Props {
  network: BitcoinNetworkType;
  addresses: Address[];
}

export const EtchRunes = ({ addresses, network }: Props) => {
  const [totalCost, setTotalCost] = useState<number>();
  const [totalSize, setTotalSize] = useState<number>();
  const [fundTxId, setFundTxId] = useState<string>("");
  const [runeName, setRuneName] = useState<string>("");
  const [feeRate, setFeeRate] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [preMine, setPreMine] = useState<string>("");
  const [divisibility, setDivisibility] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [mintCap, setMintCap] = useState<string>("");
  const [delegateInscription, setDelegateInscription] = useState<string>("");
  const [inscriptionContentType, setInscriptionContentType] =
    useState<string>("");
  const [inscriptionContent, setInscriptionContent] = useState<string>("");

  const ordinalsAddress = useMemo(
    () =>
      addresses.find((a) => a.purpose === AddressPurpose.Ordinals)?.address ??
      "",
    [addresses]
  );

  const paymentAddress = useMemo(
    () =>
      addresses.find((a) => a.purpose === AddressPurpose.Payment)?.address ??
      "",
    [addresses]
  );

  const onClickEstimate = useCallback(() => {
    (async () => {
      const response = await Wallet.request("runes_estimateEtch", {
        destinationAddress: ordinalsAddress,
        feeRate: +feeRate,
        symbol: symbol || undefined,
        premine: preMine || undefined,
        divisibility: +divisibility || undefined,
        delegateInscriptionId: delegateInscription || undefined,
        inscriptionDetails:
          inscriptionContent && inscriptionContentType
            ? {
                contentBase64: inscriptionContent,
                contentType: inscriptionContentType,
              }
            : undefined,
        terms:
          amount || mintCap
            ? {
                amount: amount || undefined,
                cap: mintCap || undefined,
              }
            : undefined,
        isMintable: true,
        runeName: runeName,
        network: network,
      });

      if (response.status === "success") {
        setTotalCost(response.result.totalCost);
        setTotalSize(response.result.totalSize);
      } else {
        console.error(response.error);
        alert("Error Fetching Estimate. See console for details.");
      }
    })().catch(console.error);
  }, [
    amount,
    delegateInscription,
    divisibility,
    feeRate,
    inscriptionContent,
    inscriptionContentType,
    mintCap,
    network,
    ordinalsAddress,
    preMine,
    runeName,
    symbol,
  ]);

  const onClickExecute = useCallback(() => {
    (async () => {
      const response = await Wallet.request("runes_etch", {
        destinationAddress: ordinalsAddress,
        symbol: symbol || undefined,
        premine: preMine || undefined,
        delegateInscriptionId: delegateInscription || undefined,
        inscriptionDetails:
          inscriptionContent && inscriptionContentType
            ? {
                contentBase64: inscriptionContent,
                contentType: inscriptionContentType,
              }
            : undefined,
        terms:
          amount || mintCap
            ? {
                amount: amount || undefined,
                cap: mintCap || undefined,
              }
            : undefined,
        feeRate: +feeRate,
        isMintable: true,
        runeName,
        refundAddress: paymentAddress,
        network,
      });

      if (response.status === "success") {
        setFundTxId(response.result.fundTransactionId);
      } else {
        console.error(response.error);
        alert("Error sending BTC. See console for details.");
      }
    })().catch(console.error);
  }, [
    amount,
    delegateInscription,
    feeRate,
    inscriptionContent,
    inscriptionContentType,
    mintCap,
    network,
    ordinalsAddress,
    paymentAddress,
    preMine,
    runeName,
    symbol,
  ]);

  const networkPath = {
    [BitcoinNetworkType.Mainnet]: "",
    [BitcoinNetworkType.Testnet]: "/testnet",
    [BitcoinNetworkType.Signet]: "/signet",
  };
  const fundTxLink = `https://mempool.space${networkPath[network]}/tx/${fundTxId}`;

  return (
    <>
      <Card className="bg-white p-4 rounded-lg shadow-md">
        <CardContent>
          <CardTitle>Etch Runes</CardTitle>
          <div className="flex flex-wrap justify-between pr-24 mb-5">
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Rune Name</h4>
              <Input
                type="text"
                value={runeName}
                onChange={(e) => setRuneName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Symbol</h4>
              <Input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">
                Delegate inscription
              </h4>
              <Input
                type="text"
                value={delegateInscription}
                onChange={(e) => setDelegateInscription(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">
                Inscription Content
              </h4>
              <Input
                type="text"
                value={inscriptionContent}
                onChange={(e) => setInscriptionContent(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">
                Inscription Content type
              </h4>
              <Input
                type="text"
                value={inscriptionContentType}
                onChange={(e) => setInscriptionContentType(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Divisibility</h4>
              <Input
                type="number"
                value={divisibility}
                onChange={(e) => setDivisibility(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Premine</h4>
              <Input
                type="number"
                value={preMine}
                onChange={(e) => setPreMine(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Amount</h4>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Mint Cap</h4>
              <Input
                type="number"
                value={mintCap}
                onChange={(e) => setMintCap(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">feeRate (sats/vb)</h4>
              <Input
                type="number"
                value={feeRate}
                onChange={(e) => setFeeRate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={onClickEstimate} disabled={!runeName || !feeRate}>
            Estimate Etch
          </Button>
        </CardContent>
      </Card>

      {totalCost && (
        <Card className="bg-white p-4 rounded-lg shadow-md mt-4">
          <CardContent>
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Rune Name</h3>
              <div className="text-green-500">{runeName}</div>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">
                Total Cost (sats) - Total Size
              </h3>
              <div className="text-green-500">
                {totalCost} - {totalSize}
              </div>
            </div>
            <Button onClick={onClickExecute}>Execute Etch</Button>
            {fundTxId && (
              <div className="text-green-500 mt-4">
                Success! Click{" "}
                <a
                  href={fundTxLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  here
                </a>{" "}
                to see your transaction
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default EtchRunes;
