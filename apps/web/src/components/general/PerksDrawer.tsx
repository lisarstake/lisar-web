import React from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface PerksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExplore?: () => void;
  buttonText?: string;
}

export const PerksDrawer: React.FC<PerksDrawerProps> = ({
  isOpen,
  onClose,
  onExplore,
  buttonText = "Explore perks",
}) => {
  const cafeOnePerks = [
    {
      title: "Specialty Coffee",
      subtitle: "Flat White, Latte, Cappuccino",
      points: "100 points",
      tone: "from-[#a855f7] via-[#7c3aed] to-[#2563eb]",
      rotation: "-rotate-2",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogOverlay className="bg-black/25 backdrop-blur-[1px]" />
      <DialogContent className="w-[min(88vw,360px)] max-h-[82vh] overflow-y-auto border-0 bg-transparent p-0 shadow-none">
        <div className="px-3 pb-4 text-center">
          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#151515] border border-[#2a2a2a] text-white flex items-center justify-center"
            >
              <X size={13} />
            </button>
          </div>

          <div className="relative mt-2 rounded-[28px] overflow-hidden">

            <div className="relative">

              <h3 className="mt-2 text-[17px] leading-[1.05] font-semibold text-white text-center">
                Build Your Reward Stack
              </h3>
              <p className="mt-1.5 text-[11px] text-white/70 max-w-[270px] mx-auto text-center">
                Redeem points for cafe items, drinks, and in-store value.
              </p>
            </div>

            <div className="relative mt-4 h-[145px]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[86%] rounded-2xl border border-white/10 bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] px-4 py-3 shadow-[0_16px_28px_rgba(30,64,175,0.35)]">
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/65">Limited drop</p>
                <p className="mt-1 text-[20px] font-semibold leading-none text-white">Whoosh!</p>
                <p className="mt-1.5 text-[10px] text-white/80">Exclusive CafeOne perks are now unlockable.</p>
              </div>
              <div className="absolute left-2 top-[62px] w-[56%] -rotate-[8deg] rounded-2xl border border-white/15 bg-gradient-to-br from-[#22c55e] to-[#0ea5e9] p-2.5 shadow-[0_12px_24px_rgba(6,182,212,0.25)]">
                <p className="text-[8px] uppercase tracking-[0.12em] text-white/75">Placeholder</p>
                <p className="text-[12px] font-semibold text-white">Icon Block</p>
              </div>
              <div className="absolute right-1 bottom-1 w-[54%] rotate-[7deg] rounded-2xl border border-white/15 bg-gradient-to-br from-[#a855f7] to-[#ec4899] p-2.5 shadow-[0_12px_24px_rgba(236,72,153,0.25)]">
                <p className="text-[8px] uppercase tracking-[0.12em] text-white/75">Placeholder</p>
                <p className="text-[12px] font-semibold text-white">Illustration</p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            {cafeOnePerks.map((perk) => (
              <div
                key={perk.title}
                className={`rounded-xl border border-white/15 bg-gradient-to-br ${perk.tone} px-3 py-2.5 text-white shadow-[0_10px_20px_rgba(0,0,0,0.25)] ${perk.rotation}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-center">
                    <p className="text-[15px] leading-tight font-semibold">{perk.title}</p>
                    <p className="mt-1 text-[10px] text-white/85">{perk.subtitle}</p>
                  </div>
                  <div className="shrink-0 rounded-full border border-white/35 bg-black/20 px-2 py-0.5 text-[9px] font-medium">
                    {perk.points}
                  </div>
                </div>
              </div>
            ))}
          </div>



          <button
            onClick={() => {
              onClose();
              onExplore?.();
            }}
            className="w-full mt-6 bg-[#F8F31B] text-black rounded-full h-10 text-sm font-medium hover:bg-[#fff87a] transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
