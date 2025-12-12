import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import {LisarLines} from "./lisar-lines";

export const UseCasesSection = () => {
  return (
    <section className="w-full md:py-20 py-12 px-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Lisar Lines Decorations */}
      <LisarLines position="top-right" />
      <div className="hidden md:block">
        <LisarLines position="bottom-left" />
      </div>

      <div className="max-w-7xl w-full mx-auto relative z-10">
        <div className="mb-10 text-center">
          <span className="text-xl text-black font-medium">How it Works</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Fund with Fiat */}
          <Card className=" bg-gray-200 rounded-lg shadow-none border border-black flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl mb-2 text-black">
                Save or stake
              </CardTitle>
              <CardDescription className=" text-gray-700">
                Start with stable coins for steady savings, or go for high-yield staking to maximize returns. Add money in your local currency or crypto—we handle the rest.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full">
              <img src="/h2.svg" className="mx-auto " />
            </CardContent>
          </Card>

          {/* Card 2: Choose Your Orchestrator */}
          <Card className="bg-gray-200 rounded-lg shadow-none border border-black flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl mb-2 text-black">
                Watch it grow
              </CardTitle>
              <CardDescription className=" text-gray-700">
                Your money starts earning right away. Rewards are added to your account daily, automatically. No checking, no managing—just growth.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full">
              <img src="/h1.svg" className="mx-auto " />
            </CardContent>
          </Card>

          {/* Card 3: One-Click Staking */}
          <Card className="bg-gray-200 rounded-lg shadow-none border border-black flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl text-black mb-2">
                Take it out when you need it
              </CardTitle>
              <CardDescription className="text-gray-700">
                Your money is always yours. Withdraw stable savings instantly, or wait a few days for high-yield stakes. Simple and straightforward.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full">
              <img src="/h3.svg" className="mx-auto " />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
