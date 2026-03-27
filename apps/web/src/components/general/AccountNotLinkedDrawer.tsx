import React from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

interface AccountNotLinkedDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onLinkAccount: () => void;
}

export const AccountNotLinkedDrawer: React.FC<AccountNotLinkedDrawerProps> = ({
    isOpen,
    onClose,
    onLinkAccount,
}) => {
    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-center text-lg font-medium text-white/80">
                        No Account Linked
                    </DrawerTitle>
                </DrawerHeader>

                <div className="pt-2 pb-4">
                    {/* Icon */}
                    <div className="flex justify-center mt-2">
                        <div className="w-20 h-20 bg-[#C7EF6B]/20 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                            <img src="/ramp.png" alt="Ramp" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <p className="text-gray-400 text-center text-sm leading-relaxed mb-8 px-4">
                        We couldn't find a linked bank account for withdrawals. Please
                        link an account to proceed.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onLinkAccount}
                            className="w-full py-3 rounded-xl font-semibold text-base text-black bg-[#C7EF6B] hover:bg-[#B8E55A] transition-colors"
                        >
                            Link Account
                        </button>

                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
