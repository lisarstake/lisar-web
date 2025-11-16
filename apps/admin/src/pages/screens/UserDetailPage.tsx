import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, Ban, CheckCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";

import {
  formatDate,
  formatAmount,
  formatWalletAddress,
  getInitials,
} from "@/lib/formatters";

export const UserDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const {
    state,
    getUserById,
    suspendUser,
    unsuspendUser,
    updateUserBalance,
    clearSelectedUser,
  } = useUser();
  const { state: authState } = useAuth();
  const {
    selectedUser,
    isLoadingSingle,
    isLoadingSuspend,
    isLoadingUnsuspend,
    isLoadingBalanceUpdate,
    error,
  } = state;

  const isSuperAdmin = authState.user?.role === "super_admin";

  const [suspendForm, setSuspendForm] = useState({
    reason: "",
  });
  const [balanceForm, setBalanceForm] = useState({
    balance: 0,
    reason: "",
  });
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [showBalanceForm, setShowBalanceForm] = useState(false);

  useEffect(() => {
    if (userId) {
      getUserById(userId);
    }
    return () => {
      clearSelectedUser();
    };
  }, [userId, getUserById, clearSelectedUser]);

  useEffect(() => {
    if (selectedUser) {
      setBalanceForm({
        balance: selectedUser.lpt_balance || 0,
        reason: "",
      });
    }
  }, [selectedUser]);

  const handleSuspend = async () => {
    if (!userId || !suspendForm.reason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    const result = await suspendUser(userId, { reason: suspendForm.reason });
    if (result.success) {
      toast.success("User suspended successfully");
      setShowSuspendForm(false);
      setSuspendForm({ reason: "" });
      getUserById(userId); // Refresh user data
    } else {
      toast.error(result.message || "Failed to suspend user");
    }
  };

  const handleUnsuspend = async () => {
    if (!userId) return;

    const result = await unsuspendUser(userId);
    if (result.success) {
      toast.success("User unsuspended successfully");
      getUserById(userId); // Refresh user data
    } else {
      toast.error(result.message || "Failed to unsuspend user");
    }
  };

  const handleBalanceUpdate = async () => {
    if (!userId || !balanceForm.reason.trim()) {
      toast.error("Please provide a reason for balance update");
      return;
    }

    const result = await updateUserBalance(userId, {
      balance: balanceForm.balance,
      reason: balanceForm.reason,
    });
    if (result.success) {
      toast.success("User balance updated successfully");
      setShowBalanceForm(false);
      setBalanceForm({ ...balanceForm, reason: "" });
      getUserById(userId); // Refresh user data
    } else {
      toast.error(
        result.message || result.error || "Failed to update user balance"
      );
    }
  };

  if (isLoadingSingle) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !selectedUser) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate("/users")}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || "User not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="w-14 h-14 md:w-16 md:h-16">
                <AvatarImage src={selectedUser.img || undefined} />
                <AvatarFallback>
                  {getInitials(selectedUser.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="md:text-lg text-base font-semibold text-gray-900">
                  {selectedUser.full_name || "N/A"}
                </h3>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <Badge
                  className={
                    selectedUser.is_suspended
                      ? "bg-red-100 text-red-800 border-0 text-xs mt-2"
                      : "bg-green-100 text-green-800 border-0 text-xs mt-2"
                  }
                >
                  {selectedUser.is_suspended ? "Suspended" : "Active"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User ID</span>
                <span
                  className="text-sm font-mono text-gray-900 max-w-[180px] truncate overflow-hidden inline-block align-middle"
                  title={selectedUser.user_id}
                >
                  {selectedUser.user_id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Wallet Address</span>
                <span className="text-sm font-mono text-gray-900">
                  {formatWalletAddress(selectedUser.wallet_address)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Chain Type</span>
                <span className="text-sm text-gray-900">
                  {selectedUser.chain_type}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">LPT Balance</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatAmount(selectedUser.lpt_balance)} LPT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Created Date</span>
                <span className="text-sm text-gray-900">
                  {formatDate(selectedUser.created_date, { includeTime: true })}
                </span>
              </div>
              {selectedUser.is_suspended && selectedUser.suspension_reason && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">
                    Suspension Reason
                  </span>
                  <span className="text-sm text-red-600 max-w-xs text-right">
                    {selectedUser.suspension_reason}
                  </span>
                </div>
              )}
              {selectedUser.is_suspended && selectedUser.suspended_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Suspended At</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(selectedUser.suspended_at, {
                      includeTime: true,
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Stats Card */}
        {selectedUser.transactionStats && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedUser.transactionStats.totalTransactions}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(selectedUser.transactionStats.totalVolume)}{" "}
                    LPT
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Pending Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedUser.transactionStats.pendingTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Actions Card - Suspend/Unsuspend (All Admins) */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Suspend/Unsuspend */}
            {!selectedUser.is_suspended ? (
              <div className="space-y-3">
                {!showSuspendForm ? (
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={() => setShowSuspendForm(true)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend User
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="suspendReason">Suspension Reason</Label>
                    <Textarea
                      id="suspendReason"
                      value={suspendForm.reason}
                      onChange={(e) =>
                        setSuspendForm({ reason: e.target.value })
                      }
                      placeholder="Enter reason for suspension..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={handleSuspend}
                        disabled={
                          isLoadingSuspend || !suspendForm.reason.trim()
                        }
                        className="flex-1"
                      >
                        {isLoadingSuspend ? "Suspending..." : "Confirm Suspend"}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setShowSuspendForm(false);
                          setSuspendForm({ reason: "" });
                        }}
                        disabled={isLoadingSuspend}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="default"
                size="lg"
                onClick={handleUnsuspend}
                disabled={isLoadingUnsuspend}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isLoadingUnsuspend ? "Unsuspending..." : "Unsuspend User"}
              </Button>
            )}

            {/* Update Balance - Super Admin Only */}
            {isSuperAdmin && (
              <div className="pt-4 border-t">
                {!showBalanceForm ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowBalanceForm(true)}
                    className="w-full"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Update LPT Balance
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div>
                      <Label htmlFor="balance">New Balance</Label>
                      <Input
                        id="balance"
                        type="number"
                        value={balanceForm.balance}
                        onChange={(e) =>
                          setBalanceForm({
                            ...balanceForm,
                            balance: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="balanceReason">Reason</Label>
                      <Textarea
                        id="balanceReason"
                        value={balanceForm.reason}
                        onChange={(e) =>
                          setBalanceForm({
                            ...balanceForm,
                            reason: e.target.value,
                          })
                        }
                        placeholder="Enter reason for balance update..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="lg"
                        onClick={handleBalanceUpdate}
                        disabled={
                          isLoadingBalanceUpdate || !balanceForm.reason.trim()
                        }
                        className="flex-1"
                      >
                        {isLoadingBalanceUpdate
                          ? "Updating..."
                          : "Update Balance"}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setShowBalanceForm(false);
                          setBalanceForm({ ...balanceForm, reason: "" });
                        }}
                        disabled={isLoadingBalanceUpdate}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
