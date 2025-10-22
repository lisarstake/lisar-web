import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface UnstakeSuccessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnstakeSuccessDrawer: React.FC<UnstakeSuccessDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleGoToHome = () => {
    onClose();
    navigate("/wallet");
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-4xl font-bold text-white">
            Success!
          </DrawerTitle>
          <DrawerDescription className="text-center text-white text-lg">
            Your unstaking has been processed successfully
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter>
          <button
            onClick={handleGoToHome}
            className="w-full py-4 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
          >
            Go to home page
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
