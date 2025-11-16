import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ShareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  validatorName: string;
  validatorId: string;
}

export const ShareDrawer: React.FC<ShareDrawerProps> = ({
  isOpen,
  onClose,
  validatorName,
  validatorId,
}) => {
  const shareUrl = `${window.location.origin}/validator-details/${validatorId}`;
  const shareText = `Check out ${validatorName} on Lisar. You can earn rewards by staking here.`;

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-xl font-semibold text-white">
            Share {validatorName}
          </DrawerTitle>
          <DrawerDescription className="text-center text-white/70 text-sm">
            Share this validator with your friends
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleTwitterShare}
              className="flex items-center justify-center space-x-3 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#1DA1F2] transition-colors"
            >
              <img 
                src="/x-logo.png" 
                alt="X" 
                className="w-[18px] h-[18px]"
              />
              <span className="text-white/90 font-normal">Twitter</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center space-x-3 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#25D366] transition-colors"
            >
              <img 
                src="/whatsapp.png" 
                alt="WhatsApp" 
                className="w-[18px] h-[18px]"
              />
               <span className="text-white/90 font-normal">WhatsApp</span>
            </button>
          </div>
        </div>

        <DrawerFooter>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl font-semibold text-lg bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-colors"
          >
            Close
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
