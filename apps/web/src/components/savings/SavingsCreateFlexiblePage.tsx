import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useStablesApy } from "@/hooks/useStablesApy";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { delegationService, perenaService } from "@/services";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
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

export const SavingsCreateFlexiblePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orchestrators } = useOrchestrators();
  const { perena: perenaApy, isLoading: apyLoading } = useStablesApy();
  const { state } = useAuth();
  const {
    solanaWalletId,
    solanaWalletAddress,
    loadStablesBalance,
    loadHighyieldBalance,
    refetch: refetchWallet,
  } = useWallet();
  const { refetch: refetchDelegation } = useDelegation();
  const { refetch: refetchTransactions } = useTransactions();
  const [amount, setAmount] = useState("");
  const [selectedOrchestrator, setSelectedOrchestrator] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const { mode, source, orchestratorFromQuery } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const pageMode = params.get("mode") === "staking" ? "staking" : "savings";
    const defaultSource = pageMode === "staking" ? "lpt" : "usdc";
    const sourceAsset = (params.get("source") || defaultSource).toLowerCase();
    const orchestratorAddress = params.get("orchestrator") || "";
    return {
      mode: pageMode,
      source: sourceAsset,
      orchestratorFromQuery: orchestratorAddress,
    };
  }, [location.search]);

  const stakingOrchestratorOptions = useMemo(
    () =>
      orchestrators.map((orch) => ({
        id: orch.address,
        label: orch.ensIdentity?.name || orch.ensName || orch.address,
        apy:
          typeof orch.apy === "string"
            ? parseFloat(orch.apy.replace("%", "")) || 0
            : typeof orch.apy === "number"
              ? orch.apy
              : 0,
      })),
    [orchestrators],
  );

  const sourceMeta = useMemo(() => {
    if (source === "ngn") return { label: "NGN", icon: "/ng_flag.png" };
    if (source === "usd") return { label: "USD", icon: "/us_flag.png" };
    if (source === "usdt") return { label: "USDT", icon: "/usdt.svg" };
    if (source === "lpt") return { label: "LPT", icon: "/livepeer.webp" };
    return { label: "USDC", icon: "/usdc.svg" };
  }, [source]);

  const currentOrchestrator = selectedOrchestrator || "";
  const selectedOrchestratorData = stakingOrchestratorOptions.find(
    (item) => item.id === currentOrchestrator,
  );

  useEffect(() => {
    if (mode !== "staking") return;

    const allowedSources = new Set(["ngn", "usd", "lpt"]);
    if (!allowedSources.has(source)) {
      navigate("/wallet/savings/create-flexible?mode=staking&source=lpt", {
        replace: true,
      });
      return;
    }

    if (orchestratorFromQuery) {
      setSelectedOrchestrator(orchestratorFromQuery);
      return;
    }

    if (!selectedOrchestrator && stakingOrchestratorOptions[0]?.id) {
      setSelectedOrchestrator(stakingOrchestratorOptions[0].id);
    }
  }, [
    mode,
    source,
    selectedOrchestrator,
    orchestratorFromQuery,
    stakingOrchestratorOptions,
    navigate,
  ]);

  useEffect(() => {
    if (mode !== "savings") return;
    const allowedSources = new Set(["ngn", "usd", "usdc", "usdt"]);
    if (!allowedSources.has(source)) {
      navigate("/wallet/savings/create-flexible?mode=savings&source=usdc", {
        replace: true,
      });
    }
  }, [mode, source, navigate]);

  const hasOrchestrators = stakingOrchestratorOptions.length > 0;
  const isEnabled =
    Number(amount) > 0 &&
    (mode === "savings" ? true : Boolean(currentOrchestrator && hasOrchestrators));

  const handleContinue = () => {
    if (!isEnabled) return;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Please enter a valid amount.");
      setShowErrorDrawer(true);
      return;
    }

    setPendingAmount(numericAmount);
    setShowConfirmDrawer(true);
  };

  const handleConfirmTopUp = async () => {
    setShowConfirmDrawer(false);
    setIsSubmitting(true);
    try {
      if (mode === "staking") {
        if (!state.user?.wallet_id || !state.user?.wallet_address) {
          setErrorMessage("Wallet information is missing. Please try again.");
          setShowErrorDrawer(true);
          return;
        }
        if (!currentOrchestrator) {
          setErrorMessage("Please select an orchestrator.");
          setShowErrorDrawer(true);
          return;
        }

        const response = await delegationService.stake({
          walletId: state.user.wallet_id,
          walletAddress: state.user.wallet_address,
          orchestratorAddress: currentOrchestrator,
          amount: String(pendingAmount),
        });

        if (!response.success) {
          setErrorMessage("Sorry an error occurred and top up didn't complete, please try again.");
          setShowErrorDrawer(true);
          return;
        }

        await Promise.all([
          refetchWallet(),
          loadHighyieldBalance(true),
          refetchDelegation(),
          refetchTransactions(),
        ]);
      } else {
        if (!solanaWalletId || !solanaWalletAddress) {
          setErrorMessage("Wallet information is missing. Please try again.");
          setShowErrorDrawer(true);
          return;
        }

        const response = await perenaService.mint({
          walletId: solanaWalletId,
          walletAddress: solanaWalletAddress,
          usdcAmount: pendingAmount,
        });

        if (!response.success) {
          setErrorMessage("Sorry an error occurred and top up didn't complete, please try again.");
          setShowErrorDrawer(true);
          return;
        }

        await Promise.all([
          refetchWallet(),
          loadStablesBalance(true),
          refetchTransactions(),
        ]);
      }

      setShowSuccessDrawer(true);
    } catch (_error) {
      setErrorMessage("Unable to complete this operation now. Please try again.");
      setShowErrorDrawer(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        {/* <h1 className="text-lg font-medium text-white">
          {mode === "staking" ? "Top up " : "Create Savings Plan"}
        </h1> */}

        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
        <div className="rounded-xl px-4 py-4 bg-[#13170a]">
          <p className="text-sm text-white/60">Amount</p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="w-full bg-transparent text-lg font-semibold text-[#d6ddd9] outline-none placeholder:text-[#3f4f47]"
            />
            <div className="flex items-center gap-2">
              <img
                src={sourceMeta.icon}
                alt={sourceMeta.label}
                className="h-6 w-7 rounded-full bg-white object-cover"
              />
              {/* <span className="text-base text-white">{sourceMeta.label}</span> */}
            </div>
          </div>
        </div>

        {mode === "staking" && (
          <div className="mt-4 rounded-xl bg-[#13170a] px-4 py-4">
            <p className="text-sm text-white/60">Orchestrator</p>
            <div className="mt-0">
              <Select
                value={currentOrchestrator}
                onValueChange={(value) => setSelectedOrchestrator(value)}
              >
                <SelectTrigger className="bg-transparent text-white/90 border-none w-full px-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#13170a] text-white/90 w-full">
                  {stakingOrchestratorOptions.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      className="focus:bg-white/10 focus:text-white/90"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#13170a] px-4 py-4">
          <p className="text-sm text-white/60">Interest rate</p>
          <p className="text-sm font-semibold text-white/80">
            {mode === "staking"
              ? `${(selectedOrchestratorData?.apy || 0).toFixed(1)}% p.a.`
              : `${apyLoading && perenaApy === null ? "..." : perenaApy ? (perenaApy * 100).toFixed(1) : "14"}% p.a.`}
          </p>
        </div>
      </div>

      <div className="px-6 pb-24 pt-3 bg-[#050505] shrink-0">
        <button
          onClick={handleContinue}
          disabled={!isEnabled || isSubmitting}
          className={`py-3.5 w-full rounded-full text-base font-semibold transition-opacity flex items-center justify-center gap-2 ${isEnabled && !isSubmitting
            ? "bg-[#C7EF6B] text-black"
            : "bg-[#636363] text-white cursor-not-allowed"
            }`}
        >
          {isSubmitting && (
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}

          {isSubmitting ? "Processing.." : "Continue"}
        </button>
      </div>

      <BottomNavigation currentPath="/wallet" />

      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => {
          setShowSuccessDrawer(false);
          navigate(mode === "staking" ? "/wallet/staking" : "/wallet/savings");
        }}
        title="You've topped up!"
        message={
          mode === "staking"
            ? "Your top up request processed successfully and your wallet has been credited."
            : "Your top up request processed successfully and your wallet has been credited."
        }
      />

      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Sorry, an error occurred"
        message={errorMessage}
      />

      <Drawer
        open={showConfirmDrawer}
        onOpenChange={(open) => setShowConfirmDrawer(open)}
      >
        <DrawerContent className="bg-[#050505] border-t border-[#2a2a2a]">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-base font-medium text-white text-center">
            </DrawerTitle>
            <div className="flex justify-center mb-2">
              <div className="w-24 h-24 bg-[#C7EF6B]/20 rounded-full my-3 flex items-center justify-center relative overflow-hidden">
                <img
                  src="/crypto.png"
                  alt="Confirm"
                  className="w-16 h-16 object-cover"
                />
              </div>
            </div>
            <DrawerDescription className="text-sm text-white/60 px-4">
              Proceed to top up your {" "}
              {mode === "staking" ? "staking" : "savings"} wallet. Once confirmed you will earning rewards at {" "}
              {mode === "staking"
                ? `${(selectedOrchestratorData?.apy || 0).toFixed(1)}%`
                : `${apyLoading && perenaApy === null ? "..." : perenaApy ? (perenaApy * 100).toFixed(1) : "10"}%`}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="space-y-3">
            <button
              onClick={handleConfirmTopUp}
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
    </div>
  );
};
