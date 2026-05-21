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
  buttonText = "Redeem now",
}) => {


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogOverlay className="bg-black/40 backdrop-blur-[1px]" />
      <DialogContent className="w-[min(88vw,360px)] max-h-[82vh] overflow-y-auto mt-10 border-0 bg-transparent p-0 shadow-none">
        <div className="px-3 pb-4 text-center">
          <div className="relative mt-2 rounded-[28px] overflow-hidden">
            <div className="relative">
              <h3 className="mt-2 text-[18px] leading-[1.05] font-semibold text-white/80 text-center">
                Earn points, redeem as rewards!
              </h3>
              <p className="mt-1.5 text-[11px] text-white/50 max-w-[300px] mx-auto text-center">
                Redeem lisar points as discounts on coworking space, coffee and pastries at CafeOne, T&C applies.
              </p>
            </div>

            <div className="relative mt-4  h-[250px]">

              <div
                className=" h-[150px] absolute top-0 left-1/2 -translate-x-1/2 w-[86%] rounded-2xl border border-white/10 overflow-hidden"
                style={{ backgroundImage: "url(/cafeone.jpeg)", backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative px-4 py-3">
                  <span className="absolute top-2 right-2 bg-[#C7EF6B]/80 text-black rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                    <Tag size={12} /> 10% off
                  </span>
                </div>
              </div>

              <div
                className="h-[170px] absolute left-2 top-[62px] w-[56%] -rotate-[8deg] rounded-2xl border border-white/15 overflow-hidden "
                style={{ backgroundImage: "url(/popup3.png)", backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative p-2.5">
                  <span className="absolute top-2 right-1 bg-[#C7EF6B]/80 text-black rounded-full px-1.5 py-0.5 text-[8px] font-bold flex items-center gap-0.5">
                    <Tag size={10} /> 25% off
                  </span>

                </div>
              </div>

              <div
                className="h-[120px] absolute right-1 bottom-1 w-[54%] rotate-[7deg] rounded-2xl border border-white/15 overflow-hidden"
                style={{ backgroundImage: "url(/popup4.png)", backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative p-2.5">
                  <span className="absolute top-2 right-1 bg-[#C7EF6B]/80 text-black rounded-full px-1.5 py-0.5 text-[8px] font-bold flex items-center gap-0.5">
                    <Tag size={10} /> 35% off
                  </span>

                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onExplore?.();
            }}
            className="w-full mt-6 bg-[#C7EF6B] text-black rounded-full h-11 text-base font-semibold hover:bg-[#fff87a] transition-colors"
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
