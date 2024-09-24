import { useCallback, useState } from "react";
import Wallet, { GetRunesBalanceResult } from "sats-connect";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export const GetRunesBalance = () => {
  const [balances, setBalances] = useState<GetRunesBalanceResult["balances"]>(
    []
  );

  const getBalance = useCallback(() => {
    (async () => {
      try {
        const response = await Wallet.request("runes_getBalance", null);
        if (response.status === "success") {
          setBalances(response.result.balances);
        } else {
          alert("Error getting runes balance. Check console for error logs");
          console.error(response.error);
        }
      } catch (err) {
        console.log(err);
      }
    })().catch(console.error);
  }, []);

  return (
    <Card>
      <CardContent>
        <CardTitle>Runes Balance</CardTitle>

        <Button onClick={getBalance}>Get Runes Balance</Button>

        <div>
          {balances.length === 0 ? (
            <div>No balances</div>
          ) : (
            balances.map((balance: GetRunesBalanceResult["balances"][0]) => (
              <div key={balance.runeName} className="p-12">
                <div>Amount: {balance.amount}</div>
                <div>Divisibility: {balance.divisibility}</div>
                <div>Inscription ID: {balance.inscriptionId}</div>
                <div>Rune name: {balance.runeName}</div>
                <div>Rune symbol: {balance.symbol}</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
