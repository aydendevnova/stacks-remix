import { useCallback, useState } from "react";
import Wallet, { RpcResult } from "sats-connect";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";

export const GetInscriptions = () => {
  const [inscriptions, setInscriptions] =
    useState<RpcResult<"ord_getInscriptions">>();
  const onClick = useCallback(() => {
    (async () => {
      const response = await Wallet.request("ord_getInscriptions", {
        limit: 100,
        offset: 0,
      });

      setInscriptions(response);

      if (response.status === "error") {
        alert("Error getting inscriptions. See console for details.");
        console.error(response.error);
        return;
      }

      console.log("inscriptions", response.result);
    })().catch(console.error);
  }, []);

  return (
    <Card>
      <CardContent>
        <CardTitle>Inscriptions</CardTitle>

        <Button
          onClick={onClick}
          className=" text-white font-bold py-2 px-4 rounded"
        >
          Get wallet inscriptions
        </Button>
        <pre>{JSON.stringify(inscriptions, null, 2)}</pre>
      </CardContent>
    </Card>
  );
};
