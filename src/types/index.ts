// src/index.ts
export interface Account {
  id: string;
  ownerName: string;
  currency: string;
  balance: number;
}

export interface TransferFundsInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface TransferFundsResponse {
  success: boolean;
  message?: string;
}

export interface Transaction {
  id: string;
  status: "pending" | "processing" | "success" | "failed";
  fromAccountId: string;
  fromAccountOwnerName: string;
  toAccountId: string;
  toAccountOwnerName: string;
  originalAmount: number;
  originalCurrency: string;
  amount: number;
  currency: string;
  date: string;
}
