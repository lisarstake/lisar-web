import React, { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { LoaderCircle } from "lucide-react";

interface WithdrawalConfirmationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  fee: number;
  onConfirmWithdrawal: (
    pin: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

export const WithdrawalConfirmationDrawer: React.FC<
  WithdrawalConfirmationDrawerProps
> = ({
  isOpen,
  onClose,
  bankName,
  accountNumber,
  accountName,
  amount,
  fee,
  onConfirmWithdrawal,
}) => {
    const [view, setView] = useState<"summary" | "pin" | "success" | "error">(
      "summary",
    );
    const [pin, setPin] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const pinInputRef = useRef<HTMLInputElement>(null);
    const TEST_PIN = "0000";

    const totalAmount = Math.max(amount + fee, 0);

    useEffect(() => {
      if (!isOpen) return;
      setView("summary");
      setPin("");
      setErrorMessage("");
      setIsSubmitting(false);
    }, [isOpen]);

    useEffect(() => {
      if (view !== "pin") return;
      const id = setTimeout(() => pinInputRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }, [view]);

    const handlePinChange = (value: string) => {
      setPin(value.replace(/\D/g, "").slice(0, 4));
      setErrorMessage("");
    };

    const handleSubmit = async () => {
      if (pin.length !== 4 || isSubmitting) return;
      if (pin !== TEST_PIN) {
        setErrorMessage("Invalid PIN. Use 0000 for now.");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");
      try {
        const response = await onConfirmWithdrawal(pin);
        if (response.success) {
          setView("success");
          return;
        }
        setErrorMessage(response.error || "Withdrawal failed");
        setView("error");
      } catch (error) {
        setErrorMessage("Withdrawal failed");
        setView("error");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="bg-[#050505] border-[#2a2a2a]">
          {view === "summary" ? (
            <>
              <DrawerHeader>
                <DrawerTitle className="text-base font-medium text-white text-left">
                  Transaction summary
                </DrawerTitle>
              </DrawerHeader>

              <div className="space-y-3">
                <div className="rounded-lg bg-[#071510] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/60">Bank</p>
                    <p className="text-sm text-white">{bankName || "-"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/60">Account number</p>
                    <p className="text-sm text-white">{accountNumber || "-"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/60">Account name</p>
                    <p className="text-sm text-white">{accountName || "-"}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-[#071510] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/60">Amount</p>
                    <p className="text-sm text-white">₦{amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/60">Fee</p>
                    <p className="text-sm text-white">₦{fee.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <p className="text-sm text-white/80">Total amount</p>
                    <p className="text-base font-semibold text-white">
                      ₦{totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <DrawerFooter>
                <button
                  onClick={() => setView("pin")}
                  className="h-12 w-full rounded-full bg-[#c7ef6b] text-base font-semibold text-black"
                >
                  Confirm
                </button>
              </DrawerFooter>
            </>
          ) : null}

          {view === "pin" ? (
            <>
              <DrawerHeader>
                <DrawerTitle className="text-base font-medium text-white text-left">
                  Enter transaction PIN
                </DrawerTitle>
              </DrawerHeader>

              <div className="space-y-4">
                <p className="text-xs text-white/60">
                  Enter your 4-digit PIN to confirm this withdrawal.
                </p>
                <input
                  ref={pinInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => pinInputRef.current?.focus()}
                  className="w-full"
                >
                  <div className="flex items-center justify-center gap-3 mt-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`withdraw-pin-${index}`}
                        className="h-14 w-14 rounded-lg bg-[#071510] border border-white/10 flex items-center justify-center text-lg text-white font-medium"
                      >
                        {pin[index] || ""}
                      </div>
                    ))}
                  </div>
                </button>
                {errorMessage ? (
                  <p className="text-xs text-amber-300 text-center">{errorMessage}</p>
                ) : null}
              </div>

              <DrawerFooter>
                <button
                  onClick={handleSubmit}
                  disabled={pin.length !== 4 || isSubmitting}
                  className={`h-12 w-full rounded-full text-base font-semibold ${pin.length === 4 && !isSubmitting
                    ? "bg-[#c7ef6b] text-black"
                    : "bg-[#2a2a2a] text-white/40"
                    }`}
                >
                  {
                    isSubmitting ? <p>
                      <LoaderCircle size={16} className="animate-spin" /> Processing
                    </p> : <p>Confirm</p>
                  }
                </button>
              </DrawerFooter>
            </>
          ) : null}

          {view === "success" ? (
            <>
              <DrawerHeader className="text-center">
                <div className="flex justify-center mb-1">
                  <div className="w-20 h-20 rounded-full my-3 flex items-center justify-center overflow-hidden bg-[#C7EF6B]/20">
                    <img src="/fund.png" alt="Success" className="w-13 h-13 object-cover" />
                  </div>
                </div>
                <DrawerTitle className="text-base font-medium text-white/90 text-center">
                  Withdrawal successful
                </DrawerTitle>
                <p className="text-sm text-white/60">Your withdrawal has been processed successfully and reciever will be credited soon!</p>
              </DrawerHeader>
              <DrawerFooter>
                <button
                  onClick={onClose}
                  className="h-12 w-full rounded-full bg-[#c7ef6b] text-base font-semibold text-black"
                >
                  Done
                </button>
              </DrawerFooter>
            </>
          ) : null}

          {view === "error" ? (
            <>
              <DrawerHeader className="text-center">
                <div className="flex justify-center mb-1">
                  <div className="w-20 h-20 rounded-full my-3 flex items-center justify-center overflow-hidden bg-[#C7EF6B]/20">
                    <img src="/error.png" alt="Error" className="w-13 h-13 object-cover" />
                  </div>
                </div>
                <DrawerTitle className="text-base font-medium text-white/90 text-center">
                  Withdrawal failed
                </DrawerTitle>
                <p className="text-sm text-white/60">
                  {"Sorry, your withdrawal couldn't complete."}
                </p>
              </DrawerHeader>
              <DrawerFooter>
                <button
                  onClick={() => {
                    setView("summary");
                    setPin("");
                    setErrorMessage("");
                  }}
                  className="h-12 w-full rounded-full bg-[#c7ef6b] text-base font-semibold text-black"
                >
                  Try again
                </button>
              </DrawerFooter>
            </>
          ) : null}
        </DrawerContent>
      </Drawer>
    );
  };
