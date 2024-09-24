import { useQuery } from "@tanstack/react-query";
import Wallet from "sats-connect";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export function WalletType() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["wallet_getWalletType"],
    queryFn: async () => {
      const res = await Wallet.request("wallet_getWalletType", undefined);
      if (res.status === "error") {
        throw new Error("Error getting wallet type", { cause: res.error });
      }
      return res.result;
    },
    enabled: false,
  });

  return (
    <Card>
      <CardContent>
        <CardTitle>Wallet type</CardTitle>

        <Button
          onClick={() => {
            refetch().catch(console.error);
          }}
        >
          Get wallet type
        </Button>

        {(() => {
          if (isFetching) {
            return <p>Loading...</p>;
          }

          if (isError) {
            console.error(error);
            console.error(error.cause);
            return (
              <div className="text-red-500">
                Error. Check console for details.
              </div>
            );
          }

          if (isSuccess) {
            return (
              <div>
                <p>Wallet type: {data}</p>
              </div>
            );
          }
        })()}
      </CardContent>
    </Card>
  );
}
