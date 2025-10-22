import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
} from "lucide-react";

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
  const [copied, setCopied] = React.useState(false);

  const shareUrl = `${window.location.origin}/validator-details/${validatorId}`;
  const shareText = `Check out ${validatorName} on Lisar! Earn rewards while supporting decentralized video infrastructure. Join the future of Web3 streaming! 🚀`;
  const shareTitle = `Stake with ${validatorName} on Lisar`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, "_blank", "width=600,height=400");
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleTelegramShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, "_blank");
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-2xl font-bold text-white">
            Share {validatorName}
          </DrawerTitle>
          <DrawerDescription className="text-center text-white/70 text-base">
            Help others discover this validator
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4">
          {/* Social Media Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleTwitterShare}
              className="flex items-center justify-center space-x-3 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#1DA1F2] transition-colors"
            >
              <Twitter size={24} color="#1DA1F2" />
              <span className="text-white font-medium">Twitter</span>
            </button>

            <button
              onClick={handleFacebookShare}
              className="flex items-center justify-center space-x-3 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#1877F2] transition-colors"
            >
              <Facebook size={24} color="#1877F2" />
              <span className="text-white font-medium">Facebook</span>
            </button>

            <button
              onClick={handleLinkedInShare}
              className="flex items-center justify-center space-x-3 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#0077B5] transition-colors"
            >
              <Linkedin size={24} color="#0077B5" />
              <span className="text-white font-medium">LinkedIn</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center space-x-3 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#25D366] transition-colors"
            >
              <MessageCircle size={24} color="#25D366" />
              <span className="text-white font-medium">WhatsApp</span>
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
