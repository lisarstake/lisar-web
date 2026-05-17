/**
 * PAJ Ramp API Service Interface
 * Defines the contract for paj-ramp-related API operations
 */

import {
  AddBankAccountRequest,
  AmountRateData,
  CreateOffRampOrderRequest,
  CreateOnRampOrderRequest,
  OffRampOrderData,
  OnRampOrderData,
  PajRampApiResponse,
  RampBank,
  RampTransaction,
  RatesData,
  ResolveBankAccountData,
  ResolveBankAccountRequest,
  SavedBankAccount,
  SessionInitiateData,
  SessionInitiateRequest,
  SessionStatusData,
  SessionVerifyData,
  SessionVerifyRequest,
} from "./types";

export interface IPajRampApiService {
  initiateSession(
    request: SessionInitiateRequest,
  ): Promise<PajRampApiResponse<SessionInitiateData>>;

  verifySession(
    request: SessionVerifyRequest,
  ): Promise<PajRampApiResponse<SessionVerifyData>>;

  getSessionStatus(): Promise<PajRampApiResponse<SessionStatusData>>;

  getRates(): Promise<PajRampApiResponse<RatesData>>;

  getRateByAmount(amount: number): Promise<PajRampApiResponse<AmountRateData>>;

  createOnRampOrder(
    request: CreateOnRampOrderRequest,
  ): Promise<PajRampApiResponse<OnRampOrderData>>;

  getBanks(): Promise<PajRampApiResponse<RampBank[]>>;

  resolveBankAccount(
    request: ResolveBankAccountRequest,
  ): Promise<PajRampApiResponse<ResolveBankAccountData>>;

  addBankAccount(
    request: AddBankAccountRequest,
  ): Promise<PajRampApiResponse<Record<string, unknown> | null>>;

  getSavedBankAccounts(): Promise<PajRampApiResponse<SavedBankAccount[]>>;

  createOffRampOrder(
    request: CreateOffRampOrderRequest,
  ): Promise<PajRampApiResponse<OffRampOrderData>>;

  getTransactions(): Promise<PajRampApiResponse<RampTransaction[]>>;

  getTransactionById(
    id: string,
  ): Promise<PajRampApiResponse<RampTransaction>>;
}
