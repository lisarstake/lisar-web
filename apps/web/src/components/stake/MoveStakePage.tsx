import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, WalletCards } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { SuccessDrawer } from "@/components/general/SuccessDrawer";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useWallet } from "@/contexts/WalletContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { delegationService } from "@/services";
import { getOrchestratorDisplayName } from "@/lib/orchestrators";

export const MoveStakePage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { userDelegation, refetch: refetchDelegation } = useDelegation();
  const { orchestrators, isLoading, error, refetch } = useOrchestrators();
  const { refreshAllWalletData } = useWallet();
  const { refetch: refetchTransactions } = useTransactions();

  const [selectedOrchestrator, setSelectedOrchestrator] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentDelegateId = userDelegation?.delegate?.id || "";
  const bondedAmount = userDelegation?.bondedAmount || "0";

  const currentOrchestrator = useMemo(() => {
    if (!currentDelegateId) return null;
    return orchestrators.find((o) => o.address === currentDelegateId) || null;
  }, [orchestrators, currentDelegateId]);

  const currentOrchestratorName = currentOrchestrator
    ? getOrchestratorDisplayName(currentOrchestrator)
    : currentDelegateId || "--";

  const newOrchestratorOptions = useMemo(
    () =>
      orchestrators
        .filter((o) => o.address !== currentDelegateId)
        .map((o) => ({
          id: o.address,
          label: getOrchestratorDisplayName(o),
          apy:
            typeof o.apy === "string"
              ? parseFloat(o.apy.replace("%", "")) || 0
              : typeof o.apy === "number"
                ? o.apy
                : 0,
        })),
    [orchestrators, currentDelegateId],
  );

  const selectedOrchestratorData = newOrchestratorOptions.find(
    (o) => o.id === selectedOrchestrator,
  );

  const isEnabled = Boolean(selectedOrchestrator && currentDelegateId);

  const handleMoveStake = () => {
    if (!isEnabled) return;
    setShowConfirmDrawer(true);
  };

  const handleConfirmMove = async () => {
    setShowConfirmDrawer(false);
    setIsSubmitting(true);

    try {
      if (!state.user?.wallet_id || !state.user?.wallet_address) {
        setErrorMessage("Wallet information is missing. Please try again.");
        setShowErrorDrawer(true);
        return;
      }

      if (!currentDelegateId || !selectedOrchestrator) {
        setErrorMessage("Please select a new orchestrator.");
        setShowErrorDrawer(true);
        return;
      }

      const response = await delegationService.moveStake({
        walletId: state.user.wallet_id,
        walletAddress: state.user.wallet_address,
        oldDelegate: currentDelegateId,
        newDelegate: selectedOrchestrator,
        amount: "0",
      });

      if (!response.success) {
        setErrorMessage(
          response.message || "Failed to move stake. Please try again.",
        );
        setShowErrorDrawer(true);
        return;
      }

      await Promise.all([
        refreshAllWalletData(),
        refetchDelegation(),
        refetchTransactions(),
      ]);

      setShowSuccessDrawer(true);
    } catch (_error) {
      setErrorMessage(
        "Unable to complete this operation now. Please try again.",
      );
      setShowErrorDrawer(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <h1 className="text-lg font-medium text-white mb-6">Move Balance</h1>

        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 px-6 pb-6 scrollbar-hide">
        <div className="rounded-xl bg-[#151515] px-4 py-4">
          <p className="text-sm text-white/60">Current orchestrator</p>
          <p className="mt-2 text-base font-semibold text-white/90 truncate">
            {currentOrchestratorName}
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-[#151515] px-4 py-4">
          <p className="text-sm text-white/60">New orchestrator</p>
          <div className="mt-0">
            {isLoading && !orchestrators.length ? (
              <div className="flex justify-end py-3">
                <span className="h-3 w-3 border-[1.5px] border-current border-t-transparent rounded-full animate-spin text-white/50" />
              </div>
            ) : error && !orchestrators.length ? (
              <div className="flex justify-end py-3">
                <button onClick={() => refetch()}>
                  <RefreshCw size={12} className="text-white/50 hover:text-white transition-colors" />
                </button>
              </div>
            ) : (
              <Select
                value={selectedOrchestrator}
                onValueChange={(value) => setSelectedOrchestrator(value)}
              >
                <SelectTrigger className="bg-transparent text-white/90 border-none w-full px-0">
                  <SelectValue placeholder="Select orchestrator" className="truncate" />
                </SelectTrigger>
                <SelectContent className="bg-[#151515] text-white/90 w-full">
                  {newOrchestratorOptions.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      className="focus:bg-white/10 focus:text-white/90 truncate"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-[#151515] px-4 py-4">
          <p className="text-sm text-white/60 flex gap-1 items-center"> <WalletCards size={20} /> Stake amount</p>
          <p className="mt-2 text-base font-medium text-white/90">
            {Number(bondedAmount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })} LPT
          </p>
        </div>

        {selectedOrchestratorData && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#151515] px-4 py-4">
            <p className="text-sm text-white/60">New APY</p>
            <p className="text-sm font-semibold text-white/80">
              {selectedOrchestratorData.apy.toFixed(1)}% p.a.
            </p>
          </div>
        )}
      </div>

      <div className="px-6 pb-24 pt-3 bg-[#050505] shrink-0">
        <button
          onClick={handleMoveStake}
          disabled={!isEnabled || isSubmitting}
          className={`py-3.5 w-full rounded-full text-base font-semibold transition-opacity flex items-center justify-center gap-2 ${isEnabled && !isSubmitting
            ? "bg-[#C7EF6B] text-black"
            : "bg-[#636363] text-white cursor-not-allowed"
            }`}
        >
          {isSubmitting && (
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {isSubmitting ? "Processing..." : "Move Stake"}
        </button>
      </div>

      <BottomNavigation currentPath="/wallet" />

      <Drawer
        open={showConfirmDrawer}
        onOpenChange={(open) => setShowConfirmDrawer(open)}
      >
        <DrawerContent className="bg-[#050505] border-t border-[#505050]">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-base font-medium text-white text-center"></DrawerTitle>
            <div className="flex justify-center mb-2">
              <div className="w-24 h-24 rounded-full my-3 flex items-center justify-center relative overflow-hidden">
                <img
                  src="/move.jpeg"
                  alt="Move stake"
                  className="w-24 h-24 object-cover rounded-full"
                />
              </div>
            </div>
            <DrawerDescription className="text-sm text-white/60 px-4">
              This will move your stake from{" "}
              <span className="text-white font-medium">
                {currentOrchestratorName}
              </span>{" "}
              to{" "}
              <span className="text-white font-medium">
                {selectedOrchestratorData?.label || selectedOrchestrator}
              </span>
              . Are you sure you want to proceed?
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="space-y-3">
            <button
              onClick={handleConfirmMove}
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#C7EF6B] text-black font-semibold flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              Confirm
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => {
          setShowSuccessDrawer(false);
          navigate("/wallet/staking");
        }}
        title="Balance moved!"
        message="Your balance has been successfully moved to the new orchestratr."
      />

      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Something went wrong"
        message={errorMessage}
      />
    </div>
  );
};
