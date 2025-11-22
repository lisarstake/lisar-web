import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  confirmation?: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
}

interface ActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string[];
  actions: ActionButton[];
  isProcessing?: boolean;
}

export const ActionDrawer: React.FC<ActionDrawerProps> = ({
  isOpen,
  onClose,
  title,
  content,
  actions,
  isProcessing = false,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionButton | null>(null);

  // Reset confirmation state when drawer closes or opens
  useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
      setPendingAction(null);
    }
  }, [isOpen]);

  const handleActionClick = (action: ActionButton) => {
    if (action.confirmation) {
      setPendingAction(action);
      setShowConfirmation(true);
    } else {
      action.onClick();
    }
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction.onClick();
    }
    // Don't reset state immediately - let the parent component control this via isProcessing
  };

  const handleCancel = () => {
    if (!isProcessing) {
      setShowConfirmation(false);
      setPendingAction(null);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-xl font-semibold text-white">
            {showConfirmation && pendingAction?.confirmation
              ? pendingAction.confirmation.title
              : title}
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-2.5">
          {showConfirmation && pendingAction?.confirmation ? (
            <div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {pendingAction.confirmation.message}
              </p>
            </div>
          ) : (
            content.map((section, index) => (
              <div key={index}>
                <p className="text-gray-300 text-sm leading-relaxed">{section}</p>
              </div>
            ))
          )}
        </div>

        <DrawerFooter>
          {showConfirmation && pendingAction?.confirmation ? (
            <>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className={`w-full py-3 rounded-xl font-semibold text-lg transition-colors ${
                  isProcessing
                    ? "bg-[#A8CF5B] text-black cursor-not-allowed opacity-70"
                    : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  pendingAction.confirmation.confirmLabel || "Yes, proceed"
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className={`w-full py-3 rounded-xl font-semibold text-lg transition-colors ${
                  isProcessing
                    ? "bg-[#1a1a1a] text-gray-500 cursor-not-allowed opacity-50"
                    : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
                }`}
              >
                {pendingAction.confirmation.cancelLabel || "Cancel"}
              </button>
            </>
          ) : (
            actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                disabled={isProcessing}
                className={`w-full py-3 rounded-xl font-semibold text-lg transition-colors ${
                  action.variant === "secondary"
                    ? "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
                    : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                }`}
              >
                {action.label}
              </button>
            ))
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
