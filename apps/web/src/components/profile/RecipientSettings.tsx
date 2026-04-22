import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Pencil, SquarePen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/general/LoadingSpinner";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import { SettingsSuccessDrawer } from "@/components/general/SettingsSuccessDrawer";
import { rampService } from "@/services/ramp";
import { BankInfo } from "@/services/ramp/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const RecipientSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, refreshUser, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [banksLoading, setBanksLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);

  const hasLinkedAccount = !!state.user?.linked_account;
  const showReadOnly = hasLinkedAccount && !isEditing;

  useEffect(() => {
    const loadData = async () => {
      try {
        if (state.isLoading) return;
        if (!state.user && !state.isAuthenticated) {
          navigate("/login");
          return;
        }

        if (!state.user && state.isAuthenticated) {
          await refreshUser();
        }

        const linked = state.user?.linked_account;
        if (linked) {
          setAccountNumber(linked.account_number || "");
          setSelectedBankCode(linked.bank_code || "");
          setAccountName(state.user?.full_name || "");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    state.user,
    state.isAuthenticated,
    state.isLoading,
    refreshUser,
    navigate,
  ]);

  useEffect(() => {
    if (!isEditing) {
      setBanksLoading(false);
      return;
    }

    const fetchBanks = async () => {
      setBanksLoading(true);
      try {
        const response = await rampService.getBanks();
        if (response.success && response.data) {
          setBanks(response.data);
          return;
        }
        throw new Error(response.error?.message || "Failed to fetch banks");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to fetch banks",
        );
        setShowErrorDrawer(true);
      } finally {
        setBanksLoading(false);
      }
    };

    fetchBanks();
  }, [isEditing]);

  const selectedBank = useMemo(
    () =>
      banks.find((bank) => bank.code === selectedBankCode) ||
      (showReadOnly
        ? {
          code: selectedBankCode,
          name: state.user?.linked_account?.bank_name || "",
        }
        : null),
    [banks, selectedBankCode, showReadOnly, state.user?.linked_account],
  );

  const lookupAccountName = async () => {
    if (accountNumber.length !== 10 || !selectedBankCode) return;
    setLookupLoading(true);
    try {
      const response = await rampService.lookupAccount({
        accountNumber,
        bankCode: selectedBankCode,
      });

      if (response.success && response.data?.accountName) {
        setAccountName(response.data.accountName);
        return;
      }

      throw new Error(
        response.error?.message || "Could not resolve account name",
      );
    } catch (error) {
      setAccountName("");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to resolve account",
      );
      setShowErrorDrawer(true);
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    if (showReadOnly) {
      return;
    }

    if (!selectedBankCode || !accountNumber || accountNumber.length !== 10) {
      setAccountName("");
      return;
    }

    const timer = setTimeout(() => {
      lookupAccountName();
    }, 350);

    return () => clearTimeout(timer);
  }, [accountNumber, selectedBankCode, showReadOnly]);

  const handleSave = async () => {
    if (accountNumber.length !== 10) {
      setErrorMessage("Enter a valid 10-digit account number.");
      setShowErrorDrawer(true);
      return;
    }
    if (!selectedBankCode || !selectedBank) {
      setErrorMessage("Select a bank to continue.");
      setShowErrorDrawer(true);
      return;
    }

    const isNewAccount =
      hasLinkedAccount &&
      (state.user?.linked_account?.account_number !== accountNumber ||
        state.user?.linked_account?.bank_code !== selectedBankCode);

    if (isNewAccount && !accountName) {
      setErrorMessage("Lookup account name before saving.");
      setShowErrorDrawer(true);
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateProfile({
        full_name: accountName,
        linked_account: {
          account_number: accountNumber,
          bank_code: selectedBank.code,
          bank_name: selectedBank.name,
        },
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to save linked account");
      }

      await refreshUser();
      setShowSuccessDrawer(true);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save linked account",
      );
      setShowErrorDrawer(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading linked account..." />;
  }

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <h1 className="text-lg font-medium text-white">Linked account</h1>
        {hasLinkedAccount ? (
          <button
            onClick={() => {
              setIsEditing(true);
              setSelectedBankCode("");
              setAccountName("");
            }}
            className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
            aria-label="Edit"
          >
            <SquarePen className="text-white" size={18} />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4 scrollbar-hide">
        <div>
          <label className="mb-2 block text-sm text-white/70">
            Account number
          </label>
          {showReadOnly ? (
            <div className="w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white/90">
              {accountNumber}
            </div>
          ) : (
            <input
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white/90 outline-none"
              placeholder="Enter account number"
            />
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Bank</label>
          {showReadOnly ? (
            <div className="w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white/90">
              {state.user?.linked_account?.bank_name}
            </div>
          ) : (
            <Select
              key={isEditing ? "editing" : "viewing"}
              value={selectedBankCode}
              onValueChange={(val) => {
                setSelectedBankCode(val);
                setAccountName("");
              }}
            >
              <SelectTrigger className="w-full rounded-lg bg-[#151515] border-none py-6 text-white">
                <SelectValue
                  placeholder={
                    "Select bank"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-[#151515] text-white border-none">
                {banks.map((bank) => (
                  <SelectItem
                    key={bank.code}
                    value={bank.code}
                    className="focus:bg-white/10 focus:text-white"
                  >
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">
            Account name
          </label>
          <div className="w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white/90 min-h-12 flex items-center">
            {lookupLoading ? (
              <span className="inline-flex items-center gap-2 text-white/70">
                <LoaderCircle size={15} className="animate-spin" />
                fetching name..
              </span>
            ) : (
              accountName || ""
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-30 left-0 right-0 px-6 z-20">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="py-3 w-full rounded-full bg-[#C7EF6B] text-black text-base font-medium disabled:opacity-60"
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle size={15} className="animate-spin" />
              Saving...
            </span>
          ) : (
            "Save changes"
          )}
        </button>
      </div>

      <BottomNavigation currentPath="/wallet" />

      <SettingsSuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => setShowSuccessDrawer(false)}
        title="Account linked"
        message="Your account has been linked successfully."
      />

      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        message={errorMessage}
      />
    </div>
  );
};
