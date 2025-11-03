import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { transactionService } from "@/services/transactions";
import { TransactionDetail } from "@/services/transactions/types";
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Copy,
  ExternalLink,
} from "lucide-react";

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const formatAmount = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

const getStatusColor = (status: string): string => {
  const normalized = status.toLowerCase();
  if (normalized === "confirmed") {
    return "bg-green-100 text-green-800 border-0 text-xs";
  } else if (normalized === "pending") {
    return "bg-yellow-100 text-yellow-800 border-0 text-xs";
  } else {
    return "bg-red-100 text-red-800 border-0 text-xs";
  }
};

const getStatusIcon = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "confirmed") {
    return <CheckCircle2 className="w-3 h-3 mr-1" />;
  }
  return <XCircle className="w-3 h-3 mr-1" />;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const TransactionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) {
        setError("Transaction ID is required");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response =
          await transactionService.getTransactionById(transactionId);
        if (response.success && response.data) {
          setTransaction(response.data);
        } else {
          setError(response.message || "Failed to fetch transaction details");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  if (isLoading) {
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

  if (error || !transaction) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate("/transactions")}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Transactions
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || "Transaction not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const walletAddress =
    transaction.users?.wallet_address || transaction.wallet_address;
  const initials = walletAddress
    ? walletAddress.slice(2, 4).toUpperCase()
    : "U";

  const ethScanUrl = `https://etherscan.io/tx/${transaction.transaction_hash}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Transaction Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={getStatusColor(transaction.status)}>
                      {getStatusIcon(transaction.status)}
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="text-sm font-medium text-gray-900">
                      {transaction.transaction_type.charAt(0).toUpperCase() +
                        transaction.transaction_type.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatAmount(transaction.amount)}{" "}
                      {transaction.token_symbol}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Date</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(transaction.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Source</span>
                    <span className="text-sm text-gray-900">
                      {transaction.source || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  Transaction Hash
                </h3>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md">
                  <code className="text-xs font-mono text-gray-700 flex-1 break-all">
                    {transaction.transaction_hash}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(transaction.transaction_hash)
                    }
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(ethScanUrl, "_blank")}
                    className="shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  Token Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-600 block mb-1">
                      Token Address
                    </span>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md">
                      <code className="text-xs font-mono text-gray-700 flex-1 break-all">
                        {transaction.token_address}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(transaction.token_address)
                        }
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 block mb-1">
                      Wallet Address
                    </span>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md">
                      <code className="text-xs font-mono text-gray-700 flex-1 break-all">
                        {transaction.wallet_address}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(transaction.wallet_address)
                        }
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 block mb-1">
                      Wallet ID
                    </span>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md">
                      <code className="text-xs font-mono text-gray-700 flex-1">
                        {transaction.wallet_id}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.wallet_id)}
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
