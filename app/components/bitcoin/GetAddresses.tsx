import { useQuery } from "@tanstack/react-query";
import Wallet, { AddressPurpose } from "sats-connect";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export function GetAddresses() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["getAddresses"],
    queryFn: async () => {
      const res = await Wallet.request("getAddresses", {
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
        <CardTitle>Get addresses</CardTitle>

        <Button
          onClick={() => {
            refetch().catch(console.error);
          }}
        >
          Get addresses
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
            console.log(data);
            return (
              <div>
                <p>{data.addresses.length} addresses found.</p>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            );
          }
        })()}
      </CardContent>
    </Card>
  );
}
