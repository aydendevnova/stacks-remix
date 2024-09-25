import { useQuery } from "@tanstack/react-query";
import Wallet, { AddressPurpose } from "sats-connect";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export function GetAccounts() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["getAccounts"],
    queryFn: async () => {
      const res = await Wallet.request("getAccounts", {
        purposes: [
          AddressPurpose.Payment,
          AddressPurpose.Ordinals,
          AddressPurpose.Stacks,
        ],
      });
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
        <CardTitle>[Legacy] Get accounts</CardTitle>

        <Button
          onClick={() => {
            refetch().catch(console.error);
          }}
        >
          Get accounts
        </Button>

        {(() => {
          if (isFetching) {
            return <p>Loading...</p>;
          }

          if (isError) {
            console.error(error);
            return (
              <div className="text-red-500">
                Error. Check console for details.
              </div>
            );
          }

          if (isSuccess) {
            return (
              <div>
                <p>{data.length} accounts found</p>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            );
          }
        })()}
      </CardContent>
    </Card>
  );
}
