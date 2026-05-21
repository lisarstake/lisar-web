import React from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Tag, X } from "lucide-react";

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
  buttonText = "Cash out points",
}) => {


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogOverlay className="bg-black/25 backdrop-blur-[1px]" />
      <DialogContent className="w-[min(88vw,360px)] max-h-[82vh] overflow-y-auto border-0 bg-transparent p-0 shadow-none">
        <div className="px-3 pb-4 text-center">
          <div className="relative mt-2 rounded-[28px] overflow-hidden">

            <div className="relative">

              <h3 className="mt-2 text-[17px] leading-[1.05] font-semibold text-white text-center">
                Earn points, cash out as rewards!
              </h3>
              <p className="mt-1.5 text-[11px] text-white/70 max-w-[270px] mx-auto text-center">
                Earn lisar points and redeem as discounts on purchases at CafeOne, T&C applies.
              </p>
            </div>

            <div className="relative mt-4 h-[145px]">
              {/* Card 1 - popup2 */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[86%] rounded-2xl border border-white/10 overflow-hidden shadow-[0_16px_28px_rgba(30,64,175,0.35)]"
                style={{ backgroundImage: "url(/popup2.png)", backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative px-4 py-3">
                  <span className="absolute top-2 right-2 bg-[#F8F31B] text-black rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                    <Tag size={12} /> 30% off
                  </span>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-white/65">Limited drop</p>
                  <p className="mt-1 text-[20px] font-semibold leading-none text-white">Whoosh!</p>
                  <p className="mt-1.5 text-[10px] text-white/80">Exclusive CafeOne perks are now unlockable.</p>
                </div>
              </div>
              {/* Card 2 - popup3 */}
              <div
                className="absolute left-2 top-[62px] w-[56%] -rotate-[8deg] rounded-2xl border border-white/15 overflow-hidden shadow-[0_12px_24px_rgba(6,182,212,0.25)]"
                style={{ backgroundImage: "url(/popup3.png)", backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative p-2.5">
                  <span className="absolute top-1 right-1 bg-[#F8F31B] text-black rounded-full px-1.5 py-0.5 text-[8px] font-bold flex items-center gap-0.5">
                    <Tag size={10} /> 20% off
                  </span>
                  <p className="text-[8px] uppercase tracking-[0.12em] text-white/75">Placeholder</p>
                  <p className="text-[12px] font-semibold text-white">Icon Block</p>
                </div>
              </div>
              {/* Card 3 - popup4 */}
              <div
                className="absolute right-1 bottom-1 w-[54%] rotate-[7deg] rounded-2xl border border-white/15 overflow-hidden shadow-[0_12px_24px_rgba(236,72,153,0.25)]"
                style={{ backgroundImage: "url(/popup4.png)", backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative p-2.5">
                  <span className="absolute top-1 right-1 bg-[#F8F31B] text-black rounded-full px-1.5 py-0.5 text-[8px] font-bold flex items-center gap-0.5">
                    <Tag size={10} /> 10% off
                  </span>
                  <p className="text-[8px] uppercase tracking-[0.12em] text-white/75">Placeholder</p>
                  <p className="text-[12px] font-semibold text-white">Illustration</p>
                </div>
              </div>
            </div>
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
          <button
            onClick={onClose}
            className="w-10 h-10 mx-auto mt-6 rounded-full bg-[#151515] border border-[#2a2a2a] text-white flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
