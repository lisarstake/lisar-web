import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";

export const SavingsCreateFlexiblePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState("");

  const asset = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("asset") === "crypto" ? "crypto" : "usd";
  }, [location.search]);

  const isCrypto = asset === "crypto";
  const isEnabled = Number(amount) > 0;

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <h1 className="text-lg font-medium text-white">Create plan</h1>

        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
        <div className="rounded-xl px-4 py-4 bg-[#13170a]">
          <p className="text-sm text-[#7f8d86]">Amount</p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="w-full bg-transparent text-lg font-semibold text-[#d6ddd9] outline-none placeholder:text-[#3f4f47]"
            />
            <div className="flex items-center gap-2">
              <img
                src={isCrypto ? "/livepeer.webp" : "/usdc.svg"}
                alt={isCrypto ? "Crypto" : "USD"}
                className={ isCrypto ? "h-6 w-7 rounded-full bg-white object-cover" : "h-6 w-7 rounded-full bg-white object-cover"}
              />

            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#13170a] px-4 py-4">
          <p className="text-base text-[#9ba49f]">Interest rate</p>
          <p className="text-base font-semibold">
            {isCrypto ? "7.5% p.a." : "3% p.a."}
          </p>
        </div>
      </div>

      <div className="px-6 pb-24 pt-3 bg-[#050505] shrink-0">
        <button
          onClick={() =>
            isEnabled && navigate(isCrypto ? "/wallet/staking" : "/wallet/savings")
          }
          className={`h-14 w-full rounded-full text-base font-semibold transition-opacity ${isEnabled
              ? "bg-[#C7EF6B] text-black"
              : "bg-[#C7EF6B]/60 text-black"
            }`}
        >
          Continue
        </button>
      </div>

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
