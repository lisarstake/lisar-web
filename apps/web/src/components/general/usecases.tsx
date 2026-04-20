import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import {LisarLines} from "@/components/landing/lisar-lines";

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
          {/* Card 1: Deposit and convert */}
          <Card className="bg-gray-200 rounded-lg shadow-none border border-black flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl mb-2 text-black">
              Deposit your assets
              </CardTitle>
              <CardDescription className="text-gray-700">
              Transfer supported assets from your wallet or exchange into your Lisar wallet.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full">
              <img src="/h4.png" className="mx-auto" />
            </CardContent>
          </Card>

          {/* Card 2: Start earning */}
          <Card className="bg-gray-200 rounded-lg shadow-none border border-black flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl mb-2 text-black">
               Earn automatically
              </CardTitle>
              <CardDescription className="text-gray-700">
              Your assets are put to work across trusted networks to generate yield while you hold.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full">
              <img src="/h3.svg" className="mx-auto" />
            </CardContent>
          </Card>

          {/* Card 3: Zero setup */}
          <Card className="bg-gray-200 rounded-lg shadow-none border border-black flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl mb-2 text-black">
                Withdraw anytime
              </CardTitle>
              <CardDescription className="text-gray-700">
              Access your funds whenever you need them. No lockups, no penalties.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full">
              <img src="/h2.svg" className="mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
