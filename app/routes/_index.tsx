import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="bg-black p-4 m-4 rounded-xl text-[#aeaeae] text-[calc(10px+1vmin)] flex flex-col items-center justify-center">
      <div className="flex items-center">
        <img
          src="/sats-connect.svg"
          alt="SatsConnect"
          className="w-[200px] p-[10px]"
        />
        <div className="w-[140px]">
          <img src="/logo-dark.png" alt="Remix" className="" />
        </div>{" "}
        <p className="ml-2">Edition by Red Block Labs</p>
      </div>
    </div>
  );
}
