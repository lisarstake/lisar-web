import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { gasService } from "@/services/gas";
import { Loader2 } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { state } = useAuth();
  const user = state.user;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [gasAmount, setGasAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [topupStats, setTopupStats] = useState<{
    totalChecked: number;
    totalToppedUp: number;
  } | null>(null);

  const handleTopupGas = async () => {
    if (!gasAmount || parseFloat(gasAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await gasService.topupGas({
        amount: gasAmount,
      });

      if (response.success && response.data) {
        const { totalChecked, totalToppedUp } = response.data;
        setTopupStats({ totalChecked, totalToppedUp });

        if (totalToppedUp > 0) {
          setSuccess(
            `Successfully checked ${totalChecked} wallet(s) and performed ${totalToppedUp} top-up(s).`
          );
        } else {
          setSuccess(
            `Successfully checked ${totalChecked} wallet(s). No top-ups were needed - all wallets have sufficient balance.`
          );
        }

        setGasAmount("");
        setTimeout(() => {
          setIsDialogOpen(false);
          setSuccess(null);
          setTopupStats(null);
        }, 15000);
      } else {
        setError(response.message || response.error || "Failed to top up gas");
        setTopupStats(null);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while topping up gas");
      setTopupStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <p className="text-gray-600">No user data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <Card className="bg-white max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 mx-3">
            Admin Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mx-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {user.email}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {user.role || "Administrator"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  className={
                    user.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button
              size={"lg"}
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              Top Up Gas for Users
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gas Top-up Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top Up Gas for Users</DialogTitle>
            <DialogDescription>
              Enter the amount of ETH to top up for user wallets below the
              threshold.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (ETH)
              </label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                value={gasAmount}
                onChange={(e) => {
                  setGasAmount(e.target.value);
                  setError(null);
                  setSuccess(null);
                  setTopupStats(null);
                }}
                placeholder="0.001"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md space-y-2">
                <p className="text-sm text-green-700 font-medium">{success}</p>
                {topupStats && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="flex items-center justify-between text-xs text-green-700">
                      <span>Wallets Checked:</span>
                      <span className="font-semibold">
                        {topupStats.totalChecked}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-green-700 mt-1">
                      <span>Top-ups Performed:</span>
                      <span className="font-semibold">
                        {topupStats.totalToppedUp}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size={"lg"}
              onClick={() => {
                setIsDialogOpen(false);
                setGasAmount("");
                setError(null);
                setSuccess(null);
                setTopupStats(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button size={"lg"} onClick={handleTopupGas} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Top up Gas"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
